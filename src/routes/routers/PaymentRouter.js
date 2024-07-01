const {authToken, authAdmin, authUser} = require('../../middlewares/authenticatetion')
const express = require('express')
const router = express.Router()
const {createVNPPayment, checksumVNPPayment, ipnVNPPayment} = require('../../app/controllers/PaymentController')

router.use(authToken, authUser)
router.get('/vnpay/ipn', ipnVNPPayment)
router.post('/vnpay/checksum/me', checksumVNPPayment)
router.post('/vnpay/me', createVNPPayment)

module.exports = router