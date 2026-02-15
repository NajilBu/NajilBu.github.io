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
        //     resizedResults.forEach(face => {
        //     const bestMatch = facematcher.findBestMatch(face.descriptor);
        //     // Use folder name for label if recognized
        //     const label = bestMatch.toString();
        //     const drawBox = new faceapi.draw.DrawBox(face.detection.box, {
        //     label: label
        //      });

        //     drawBox.draw(canvas);
        // });

         
        faceapi.draw.drawFaceExpressions(canvas, resizedResults);

        requestAnimationFrame(detectFaces);
    };

    detectFaces();
};

// async function loadImages() {
//     const res = await fetch('./recog_cam_multi.php');
//     const labels = await res.json();

//     const validLabels = [];

//     for (const label of labels) {
//         const descriptions = [];
//         let i = 1;

//         while (true) {
//             try {
//                 const img = await faceapi.fetchImage(`./IMAGE/${label}/${i}.jpg`);
//                 const detection = await faceapi
//                     .detectSingleFace(img)
//                     .withFaceLandmarks()
//                     .withFaceDescriptor();

//                 if (detection) {
//                     descriptions.push(detection.descriptor);
//                 } else {
//                     console.warn(`No face detected: ${label}/${i}.jpg`);
//                 }

//                 i++;
//             } catch {
//                 break;
//             }
//         }

        
//         if (descriptions.length > 0) {
//             validLabels.push(
//                 new faceapi.LabeledFaceDescriptors(label, descriptions)
//             );
//         } else {
//             console.warn(`Skipping ${label}: No valid face data`);
//         }
//     }

//     return validLabels;
// }


run();
