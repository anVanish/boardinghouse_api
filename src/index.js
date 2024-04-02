const express = require('express')
const morgan = require('morgan')
const db = require('./config/db')
const dotenv = require('dotenv')
const route = require('./routes')
const errorHandling = require('./middlewares/errorHandling')
const app = express()
const port = process.env.PORT || 5000
dotenv.config()

//connect to db
db.connect()

//middlewares
app.use(morgan('short'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

//router
route(app)

//handle error
app.use(errorHandling)

app.listen(port, () => console.log(`Web api started at http://localhost:${port}`))