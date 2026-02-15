const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'], // validator, this validates our data, we have set it here to be required and we also have set an error string
      unique: true,
      trim: true,
    },
    slug: String,
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
    secretTour: {
      type: Boolean,
      default: false, // USUALLY tours are not secret and thus open to the public for normal requests
    },
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

tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true }); // define a new slug prop on the newly created document
  next(); // similar to the next middlewares of express, we need to invoke this here
}); // pre is a middleware that runs before an event, the event is the one specified as the argument of the function so in this case, the function callback we are passing will be called BEFORE we SAVE something in the db

/*
tourSchema.pre('save', function (next) {
  console.log('Will save document...');
  next();
});

tourSchema.post('save', function (doc, next) {
  // the doc parameter is the newly created document

  next();
});
*/

//tourSchema.pre('find', function (next) {
// we use a regex here to cover all of the find cases, meaning this query middleware will run for normal get requests and also get by id requests, otherwise we would have needed a separate middleware with the findOne parameter
tourSchema.pre(/^find/, function (next) {
  // the find keyword turns the pre middleware into a query middleware, this means that by using the find keyword, we are now looking at the query instead of a document
  // in this fictional use case, we are using this middleware to filter secret tours from the results, reserved for VIP members only
  this.find({ secretTour: { $ne: true } }); // find tours which have secret tour prop NOT EQUAL to true

  this.start = Date.now();
  next();
});

/*
tourSchema.post(/^find/, function (docs, next) {
  // we have access to ALL of the documents that have matched the query because are using the find parameter here as well
  next();
});
*/

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
