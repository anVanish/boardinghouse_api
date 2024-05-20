const setStateFilter = require('./setStateFilter')

function getFilter(userId, search, city, district, ward, tab){
    const phoneRegex = /^0\d{9}$/
    const tabOptions = {
        'posted': { isPaid: true, isApproved: true, isHided: false },
        'inPay': { isPaid: false },
        'inApprove': { isApproved: false },
        'inViolation': { isViolated: true },
        'inHide': { isHided: true }
    };

    return {
        userId,
        ...(phoneRegex.test(search) ? {phone: search} : { title: { '$regex': `.*${search}.*`, $options: 'i' } }),
        ...(city && {'address.city': city}),
        ...(district && {'address.district': district}),
        ...(ward && {'address.ward': ward}),
        ...(tab && tabOptions[tab] || {})
    }
}

function postUserFilter(query, userId){
    const {pagination, search, city, district, ward} = setStateFilter(query)
    const tab = query.tabs || 'posted'
    const filter = getFilter(userId, search, city, district, ward, tab)

    return {pagination, filter}
}

module.exports = postUserFilter