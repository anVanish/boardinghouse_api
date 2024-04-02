const jwt = require('jsonwebtoken')

exports.generateToken = function (data, expiresIn = '7d'){
    return jwt.sign({data}, process.env.SECRET_KEY, {expiresIn})
}


exports.decodeToken = function (token){
    try {
        return jwt.verify(token, process.env.SECRET_KEY);
    } catch (error) {
        return null;
    }
}