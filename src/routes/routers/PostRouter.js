const {authToken, authUser, authModerator, authAdmin} = require('../../middlewares/authenticatetion')
const express = require('express')
const router = express.Router()
const {listPosts, addPost, getPost, updatePost, deletePost, myPosts, addMyPost, updateMyPost, deleteMyPost, listPostsModerator, approvedPost, violatedPost, listPostsAdmin} = require('../../app/controllers/PostController')

router.get('/me',authToken, authUser, myPosts)
router.get('/moderators', authToken, authModerator, listPostsModerator)
router.get('/admin', authToken, authAdmin, listPostsAdmin)
router.get('/', listPosts)
router.get('/:slug', getPost)

router.use(authToken)
//user
router.post('/me', authUser, addMyPost)
router.put('/:slug/me', authUser, updateMyPost)
router.delete('/:slug/me', authUser, deleteMyPost)

//moderator
router.patch('/:slug/approved', authUser, approvedPost)
router.patch('/:slug/violated', authUser, violatedPost)

//admin
router.use(authAdmin)
router.post('/', addPost)
router.put('/:slug', updatePost)
router.delete('/:slug', deletePost)

module.exports = router