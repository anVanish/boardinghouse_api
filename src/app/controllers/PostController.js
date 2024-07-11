const Posts = require('../models/Posts')
const ApiRes = require('../utils/ApiRes')
const ErrorRes = require('../utils/ErrorRes')
const filterAddUpdatePost = require('../utils/filters/filterAddUpdatePost')
const {postFilter, postUserFilter, postModeratorFilter, postAdminFilter, postAdminModeratorFilter} = require('../utils/filters/posts')
const {uploadMultipleMedia, uploadMedia} = require('../utils/uploadMedia')

class PostController{
    // ----------------------------------------
    //GET /
    async listPosts(req, res, next){
        const {pagination, filter, sort} = postFilter(req.query)

        try{
            const posts = await Posts.find(filter)
                .sort(sort)
                .limit(pagination.limit)
                .skip(pagination.skip)
                .populate('userId', 'name')
                .populate('categoryId', 'name')
                .populate('type', 'name')
            const total = await Posts.countDocuments(filter)

            const apiRes = new ApiRes()
                .setData('total', total)
                .setData('count', posts.length)
                .setData('page', pagination.page)
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
                .populate('userId', 'name phone email zalo facebook img')
                .populate('categoryId', 'name')
                .populate('type', 'name')
            if (!post || post.isHided || !post.isPaid || !post.isApproved || post.isExpired) throw new ErrorRes('Post not found', 404)

            post.views = post.views + 1
            await post.save()
            const apiRes = new ApiRes().setData('post', post)
            res.json(apiRes)
        }catch(error){
            next(error)
        }
    }

    //GET /:slug/popular
    async listPopularPosts(req, res, next){
        try{
            const {slug} = req.params
            const currentPost = await Posts.findOne({slug})
            if (!currentPost) throw new ErrorRes('Slug not found', 404)

            const filter = {
                'address.city': currentPost.address.city,
                'address.district': currentPost.address.district,
                priority: {$gt: 1},
                slug: {$ne: slug},
                isPaid: true, isApproved: true, isHided: false, isExpired: false,
            }

            const popularPosts = await Posts.find(filter)
                .sort({priority: -1, views: -1, createdAt: -1})
                .limit(5)
                .populate('userId', 'name')
                .populate('categoryId', 'name')
                .populate('type', 'name')

            res.json(new ApiRes()
                .setSuccess()
                .setData('total', popularPosts.length)
                .setData('popularPosts', popularPosts)
            )
        }catch(error){
            next(error)
        }
    }

    //GET /:slug/latest
    async listLatestPosts(req, res, next){
        try{
            const {slug} = req.params
            const currentPost = await Posts.findOne({slug})
            if (!currentPost) throw new ErrorRes('Slug not found', 404)

            const latestPosts = await Posts.find({
                'address.city': currentPost.address.city,
                'address.district': currentPost.address.district,
                priority: 1,
                slug: {$ne: slug},
                isPaid: true, isApproved: true, isHided: false, isExpired: false, 
            })
                .sort({createdAt: -1})
                .limit(10)
                .populate('userId', 'name')
                .populate('categoryId', 'name')
                .populate('type', 'name')

            res.json(new ApiRes()
                .setSuccess()
                .setData('total', latestPosts.length)
                .setData('latestPosts', latestPosts)
            )
        }catch(error){
            next(error)
        }
    }

    //user ----------------------------------------
    //GET /me
    async myPosts(req, res, next){
        const {pagination, filter, sort} = postUserFilter(req.query, req.user._id)

        try{
            const posts = await Posts.find(filter)
                .sort(sort)
                .limit(pagination.limit)
                .skip(pagination.skip)
                .populate('categoryId', 'name')

            const total = await Posts.countDocuments(filter)

            const apiRes = new ApiRes()
                .setData('total', total)
                .setData('page', pagination.page)
                .setData('posts', posts)
            res.json(apiRes)
        }catch(error){
            next(error)
        }
    }

    //GET /:slug/me
    async getMyPost(req, res, next){
        try{
            const post = await Posts.findOne({slug: req.params.slug, userId: req.user._id})
                .populate('userId', 'name phone email zalo facebook img')
                .populate('categoryId', 'name')
                .populate('moderatedBy', 'name phone')
                .populate('type', 'name')
            if (!post) throw new ErrorRes('Post not found', 404)
            const apiRes = new ApiRes().setData('post', post)
            res.json(apiRes)
        }catch(error){
            next(error)
        }
    }

