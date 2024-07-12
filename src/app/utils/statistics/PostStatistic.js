const Invoices = require('../../models/Invoices')
const Packs = require('../../models/Packs')
const Posts = require('../../models/Posts')
const Post = require('../../models/Posts')
const {toVNTimezone} = require('../../utils/DateUtils')
const {getData, getSingleData} = require('./dataProcessing')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId

function getMatchCondition(query){
    const {month, year, filter, type, moderatedBy} = query
    const matchCondition = {}
    
    if (moderatedBy) matchCondition.moderatedBy = new ObjectId(moderatedBy)
    if (type === 'approved') matchCondition.isApproved = true 
    else if (type === 'violated') matchCondition.isViolated = true
    else if (type === 'toModerated') {
        matchCondition.isViolated = false
        matchCondition.isApproved = false
    }

    if (month && year){
        const startDate = new Date(year, month - 1, 1)
        const endDate = new Date(year, month, 1)
        matchCondition.createdAt = { $gt: startDate, $lte: endDate }
    } else if (filter === 'current'){
        const now = toVNTimezone(new Date())
        const startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)
        matchCondition.createdAt = { $gt: startDate, $lte: endDate }
    }

    return matchCondition
}

exports.getTotalPost = async(query) => {
    const matchCondition = getMatchCondition(query)

    return getSingleData(await Posts.aggregate([
        {
            $match: matchCondition,
        },
        {
            $group: {
                _id: null,
                total: { $sum: 1 }
            }
        }
    ]))
}