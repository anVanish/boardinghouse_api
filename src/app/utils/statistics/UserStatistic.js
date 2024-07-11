const Users = require('../../models/Users')
const {toVNTimezone} = require('../../utils/DateUtils')
const {getData, getSingleData} = require('./dataProcessing')


function getMatchCondition(query){
    const {month, year, filter} = query
    const matchCondition = { isVerified: true }
    
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

exports.getTotalUser = async(query) => {
    const matchCondition = getMatchCondition(query)

    return getSingleData(await Users.aggregate([
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