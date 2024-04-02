const otpGenerator = require('otp-generator')

exports.genOtp = ()=>{
    return otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
}