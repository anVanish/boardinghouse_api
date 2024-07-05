const Posts = require('../../models/Posts')
const cron = require('node-cron')
const {toVNTimezone} = require('../DateUtils')

async function updateExpiredPost(){
    try{
        const now = toVNTimezone(new Date())
        const result = await Posts.updateMany({isPaid: true, endedAt: { $lt: now }}, {isExpired: true})
    }finally{}
}

cron.schedule('* * * * *', () => {
    updateExpiredPost().catch(console.error)
})