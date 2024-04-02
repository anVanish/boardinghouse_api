const {authToken, authUser, authAdmin} = require('../../middlewares/authenticatetion')
const express = require('express')
const router = express.Router()
const {listInvoice, listMyInvoice, addMyInvoice} = require('../../app/controllers/InvoiceController')

router.use(authToken)
router.get('/me', authUser, listMyInvoice)
router.post('/me', authUser, addMyInvoice)

router.use(authAdmin)
router.get('/', listInvoice)


module.exports = router