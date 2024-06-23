const {authToken, authAdmin} = require('../../middlewares/authenticatetion')
const express = require('express')
const router = express.Router()
const {listPacks, updatePack, addPack, deletePack} = require('../../app/controllers/PackController')

router.get('/', listPacks)
router.use(authToken, authAdmin)
router.post('/', addPack)
router.put('/:packId', updatePack)
router.delete('/:packId', deletePack)

module.exports = router