function filterAddUpdatePack(pack){
    let filteredPack = {}
    if (pack.name) filteredPack.name = pack.name
    if (pack.fee) filteredPack.fee = pack.fee
    if (pack.description) filteredPack.description = pack.description
    return filteredPack
}

module.exports = filterAddUpdatePack