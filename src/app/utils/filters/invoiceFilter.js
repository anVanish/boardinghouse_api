
function getInvoiceFilter(search, fromDate, toDate){
    const objectIdRegex = /^[0-9a-fA-F]{24}$/

    return {
        isTemp: false,
        ...(search ? objectIdRegex.test(search) ? {$or: [{_id: search}, {postId: search}]} : {} : {}),
        ...(fromDate && {createdAt: {$gte: fromDate}}),
        ...(toDate && {createdAt: {$lte: toDate}}),
    }
}

function invoiceFilter(query){
    //pagination
    const page = parseInt(query.page) || 1
    const limit = parseInt(query.limit) || 10
    const skip = (page - 1) * limit
    const pagination = {page, limit, skip}

    //search
    const search = query.search || '' //search by invoiceId, postId
    const fromDate = query.fromDate || new Date(2000, 1, 1)
    const toDate = query.toDate || new Date()

    //filter
    const filter = getInvoiceFilter(search, fromDate, toDate)

    return {pagination, filter}
}

module.exports = invoiceFilter