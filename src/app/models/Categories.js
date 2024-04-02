const mongoose = require("mongoose");

const Categories = new mongoose.Schema({
    name: {type: String, require: [true, 'Please enter category name']},
}, {
    timestamps: true,
});

module.exports = mongoose.model("categories", Categories);
