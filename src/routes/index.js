const AuthRouter = require('./routers/AuthRouter')
const UserRouter = require('./routers/UserRouter')
const CategoryRouter = require('./routers/CategoryRouter')
const PostRouter = require('./routers/PostRouter')
const InvoiceRouter = require('./routers/InvoiceRouter')
const PackRouter = require('./routers/PackRouter')
const PaymentRouter = require('./routers/PaymentRouter')
const StatisticRouter = require('./routers/StatisticRouter')

function route(app){
    app.use('/api/v1/auth', AuthRouter)
    app.use('/api/v1/users', UserRouter)
    app.use('/api/v1/categories', CategoryRouter)
    app.use('/api/v1/posts', PostRouter)
    app.use('/api/v1/invoices', InvoiceRouter)
    app.use('/api/v1/packs', PackRouter)
    app.use('/api/v1/payments', PaymentRouter)
    app.use('/api/v1/statistics', StatisticRouter)
}

module.exports = route