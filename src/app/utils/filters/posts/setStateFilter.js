function setStateFilter(query){
    //pagination
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;
    const pagination = { page, limit, skip };

    //search
    const search = query.search || ''

    //location
    const city = query.city || ''
    const district = query.district || ''
    const ward = query.ward || ''

    //category
    const objectIdRegex = /^[0-9a-fA-F]{24}$/
    const categoryId = (query.categoryId && objectIdRegex.test(query.categoryId)) ? query.categoryId : ''

    return {pagination, search, city, district, ward, categoryId}
}

module.exports = setStateFilter