const {authToken, authUser, authAdmin} = require('../../middlewares/authenticatetion')
const express = require('express')
const router = express.Router()
const {getProfile, updateProfile, updatePassword, listUsers, getUser, updateUser, deleteUser, addUser, lockUser, unlockUser, forceDeleteUser, restoreUser } = require('../../app/controllers/UserController')

//multer as middlewares
const multer = require('multer')
const upload = multer({ storage: multer.memoryStorage()})


router.use(authToken)
router.get('/me', authUser, getProfile)
router.put('/me', authUser, upload.single('imgFile'), updateProfile)
router.patch('/me/password', authUser, updatePassword)

router.use(authAdmin)
router.get('/', listUsers)
router.get('/:userId', getUser)
router.post('/', addUser)
router.put('/:userId', upload.single('img'), updateUser)
router.patch('/:userId/lock', lockUser)
router.patch('/:userId/unlock', unlockUser)
router.delete('/:userId', deleteUser)
router.delete('/:userId/force', forceDeleteUser)
router.patch('/:userId/restore', restoreUser)

module.exports = router