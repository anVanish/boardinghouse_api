const Categories = require('../models/Categories')
const ApiRes = require('../utils/ApiRes')
const ErrorRes = require('../utils/ErrorRes')
const filterAddUpdateCate = require('../utils/filters/filterAddUpdateCate')

class CategoryController{
    //GET /categories
    async listCates(req, res, next){
        try{
            const cates = await Categories.find({})
                .sort({updatedAt: -1})
            const count = await Categories.countDocuments({})
    
            const apiRes = new ApiRes()
                .setData('count', count)
                .setData('cates', cates)
            res.json(apiRes)
        }catch(error){
            next(error)
        }
    }

    //POST /categories
    async addCate(req, res, next){
        try{
            const cate = new Categories(filterAddUpdateCate(req.body))
            await cate.save()
            const apiRes = new ApiRes().setData('cate', cate).setSuccess('Category added')
            res.json(apiRes)
        }catch(error){
            next(error)
        }
    }

    //PUT /categories/:categoryId
    async updateCate (req, res, next){
        try{
            const cate = await Categories.findOneAndUpdate({_id: req.params.categoryId}, filterAddUpdateCate(req.body), {new: true})
            if (!cate) throw new ErrorRes('Category not found', 404)
            const apiRes = new ApiRes().setData(['cate'], cate).setSuccess('Category updated')
            res.json(apiRes)
        } catch(error){
            next(error)
        }
    }

    //DELETE /categories/:categoryId
    async deleteCate(req, res, next){
        try{
            const cate = await Categories.findOneAndDelete({_id: req.params.categoryId})
            if (!cate) throw new ErrorRes('Category not found', 404)
            const apiRes = new ApiRes().setSuccess('Category deleted')
            res.json(apiRes)
        } catch(error){
            next(error)
        }
    }
}

module.exports = new CategoryController()



