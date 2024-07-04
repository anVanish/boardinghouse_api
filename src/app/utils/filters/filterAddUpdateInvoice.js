function filterAddUpdateInvoice(invoice){
    const filteredInvoice = {}
    if (invoice.userId) filteredInvoice.userId = invoice.userId
    if (invoice.postId) filteredInvoice.postId = invoice.postId
    if (invoice.packId) filteredInvoice.packId = invoice.packId
    if (invoice.amount) filteredInvoice.amount = invoice.amount
    if (invoice.method) filteredInvoice.method = invoice.method
    if (invoice.period) filteredInvoice.period = invoice.period
    if (invoice.type) filteredInvoice.type = invoice.type

    return filteredInvoice
}

module.exports = filterAddUpdateInvoice