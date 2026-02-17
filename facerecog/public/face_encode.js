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
        faceapi.draw.drawDetections(canvas, resizedResults);


         
        faceapi.draw.drawFaceExpressions(canvas, resizedResults);

        requestAnimationFrame(detectFaces);
    };

    detectFaces();
};




run();
