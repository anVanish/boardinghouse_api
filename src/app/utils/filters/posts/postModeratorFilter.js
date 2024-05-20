const setStateFilter = require('./setStateFilter')

function getFilter(userId, search, tab, city, district, ward,moderatedFilter){
    const moderatedFilterOption = {
        $or: [
            ...(moderatedFilter === 'approved' ? [{ isApproved: true }] : []),
            ...(moderatedFilter === 'violated' ? [{ isViolated: true }] : []),
            ...(moderatedFilter !== 'approved' && moderatedFilter !== 'violated' ? [{ isApproved: true }, { isViolated: true }] : [])
        ]
    };

    const tabOptions = {
        'inApprove': {isApproved: false},
        'myModerated': {
            moderatedBy: userId, 
            ...moderatedFilterOption
        },
        'moderated': {
            ...moderatedFilterOption
        }
    }


    return {
        ...(search && { title: { '$regex': `.*${search}.*`, $options: 'i' } }),
        ...(city && {'address.city': city}), 
        ...(district && {'address.district': district}),
        ...(ward && {'address.ward': ward}),
        ...(tab && tabOptions[tab] || {})
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