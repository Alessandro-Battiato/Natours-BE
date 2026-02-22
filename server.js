const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Handle ALL uncaught exceptions here, lift this event listener here at the top for uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! Shutting down...');
  console.log(err.name, err.message);
  process.exit(1); // no asynchronous behavior involved here so we can abruptly close the server
});

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {});

const app = require('./app');

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

// Handle ALL promise rejections here
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    // server close gives time to the server to close "gracefully" because doing only process.exit(1) closes the server abruptly, without caring for pending requests for instance
    process.exit(1);
  });
});
