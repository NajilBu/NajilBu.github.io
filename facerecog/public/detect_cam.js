console.log(faceapi)

const run = async()=>{
    //we need to load our models
    //loading the models is going to use await

      const stream = await navigator.mediaDevices.getUserMedia({video:{
        video: true,
        audio: false,
    }})

    const videofeed = document.getElementById('video')
    videofeed.srcObject = stream

    await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri('./models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
        faceapi.nets.ageGenderNet.loadFromUri('./models'),
        faceapi.nets.faceExpressionNet.loadFromUri('./models')
    ])


    const canvas = document.getElementById('canvas')

    canvas.style.left = videofeed.offsetLeft
    canvas.style.top = videofeed.offsetTop

    canvas.height = videofeed.height
    canvas.width = videofeed.width
    
//     const face1 = document.getElementById('face')

// detection of faces in the vid

setInterval(async()=>{

let facedata = await faceapi.detectAllFaces(videofeed).withFaceLandmarks().withFaceDescriptors().withAgeAndGender().withFaceExpressions()
   console.log(facedata)


   canvas.getContext('2d').clearRect(0,0,canvas.width,canvas.height)
   facedata = faceapi.resizeResults(facedata,videofeed)
    faceapi.draw.drawDetections(canvas,facedata)
   // faceapi.draw.drawFaceLandmarks(canvas,facedata)
    faceapi.draw.drawFaceExpressions(canvas,facedata)  

   

},200)









}

run()