    //POST /me
    async addMyPost(req, res, next){
        try{
            const requestBody = filterAddUpdatePost(req.body)
            requestBody.userId = req.user._id
            const post = new Posts(requestBody)
            
            if (req.files && req.files.imageFiles) post.images = await uploadMultipleMedia(req.files.imageFiles, requestBody.images, `houses/${post._id}`)

            if (req.files && req.files.videoFile) post.video = await uploadMedia(req.files.videoFile[0], `housesVideo/video_${post._id}`)

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
            //get post
            const post = await Posts.findOne({slug: req.params.slug, userId: req.user._id})
            if (!post) throw new ErrorRes('Post not found', 404)
            
            //upload imagaes and video
            const requestBody = filterAddUpdatePost(req.body)
            if (req.files && req.files.imageFiles) requestBody.images.push(...await uploadMultipleMedia(req.files.imageFiles, requestBody.images, `houses/${post._id}`))

            if (req.files && req.files.videoFile) requestBody.video = await uploadMedia(req.files.videoFile[0], `housesVideo/video_${post._id}`)

            const updatedPost = await Posts.findOneAndUpdate(
                {slug: req.params.slug, userId: req.user._id}, 
                {...requestBody, isApproved: false, isViolated: false, moderatedBy: null, violation: ''}, 
                {new: true, runValidators: true})
            const apiRes = new ApiRes()
                    .setData('post', updatedPost)
                    .setSuccess('Post updated')
            res.json(apiRes)
        }catch(error){
            next(error)
        }
    }

    //PATCH /:slug/hide/me
    async hideMyPost(req, res, next){
        try{
            const post = await Posts.findOneAndUpdate({slug: req.params.slug, userId: req.user._id, isHided: false}, {isHided: true}, {new: true})
            if (!post) throw new ErrorRes('Post not found', 404)
            const apiRes = new ApiRes().setData(['post'], post).setSuccess('Post hided')
            res.json(apiRes)
            
        }catch(error){
            next(error)
        }
    }

