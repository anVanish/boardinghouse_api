const {authToken, authUser, authModerator, authAdmin} = require('../../middlewares/authenticatetion')
const express = require('express')
const router = express.Router()
const {listPosts, addPost, getPost, updatePost, deletePost, myPosts, addMyPost, updateMyPost, deleteMyPost, listPostsModerator, approvedPost, violatedPost, listPostsAdmin, listPostsAdminModerator, getMyPost, getPostModerator, getPostAdmin, hideMyPost, hidePost, visibleMyPost, visiblePost, listLatestPosts, listPopularPosts} = require('../../app/controllers/PostController')

//multer as middlewares
const multer = require('multer')
const upload = multer({ storage: multer.memoryStorage()})

//list posts
router.get('/me',authToken, authUser, myPosts)
router.get('/moderators', authToken, authModerator, listPostsModerator)
router.get('/admin', authToken, authAdmin, listPostsAdmin)
router.get('/admin/moderators', authToken, authAdmin, listPostsAdminModerator)
router.get('/', listPosts)
//get post
router.get('/:slug/me', authToken, authUser, getMyPost)
router.get('/:slug/moderator', authToken, authModerator,getPostModerator)
router.get('/:slug/admin', authToken, authAdmin, getPostAdmin)
router.get('/:slug/popular', listPopularPosts)
router.get('/:slug/latest', listLatestPosts)
router.get('/:slug', getPost)

router.use(authToken)
//user
router.post('/me', upload.fields([
    { name: 'imageFiles', maxCount: 10 },
    { name: 'videoFile', maxCount: 1 }
]), authUser, addMyPost)
router.put('/:slug/me',upload.fields([
    { name: 'imageFiles', maxCount: 10 },
    { name: 'videoFile', maxCount: 1 }
]), authUser, updateMyPost)
router.patch('/:slug/hide/me', authUser, hideMyPost)
router.patch('/:slug/visible/me', authUser, visibleMyPost)
router.delete('/:slug/me', authUser, deleteMyPost)

//moderator
router.patch('/:slug/approved', authUser, approvedPost)
router.patch('/:slug/violated', authUser, violatedPost)

//admin
router.use(authAdmin)
router.post('/', upload.fields([
    { name: 'imageFiles', maxCount: 10 },
    { name: 'videoFile', maxCount: 1 }
]), addPost)
router.put('/:slug', upload.fields([
    { name: 'imageFiles', maxCount: 10 },
    { name: 'videoFile', maxCount: 1 }
]), updatePost)
router.patch('/:slug/hide', hidePost)
router.patch('/:slug/visible', visiblePost)
router.delete('/:slug', deletePost)

module.exports = router