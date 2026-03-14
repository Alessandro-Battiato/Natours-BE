const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

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
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8, // it has been found that the safest passwords are usually the longest ones, not the crazy ones with special characters or anything like that, that is why we are only imposing a min length as a requirement
    select: false, // this way the password won't show in any output of our requests (such as get users), very important for security purposes
  },
  passwordConfirm: {
    type: String,
    required: [true, 'You must confirm your password'],
    validate: {
      // This validation only works on User.create and User.save
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same!',
    },
  },
  passwordChangedAt: Date,
});

// Between getting the data, and saving it to the database, we are running the following middleware
userSchema.pre('save', async function (next) {
  // this = current document, or rather the current User
  if (!this.isModified('password')) return next(); // If password has NOT been modified, run next middleware

  // Encrypt (or hash) password using bcrypt to protect from brute force attacks
  this.password = await bcrypt.hash(this.password, 12); // second argument is salt, random string added to our password, the higher this argument is, the more CPU intensive this operation becomes

  this.passwordConfirm = undefined; // of course the hashed password will not be equal to the old user's password so we no longer need this validation field
  next();
});

// The following is an instant method, a method immediately available on all documents of a certain collection
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword); // returns true if the 2 arguments are the same
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  // Remember this is an instance method so 'this' points to the current document
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    return JWTTimestamp < changedTimestamp;
  }

  // False means password NOT changed
  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
