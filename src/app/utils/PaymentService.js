const qs = require('qs')
const {formatDate} = require('../utils/formatDate')
const crypto = require('crypto')
const dotenv = require('dotenv')
dotenv.config()

function sortObject(obj){
    var sorted = {};
    var str = [];
    var key;
    for (key in obj){
        if (obj.hasOwnProperty(key)) {
        str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}

function getVNPayParams(req){
    //get data
    const vnp_IpAddr = req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;

    const {vnp_TmnCode, vnp_ReturnUrl, vnp_OrderType, vnp_CurrCode, vnp_Version, vnp_Command, vnp_Locale} = process.env
    const {postId, packId, amount, bankCode, locale} = req.body

    const now = new Date()
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000)
    const date = new Date(utcTime + (7 * 60 * 60 * 1000))
    const vnp_ExpireDate = new Date(date.getTime() + (15 * 60 * 1000))

    const orderId = `${req.user._id}_${postId}_${packId}_${formatDate(date)}`
    const orderInfo = `Thanh toan bai dang ${postId}. So tien la ${amount} VND`

    var vnp_Params = {
        'vnp_Version': vnp_Version,
        'vnp_Command': vnp_Command,
        'vnp_TmnCode': vnp_TmnCode,
        'vnp_Locale': locale || vnp_Locale,
        'vnp_CurrCode': vnp_CurrCode,
        'vnp_TxnRef': orderId,
        'vnp_OrderInfo': orderInfo,
        'vnp_OrderType': vnp_OrderType,
        'vnp_Amount': amount * 100,
        'vnp_ReturnUrl': vnp_ReturnUrl,
        'vnp_IpAddr': vnp_IpAddr,
        'vnp_CreateDate': formatDate(date),
        'vnp_ExpireDate': formatDate(vnp_ExpireDate),
    }
    if(bankCode) vnp_Params['vnp_BankCode'] = bankCode

    return vnp_Params
}

function generateVNPaySignature(params){
    const {vnp_HashSecret} = process.env

    const signData = qs.stringify(params, {encode: false})
    const hmac = crypto.createHmac('sha512', vnp_HashSecret)
    const vnp_SecureHash = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex')

    return vnp_SecureHash
}

exports.getVNPayayPaymentURL = (req) => {
    //get data
    let vnp_Params = getVNPayParams(req)
    const {vnp_Url} = process.env 

    //sort object 
    vnp_Params = sortObject(vnp_Params)

    //hash signature
    vnp_Params['vnp_SecureHash'] = generateVNPaySignature(vnp_Params)

    //generate url
    const paymentUrl = `${vnp_Url}?${qs.stringify(vnp_Params, {encode: false})}`

    return paymentUrl
}

exports.checksumVNPayParams = (vnp_Params) => {
    //delete sensitive data
    const vnp_SecureHash = vnp_Params['vnp_SecureHash']
    delete vnp_Params['vnp_SecureHash']
    delete vnp_Params['vnp_SecureHashType']

    //sort object
    vnp_Params = sortObject(vnp_Params)
    
    const signed = generateVNPaySignature(vnp_Params)

    if (signed === vnp_SecureHash) {
        return true
    }
    return false
}