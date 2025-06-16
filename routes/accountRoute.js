const express = require("express");
const router = new express.Router();
const accountController = require("../controllers/accountController");
const utilities = require("../utilities");
const validate = require("../utilities/account-validation"); // Corrected import

// Deliver login view
router.get("/login", utilities.handleErrors(accountController.buildLogin));

// Deliver registration view
router.get("/register", utilities.handleErrors(accountController.buildRegister));

// Process registration data
router.post(
  "/register",
  validate.registationRules(),
  validate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
);

// Process the login request
router.post(
  "/login",
  validate.loginRules(),
  validate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
);

// Default account management route
router.get(
  "/",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildAccount)
);

// Update account routes
router.get("/update/:account_id", utilities.handleErrors(accountController.buildUpdate));
router.post(
  "/update",
  validate.updateRules(),
  validate.checkUpdateData,
  utilities.handleErrors(accountController.updateAccount)
);
router.post(
  "/update-password",
  validate.passwordRules(),
  validate.checkPasswordData,
  (req, res, next) => {
    console.log("Reached /update-password controller with body:", req.body);
    utilities.handleErrors(accountController.updatePassword)(req, res, next);
  }
);

// Logout route
router.get(
  "/logout",
  utilities.handleErrors(accountController.logout)
);

module.exports = router;