    //PATCH /:slug/visible/me
    async visibleMyPost(req, res, next){
        try{
            const post = await Posts.findOneAndUpdate({slug: req.params.slug, userId: req.user._id, isHided: true}, {isHided: false}, {new: true})
            if (!post) throw new ErrorRes('Post not found', 404)
            const apiRes = new ApiRes().setData(['post'], post).setSuccess('Post visibled')
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

    //moderator ----------------------------------------
    //GET /moderators
    async listPostsModerator(req, res, next){
        const {pagination, filter, sort} = postModeratorFilter(req.query, req.user._id)

        try{
            const posts = await Posts.find(filter)
                .sort(sort)
                .limit(pagination.limit)
                .skip(pagination.skip)
                .populate('categoryId', 'name')
                .populate('userId', 'name phone email')
                .populate('type', 'name')
            const total = await Posts.countDocuments(filter)

            const apiRes = new ApiRes()
                .setData('total', total)
                .setData('count', posts.length)
                .setData('page', pagination.page)
                .setData('filter', filter)
                .setData('posts', posts)
            res.json(apiRes)
        }catch(error){
            next(error)
        }
    }

    //GET /:slug/moderator
    async getPostModerator(req, res, next){
        try{
            const post = await Posts.findOne({slug: req.params.slug})
                .populate('userId', 'name phone email zalo facebook img')
                .populate('categoryId', 'name')
                .populate('type', 'name')
            if (!post) throw new ErrorRes('Post not found', 404)
            const apiRes = new ApiRes().setData('post', post)
            res.json(apiRes)
        }catch(error){
            next(error)
        }
    }

    //PATCH /:slug/approved
    async approvedPost(req, res, next){
        try{
            const post = await Posts.findOneAndUpdate(
                {slug: req.params.slug}, 
                {isApproved: true, isViolated: false, moderatedBy: req.user._id}, 
                {new: true})
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

            const post = await Posts.findOneAndUpdate(
                {slug: req.params.slug}, 
                {violation, isViolated: true, isApproved: false, moderatedBy: req.user._id}, 
                {new: true})
            if (!post) throw new ErrorRes('Post not found', 404)
            const apiRes = new ApiRes().setData(['post'], post).setSuccess('Post unapproved')
            res.json(apiRes)
        }catch(error){
            next(error)
        }
    }
    
    //admin ----------------------------------------
    //GET /admin
    async listPostsAdmin(req, res, next){
        try{
            const {pagination, filter, sort} = postAdminFilter(req.query)

            const posts = await Posts.find(filter)
                        .sort(sort)
                        .limit(pagination.limit)
                        .skip(pagination.skip)
                        .populate('userId', 'name phone email')
                        .populate('categoryId', 'name')
                        .populate('type', 'name')
            const total = await Posts.countDocuments(filter)
            const apiRes = new ApiRes()
                        .setSuccess()
                        .setData('total', total)
                        .setData('count', posts.length)       
                        .setData('page', pagination.page)
                        .setData('posts', posts)
            res.json(apiRes)
        }catch(error){
            next(error)
        }
    }

    //GET /:slug/admin
    async getPostAdmin(req, res, next){
        try{
            const post = await Posts.findOne({slug: req.params.slug})
                .populate('userId', 'name phone email zalo facebook img')
                .populate('categoryId', 'name')
                .populate('moderatedBy', 'name phone')
                .populate('type', 'name')
            if (!post) throw new ErrorRes('Post not found', 404)
            const apiRes = new ApiRes().setData('post', post)
            res.json(apiRes)
        }catch(error){
            next(error)
        }
    }

    //GET /admin/moderator
    async listPostsAdminModerator(req, res, next){
        try{
            const {pagination, filter, sort} = postAdminModeratorFilter(req.query, req.user._id)     
            const posts = await Posts.find(filter)
                        .sort(sort)
                        .limit(pagination.limit)
                        .skip(pagination.skip)
                        .populate('userId', 'name phone email')
                        .populate('moderatedBy', 'name phone email')
                        .populate('categoryId', 'name')
                        .populate('type', 'name')
            const total = await Posts.countDocuments(filter)

            const apiRes = new ApiRes()
                        .setSuccess()
                        .setData('total', total)       
                        .setData('count', posts.length)       
                        .setData('page', pagination.page)
                        .setData('posts', posts)       
            res.json(apiRes)

        }catch(error){
            next(error)
        }
    }

    //POST /
    async addPost(req, res, next){
        try{
            const requestBody = filterAddUpdatePost(req.body)
            requestBody.userId = req.body.userId
            const post = new Posts(requestBody)
            
            if (req.files && req.files.imageFiles) post.images = await uploadMultipleMedia(req.files.imageFiles, requestBody.images, `houses/${post._id}`)

            if (req.files && req.files.videoFile) post.video = await uploadMedia(req.files.videoFile[0], `housesVideo/video_${post._id}`)

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
            //get post
            const post = await Posts.findOne({slug: req.params.slug})
            if (!post) throw new ErrorRes('Post not found', 404)
            
            //upload imagaes and video
            const requestBody = filterAddUpdatePost(req.body)
            if (req.files && req.files.imageFiles) requestBody.images.push(...await uploadMultipleMedia(req.files.imageFiles, requestBody.images, `houses/${post._id}`))

            if (req.files && req.files.videoFile) requestBody.video = await uploadMedia(req.files.videoFile[0], `housesVideo/video_${post._id}`)

            const updatedPost = await Posts.findOneAndUpdate(
                {slug: req.params.slug}, 
                {...requestBody, isApproved: false, isViolated: false, moderatedBy: null, violation: ''}, 
                {new: true, runValidators: true})
            const apiRes = new ApiRes()
                    .setData('post', updatedPost)
                    .setSuccess('Post updated')
            res.json(apiRes)
        }catch(error){
            next(error)
        }
    }

    //PATCH /:slug/hide
    async hidePost(req, res, next){
        try{
            const post = await Posts.findOneAndUpdate({slug: req.params.slug, isHided: false}, {isHided: true}, {new: true})
            if (!post) throw new ErrorRes('Post not found', 404)
            const apiRes = new ApiRes().setData(['post'], post).setSuccess('Post hided')
            res.json(apiRes)
            
        }catch(error){
            next(error)
        }
    }

    //PATCH /:slug/visible
    async visiblePost(req, res, next){
        try{
            const post = await Posts.findOneAndUpdate({slug: req.params.slug, isHided: true}, {isHided: false}, {new: true})
            if (!post) throw new ErrorRes('Post not found', 404)
            const apiRes = new ApiRes().setData(['post'], post).setSuccess('Post visibled')
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