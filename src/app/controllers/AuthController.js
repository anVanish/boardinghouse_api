const Users = require("../models/Users")
const ErrorRes =  require('../utils/ErrorRes')
const bcrypt = require('bcryptjs')
const {generateToken, decodeToken} = require('../utils/TokenService')
const ApiRes = require("../utils/ApiRes")
const {sendMail} = require('../utils/sendMail')
const {genOtp} = require('../utils/generateOtp')
const { verify } = require("jsonwebtoken")

class AuthController{
    
    //POST /login
    async login(req, res, next){
        const {email, password} = req.body

        try{
            if (!email) throw new ErrorRes('Please enter email', 400)
            if (!password) throw new ErrorRes('Please enter password', 400)

            const user = await Users.findOne({email})
            if (!user) throw new ErrorRes('Email is not found', 400)
            
            if (!user.isVerified) throw new ErrorRes('Email not verified', 403)
            if (!user.isLocked) throw new ErrorRes('Your account has been locked', 403)

            if (!bcrypt.compareSync(password, user.password)) throw new ErrorRes('Password is incorrect', 401)

            const code = generateToken({
                _id: user._id,
                isAdmin: user.isAdmin,
                isModerator: user.isModerator
            })

            const resUser = user.toObject()
            delete resUser.password

            const apiRes = new ApiRes()
                .setSuccess()
                .setData('user', resUser)
                .setData('code', code)
            res.json(apiRes)

        }catch(error){
            next(error)
        }
    }

    //POST /register
    async register(req, res, next){
        const {email, password, name, phone} = req.body
        try{
            if (!email || !password || !name || !phone) throw new ErrorRes('Please enter both email, password, name and phone')
            let existUser = await Users.findOne({$or: [{email}, {phone}]})
            if (existUser) {
                if (existUser.email === email)
                    throw new ErrorRes('Email is already registered', 409)
                else if (existUser.phone === phone)
                    throw new ErrorRes('Phone is already registered', 409)
            }

            const salt = bcrypt.genSaltSync(10)
            const hashPassword = bcrypt.hashSync(password, salt)
            req.body.password = hashPassword

            const user = new Users(req.body)
            user.otpCode = genOtp()
            await user.save()

            await sendMail(user.email, 'Xin chào mừng đến với ABCz', `Mã OTP đăng ký của bạn là ${user.otpCode}, không nên chia sẻ mã OTP với người khác.`)
    
            const apiRes = new ApiRes().setSuccess('Mail sent, please verify email')
            res.json(apiRes)
        }catch(error){
            next(error)
            
        }
    }

    //POST /otp/resend
    async resendOTP(req, res, next){
        try{
            const {email} = req.body
            const user = await Users.findOne({email})
            if (!user) throw new ErrorRes('Email not found', 404)
            if (user.isVerified)
                throw new ErrorRes('Email is already verified', 409)

            //generate and send otp
            user.otpCode = genOtp()
            await user.save()

            await sendMail(user.email, 'Yêu cầu gửi lại mã OTP xác thực', `Mã OTP đăng ký của bạn là ${user.otpCode}, bạn không nên chia sẻ mã OTP với người khác.`)
    
            const apiRes = new ApiRes().setSuccess('Mail sent, please verify email')
            res.json(apiRes)
        } catch(error){
            next(error)
        }
    }

    //POST /verify
    async verify(req, res, next){
        const {email, otp} = req.body
        try{
            const user = await Users.findOne({email})
            if (!user) throw new ErrorRes('User not register account', 400)
            
            if (!user.isVerified){
                if (user.otpCode.toString() !== otp) throw new ErrorRes('Verified code is incorrect', 400)

                user.isVerified = true
                user.otpCode = 0
                await user.save()
            }

            const apiRes = new ApiRes().setSuccess('Email verified')
            res.json(apiRes)
        }catch(error){
            next(error)
        }
    }

    //POST /password/forgot
    async forgotPassword(req, res, next){
        const {email} = req.body
    try{
        const user = await Users.findOne({email})
        if (!user) throw new ErrorRes('User not register account', 400)
        
        user.otpCode = genOtp()
        await user.save()

        await sendMail(user.email, 'Đặt lại mật khẩu', `Mã OTP của bạn là ${user.otpCode}, sử dụng để đặt lại mật khẩu, không chia sẻ mã OTP cho người khác`)

        const apiRes = new ApiRes().setSuccess('Mail sent, please verify your email')
        res.json(apiRes)
    }catch(error){
        next(error)
    }
    }

    //POST /password/reset
    async resetPassword(req, res, next){
        const {email, otp, password} = req.body
        try{
            const user = await Users.findOne({email})
            if (!user) throw new ErrorRes('User not register account', 400)
            
            if (user.otpCode.toString() !== otp) throw new ErrorRes('OTP is incorrect')

            const salt = bcrypt.genSaltSync(10)
            const hashPassword = bcrypt.hashSync(password, salt)
            user.password = hashPassword
            user.otpCode = 0
            user.isVerified = true
            await user.save()

            const apiRes = new ApiRes().setSuccess('Password reseted')
            res.json(apiRes)
        }catch(error){
            next(error)
        }
    }

     //POST /password/verify
     async verifyOtpPassword(req, res, next){
        const {email, otp} = req.body
        try{
            const user = await Users.findOne({email})
            if (!user) throw new ErrorRes('User not register account', 400)
            
            if (user.otpCode.toString() !== otp) throw new ErrorRes('OTP is incorrect')
    
            const apiRes = new ApiRes().setSuccess('Correct')
            res.json(apiRes)
        }catch(error){
            next(error)
        }
     }


}

module.exports = new AuthController()