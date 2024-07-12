const Invoices = require('../../models/Invoices')
const Packs = require('../../models/Packs')
const Posts = require('../../models/Posts')
const {toVNTimezone} = require('../../utils/DateUtils')
const {getData, getSingleData} = require('./dataProcessing')


function getMatchCondition(query){
    const {month, year, filter} = query
    const matchCondition = { isTemp: false }
    
    if (month && year){
        const startDate = new Date(year, month - 1, 1)
        const endDate = new Date(year, month, 1)
        matchCondition.paidAt = { $gt: startDate, $lte: endDate }
    } else if (filter === 'current'){
        const now = toVNTimezone(new Date())
        const startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)
        matchCondition.paidAt = { $gt: startDate, $lte: endDate }
    }

    return matchCondition
}

exports.getTotalRevenue = async (query) => {
    const matchCondition = getMatchCondition(query)

    return getSingleData(await Invoices.aggregate([
        {
            $match: matchCondition,
        },
        {
            $group: {
                _id: null,
                total: { $sum: "$amount" }
            }
        }
    ]))
}

exports.getRevenueByPack = async (query) => {
    const matchCondition = getMatchCondition(query)

    const revenueByPack = await Invoices.aggregate([
        {
            $match: matchCondition
        },
        {
            $group: {
                _id: "$packId",
                totalRevenue: { $sum: "$amount" }
            }
        },
        {
            $lookup: {
                from: 'packs',
                localField: '_id',
                foreignField: '_id',
                as: 'pack'
            }
        },
        {
            $unwind: '$pack'
        },
        {
            $project: {
                _id: 0,
                packId: '$_id',
                packName: '$pack.name',
                totalRevenue: 1
            }
        }
    ])

    
    const postsCountByPack = await Posts.aggregate([
        {
            $group: {
                _id: "$type",
                totalPosts: { $sum: 1 }
            }   
        }
    ])

    return getData(revenueByPack.map(revenue => {
        const postCount = revenue.packId && postsCountByPack.find(post => (post._id && post._id.toString() === revenue.packId.toString()))
        return {
            ...revenue,
            totalPosts: postCount ? postCount.totalPosts : 0
        }
    }))

}