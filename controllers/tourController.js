const Tour = require('../models/tourModel');

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

exports.getAllTours = (req, res) => {
  console.log(req.requestTime);

  res.status(200).json({
    status: 'success',
    /*results: tours.length,
    data: {
      tours,
    },
    */
  });
};

exports.getTour = (req, res) => {
  const id = req.params.id * 1; // left as it is would be a string, we convert it automatically to a number
  /*const tour = tours.find((el) => el.id === id);

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });*/
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

exports.updateTour = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      tour: '<Updated tour here...>',
    },
  });
};

exports.deleteTour = (req, res) => {
  // 204 because the data no longer exists as we deleted it
  res.status(204).json({
    status: 'success',
    data: null,
  });
};
