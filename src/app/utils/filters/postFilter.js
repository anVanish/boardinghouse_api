function getPostFilter(search, city, district, ward, minArea, maxArea, minPrice, maxPrice){
    return {
        ...{isPaid: true, isApproved: true, isHided: false},
        ...(search && { title: { '$regex': `.*${search}.*`, $options: 'i' } }),
        ...(minArea >= 0 && { area: { $gte: minArea } }),
        ...(maxArea >= 0 && { area: { ...(minArea >= 0 ? { $gte: minArea } : {}), $lte: maxArea } }),
        ...(minPrice >= 0 && { price: { $gte: minPrice } }),
        ...(maxPrice >= 0 && { price: { ...(minPrice >= 0 ? { $gte: minPrice } : {}), $lte: maxPrice } }),
        ...(city && {'address.city': city}), 
        ...(district && {'address.district': district}),
        ...(ward && {'address.ward': ward}),

    }
}

function postFilter(query) {
    // Pagination
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;
    const pagination = { page, limit, skip };

    // Search
    const search = query.search || '';

    // Filter
    const city = query.city || ''
    const district = query.district || ''
    const ward = query.ward || ''
    const minArea = query.minArea ? parseInt(query.minArea) : -1;
    const maxArea = query.maxArea ? parseInt(query.maxArea) : -1;
    const minPrice = query.minPrice ? parseInt(query.minPrice) : -1;
    const maxPrice = query.maxPrice ? parseInt(query.maxPrice) : -1;

    const filter = getPostFilter(search, city, district, ward, minArea, maxArea, minPrice, maxPrice);

    return { pagination, filter };
}

module.exports = postFilter