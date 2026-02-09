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

    const face1 = document.getElementById('face')


    //const face1 = await faceapi.fetchImage('./images/N,Bumacod.jpg')
    await face1.decode()
    let faceAIData = await faceapi.detectAllFaces(face1).withFaceLandmarks().withFaceDescriptors().withAgeAndGender()


    const canvas = document.getElementById('canvas')
    canvas.style.left = face1.offsetLeft
    canvas.style.top = face1.offsetTop

    canvas.height = face1.height
    canvas.width = face1.width

   faceAIData = faceapi.resizeResults(faceAIData,face1)
   faceapi.draw.drawDetections(canvas, faceAIData)

   faceAIData.forEach(face=>{
    const{age, gender, genderProbability}=face
    const genderText = `${gender} : ${Math.round(genderProbability *1000)/1000}`
    const ageText = `Age: ${Math.round(age)} years`
    const TextField = new faceapi.draw.DrawTextField([genderText, ageText], face.detection.box.bottomLeft)
    TextField.draw(canvas)
   })

   console.log(faceAIData)
}

run()