function filterAddUpdatePack(pack){
    let filteredPack = {}
    if (pack.name) filteredPack.name = pack.name
    if (pack.fee) filteredPack.fee = pack.fee
    if (pack.description) filteredPack.description = pack.description
    if (pack.priority) filteredPack.priority = pack.priority
    return filteredPack
}

module.exports = filterAddUpdatePack