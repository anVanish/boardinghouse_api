const cron = require('node-cron')
const Invoices = require('../../models/Invoices')
const {toVNTimezone} = require('../formatDate')

async function deleteExpiredInvoices(){
    try{
        const thirtyMinutesAgo = toVNTimezone(new Date(Date.now() - 30 * 60 * 1000))

        await Invoices.deletedMany({
            isTemp: true,
            createdAt: { $lt: thirtyMinutesAgo },
        })
    }finally {}
}

cron.schedule('* * * * *', () => {
    deleteExpiredInvoices().catch(console.error)
})
