const Users = require('../models/Users')
const ApiRes = require("../utils/ApiRes")
const ErrorRes = require("../utils/ErrorRes")
const bcrypt = require('bcryptjs')
const filterAddUpdateUser = require('../utils/filters/filterAddUpdateUser')
const userFilter = require('../utils/filters/userFilter')

class UserController{
    //GET /me 
    async getProfile(req, res, next){
        try{
            const user = await Users.findOne({_id: req.user._id})
            if (!user) throw new ErrorRes('User not found', 404)
    
            const {password, ...profile} = user.toObject()
            const apiRes = new ApiRes().setData('user', profile)
            res.json(apiRes)
        }catch(error){
            next(error)
        }
    }

    //PUT /me
    async updateProfile(req, res, next){
        try{
            const user = await Users.findOneAndUpdate({_id: req.user._id}, filterAddUpdateUser(req.body), {new: true,  runValidators: true })
            if (!user) throw new ErrorRes('User not found', 404)
    
            const {password, ...profile} = user.toObject()
            const apiRes = new ApiRes().setData('user', profile).setSuccess('User updated')
            res.json(apiRes)
        }catch(error){
            next(error)
        }
    
    }

    //PATCH /me/password
    async updatePassword(req, res, next){
        try{
            const {oldPassword, newPassword} = req.body
            const user = await Users.findOne({_id: req.user._id})
            if (!user) throw new ErrorRes('User not found', 404)
            if (!bcrypt.compareSync(oldPassword, user.password)) throw new ErrorRes('Password is incorrect', 401)

            const salt = bcrypt.genSaltSync()
            const hashedPassword = bcrypt.hashSync(newPassword, salt)
            user.password = hashedPassword
            await user.save()
    
            const apiRes = new ApiRes().setSuccess('Password updated')
            res.json(apiRes)
        }catch(error){
            next(error)
        }
    }

    //admin
    //GET /
    async listUsers(req, res, next){
        const {pagination, filter} = userFilter(req.query)
        try{
            const users = await Users.find(filter)
                .sort({updatedAt: -1})
                .limit(pagination.limit)
                .skip(pagination.skip)
            
            const usersObject = users.map(user => {
                const {password, ...other} = user.toObject()
                return other
            })
            const total = await Users.countDocuments(filter)

            const apiRes = new ApiRes()
                .setData('total', total)
                .setData('count', usersObject.length)
                .setData('page', pagination.page)
                .setData('users', usersObject)
            res.json(apiRes)
        }catch(error){
            next(error)
        }
    }

    //GET /:userId
    async getUser(req, res, next){
        try{
            const user = await Users.findOne({_id: req.params.userId})
            if (!user) throw new ErrorRes('User not found', 404)
    
            const {password, ...profile} = user.toObject()
            const apiRes = new ApiRes().setData('user', profile)
            res.json(apiRes)
        }catch(error){
            next(error)
        }
    }

    //POST /
    async addUser(req, res, next){
        
    }

    //PUT /:userId
    async updateUser(req, res, next){
        try{
            const _id = req.params.userId
            const user = await Users.findOneAndUpdate({_id}, req.body, {new: true, runValidators: true})
            if (!user) throw new ErrorRes('User not found', 404)
            
            const {password, ...profile} = user.toObject()
            
            const apiRes = new ApiRes().setData('user', profile).setSuccess('User updated')
            res.json(apiRes)
        }catch(error){
            next(error)
        }
    }

    //PATCH /:userId/lock
    async lockUser(req, res, next){
        try{
            const _id = req.params.userId
            const user = await Users.findOneAndUpdate({_id}, {isLocked: true})
            if (!user) throw new ErrorRes('User not found', 404)

            const apiRes = new ApiRes().setSuccess('User locked')
            res.json(apiRes)
        }catch(error){
            next(error)
        }
    }

    //PATCH /:userId/unlock
    async unlockUser(req, res, next){
        try{
            const _id = req.params.userId
            const user = await Users.findOneAndUpdate({_id}, {isLocked: false})
            if (!user) throw new ErrorRes('User not found', 404)

            const apiRes = new ApiRes().setSuccess('User unlocked')
            res.json(apiRes)
        }catch(error){
            next(error)
        }
    }

    //DELETE /:userId
    async deleteUser(req, res, next){
        try{
            const _id = req.params.userId
            const user = await Users.findOneAndUpdate({_id}, {isDeleted: true, deletedAt: new Date()})
            if (!user || user.isDeleted) throw new ErrorRes("User not found", 404)
            
            const apiRes = new ApiRes().setSuccess("User deleted")
            res.json(apiRes)
        }catch(error){
            next(error)
        }
    }

    //DELETE /:userId/force
    async forceDeleteUser(req, res, next){
        try{
            const _id = req.params.userId
            const user = await Users.findOneAndDelete({_id})
            if (!user) throw new ErrorRes("User not found", 404)
            
            const apiRes = new ApiRes().setSuccess("User force deleted")
            res.json(apiRes)
        }catch(error){
            next(error)
        }
    }

    //PATCH /:userId/restore
    async restoreUser(req, res, next){
        try{
            const _id = req.params.userId
            const user = await Users.findOneAndUpdate({_id}, {isDeleted: false})
            if (!user || !user.isDeleted) throw new ErrorRes("User not found", 404)

            const apiRes = new ApiRes().setSuccess("User restored")
            res.json(apiRes)
        }catch(error){
            next(error)
        }
    }

}

module.exports = new UserController()