const {authToken, authUser, authAdmin} = require('../../middlewares/authenticatetion')
const express = require('express')
const router = express.Router()
const {listInvoice, listMyInvoice, getMyInvoice, addMyInvoice, getInvoice} = require('../../app/controllers/InvoiceController')

router.use(authToken)
router.get('/me', authUser, listMyInvoice)
router.get('/:invoiceId', authUser, getMyInvoice)

router.use(authAdmin)
router.get('/', listInvoice)
router.get('/', getInvoice)


module.exports = router