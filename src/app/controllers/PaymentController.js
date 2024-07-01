const ApiRes = require('../utils/ApiRes')
const ErrorRes = require('../utils/ErrorRes')
const {getVNPayayPaymentURL, checksumVNPayParams} = require('../utils/PaymentService')
const {revertDateFormat} = require('../utils/formatDate')
const Invoices = require('../models/Invoices')

// /payments
class PaymentController{
    //POST /vnpay/me
    async createVNPPayment(req, res, next){
        try{
            const paymentUrl = getVNPayayPaymentURL(req)
            res.json(new ApiRes()
                .setSuccess()
                .setData('paymentUrl', paymentUrl)
            )
        }catch(error){
            next(error)
        }
    }

    //GET /vnpay/ipn
    async ipnVNPPayment(req, res, next){
        try{
            let vnp_Params = req.query
            if (checksumVNPayParams(vnp_Params)) {
                //update invoice here

                return res.status(200).json({RspCode: '00', Message: 'success'})
            }
            res.status(200).json({RspCode: '97', Message: 'Fail checksum'})
        }catch(error){
            res.status(200).json({RspCode: '97', Message: 'Fail checksum'})
        }
    }

    //POST /vnpay/checksum
    async checksumVNPPayment(req, res, next){
        try{
            const isValid = checksumVNPayParams(req.query)
            res.json(new ApiRes()
                .setData('isValid', isValid)
            )
        }catch(error){
            next(error)
        }
    }

}

module.exports = new PaymentController()

