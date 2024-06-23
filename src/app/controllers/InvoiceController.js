const Invoices = require('../models/Invoices')
const ApiRes = require('../utils/ApiRes')
const ErrorRes = require('../utils/ErrorRes')
const filterAddUpdateInvoice = require('../utils/filters/filterAddUpdateInvoice')
const Posts = require('../models/Posts')
const invoiceFilter = require('../utils/filters/invoiceFilter')

class InvoiceController{
    //user
    //GET /me
    async listMyInvoice(req, res, next){
        const {pagination, filter} = invoiceFilter(req.query)
        try{
            const invoices = await Invoices.find({userId: req.user._id, ...filter})
                .sort({updatedAt: -1})
                .limit(pagination.limit)
                .skip(pagination.skip)
            const total = await Invoices.countDocuments({userId: req.user._id, ...filter})

            const apiRes = new ApiRes()
                .setData('total', total)
                .setData('count', invoices.length)
                .setData('page', pagination.page)
                .setData('invoices', invoices)
            res.json(apiRes)
        }catch(error){
            next(error)
        }
    }

    //GET /:invoiceId/me
    async getMyInvoice(req, res, next){
        try{
            const invoice = await Invoices.findOne({_id: req.params.invoiceId, userId: req.user._id})
                        .populate('userId', 'name email phone')
                        .populate('postId', 'title slug')
                        .populate('packId', 'name description fee')

            if (!invoice) throw new ErrorRes('Inoivce not found', 404)
            
            const apiRes = new ApiRes().setData('invoice', invoice)
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
    //GET /
    async listInvoice(req, res, nexy){
        const {pagination, filter} = invoiceFilter(req, query)

        try{
            const invoices = await Invoices.find(filter)
                .sort({updatedAt: -1})
                .limit(pagination.limit)
                .skip(pagination.skip)
            const total = await Invoices.countDocuments(filter)

            const apiRes = new ApiRes()
                .setData('total', total)
                .setData('count', invoices.length)
                .setData('page', pagination.page)
                .setData('invoices', invoices)
            res.json(apiRes)
        }catch(error){
            next(error)
        }
    }

    //GET /:invoiceId
    async getInvoice(req, res, next){
        try{
            const invoice = await Invoices.findOne({_id: req.params.invoiceId})
                        .populate('userId', 'name email phone')
                        .populate('postId', 'title slug')
                        .populate('packId', 'name description fee')
            if (!invoice) throw new ErrorRes('Inoivce not found', 404)

            const apiRes = new ApiRes().setData('invoice', invoice)
            res.json(apiRes)
        }catch(error){
            next(error)
        }
    }

}

module.exports = new InvoiceController()