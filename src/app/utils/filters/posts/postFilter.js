const setStateFilter = require('./setStateFilter')

function getFilter(search, city, district, ward, minArea, maxArea, minPrice, maxPrice){
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
    // set state
    const {pagination, search, city, district, ward} = setStateFilter(query)

    const minArea = query.minArea ? parseInt(query.minArea) : -1;
    const maxArea = query.maxArea ? parseInt(query.maxArea) : -1;
    const minPrice = query.minPrice ? parseInt(query.minPrice) : -1;
    const maxPrice = query.maxPrice ? parseInt(query.maxPrice) : -1;

    const filter = getFilter(search, city, district, ward, minArea, maxArea, minPrice, maxPrice);

    return { pagination, filter };
}

module.exports = postFilter