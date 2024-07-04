const cron = require('node-cron')
const Invoices = require('../../models/Invoices')

async function deleteExpiredInvoices(){
    try{
        const thirtyMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
        const result = await Invoices.deleteMany({
            isTemp: true,
            createdAt: { $lt: thirtyMinutesAgo },
        })
    }finally {}
}

cron.schedule('* * * * *', () => {
    deleteExpiredInvoices().catch(console.error)
})
