const fs = require('fs');
const express = require('express');
const morgan = require('morgan');

const app = express();

// Middlewares

app.use(morgan('dev'));

app.use(express.json());

app.use((req, res, next) => {
  console.log('Hello from the middleware');
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`),
);

// Route handlers

const getAllTours = (req, res) => {
  console.log(req.requestTime);

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
};

const getTourById = (req, res) => {
  const id = req.params.id * 1; // left as it is would be a string, we convert it automatically to a number
  const tour = tours.find((el) => el.id === id);

  if (!tour)
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
};

const createTour = (req, res) => {
  // console.log(req.body);

  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body); // merges 2 objects into 1

  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      }); // 200 means ok, 201 means created
    },
  );
};

const updateTour = (req, res) => {
  if (!req.params.id * 1 > tours.length)
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });

  res.status(200).json({
    status: 'success',
    data: {
      tour: '<Updated tour here...>',
    },
  });
};

const deleteTour = (req, res) => {
  if (!req.params.id * 1 > tours.length)
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  // 204 because the data no longer exists as we deleted it
  res.status(204).json({
    status: 'success',
    data: null,
  });
};

const getAllUsers = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};

const getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};

const createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};

const updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};

const deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};

// Routes

const userRouter = express.Router();
const tourRouter = express.Router();

tourRouter.route('/').get(getAllTours).post(createTour);

// because the following middleware has been defined after the route handler ('/api/v1/tours')
// all of the requests regarding the tours, will SKIP the middleware. Order definition is important
app.use((req, res, next) => {
  console.log('Hello from the skipped middleware');
  next();
});

tourRouter.route('/:id').get(getTourById).patch(updateTour).delete(deleteTour);

userRouter.route('/').get(getAllUsers).post(createUser);

userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// Start server

const port = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
