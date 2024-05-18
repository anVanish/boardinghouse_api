const Posts = require('../models/Posts')
const ApiRes = require('../utils/ApiRes')
const ErrorRes = require('../utils/ErrorRes')
const filterAddUpdatePost = require('../utils/filters/filterAddUpdatePost')

class PostController{
    
    //GET /
    async listPosts(req, res, next){
        const page = req.query.page || 1
        const limit = req.query.limit || 6
        // const search = req.query.search || ''
        // const filter = {'name': { $regex: `.*${search}.*`, $options: 'i' }}

        try{
            const posts = await Posts.find({isApproved: true})
                .sort({updatedAt: -1})
                .limit(limit)
                .skip((page - 1) * limit)
                .populate('userId', 'name')
                .populate('categoryId', 'name')
            const count = await Posts.countDocuments({isApproved: true})

            const apiRes = new ApiRes()
                .setData('count', count)
                .setData('posts', posts)
            res.json(apiRes)
        }catch(error){
            next(error)
        }
    }

    //GET /:slug
    async getPost(req, res, next){
        try{
            const post = await Posts.findOne({slug: req.params.slug})
                .populate('userId', 'name phone email zalo facebook')
                .populate('categoryId', 'name')
            if (!post) throw new ErrorRes('Post not found', 404)
            const apiRes = new ApiRes().setData('post', post)
            res.json(apiRes)
        }catch(error){
            next(error)
        }
    }

    //user
    //GET /me
    async myPosts(req, res, next){
        const page = req.query.page || 1
        const limit = req.query.limit || 6
        // const search = req.query.search || ''
        // const filter = {$and: 
        //     [{'name': { $regex: `.*${search}.*`, $options: 'i' }}, 
        //     {userId: req.user._id}]
        // }
        try{
            const posts = await Posts.find({userId: req.user._id})
                .sort({updatedAt: -1})
                .limit(limit)
                .skip((page - 1) * limit)
            const count = await Posts.countDocuments({userId: req.user._id})

            const apiRes = new ApiRes()
                .setData('count', count)
                .setData('posts', posts)
            res.json(apiRes)
        }catch(error){
            next(error)
        }
    }

    //POST /me
    async addMyPost(req, res, next){
        try{
            const filteredPost = filterAddUpdatePost(req.body)
            filteredPost.userId = req.user._id
            const post = new Posts(filteredPost)
            await post.save({runValidators: true})
            const apiRes = new ApiRes().setData('post', post).setSuccess('Post added')
            res.json(apiRes)
        }catch(error){
            next(error)
        }
    }

    //PUT /:slug/me
    async updateMyPost(req, res, next){
        try{
            const post = await Posts.findOneAndUpdate({slug: req.params.slug, userId: req.user._id}, filterAddUpdatePost(req.body), {new: true, runValidators: true})
            if (!post) throw new ErrorRes('Post not found', 404)
            const apiRes = new ApiRes().setData(['post'], post).setSuccess('Post updated')
            res.json(apiRes)
        }catch(error){
            next(error)
        }
    }

    //DELETE /:slug/me
    async deleteMyPost(req, res, next){
        try{
            const post = await Posts.findOneAndDelete({slug: req.params.slug, userId: req.user._id})
            if (!post) throw new ErrorRes('Post not found', 404)
            const apiRes = new ApiRes().setSuccess('Post deleted')
            res.json(apiRes)
        }catch(error){
            next(error)
        }
    }

    //moderator
    //GET /moderators
    async listUnapprovedPost(req, res, next){
        const page = req.query.page || 1
        const limit = req.query.limit || 6
        // const search = req.query.search || ''
        // const filter = {'name': { $regex: `.*${search}.*`, $options: 'i' }}

        try{
            const posts = await Posts.find({isApproved: false})
                .sort({updatedAt: -1})
                .limit(limit)
                .skip((page - 1) * limit)
            const count = await Posts.countDocuments({isApproved: false})

            const apiRes = new ApiRes()
                .setData('count', count)
                .setData('posts', posts)
            res.json(apiRes)
        }catch(error){
            next(error)
        }
    }

    //PATCH /:slug/approved
    async approvedPost(req, res, next){
        try{
            const toUpdateData = {isApproved: true, moderatedBy: req.user._id}
            const post = await Posts.findOneAndUpdate({slug: req.params.slug}, toUpdateData, {new: true})
            if (!post) throw new ErrorRes('Post not found', 404)
            const apiRes = new ApiRes().setData(['post'], post).setSuccess('Post approved')
            res.json(apiRes)
        }catch(error){
            next(error)
        }
    }

    //PATCH /:slug/violated
    async violatedPost(req, res, next){
        try{
            const {violation} = req.body
            if (!violation) throw new ErrorRes('Missing violation reason', 400)

            const toUpdateData = {isApproved: false, moderatedBy: req.user._id, violation}
            const post = await Posts.findOneAndUpdate({slug: req.params.slug}, toUpdateData, {new: true})
            if (!post) throw new ErrorRes('Post not found', 404)
            const apiRes = new ApiRes().setData(['post'], post).setSuccess('Post unapproved')
            res.json(apiRes)
        }catch(error){
            next(error)
        }
    }
    
    //admin
    //POST /
    async addPost(req, res, next){
        try{
            const filteredPost = filterAddUpdatePost(req.body)
            filteredPost.userId = req.body.userId
            const post = new Posts(filteredPost)
            await post.save({runValidators: true})
            const apiRes = new ApiRes().setData('post', post).setSuccess('Post added')
            res.json(apiRes)
        }catch(error){
            next(error)
        }
    }

    //PUT /:slug
    async updatePost(req, res, next){
        try{
            const post = await Posts.findOneAndUpdate({slug: req.params.slug}, filterAddUpdatePost(req.body), {new: true, runValidators: true})
            if (!post) throw new ErrorRes('Post not found', 404)
            const apiRes = new ApiRes().setData(['post'], post).setSuccess('Post updated')
            res.json(apiRes)
        }catch(error){
            next(error)
        }
    }

    //DELETE /:postId
    async deletePost(req, res, next){
        try{
            const post = await Posts.findOneAndDelete({slug: req.params.slug})
            if (!post) throw new ErrorRes('Post not found', 404)
            const apiRes = new ApiRes().setSuccess('Post deleted')
            res.json(apiRes)
        }catch(error){
            next(error)
        }
    }

}

module.exports = new PostController()