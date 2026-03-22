const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const compression = require('compression');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const bookingRouter = require('./routes/bookingRoutes');

const app = express();

// Set security HTTP headers
app.use(helmet());

// Middlewares
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  // how many requests per IP we allow during a time window
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour',
});

app.use('/api', limiter); // apply this limiter only to /api routes

app.use(express.json({ limit: '10kb' })); // req.bodies larger than 10kb will not be accepted

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      // Only allow the following specified parameters as duplicates during requests
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);

app.use(express.static(`${__dirname}/public`)); // to be able to serve static files

app.use(compression()); // compresses all the text that is sent to the client

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
app.use('/api/v1/bookings', bookingRouter);
// ONLY if neither the tour or user controllers have been able to handle the request, use the following wildcard error middleware to cover all cases for all requests where the requested URL doesn't exist
// This is why middleware order definition is extremely important
app.all('*', (req, res, next) => {
  /*res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server!`,
  });*/
  /*const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  err.status = 'fail';
  err.statusCode = 404;*/

  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
