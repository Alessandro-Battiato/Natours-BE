const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
// require here the reviewRouter, not the controller

const router = express.Router();

// router.param('id', tourController.checkID);

// Clean best practice for nested routes in Express, but for this to work, in the reviewRouter file
// you would have to specify express.Router({ mergeParams: true }) so that the reviewRouter can access the tour Id as by default, routers can only access their own ids
router.use(
  '/:tourId/reviews',
  // reviewRouter here should go the reviewRouter, remember that a router itself is a middleware so in order to avoid the implementation commented at the end of this page where we have a function coming from the review controller inside tour related routes
  // we do it this way as shown here as to say "whenever you encounter this specified route, use the following router"
);

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);

router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan,
  );

router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour,
  );
// .post(tourController.checkBody, tourController.createTour); // first we run our custom middleware, then the createTour function

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour,
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour,
  );

// Correct nested RESTful architecture
// POST /tour/234fad4/reviews creates a review for a given tour
// GET /tour/234fad4/reviews gets a review for a given tour
// GET /tour/234fad4/reviews/9487fda gets a specific review for a given tour

/*
  router.route('/:tourId/reviews').post(
    authController.protect,
    authController.restrictTo('user'),
    // reviewController.createReview here as the 3rd argument
  );
*/

module.exports = router;
