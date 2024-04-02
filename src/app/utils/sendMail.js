const nodemailer = require('nodemailer')
const dotenv = require('dotenv')
dotenv.config()


const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    service: 'Gmail',
    secure: true,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD
    }
})

exports.sendMail = async (mailto, subject, link) => {
    const mailOptions = {
        from: process.env.MAIL_USER,
        to: mailto,
        subject: subject,
        text: link
    }
    return transporter.sendMail(mailOptions)
}

