const run = async () => {
    const videofeed = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    videofeed.srcObject = stream;

     await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri('./models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
        faceapi.nets.ageGenderNet.loadFromUri('./models'),
        faceapi.nets.faceExpressionNet.loadFromUri('./models')
    ]);
  //  const ImagePath = './IMAGE/Bumacod/1.jpg'; //find this
 ///   const LabelName = ImagePath.split('/')[2];
    const FaceRef = await faceapi.fetchImage(ImagePath) //find this
    const faceAIData = await faceapi.detectAllFaces(FaceRef)
                .withFaceLandmarks()
                .withFaceDescriptors()
          
  
    const LabelDesc = [
        new faceapi.LabeledFaceDescriptors(LabelName, faceAIData.map(fd => fd.descriptor))
    ]
                
    let facematcher = new faceapi.FaceMatcher(LabelDesc);
    // Set canvas size once
    canvas.width = videofeed.width;
    canvas.height = videofeed.height;
    canvas.style.left = videofeed.offsetLeft + 'px';
    canvas.style.top = videofeed.offsetTop + 'px';

    const detectFaces = async () => {
        const VideoData = await faceapi.detectAllFaces(videofeed)
            .withFaceLandmarks()
            .withFaceDescriptors()
            .withAgeAndGender()
            .withFaceExpressions();


        ctx.clearRect(0, 0, canvas.width, canvas.height);
        faceapi.matchDimensions(canvas, videofeed);

        const resizedResults = faceapi.resizeResults(VideoData, videofeed);    

            resizedResults.forEach(face => {
            const bestMatch = facematcher.findBestMatch(face.descriptor);
            // Use folder name for label if recognized
            const label = bestMatch.label === 'unknown' ? 'unknown' : LabelName;
            const drawBox = new faceapi.draw.DrawBox(face.detection.box, { label });
            drawBox.draw(canvas);
        });

         
        faceapi.draw.drawFaceExpressions(canvas, resizedResults);

        requestAnimationFrame(detectFaces);
    };

    detectFaces();
};

async function loadImages(){
    const response = await fetch('./recog_cam_multi.php');
    const labels = await response.json();

    return Promise.all(
        labels.map(as)
    )
}

run();
