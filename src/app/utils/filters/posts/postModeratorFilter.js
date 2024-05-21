const setStateFilter = require('./setStateFilter')

function getFilter(userId, search, tab, city, district, ward, moderatedFilter){

    const tabOptions = {
        'inApprove': {isPaid: true, isApproved: false, isViolated: false},
        'moderated': {$or: [{isApproved: true}, {isViolated: true}] },
        'myModerated': {moderatedBy: userId, $or: [{isApproved: true}, {isViolated: true}] },
    }


    return {
        ...(search && { title: { '$regex': `.*${search}.*`, $options: 'i' } }),
        ...(city && {'address.city': city}), 
        ...(district && {'address.district': district}),
        ...(ward && {'address.ward': ward}),
        ...(tab && tabOptions[tab] || tabOptions['inApprove']),
        ...(moderatedFilter && moderatedFilter === 'approved' ? {isApproved: true} : 
            moderatedFilter === 'violated' ? {isViolated: true} :
            {}),
    }
}  

function postsModeratorFilter(query, userId){
    //set stateW
    const {pagination, search, city, district, ward} = setStateFilter(query)

    //filter
    const tab = query.tab || 'inApprove'
    const moderatedFilter = ((tab === 'moderated' || tab === 'myModerated')&& query.moderatedFilter) ? query.moderatedFilter : ''
    const filter = getFilter(userId, search, tab, city, district, ward, moderatedFilter)    

    return {pagination, filter}
}

module.exports = postsModeratorFilter