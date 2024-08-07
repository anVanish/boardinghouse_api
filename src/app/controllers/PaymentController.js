const ApiRes = require('../utils/ApiRes')
const ErrorRes = require('../utils/ErrorRes')
const {getVNPayayPaymentURL, checksumVNPayParams} = require('../utils/PaymentService')
const {revertDateFormat, toVNTimezone, nextXDays, dayDiff} = require('../utils/DateUtils')
const Invoices = require('../models/Invoices')
const Packs = require('../models/Packs')
const Posts = require('../models/Posts')
const filterAddUpdateInvoice = require('../utils/filters/filterAddUpdateInvoice')


// /payments
class PaymentController{
    //POST /vnpay/me
    async createVNPPayment(req, res, next){
        try{
            const {packId, period, postId, type} = req.body

            //check type
            const paymentTypes = ['pay', 'extend']
            if (!paymentTypes.includes(type)) throw new ErrorRes('Type is invalid', 400)

            //check if post is paid
            const post = await Posts.findOne({_id: postId})
            if (!post) throw new ErrorRes('Post not found', 404)
            if (type === 'pay' && post.isPaid) throw new ErrorRes('Post has been paid', 409)
            if (type === 'extend' && !post.isExpired) throw new ErrorRes('Post has not expired yet', 409)

            const pack = await Packs.findOne({_id: packId})
            if (!pack) throw new ErrorRes('Pack not found', 404)
            req.body.amount = pack.fee * period

            const tempInvoice = new Invoices(filterAddUpdateInvoice({...req.body, userId: req.user._id, method: 'vnpay'}))
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

    //POST /vnpay/upgrade/me
    async upgradePostWithVNPay(req, res, next){
        try{
            const {postId, newPackId, expandDay} = req.body
            const request = req
            
            const {amount, period, currentPack, newPack, error} = await estimateUpgradeFee(postId, newPackId, expandDay)
            if (error) throw error

            request.body.amount = amount
            request.body.period = period + expandDay
            request.body.packId = newPack._id
            request.body.type = 'upgrade'
            request.body.currentPack = currentPack.name
            request.body.newPack = newPack.name
            request.body.expandDay = expandDay

            //temp invoices
            const tempInvoice = new Invoices(filterAddUpdateInvoice({
                ...request.body,
                userId: request.user._id,
                method: 'vnpay'
            }))
            request.body.orderId = tempInvoice._id
            await tempInvoice.save()

            const paymentUrl = getVNPayayPaymentURL(request)
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
            if (checksumVNPayParams(vnp_Params) && vnp_Params['vnp_TransactionStatus'] === '00') {
                //update invoice here
                const orderId = vnp_Params['vnp_TxnRef']
                const invoice = await Invoices.findOne({_id: orderId})
                invoice.paidAt = revertDateFormat(vnp_Params.vnp_PayDate)
                invoice.isTemp = false
                await invoice.save()

                //get pack info
                const pack = await Packs.findOne({_id: invoice.packId})

                //update post
                const post = await Posts.findOne({_id: invoice.postId})
                post.isPaid = true
                post.startedAt = toVNTimezone(new Date())
                post.endedAt = nextXDays(post.startedAt, invoice.period)
                post.isExpired = false
                post.priority = pack.priority
                post.type = invoice.packId
                await post.save()

                return res.status(200).json({RspCode: '00', Message: 'success'})
            }
            res.status(200).json({RspCode: '97', Message: 'Fail checksum'})
        }catch(error){
            res.status(200).json({RspCode: '97', Message: 'Fail checksum'})
        }
    }

    //POST /vnpay/checksum/me
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

    //POST /estimate/upgrade/me
    async estimateUpgradeAmount(req, res, next){
        try{
            const { postId, newPackId, expandDay } = req.body
            const { amount, error, restDay } = await estimateUpgradeFee(postId, newPackId, expandDay)
            if (error) throw error

            res.json(new ApiRes()
                .setSuccess('Estimate successfully')
                .setData('amount', amount)
                .setData('restDay', restDay)
            )
        }catch(error){
            next(error)
        }
    }

}

async function estimateUpgradeFee(postId, newPackId, expandDay){
    try{
        const post = await Posts.findOne({_id: postId})
        if (!post) throw new ErrorRes('Post not found', 404)
        if (post.isExpired ) throw new ErrorRes('Post has been expired', 400)
        if (!post.isPaid) throw new ErrorRes('Post has not been paid yet', 400)
        const period = dayDiff(post.startedAt, post.endedAt)


        const currentPack = await Packs.findOne({_id: post.type})
        const newPack = await Packs.findOne({_id: newPackId})
        if (!newPack) throw new ErrorRes('Pack to upgrade not found', 404)
        if (currentPack.fee > newPack.fee) throw new ErrorRes('Can only upgrade to higher pack', 400)

        //calculate fee
        const restDay = dayDiff(toVNTimezone(new Date()), post.endedAt)
        const amount = restDay * (newPack.fee - currentPack.fee) + expandDay * newPack.fee

        return {
            amount,
            period, 
            restDay,
            currentPack: currentPack.toObject(), 
            newPack: newPack.toObject(), 
        }
    }catch(error){
        return {error}
    }
}

module.exports = new PaymentController()

