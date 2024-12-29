const mongoose = require('mongoose')

const reviewSchema = mongoose.Schema({
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: [true,'Please provide rating'],
    },
    title: {
        type: String,
        trim: true,
        required: [true,'Please provide review title'],
        maxlength: 100,
    },
    comment: {
        type: String,
        required: [true,'Please provide review text'],
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Products',
        required: true,
    },
},{timestamps: true})

reviewSchema.index({product: 1, user: 1},{unique: true})

// Define the static method on the schema 
reviewSchema.statics.calculateAverageRating = async function (productID) { 
    const result = await this.aggregate([
        {$match:{product: productID}},
        {$group: {
            _id: null,
            aveargeRating: {$avg: '$rating'},
            numOfReviews: {$sum: 1},
        },
    },
    ])
    
    try {
        await this.model('Products').findOneAndUpdate({_id:productID},{
            aveargeRating: Math.ceil(result[0]?.aveargeRating || 0),
            numOfReviews: result[0]?.numOfReviews || 0,
        })
    } catch (error) {
        console.log(error)
    } 
}; 
// Middleware after saving a review 
reviewSchema.post('save', async function () { 
    await this.constructor.calculateAverageRating(this.product); 
}); 
// Middleware after deleting a review 
reviewSchema.post('deleteOne', { document: true, query: false }, async function () { 
    await this.constructor.calculateAverageRating(this.product);
});


module.exports = mongoose.model('Reviews', reviewSchema);