const Packs = require('../models/Packs')
const ApiRes = require('../utils/ApiRes')
const ErrorRes = require('../utils/ErrorRes')
const filterAddUpdatePack = require('../utils/filters/filterAddUpdatePack')

class PackController{
    //GET /packs
    async listPacks(req, res, next){
        try{
            const packs = await Packs.find({})
                .sort({updatedAt: -1})
            const count = await Packs.countDocuments({})
    
            const apiRes = new ApiRes()
                .setData('count', count)
                .setData('packs', packs)
            res.json(apiRes)
        }catch(error){
            next(error)
        }
    }

    //POST /packs
    async addPack(req, res, next){
        try{
            const pack = new Packs(filterAddUpdatePack(req.body))
            await pack.save()
            const apiRes = new ApiRes().setData('pack', pack).setSuccess('Pack added')
            res.json(apiRes)
        }catch(error){
            next(error)
        }
    }

    //PUT /packs/:packId
    async updatePack (req, res, next){
        try{
            const pack = await Packs.findOneAndUpdate({_id: req.params.packId}, filterAddUpdatePack(req.body), {new: true})
            if (!pack) throw new ErrorRes('Pack not found', 404)
            const apiRes = new ApiRes().setData(['pack'], pack).setSuccess('Pack updated')
            res.json(apiRes)
        } catch(error){
            next(error)
        }
    }

    //DELETE /packs/:packId
    async deletePack(req, res, next){
        try{
            const pack = await Packs.findOneAndDelete({_id: req.params.packId})
            if (!pack) throw new ErrorRes('Pack not found', 404)
            const apiRes = new ApiRes().setSuccess('Pack deleted')
            res.json(apiRes)
        } catch(error){
            next(error)
        }
    }
}

module.exports = new PackController()



