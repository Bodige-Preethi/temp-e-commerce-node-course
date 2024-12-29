const mongoose = require('mongoose');
const Reviews = require('../models/review')

const productSchema = new mongoose.Schema({
    name: {
      type: String,
      trim: true,
      required: [true, 'Please provide product name'],
      maxlength: [100, 'Name can not be more than 100 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Please provide product price'],
      default: 0,
    },
    description: {
      type: String,
      required: [true, 'Please provide product description'],
      maxlength: [1000, 'Description can not be more than 1000 characters'],
    },
    image: {
      type: String,
      default: '/uploads/example.jpeg',
    },
    category: {
      type: String,
      required: [true, 'Please provide product category'],
      enum: ['office', 'kitchen', 'bedroom'],
    },
    company: {
      type: String,
      required: [true, 'Please provide company'],
      enum: {
        values: ['ikea', 'liddy', 'marcos'],
        message: '{VALUE} is not supported',
      },
    },
    colors: {
      type: [String],
      required: true,
      default: ['#222'],
    },
    featured: {
      type: Boolean,
      default: false,
    },
    freeShipping: {
      type: Boolean,
      default: false,
    },
    inventory: {
      type: Number,
      required: true,
      default: 15,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },{ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

productSchema.virtual('reviews',{
  ref: 'Reviews',   //name of the review model
  localField: '_id',
  foreignField: 'product',
  justOne: false,
  //match: {rating: 5},
})

/*productSchema.pre('remove', async function(next){
  await this.model('Reviews').deleteMany({ product: this._id })
  next()
})*/

productSchema.pre('findOneAndDelete', async function(next) { 
  const productID = this.getQuery()['_id']; 
  console.log(this.getQuery()['_id'])
  console.log('Middleware triggered to remove reviews for product:', productID); 
  await Reviews.deleteMany({ product: productID }); 
  next(); 
});


module.exports = mongoose.model('Products', productSchema)