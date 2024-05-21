const setStateFilter = require('./setStateFilter')

function getFilter(search, city, district, ward, tab, userFilter){
    const phoneRegex = /^0\d{9}$/
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    const objectIdRegex = /^[0-9a-fA-F]{24}$/

    const tabOptions = {
        'all': {},
        'posted': { isPaid: true, isApproved: true, isHided: false },
        'inPay': {isPaid: false},
        'inApprove': {isPaid: true, isApproved: false, isViolated: false},
        'inViolation': {isViolated: true},
        'inHide': {isHided: true},
    }

    let userFilterOption = {}
    if (userFilter)
        userFilterOption = 
            phoneRegex.test(userFilter) ? {'userId.phone': userFilter} :
            objectIdRegex.test(userFilter) ? {'userId._id': userFilter} :
            emailRegex.test(userFilter) ? {'userId.email': userFilter} : 
            {'userId.name': userFilter}

    return {
        ...(tab && tabOptions[tab] ? tabOptions[tab] : tabOptions['all']),
        ...(search ? objectIdRegex.test(search) ? {_id: search} : { title: { '$regex': `.*${search}.*`, $options: 'i' } } : {}),
        ...(city && {'address.city': city}),
        ...(district && {'address.district': district}),
        ...(ward && {'address.ward': ward}),
        ...userFilterOption
    }
}

function postAdminFilter(query){
    const {pagination, search, city, district, ward} = setStateFilter(query)

    const tab = query.tab || 'all'
    const userFilter = query.userFilter || ''
    const filter = getFilter(search, city, district, ward, tab, userFilter)

    return {pagination, filter}
}

module.exports = postAdminFilter