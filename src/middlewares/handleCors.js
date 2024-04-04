const cors = require('cors')

const allowedOrigins = (process.env.ALLOW_ORIGINS).split(',') || [];
const corsOptions = {
    origin: function (origin, callback) {
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    methods: ['GET','POST','DELETE','UPDATE','PUT','PATCH'],
}

module.exports = cors(corsOptions)