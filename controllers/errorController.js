module.exports = (err, req, res, next) => {
  // By specifying 4 arguments (and in this case the first one becomes the error)
  // express AUTOMATICALLY recognizes this middleware as an error middleware and treats it as one
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });

  // key note: whenever we pass ANYTHING into the next() function, express assumes it is an error and will send the error to the global error handling middleware, skipping all the other middlewares
};
