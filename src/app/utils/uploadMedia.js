const {getStorage, ref, getDownloadURL, uploadBytesResumable} = require('firebase/storage')
const {initializeApp} = require('firebase/app')
const firebaseConfig = require('../../config/firebase')
//connect to firebase
initializeApp(firebaseConfig)
//get storage
const storage = getStorage()

exports.uploadMedia = async (file, filename) => {
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

exports.uploadMultipleMedia = async (files, folder) => {
    const uploadedURLs = []
    
    for (let i = 0; i < files.length; i++){
        const filename = `${folder}/post_${i}`
        const downloadedURL = await this.uploadMedia(files[i], filename)
        uploadedURLs.push(downloadedURL)
    }

    return uploadedURLs
}
