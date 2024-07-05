const setStateFilter = require('./setStateFilter')

function getFilter(userId, search, city, district, ward, tab, moderatedFilter, categoryId){
    const objectIdRegex = /^[0-9a-fA-F]{24}$/
    const tabOptions = {
        'inApprove': {isPaid: true, isApproved: false, isViolated: false},
        'moderated': {$or: [{isApproved: true}, {isViolated: true}]},
        'myModerated': {moderatedBy: userId, $or: [{isApproved: true}, {isViolated: true}]}
    }

    return{
        ...(search ? objectIdRegex.test(search) ? {_id: search} : { title: { '$regex': `.*${search}.*`, $options: 'i' } } : {}),
        ...(tab && tabOptions[tab] ? tabOptions[tab] : tabOptions['inApprove']),
        ...(city && {'address.city': city}),
        ...(district && {'address.district': district}),
        ...(ward && {'address.ward': ward}),
        ...(moderatedFilter && moderatedFilter === 'approved' ? {isApproved: true} : 
            moderatedFilter === 'violated' ? {isViolated: true} :
            {}),
        ...(categoryId && {categoryId})

    }
}

function postAdminModeratorFilter(query, userId){
    const {pagination, search, city, district, ward, categoryId} = setStateFilter(query)

    const tab = query.tab || 'inApprove'
    const moderatedFilter = (tab === 'moderated' || tab === 'myModerated') ? query.moderatedFilter : ''
    const filter = getFilter(userId, search, city, district, ward, tab, moderatedFilter, categoryId)

    const sort = { priority: -1, createdAt: -1 }

    return {pagination, filter, sort}
}

module.exports = postAdminModeratorFilter