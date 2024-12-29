const { StatusCodes } = require("http-status-codes")
const Orders = require('../models/order')
const Products = require('../models/product')
const { checkPermissions } = require('../utils')
const customError = require('../errors')


const getAllOrders = async (req,res) => {
    const orders = await Orders.find({})

    res.status(StatusCodes.OK).json({orders,count:orders.length})
}

const getSingleOrder = async (req,res) => {
    const {id:orderID} = req.params
    const order = await Orders.findOne({_id:orderID})
    if(!order){
        throw new customError.NotFoundErrorError(`No order with id: ${orderID}`)
    }
    checkPermissions(req.user,order.user)

    res.status(StatusCodes.OK).json({order})
}

const getCurrentUserOrders = async (req,res) => {
    const order = await Orders.find({user:req.user.userID})

    res.status(StatusCodes.OK).json({order})
}

const fakeStripeAPI = async ({ amount, currency }) => {
    const client_secret = 'someRandomValue'
    return {client_secret,amount}
}

const createOrder = async (req,res) => {
    const {items:cartItems,tax,shippingFee} = req.body
    if(!cartItems || cartItems.length<1){
        throw new customError.BadRequestError('No cart items provided')
    }
    if(!tax || !shippingFee){
        throw new customError.BadRequestError('Please provide tax and shipping fee')
    } 

    let orderItems = []
    let subtotal = 0

    for(const item of cartItems){
        const dbProduct = await Products.findOne({_id:item.product})
        if(!dbProduct){
            throw new customError.NotFoundError(`No product with id: ${item.product}`)
        }
        const {name, price, image} = dbProduct
        //console.log(name,price,image)
        const singleOrderItem = {
            amount: item.amount,
            name,
            price,
            image,
            product:item.product,
        }
        //add item to order
        orderItems = [...orderItems, singleOrderItem]
        //calculate subtotal
        subtotal += item.amount * price
    }
    //console.log(orderItems)
    //console.log(subtotal)

    //calculate total 
    const total = tax + shippingFee + subtotal
    //get client secret
    const paymentIntent = await fakeStripeAPI({
        amount: total,
        currency: 'usd',
    })

    const order = await Orders.create({
        orderItems,
        total,
        subtotal,
        tax,
        shippingFee,
        clientSecret: paymentIntent.client_secret,
        user: req.user.userID,
    })

    res.status(StatusCodes.CREATED).json({order, clientSecret:order.clientSecret})
}

const updateOrder = async (req,res) => {
    const {id:orderID} = req.params
    const {paymentIntentID} = req.body
    const order = await Orders.findOne({_id:orderID})
    if(!order){
        throw new customError.NotFoundError(`No order with id: ${orderID}`)
    }
    checkPermissions(req.user,order.user)

    order.paymentIntentID = paymentIntentID
    order.status = 'paid'

    await order.save()
    
    res.status(StatusCodes.OK).json({order})
}


module.exports = {
    getAllOrders,
    getSingleOrder,
    getCurrentUserOrders,
    createOrder,
    updateOrder,
}