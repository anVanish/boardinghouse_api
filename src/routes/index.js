const AuthRouter = require('./routers/AuthRouter')
const UserRouter = require('./routers/UserRouter')
const CategoryRouter = require('./routers/CategoryRouter')
const PostRouter = require('./routers/PostRouter')
const InvoiceRouter = require('./routers/InvoiceRouter')

function route(app){
    app.use('/api/v1/auth', AuthRouter)
    app.use('/api/v1/users', UserRouter)
    app.use('/api/v1/categories', CategoryRouter)
    app.use('/api/v1/posts', PostRouter)
    app.use('/api/v1/invoices', InvoiceRouter)
}

module.exports = route