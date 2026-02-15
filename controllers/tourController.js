const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');

/*
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`),
);
*/
/*exports.checkID = (req, res, next, value) => {
  // this is the function we'll pass to the param middleware and as such, the 4th argument is the
  // value of the parameter itself, in this case, the id
  if (value * 1 > tours.length)
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  next();
};

exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price)
    return res.status(400).json({
      status: 'fail',
      message: 'Missing name or price',
    });
  next();
};*/

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = async (req, res) => {
  try {
    /*const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];

    excludedFields.forEach((el) => delete queryObj[el]);

    let queryString = JSON.stringify(queryObj);
    queryString = queryString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (matchedKeyword) => `$${matchedKeyword}`,
    ); // match the following operators: gte, gt, lte, lt and replace them with the mongoose $ operator

    let query = Tour.find(JSON.parse(queryString));*/

    /*if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt'); // createdAt descending order
    }*/

    /*if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields); // only return the selected fields
    } else {
      query = query.select('-__v'); // because of the - we get everything EXCEPT the v field
    }*/

    // Pagination, skip is useful to return the requested results based on the requested page (e.g for page 2 we need to skip the first 10 results)
    /*const page = req.query.page * 1 || 1; // convert to a number or set 1 by default
    const limit = req.query.limit * 1 || 100;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    if (req.query.page) {
      const numTours = await Tour.countDocuments(); // returns the number of documents
      if (skip >= numTours) throw new Error('This page does not exist'); // throw Error as to trigger the catch block where we handle the error
    }*/

    /*const query = await Tour.find()
      .where('duration')
      .equals(5)
      .where('difficulty')
      .equals('easy');*/

    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const tours = await features.query;

    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getTour = async (req, res) => {
  // const id = req.params.id * 1; // left as it is would be a string, we convert it automatically to a number
  /*const tour = tours.find((el) => el.id === id);*/
  try {
    const tour = await Tour.findById(req.params.id);

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    }); // 200 means ok, 201 means created
  } catch (err) {
    res.status(400).json({
      status: 'failed',
      message: 'Invalid data sent!', // TO DO: Handle error later
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // the updated document will be the one returned by the request this way, more info on the options set here can be found in the mongoose official docs
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'failed',
      message: 'Invalid data sent!', // TO DO: Handle error later
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    // 204 because the data no longer exists since we deleted it
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getTourStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: {
          ratingsAverage: { $gte: 4.5 },
        },
      },
      {
        $group: {
          _id: { $toUpper: '$difficulty' }, // group by difficulty
          numTours: {
            $sum: 1,
          },
          numRatings: {
            $sum: '$ratingsQuantity',
          },
          avgRating: {
            $avg: '$ratingsAverage', // calculates the average by the ratingsAverage field
          },
          avgPrice: {
            $avg: '$price',
          },
          minPrice: {
            $min: '$price',
          },
          maxPrice: {
            $max: '$price',
          },
        },
      },
      {
        $sort: {
          avgPrice: 1,
        },
      },
      /*{
        $match: {
          _id: {
            $ne: 'EASY', // select documents that are NOT easy, and so far the id is still set to difficulty because of the previous object
          },
        },
      },*/
    ]);

    res.status(200).json({
      status: 'success',
      data: stats,
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  // Custom endpoint to get the busiest months of this fake Natours business
  try {
    const year = req.params.year * 1;

    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates',
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numTourStarts: {
            $sum: 1,
          },
          tours: {
            $push: '$name',
          },
        },
      },
      {
        $addFields: {
          month: '$_id',
        },
      },
      {
        $project: {
          _id: 0, // this field will no longer show up in the results, if you set it to 1 the opposite would happen
        },
      },
      {
        $sort: {
          numTourStarts: -1, // descending order, the highest number of num tour starts
        },
      },
      {
        $limit: 12, // result limit
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: plan,
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};
