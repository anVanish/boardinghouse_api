const setStateFilter = require('./setStateFilter')

function getFilter(userId, search, city, district, ward){
    const tabOptions = {
        'all': {},
        'posted': { isPaid: true, isApproved: true, isHided: false },
        'inApprove': {isApproved: false},
        'inPay': {isPaid: false},
        'inViolation': {isViolated: true},
        'inHide': {isHided: true},
        'myApproval': {moderatedBy: userId}

    }
}

function postAdminFilter(query, userId){
    const {pagination, search, city, district, ward} = setStateFilter(query)

    const tab = query.tab || 'all'
    const filter = getFilter(userId, search, city, district, ward)

    return {pagination, filter}
}

module.exports = postAdminFilter