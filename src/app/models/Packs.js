const mongoose = require('mongoose')

const Packs = new mongoose.Schema({
    name: {type: String, required: true},
    fee: {type: Number, required: true},
    description: {type: String, required: true},
}, {
    timestamps: true,
})

module.exports = mongoose.model('packs', Packs)

