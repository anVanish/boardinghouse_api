function filterAddUpdateCate(cate){
    filteredCate = {}
    if (cate.name) filteredCate.name = cate.name
    return filteredCate
}

module.exports = filterAddUpdateCate