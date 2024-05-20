const objectIdRegex = /^[0-9a-fA-F]{24}$/

function getUserFilter(search, role, deleted){
    //search
    let filter = {}
    if (objectIdRegex.test(search)) filter = {_id: search}
    else filter = {name: { '$regex': `.*${search}.*`, $options: 'i' }}
    //role
    let roleOption = {isAdmin: false, isModerator: false}
    if (role === 'moderator') roleOption.isModerator = true
    //deleted
    if (deleted)
        return {
            $and:[
                filter,
                roleOption,
                {isDeleted: true}
            ]
        }
    
    return {
        $and:[
            filter,
            roleOption,
            {$or: [
                {isDeleted: false},
                {isDeleted: {$exists: false}}
            ]}
        ]
    }
    
}

function userFilter(query){
    //pagination
    const page = query.page ? parseInt(query.page) : 1
    const limit = query.limit ? parseInt(query.limit) : 10
    const skip = (page - 1) * limit
    const pagination = {page, limit, skip}

    //search
    const search = query.search ? query.search : ''

    //filter
    const deleted = (query.deleted === 'true')
    const role = query.role
    const filter = getUserFilter(search, role, deleted)

    return {pagination, filter}

}

module.exports = userFilter