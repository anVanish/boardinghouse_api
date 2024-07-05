const setStateFilter = require('./setStateFilter')

function getFilter(search, city, district, ward, tab, categoryId){
    const objectIdRegex = /^[0-9a-fA-F]{24}$/

    const tabOptions = {
        'all': {},
        'posted': { isPaid: true, isApproved: true, isHided: false },
        'inPay': {isPaid: false},
        'inApprove': {isPaid: true, isApproved: false, isViolated: false},
        'inViolation': {isViolated: true},
        'inHide': {isHided: true},
        'expired': {isExpired: true},
    }

    return {
        ...(tab && tabOptions[tab] ? tabOptions[tab] : tabOptions['all']),
        ...(search ? objectIdRegex.test(search) ? {_id: search} : { title: { '$regex': `.*${search}.*`, $options: 'i' } } : {}),
        ...(city && {'address.city': city}),
        ...(district && {'address.district': district}),
        ...(ward && {'address.ward': ward}),
        ...(categoryId && {categoryId}),
    }
}

function postAdminFilter(query){
    const {pagination, search, city, district, ward, categoryId} = setStateFilter(query)

    const tab = query.tab || 'all'
    const filter = getFilter(search, city, district, ward, tab, categoryId)

    return {pagination, filter}
}

module.exports = postAdminFilter