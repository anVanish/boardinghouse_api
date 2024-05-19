const objectIdRegex = /^[0-9a-fA-F]{24}$/

function getUserFilter(search, deleted){
    let filter = {}
    if (objectIdRegex.test(search)) filter = {_id: search}
    else filter = {name: { '$regex': `.*${search}.*`, $options: 'i' }}
    
    if (deleted)
        return {
            $and:[
                filter,
                {isDeleted: true}
            ]
    
        }
    
    return {
        $and:[
            filter,
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
    const id = query.id ? query.id : ''

    //filter
    const deleted = (query.deleted === 'true')
    const filter = getUserFilter(search, id, deleted)

    return {pagination, filter}

}

module.exports = userFilter