const ApiRes = require('../utils/ApiRes')
const ErrorRes = require('../utils/ErrorRes')
const {getVNPayayPaymentURL, checksumVNPayParams} = require('../utils/PaymentService')
const {revertDateFormat, toVNTimezone, nextXDays} = require('../utils/formatDate')
const Invoices = require('../models/Invoices')
const Packs = require('../models/Packs')
const Posts = require('../models/Posts')

// /payments
class PaymentController{
    //POST /vnpay/me
    async createVNPPayment(req, res, next){
        try{
            const {packId, period, postId, type} = req.body

            //check type
            const paymentTypes = ['pay', 'extend']
            if (!paymentTypes.includes(req.body.type)) throw new ErrorRes('Type is invalid', 404)

            //check if post is paid
            const post = await Posts.findOne({_id: postId})
            if (!post) throw new ErrorRes('Post not found', 404)
            if (post.isPaid && type === 'pay') throw new ErrorRes('Post has been paid', 409)
            if (type === 'extend' && post.endedAt && post.endedAt > new Date()) throw new ErrorRes('Post has not expired yet', 409)

            const pack = await Packs.findOne({_id: packId})
            req.body.amount = pack.fee * period

            const tempInvoice = new Invoices({...req.body, userId: req.user._id, method: 'vnpay'})
            req.body.orderId = tempInvoice._id
            await tempInvoice.save()

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
                const orderId = vnp_Params['vnp_TxnRef']
                const invoice = await Invoices.findOne({_id: orderId})
                invoice.paidAt = revertDateFormat(vnp_Params.vnp_PayDate)
                invoice.isTemp = false
                await invoice.save()

                //get pack info / priority
                const packNames = ['Tin thường', 'Tin Vip', 'Tin Vip nổi bật']
                const pack = await Packs.findOne({_id: invoice.packId})
                const priority = packNames.includes(pack.name) ? packNames.indexOf(pack.name) : 0

                //update post
                const post = await Posts.findOne({_id: invoice.postId})
                post.isPaid = true
                post.startedAt = toVNTimezone(new Date())
                post.endedAt = nextXDays(post.startedAt, invoice.period)
                post.priority = priority
                await post.save()

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

