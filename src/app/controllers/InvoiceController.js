const Invoices = require('../models/Invoices')
const ApiRes = require('../utils/ApiRes')
const ErrorRes = require('../utils/ErrorRes')
const filterAddUpdateInvoice = require('../utils/filters/filterAddUpdateInvoice')
const Posts = require('../models/Posts')

class InvoiceController{
    //user
    //GET /me
    async listMyInvoice(req, res, next){
        const page = req.query.page || 1
        const limit = req.query.limit || 6
        // const search = req.query.search || ''
        // const filter = {'name': { $regex: `.*${search}.*`, $options: 'i' }}

        try{
            const invoices = await Invoices.find({userId: req.user._id})
                .sort({updatedAt: -1})
                .limit(limit)
                .skip((page - 1) * limit)
            const count = await Invoices.countDocuments({userId: req.user._id})

            const apiRes = new ApiRes()
                .setData('count', count)
                .setData('posts', invoices)
            res.json(apiRes)
        }catch(error){
            next(error)
        }
    }

    //POST /me
    async addMyInvoice(req, res, next){
        try{
            const filteredInvoice = filterAddUpdateInvoice(req.body)
            filteredInvoice.userId = req.user._id

            const post = await Posts.findOne({_id: filteredInvoice.postId, userId: req.user._id})
            if (!post) throw new ErrorRes('Post not found', 404)
            if (post.isPaid) throw new ErrorRes('Post is already paid')

            const invoice = new Invoices(filteredInvoice)
            await invoice.save({runValidators: true})
            post.isPaid = true
            await post.save()

            const apiRes = new ApiRes().setData('invoice', invoice).setSuccess('Invoice added')
            res.json(apiRes)
        }catch(error){
            next(error)
        }
    }

    //admin
    //GET
    async listInvoice(req, res, nexy){
        const page = req.query.page || 1
        const limit = req.query.limit || 6
        // const search = req.query.search || ''
        // const filter = {'name': { $regex: `.*${search}.*`, $options: 'i' }}

        try{
            const invoices = await Invoices.find({})
                .sort({updatedAt: -1})
                .limit(limit)
                .skip((page - 1) * limit)
            const count = await Invoices.countDocuments({})

            const apiRes = new ApiRes()
                .setData('count', count)
                .setData('posts', invoices)
            res.json(apiRes)
        }catch(error){
            next(error)
        }
    }
}

module.exports = new InvoiceController()