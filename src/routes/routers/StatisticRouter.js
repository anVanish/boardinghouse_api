const {authToken, authAdmin} = require('../../middlewares/authenticatetion')
const express = require('express')
const router = express.Router()
const {adminStatistic} = require('../../app/controllers/StatisticController')

router.use(authToken, authAdmin)
router.get('/admin', adminStatistic)

module.exports = router