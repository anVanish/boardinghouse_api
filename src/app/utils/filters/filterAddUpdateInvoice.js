function filterAddUpdateInvoice(invoice){
    const filteredInvoice = {}
    if (invoice.postId) filteredInvoice.postId = invoice.postId
    if (invoice.fee) filteredInvoice.fee = invoice.fee
    if (invoice.method) filteredInvoice.method = invoice.method

    return filteredInvoice
}

module.exports = filterAddUpdateInvoice