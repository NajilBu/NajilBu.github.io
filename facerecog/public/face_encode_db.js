        let captureCount = 0;
        const MAX = 10;
        let countdown = 5;

        const instructions = [
            "Look straight",
            "Turn left",
            "Turn right",
            "Look up",
            "Look down",
            "Look straight",
            "Turn left",
            "Turn right",
            "Look up",
            "Look down"
        ];

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

    function startCapture(){
        const user = document.getElementById('username').value.trim();
        if(!user){
            alert("Please enter a username");
            return;
        }
            captureCount = 0;
            startCountdown(user);
    }
    function  startCountdown(username){

        if(captureCount >= MAX){
            document.getElementById(`instruction`)
            .innerText = "Capture complete!";
            alert("Capture complete!");
            return;
        }

        countdown = 5;
        document.getElementById('instruction').innerText =
            instructions[captureCount] + " | " + countdown;

        
        const timer = setInterval(async () => {
            countdown--;
            document.getElementById('instruction').innerText =
                instructions[captureCount] + " | " + countdown;
            if(countdown === 0){
                clearInterval(timer);
                await captureEncoding(username, captureCount + 1);
                captureCount++;
                setTimeout(() => startCountdown(username), 1000);
            }   
        }, 1000);
    }

    async function captureEncoding(username, num){
       
        const video = document.getElementById('video'); 
        const detections = await faceapi
        .detectSingleFace(video)
        .withFaceLandmarks()
        .withFaceDescriptor();
        
        // canvas.width = video.videoWidth;
        // canvas.height = video.videoHeight;

        if(!detections){
            alert("No face detected, please try again.");
            return;
        }

        // canvas.getContext('2d').drawImage(video, 0, 0);

        // const img = canvas.toDataURL('image/jpeg');

        const encoding = Array.from(detections.descriptor);

        fetch(`face_encode_db.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({user: username, encoding: encoding})
        });
    }


    run();
