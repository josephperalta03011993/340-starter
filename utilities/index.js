const invModel = require("../models/inventory-model");
const Util = {};
const jwt = require("jsonwebtoken");
require("dotenv").config();

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req = { originalUrl: "/" }) {
  const currentPath = req.originalUrl; // e.g., "/", "/inv/type/2"
  let data = await invModel.getClassifications();

  let list = '<ul>';
  list += `<li><a href="/" title="Home page" class="${currentPath === '/' ? 'active' : ''}">Home</a></li>`;

  data.rows.forEach((row) => {
    const path = `/inv/type/${row.classification_id}`;
    const isActive = currentPath === path ? 'active' : '';

    list += `<li><a href="${path}" title="See our inventory of ${row.classification_name} vehicles" class="${isActive}">${row.classification_name}</a></li>`;
  });

  list += '</ul>';
  return list;
};

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function (data) {
  let grid;
  if (data.length > 0) {
    grid = '<ul id="inv-display">';
    data.forEach(vehicle => { 
      grid += '<li>';
      grid +=  '<a href="../../inv/detail/' + vehicle.inv_id 
        + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
        + 'details"><img src="' + vehicle.inv_thumbnail 
        +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
        +' on CSE Motors"></a>';
      grid += '<div class="namePrice">';
      grid += '<hr>';
      grid += '<h2>';
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
        + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
        + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>';
      grid += '</h2>';
      grid += '<span>$' 
        + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>';
      grid += '</div>';
      grid += '</li>';
    });
    grid += '</ul>';
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }
  return grid;
};

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

function buildDetailView(vehicle) {
  return `
    <div id="inv-detail-container">
    <h2>${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</h2>
    <div class="detail-container">
        <img src="${vehicle.inv_image}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model}">
        <div class="vehicle-details">
            <h3>${vehicle.inv_make} ${vehicle.inv_model} Details</h3><br>
            <p><strong>Price: $${Number(vehicle.inv_price).toLocaleString()}</strong></p><br>
            <p><strong>Description:</strong> ${vehicle.inv_description}</p><br>
            <p><strong>Color:</strong> ${vehicle.inv_color}</p><br>
            <p><strong>Mileage:</strong> ${Number(vehicle.inv_miles).toLocaleString()} miles</p>
        </div>
    </div>
  `;
}

Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications();
  let classificationList =
    `<label for="classification_id">Classification:</label>
    <select name="classification_id" id="classification_id" required>`;
  classificationList += "<option value=''>Choose a Classification</option>";
  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"';
    if (
      classification_id != null &&
      row.classification_id == classification_id
    ) {
      classificationList += " selected ";
    }
    classificationList += ">" + row.classification_name + "</option>";
  });
  classificationList += "</select>";
  return classificationList;
};

/* ****************************************
 * Middleware to check token validity
 **************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, accountData) {
        if (err) {
          req.flash("notice", "Please log in");
          res.clearCookie("jwt");
          return res.redirect("/account/login");
        }
        res.locals.accountData = accountData;
        res.locals.loggedin = true;
        res.locals.account_firstname = accountData.account_firstname;
        next();
      });
  } else {
    res.locals.loggedin = false;
    res.locals.account_firstname = null;
    res.locals.accountData = null;
    next();
  }
};

/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next();
  } else {
    req.flash("notice", "Please log in.");
    return res.redirect("/account/login");
  }
};

/* ****************************************
 * Middleware to restrict access to Employee or Admin
 **************************************** */
Util.restrictToEmployeeOrAdmin = (req, res, next) => {
  if (!res.locals.loggedin || !res.locals.accountData) {
    req.flash("notice", "Please log in to access this page.");
    return res.redirect("/account/login");
  }
  if (res.locals.accountData.account_type !== "Employee" && res.locals.accountData.account_type !== "Admin") {
    req.flash("notice", "Unauthorized: Employee or Admin access required.");
    return res.redirect("/account/login");
  }
  next();
};

module.exports = { ...Util, buildDetailView };