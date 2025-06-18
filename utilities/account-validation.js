const utilities = require("../utilities");
const { body, validationResult } = require("express-validator");
const validate = {};
const accountModel = require("../models/account-model");

/*  **********************************
 *  Registration Data Validation Rules
 * ********************************* */
validate.registationRules = () => {
  return [
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."),
    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a last name."),
    body("account_email")
      .trim()
      .escape()
      .notEmpty()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required.")
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(account_email);
        if (emailExists) {
          throw new Error("Email exists. Please log in or use different email");
        }
      }),
    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ];
};

/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body;
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("account/register", {
      errors,
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    });
    return;
  }
  next();
};

/*  **********************************
 *  Login Data Validation Rules
 * ********************************* */
validate.loginRules = () => {
  return [
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required."),
    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Password cannot be empty."),
  ];
};

/* ******************************
 * Check login data and return errors or continue
 * ***************************** */
validate.checkLoginData = async (req, res, next) => {
  const { account_email } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("account/login", {
      errors,
      title: "Login",
      nav,
      account_email,
    });
    return;
  }
  next();
};

/* ******************************
 * Check inventory add classification data and return errors or continue
 * ***************************** */
validate.classificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .notEmpty().withMessage("Classification name is required.")
      .matches(/^[a-zA-Z0-9]+$/)
      .withMessage("Classification name must not contain spaces or special characters."),
  ];
};

/* ******************************
 * Check data and return errors or continue to login
 * ***************************** */
validate.checkClassificationData = async (req, res, next) => {
  const { classification_name } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("./inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors,
      classification_name,
      notice: req.flash("notice"),
    });
    return;
  }

  next();
};

validate.inventoryRules = () => {
  return [
    body("classification_id").notEmpty().withMessage("Please choose a classification."),
    body("inv_make").trim().notEmpty().withMessage("Make is required."),
    body("inv_model").trim().notEmpty().withMessage("Model is required."),
    body("inv_year").isInt({ min: 1886 }).withMessage("Enter a valid year."),
    body("inv_description").trim().notEmpty().withMessage("Description is required."),
    body("inv_image").trim().notEmpty().withMessage("Image path is required."),
    body("inv_thumbnail").trim().notEmpty().withMessage("Thumbnail path is required."),
    body("inv_price").isFloat({ min: 0 }).withMessage("Price must be a positive number."),
    body("inv_miles").isInt({ min: 0 }).withMessage("Miles must be a positive number."),
    body("inv_color").trim().notEmpty().withMessage("Color is required."),
  ];
};

validate.checkInventoryData = async (req, res, next) => {
  const errors = validationResult(req);
  const classificationList = await utilities.buildClassificationList(req.body.classification_id);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("inventory/add-inventory", {
      title: "Add New Inventory",
      nav,
      classificationList,
      errors,
      notice: req.flash("notice"),
      ...req.body,
    });
    return;
  }
  next();
};

validate.checkUpdateData = async (req, res, next) => {
  const errors = validationResult(req);
  console.log("Validation errors:", errors.array()); // Debug log
  //const classificationSelect = await utilities.buildClassificationList(req.body.classification_id);

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("account/update", { 
      title: "Update Account",
      nav,
      errors,
      notice: req.flash("notice"),
      ...req.body,
    });
    return;
  }
  next();
};

/* ******************************
 * Check password data and return errors or continue
 * ***************************** */
validate.checkPasswordData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("account/update", {
      title: "Update Account",
      nav,
      errors,
      notice: req.flash("notice"),
      ...req.body,
    });
    return;
  }
  next();
};

/*  **********************************
 *  Update Data Validation Rules
 * ********************************* */
validate.updateRules = () => {
  return [
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("First name is required."),
    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Last name is required."),
    // body("account_email")
    //   .trim()
    //   .escape()
    //   .notEmpty()
    //   .isEmail()
    //   .normalizeEmail()
    //   .withMessage("A valid email is required.")
    //   .custom(async (account_email, { req }) => {
    //     if (req.body.account_id) {
    //       const account = await accountModel.getAccountByEmail(account_email);
    //       if (account && account.account_id !== req.body.account_id) {
    //         throw new Error("Email already exists. Please use a different email.");
    //       }
    //     }
    //   }),
    body("account_id")
      .trim()
      .notEmpty()
      .withMessage("Account ID is required.")
      .isInt()
      .withMessage("Invalid Account ID format."),
  ];
};

/*  **********************************
 *  Password Change Validation Rules
 * ********************************* */
validate.passwordRules = () => {
  return [
    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Password is required.")
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password must be at least 12 characters with uppercase, lowercase, number, and special character."),
    body("account_id")
      .trim()
      .notEmpty()
      .withMessage("Account ID is required.")
      .isInt()
      .withMessage("Invalid Account ID format."),
  ];
};

/* ******************************
 * Review Validation Rules
 * ***************************** */
validate.reviewRules = () => {
  return [
    body("review_rating")
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5"),
    body("review_comment")
      .trim()
      .notEmpty()
      .withMessage("Comment is required")
  ];
};

module.exports = validate;