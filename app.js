const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// Middlewares
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());

app.use(express.static(`${__dirname}/public`)); // to be able to serve static files

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// because the following middleware has been defined after the route handler ('/api/v1/tours')
// all of the requests regarding the tours, will SKIP the middleware. Order definition is important
/*
app.use((req, res, next) => {
  console.log('Hello from the skipped middleware');
  next();
});
*/

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
// ONLY if neither the tour or user controllers have been able to handle the request, use the following wildcard error middleware to cover all cases for all requests where the requested URL doesn't exist
// This is why middleware order definition is extremely important
app.all('*', (req, res, next) => {
  /*res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server!`,
  });*/
  const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  err.status = 'fail';
  err.statusCode = 404;

  next(err);
});

app.use((err, req, res, next) => {
  // By specifying 4 arguments (and in this case the first one becomes the error)
  // express AUTOMATICALLY recognizes this middleware as an error middleware and treats it as one
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });

  // key note: whenever we pass ANYTHING into the next() function, express assumes it is an error and will send the error to the global error handling middleware, skipping all the other middlewares
});

module.exports = app;
