const Reviews = require('../models/review');
const Products = require('../models/product');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { checkPermissions } = require('../utils');

const createReview = async (req, res) => {
  const { product: productID } = req.body;

  const isValidProduct = await Products.findOne({ _id: productID });

  if (!isValidProduct) {
    throw new CustomError.NotFoundError(`No product with id : ${productID}`);
  }

  const alreadySubmitted = await Reviews.findOne({
    product: productID,
    user: req.user.userID,
  });

  if (alreadySubmitted) {
    throw new CustomError.BadRequestError(
      'Already submitted review for this product'
    );
  }

  req.body.user = req.user.userID;
  const review = await Reviews.create(req.body);
  res.status(StatusCodes.CREATED).json({ review });
};

const getAllReviews = async (req, res) => {
  const reviews = await Reviews.find({})
  .populate({
    path:'product',
    select:'name company price'
})

  res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
};

const getSingleReview = async (req, res) => {
  const { id: reviewID } = req.params;

  const review = await Reviews.findOne({ _id: reviewID });

  if (!review) {
    throw new CustomError.NotFoundError(`No review with id ${reviewID}`);
  }

  res.status(StatusCodes.OK).json({ review });
};

const updateReview = async (req, res) => {
  const { id: reviewID } = req.params;
  const { rating, title, comment } = req.body;

  const review = await Reviews.findOne({ _id: reviewID });

  if (!review) {
    throw new CustomError.NotFoundError(`No review with id ${reviewID}`);
  }

  checkPermissions(req.user, review.user);

  review.rating = rating;
  review.title = title;
  review.comment = comment;

  await review.save();
  res.status(StatusCodes.OK).json({ review });
};

const deleteReview = async (req, res) => {
  const { id: reviewID } = req.params;

  const review = await Reviews.findOne({ _id: reviewID });

  if (!review) {
    throw new CustomError.NotFoundError(`No review with id ${reviewID}`);
  }

  checkPermissions(req.user, review.user);
  await review.deleteOne();
  res.status(StatusCodes.OK).json({ msg: 'Success! Review removed' });
};

const getSingleProductReviews = async (req,res) => {
  const { id: productID } = req.params
  const reviews = await Reviews.find({ product: productID })
  res.status(StatusCodes.OK).json({ reviews, count: reviews.length })
}

module.exports = {
    createReview,
    getAllReviews,
    getSingleReview,
    updateReview,
    deleteReview,
    getSingleProductReviews,
}