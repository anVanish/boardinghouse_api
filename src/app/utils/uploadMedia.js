const {getStorage, ref, getDownloadURL, uploadBytesResumable} = require('firebase/storage')
const {initializeApp} = require('firebase/app')
const firebaseConfig = require('../../config/firebase')
//connect to firebase
initializeApp(firebaseConfig)
//get storage
const storage = getStorage()

exports.uploadImage = async (file, filename) => {
    const storageRef = ref(storage, filename)
    const metadata = {
        contentType: file.mimetype,
    };

    //upload to bucket
    const snapshot = await uploadBytesResumable(storageRef, file.buffer, metadata)

    //get url
    const downloadedURL = await getDownloadURL(snapshot.ref)

    return downloadedURL
}

exports.uploadImages = async (files) => {

}

exports.uploadVideo = async (video) => {

}