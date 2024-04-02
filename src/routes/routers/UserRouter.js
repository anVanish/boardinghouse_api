const {authToken, authUser, authAdmin} = require('../../middlewares/authenticatetion')
const express = require('express')
const router = express.Router()
const {getProfile, updateProfile, updatePassword, listUsers, getUser, updateUser, deleteUser, addUser, lockUser, unlockUser } = require('../../app/controllers/UserController')

router.use(authToken)
router.get('/me', authUser, getProfile)
router.put('/me', authUser, updateProfile)
router.patch('/me/password', authUser, updatePassword)

router.use(authAdmin)
router.get('/', listUsers)
router.get('/:userId', getUser)
router.post('/', addUser)
router.put('/:userId', updateUser)
router.patch('/:userId/lock', lockUser)
router.patch('/:userId/unlock', unlockUser)
router.delete('/:userId', deleteUser)

module.exports = router