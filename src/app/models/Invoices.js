const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.ObjectId
const slugify = require('slugify')

const Invoices = new mongoose.Schema({
    userId: {type: ObjectId, ref: 'users', required: true},
    postId: {type: ObjectId, ref: 'posts', required: true},
    packId: {type: ObjectId, ref: 'packs', required: true},
    amount: {
        type: Number,
        required: [true, 'Missing fee value'],
    },
    method: {type: String, required: true, enum: ['vnpay', 'momo']},
    type: {type: String, required: true, enum: ['pay', 'extend']},
    period: {type: Number, required: true},
    isTemp: {type: Boolean, default: true},
    paidAt: {type: Date},
}, {
    timestamps: true,
})

Invoices.index({createdAt: 1})

module.exports = mongoose.model("invoices", Invoices);
