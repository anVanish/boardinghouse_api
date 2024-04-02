const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.ObjectId
const slugify = require('slugify')

const Invoices = new mongoose.Schema({
    userId: {type: ObjectId, ref: 'users', required: true},
    postId: {type: ObjectId, ref: 'posts', required: true},
    fee: {
        type: Number,
        required: [true, 'Missing fee value'],
    },
    method: {type: String, required: true},
}, {
    timestamps: true,
});

module.exports = mongoose.model("invoices", Invoices);
