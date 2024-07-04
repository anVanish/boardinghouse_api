const cron = require('node-cron')
const Invoices = require('../../models/Invoices')
const {toVNTimezone} = require('../formatDate')

async function deleteExpiredInvoices(){
    try{
        const thirtyMinutesAgo = toVNTimezone(new Date(Date.now() - 5 * 60 * 1000))

        const result = await Invoices.deleteMany({
            isTemp: true,
            createdAt: { $lt: thirtyMinutesAgo },
        })
    }finally {}
}

cron.schedule('* * * * *', () => {
    deleteExpiredInvoices().catch(console.error)
})
