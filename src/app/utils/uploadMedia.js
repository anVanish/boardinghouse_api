const {getStorage, ref, getDownloadURL, uploadBytesResumable} = require('firebase/storage')
const {initializeApp} = require('firebase/app')
const firebaseConfig = require('../../config/firebase')
//connect to firebase
initializeApp(firebaseConfig)
//get storage
const storage = getStorage()

function extractNumberFromPostLink(url){
    const regex = /post_(\d+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

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

exports.uploadMultipleMedia = async (files, multiMedia, folder) => {
    const uploadedURLs = []
    const start = multiMedia.length === 0 ? 0 : parseInt(extractNumberFromPostLink(multiMedia[multiMedia.length - 1])) + 1


    for (let i = 0; i < files.length; i++){
        const filename = `${folder}/post_${start + i}`
        const downloadedURL = await this.uploadMedia(files[i], filename)
        uploadedURLs.push(downloadedURL)
    }

    return uploadedURLs
}
