const mongoose = require('mongoose')

const singleOrderItemSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    product: {
        type: mongoose.Schema.ObjectId,
        ref: 'Products',
        required: true,
    }
})

const orderSchema = mongoose.Schema({
    tax: {
        type:Number,
        required: true,
    },
    shippingFee: {
        type: Number,
        required: true,
    },
    subtotal: {
        type: Number,
        required: true,
    },
    total: {
        type: Number,
        required: true,
    },
    orderItems:[singleOrderItemSchema],
    status: {
        type: String,
        enum: ['pending','failed','paid','delivered','canceled'],
        default: 'pending',
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    clientSecret: {
        type: String,
        required: true,
    },
    paymentId: {
        type: String,
    },
},{ timestamps: true })


module.exports = mongoose.model('Orders',orderSchema)