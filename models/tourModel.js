const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'], // validator, this validates our data, we have set it here to be required and we also have set an error string
      unique: true,
      trim: true,
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: Number,
    summary: {
      type: String,
      trim: [true, 'A tour must have a description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false, // hides field from the returned data
    },
    startDates: [Date],
  },
  {
    toJSON: { virtuals: true }, // this is how you "enable" the virtuals
  },
);

// knowing the duration in weeks is business logic cause it has to do with the business itself,
// and since we need to follow the "fat models, thin controllers" principle
// we calculate this custom field here using virtuals which is useful for this reason
// as to leave as much business logic as possible out of the controllers which should only be concerned with application logic

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7; // we calculate the duration in weeks this way, that is why we are not using an arrow function because we need 'this'
}); // in this case, the get is called getter and each time we get something for the db, the virtual property we have set will be created and will be returned in the results even if not present in the db

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
