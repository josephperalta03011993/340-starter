const utilities = require("../utilities");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

/* ****************************************
 *  Deliver login view
 * *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
  });
}

/* ****************************************
 *  Deliver registration view
 * *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  });
}

/* ****************************************
 *  Process Registration
 * *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav();
  const { account_firstname, account_lastname, account_email, account_password } = req.body;

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hashSync(account_password, 10);
  } catch (error) {
    req.flash("notice", "Sorry, there was an error processing the registration.");
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    });
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  );

  if (regResult) {
    req.flash("notice", `Congratulations, you're registered ${account_firstname}. Please log in.`);
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null,
    });
  } else {
    req.flash("notice", "Sorry, the registration failed.");
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    });
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body;
  const accountData = await accountModel.getAccountByEmail(account_email);
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.");
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    });
    return;
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password;
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 });
      if (process.env.NODE_ENV === "development") {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 });
      }
      return res.redirect("/account/");
    } else {
      req.flash("notice", "Please check your credentials and try again.");
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      });
    }
  } catch (error) {
    throw new Error("Access Forbidden");
  }
}

/* ****************************************
 *  Process logout
 * *************************************** */
const logout = (req, res) => {
  res.clearCookie("jwt");
  res.redirect("/");
};

/* ****************************************
 *  Deliver account management view
 * *************************************** */
const buildAccount = async (req, res) => {
  let nav = await utilities.getNav();
  let account = res.locals.accountData || (await accountModel.getAccountById(res.locals.accountData?.account_id));
  res.render("account/account", {
    title: "Account Management",
    nav,
    message: req.flash("message"),
    errors: req.flash("errors"),
    account: account,
  });
};

/* ****************************************
 *  Deliver account update view
 * *************************************** */
const buildUpdate = async (req, res) => {
  let nav = await utilities.getNav();
  const account_id = req.params.account_id;
  const account = await accountModel.getAccountById(account_id);
  if (!account || (res.locals.accountData && account_id !== res.locals.accountData.account_id.toString())) {
    req.flash("notice", "Unauthorized access to account update.");
    return res.redirect("/account/");
  }
  res.render("account/update", {
    title: "Update Account",
    nav,
    account: account,
    message: req.flash("message"),
    errors: req.flash("errors"),
  });
};

/* ****************************************
 *  Process account update
 * *************************************** */
const updateAccount = async (req, res, next) => {
  let nav = await utilities.getNav();
  console.log("Update attempt reached:", req.body);
  const { account_id, account_firstname, account_lastname, account_email } = req.body;
  if (!account_id || !account_firstname || !account_lastname || !account_email) {
    req.flash("errors", ["All fields are required for update."]);
    console.log("Validation failed:", req.flash("errors"));
    return res.render("account/update", {
      title: "Update Account",
      nav,
      message: req.flash("message"),
      errors: req.flash("errors"),
      account: req.body,
    });
  }
  try {
    console.log("Attempting update for account_id:", account_id);
    const updateResult = await accountModel.updateAccount(account_id, account_firstname, account_lastname, account_email);
    console.log("Update result:", updateResult);
    const updatedAccount = await accountModel.getAccountById(account_id);
    console.log("Fetched updated account:", updatedAccount);
    if (updatedAccount && (updatedAccount.account_firstname === account_firstname || updatedAccount.account_lastname === account_lastname || updatedAccount.account_email === account_email)) {
      // Update the JWT with new account data
      const newAccountData = {
        account_id: updatedAccount.account_id,
        account_firstname: updatedAccount.account_firstname,
        account_lastname: updatedAccount.account_lastname,
        account_email: updatedAccount.account_email,
        account_type: updatedAccount.account_type,
      };
      const accessToken = jwt.sign(newAccountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 });
      if (process.env.NODE_ENV === "development") {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 });
      }
      res.locals.accountData = newAccountData; // Update local session data
      req.flash("message", "Account updated successfully.");
      console.log("Redirecting to /account with message");
      res.redirect("/account"); // Use redirect instead of render
    } else {
      req.flash("errors", ["Update failed to apply changes. Please try again or contact support."]);
      console.log("Update failed, fetched account does not match input:", updatedAccount);
      res.render("account/update", {
        title: "Update Account",
        nav,
        message: req.flash("message"),
        errors: req.flash("errors"),
        account: req.body,
      });
    }
  } catch (error) {
    console.error("Update error:", error);
    next(error);
  }
};

/* ****************************************
 *  Process password change
 * *************************************** */
const updatePassword = async (req, res, next) => {
  let nav = await utilities.getNav();
  console.log("Password update attempt reached:", req.body); // Enhanced debug
  const { account_id, account_password } = req.body;
  if (!account_id || !account_password) {
    req.flash("errors", ["Account ID and password are required."]);
    return res.render("account/update", {
      title: "Update Account",
      nav,
      message: req.flash("message"),
      errors: req.flash("errors"),
      account: req.body,
    });
  }
  try {
    const hashedPassword = await bcrypt.hash(account_password, 10);
    const updateResult = await accountModel.updatePassword(account_id, hashedPassword);
    if (updateResult) {
      req.flash("message", "Password updated successfully.");
      res.render("account/account", {
        title: "Account Management",
        nav,
        message: req.flash("message"),
        errors: null,
      });
    } else {
      req.flash("errors", ["Failed to update password. Please try again or contact support."]);
      res.render("account/update", {
        title: "Update Account",
        nav,
        message: req.flash("message"),
        errors: req.flash("errors"),
        account: await accountModel.getAccountById(account_id),
      });
    }
  } catch (error) {
    console.error("Password update error:", error);
    next(error); // Pass to error handler
  }
};

module.exports = { 
  buildLogin, 
  buildRegister, 
  registerAccount, 
  accountLogin, 
  buildAccount, 
  buildUpdate, 
  updateAccount, 
  updatePassword,
  logout,
};