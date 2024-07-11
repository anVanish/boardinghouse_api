const {authToken, authAdmin, authModerator} = require('../../middlewares/authenticatetion')
const express = require('express')
const router = express.Router()
const {adminStatistic, moderatorStatistic} = require('../../app/controllers/StatisticController')

router.use(authToken)
router.get('/admin', authAdmin, adminStatistic)
router.get('/moderator', authModerator, moderatorStatistic)

module.exports = router