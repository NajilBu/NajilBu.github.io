console.log(faceapi)

const run = async()=>{
    //we need to load our models
    //loading the models is going to use await
    await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri('./models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
        faceapi.nets.ageGenderNet.loadFromUri('./models'),
    ])

    const facetocheck = document.getElementById('face')


    const face1 = await faceapi.fetchImage('./images/oldMan1.png') //find this
    //const facetocheck = await faceapi.fetchImage('./imagesfind/Find.jpg')
    await face1.decode()
    await facetocheck.decode()

    let faceAIData = await faceapi.detectAllFaces(face1).withFaceLandmarks().withFaceDescriptors().withAgeAndGender()
    let faceAiDatatocheck = await faceapi.detectAllFaces(facetocheck).withFaceLandmarks().withFaceDescriptors().withAgeAndGender()

    const canvas = document.getElementById('canvas')



    faceapi.matchDimensions(canvas, facetocheck)

    canvas.style.left = facetocheck.offsetLeft
    canvas.style.top = facetocheck.offsetTop
    canvas.width = facetocheck.width
    canvas.height = facetocheck.height

    let facematcher = new faceapi.FaceMatcher(faceAIData)

   faceAiDatatocheck = faceapi.resizeResults(faceAiDatatocheck,facetocheck)

   faceAiDatatocheck.forEach(face=>{
     const {detection, descriptor} = face

     let label = facematcher.findBestMatch(descriptor).toString()

     console.log(label)

     if(label.includes("unknown")){
        return
     }
     let options = {label: "Me"}
        const drawBox = new faceapi.draw.DrawBox(detection.box, options)
        drawBox.draw(canvas)
   })

}

run()