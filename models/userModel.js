const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!'],
  },
  email: {
    type: String,
    required: [true, 'A user must have an email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8, // it has been found that the safest passwords are usually the longest ones, not the crazy ones with special characters or anything like that, that is why we are only imposing a min length as a requirement
  },
  passwordConfirm: {
    type: String,
    required: [true, 'You must confirm your password'],
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
