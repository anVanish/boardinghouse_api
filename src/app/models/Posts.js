const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.ObjectId
const slugify = require('slugify')

const Posts = new mongoose.Schema({
    userId: {type: ObjectId, ref: 'users', required: true},
    title: {
        type: String,
        required: [true, 'Please enter title'],
    },
    slug: {
        type: String, 
        unique: true,
        default: function(){
            return slugify(`${this.title}-${this._id.toString().slice(-5)}`, { lower: true, locale: 'vi', trim: true })
        }
    },
    description: {
        type: String,
        required: [true, 'Please enter description'],
        validate: [
            {
                validator: function (v) {
                    return v.length > 10;
                },
                message: "Invalid description! Must be greater than 100 characters",
            },
        ],
    },
    categoryId: { type: ObjectId, ref: 'categories', required: true },
    price: {
        type: Number,
        required: [true, 'Please enter rental price'],
        validate: {
            validator: function (v) {
                return v >= 100000;
            },
            message: "Invalid price! Must be greater than 100000 vnd"
        },
    },
    area: {type: Number, required: true},
    renters: {
        type: String,
        enum: ['male', 'female', 'all'],
        required: [true, 'Please provide gender for renters [male, femail, all]'],
    },
    views: {type: Number, default: 0},
    images: [{type: String}],
    video: {type: String},
    priority: {type: Number, default: 0},
    type: {type: ObjectId, ref: 'packs'},
    address: {
        city: {type: String, required: [true, 'Please enter city']},
        district: {type: String, required: [true, 'Please enter district']},
        ward: {type: String, required: [true, 'Please enter ward']},
        street: {type: String, required: [true, 'Please enter street']},
    },
    isPaid: {type: Boolean, default: false},
    isApproved: {type: Boolean, default: false},
    isViolated: {type: Boolean, default: false},
    isHided: {type: Boolean, default: false},
    isExpired: {type: Boolean, default: false},
    violation: {type: String},
    startedAt: {type: Date},
    endedAt: {type: Date},
    moderatedBy: {type: ObjectId, ref: 'users'}
}, {
    timestamps: true,
});

Posts.index({createdAt: 1})

module.exports = mongoose.model("posts", Posts);
