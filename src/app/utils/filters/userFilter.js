
function getUserFilter(search, role, deleted){
    const objectIdRegex = /^[0-9a-fA-F]{24}$/
    //search
    const searchOption = objectIdRegex.test(search) ? {_id: search} :{name: { '$regex': `.*${search}.*`, $options: 'i' }}

    //role
    const roleOption = {isAdmin: false, isModerator: role === 'moderator'}

    //deleted
    const deletedOption = deleted 
        ? {isDeleted: true} 
        : {$or: [
            {isDeleted: false},
            {isDeleted: {$exists: false}}
        ]}
    
    return {
        $and:[
            searchOption,
            roleOption,
            deletedOption
        ]
    }
    
}

function userFilter(query){
    //pagination
    const page = parseInt(query.page) || 1
    const limit = parseInt(query.limit) || 10
    const skip = (page - 1) * limit
    const pagination = {page, limit, skip}

    //search
    const search = query.search || ''

    //filter
    const deleted = query.deleted === 'true'
    const role = query.role
    const filter = getUserFilter(search, role, deleted)

    return {pagination, filter}

}

module.exports = userFilter