const {getTotalRevenue, getRevenueByPack} = require('../utils/statistics/RevenueStatistic')
const {getTotalPost} = require('../utils/statistics/PostStatistic')
const {getTotalUser} = require('../utils/statistics/UserStatistic')
const ApiRes = require('../utils/ApiRes')

// /statistics
class StatisticController{
    //GET /admin
    async adminStatistic(req, res, next){
        try{
            const statistics = {}
            //revenue
            statistics.totalRevenue = await getTotalRevenue({})
            statistics.totalRevenueThisMonth = await getTotalRevenue({filter: 'current'})
            //post
            statistics.totalPosts = await getTotalPost({})
            statistics.newPosts = await getTotalPost({filter: 'current'})
            //revenue and post per pack
            statistics.packRevenueThisMonth = await getRevenueByPack({filter: 'current'})
            statistics.packRevenue = await getRevenueByPack({})
            //user
            statistics.totalUser = await getTotalUser({})
            statistics.newUser = await getTotalUser({fitler: 'current'})

            statistics.avgPostPerUser = statistics.totalPosts / statistics.totalUser

            res.json(new ApiRes()
                .setSuccess()
                .setData('statistics', statistics)
            )

        }catch(error){
            next(error)
        }
    }
}



module.exports = new StatisticController()
