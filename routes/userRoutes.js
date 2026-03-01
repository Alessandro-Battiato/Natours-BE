const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

// The following DOES NOT follow the RESTful principle regarding names because the signup rout HAS to do with the performed action but it's fine in this scenario
router.post('/signup', authController.signup);

// The following DO follow the RESTful principle of rout names not having anything to do with the performed action
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
