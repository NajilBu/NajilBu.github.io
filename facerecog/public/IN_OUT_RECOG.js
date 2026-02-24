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
 
         
    const labelDesc = await loadImages();
    if (labelDesc.length === 0) {
    alert("No faces in database yet");
    return;
}
    let facematcher = new faceapi.FaceMatcher(labelDesc, 0.5);
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
            const label = bestMatch.toString();
            const drawBox = new faceapi.draw.DrawBox(face.detection.box, {
            label: label
             });

            drawBox.draw(canvas);
        });

         
        faceapi.draw.drawFaceExpressions(canvas, resizedResults);

        requestAnimationFrame(detectFaces);
    };

    detectFaces();
};

async function loadImages() {
    const res = await fetch('./IN_OUT_RECOG.php');
    const text = await res.text();
    console.log(text);

    const LabeledDescriptors = [];
    const data = JSON.parse(text);
   
    for (const label in data) {
        const descriptions = data[label].map(arr => new Float32Array(arr));
        LabeledDescriptors.push(
            new faceapi.LabeledFaceDescriptors(label, descriptions)
        );
    }

    return LabeledDescriptors;
}


run();
