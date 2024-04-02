const {authToken, authAdmin} = require('../../middlewares/authenticatetion')
const express = require('express')
const router = express.Router()
const {listCates, addCate, updateCate, deleteCate} = require('../../app/controllers/CartegoryController')

router.get('/', listCates)
router.use(authToken, authAdmin)
router.post('/', addCate)
router.put('/:categoryId', updateCate)
router.delete('/:categoryId', deleteCate)

module.exports = router