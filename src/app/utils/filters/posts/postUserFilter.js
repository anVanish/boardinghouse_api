const setStateFilter = require('./setStateFilter')

function getFilter(userId, search, city, district, ward, tab, categoryId){
    const tabOptions = {
        'all': {},
        'posted': { isPaid: true, isApproved: true, isHided: false },
        'inPay': { isPaid: false },
        'inApprove': {isPaid: true, isApproved: false, isViolated: false },
        'inViolation': { isViolated: true },
        'inHide': { isHided: true },
        'expired': {isExpired: true}
    };

    return {
        userId,
        ...(search && { title: { '$regex': `.*${search}.*`, $options: 'i' } }),
        ...(city && {'address.city': city}),
        ...(district && {'address.district': district}),
        ...(ward && {'address.ward': ward}),
        ...(tab && tabOptions[tab] || {}),
        ...(categoryId && {categoryId})
    }
}

function postUserFilter(query, userId){
    const {pagination, search, city, district, ward, categoryId} = setStateFilter(query)
    const tab = query.tab || 'all'
    const filter = getFilter(userId, search, city, district, ward, tab, categoryId)
    const sort = { updatedAt: -1 }

    return { pagination, filter, sort }
}

module.exports = postUserFilter