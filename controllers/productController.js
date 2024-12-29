const Products = require('../models/product')
const {StatusCodes} = require('http-status-codes')
const customError = require('../errors')
const path = require('path')

const createProduct = async (req,res) => {
    req.body.user = req.user.userID
    const product = await Products.create(req.body)
    res.status(StatusCodes.CREATED).json({product})
}

const getAllProducts = async (req,res) => {
    const products = await Products.find({})

    res.status(StatusCodes.OK).json({products,count:products.length})
}

const getSingleProduct = async (req,res) => {
    const {id:productID} = req.params
    const product = await Products.findOne({_id:productID}).populate('reviews')
    if(!product){
        throw new customError.NotFoundError(`No Product with id: ${productID}`)
    }

    res.status(StatusCodes.OK).json({product})
}

const updateProduct = async (req,res) => {
    const {id:productID} = req.params
    const product = await Products.findOneAndUpdate(
        {_id:productID},
        req.body,
        {new:true,runValidators:true}
    )
    if(!product){
        throw new customError.NotFoundError(`No Product with id: ${productID}`)
    }
    
    res.status(StatusCodes.OK).json({product})
}

const deleteProduct = async (req,res) => {
    const {id:productID} = req.params
    const product = await Products.findOneAndDelete({_id:productID})
    if(!product){
        throw new customError.NotFoundError(`No Product with id: ${productID}`)
    }
    //await product.remove()

    res.status(StatusCodes.OK).json({msg:'Success! Product removed'})
}

const uploadImage = async (req,res) => {
    if(!req.files){
        throw new customError.BadRequestError('Please Upload File')
    }

    const productImage = req.files.image
    if(!productImage.mimetype.startsWith('image')){
        throw new customError.BadRequestError('Please Upload Image')
    }

    const maxSize = 1024 * 1024
    if(productImage.size > maxSize){
        throw new customError.BadRequestError('Please Upload Image smaller than 1MB')
    }

    const imagePath = path.join(__dirname,'../public/uploads/'+`${productImage.name}`)
    await productImage.mv(imagePath)

    res.status(StatusCodes.OK).json({image:`/uploads/${productImage.name}`})
}


module.exports = {
    createProduct,
    getAllProducts,
    getSingleProduct,
    updateProduct,
    deleteProduct,
    uploadImage,
}