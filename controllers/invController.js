const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")
const { classificationRules } = require("../utilities/account-validation")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav(req)
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

invCont.buildById = async function (req, res, next) {
  try {
      const invId = req.params.inventoryId;
      const data = await invModel.getInventoryById(invId);
      if (!data) {
          return next(); // Trigger 404 if no data
      }
      const html = utilities.buildDetailView(data);
      res.render('./inventory/detail', { 
          title: `${data.inv_make} ${data.inv_model}`,
          nav: await utilities.getNav(req),
          html 
      });
  } catch (error) {
      next(error); // Pass to error handler
  }
}

/* Intentional Error Trigger */
invCont.triggerError = async function (req, res, next) {
  try {
    // Intentionally throw an error to simulate a 500-type error
    throw new Error("This is an intentional error for testing purposes!");
  } catch (error) {
    // Pass the error to the next middleware
    next(error);
  }
};

invCont.buildManagement = async (req, res) => {
  try {
    const nav = await utilities.getNav(req);
    res.render("inventory/management", { 
      title: "Inventory Management",
      nav, 
      errors: null, 
      notice: req.flash("notice")
    });
  } catch (error) {
    req.flash("error", "Failed to load management view.");
    res.redirect("/");
  }
};

invCont.buildAddClassification = async (req, res) => {
  try {
    const nav = await utilities.getNav(req);
    res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: null,
      classification_name: "",
      notice: req.flash("notice")
    });
  } catch (error) {
    req.flash("error", "Failed to load add classification view.");
    res.redirect("/inv");
  }
}

invCont.addClassification = async (req, res) => {
  try {
    const { classification_name } = req.body;
    const result = await invModel.addClassification(classification_name);
    const nav = await utilities.getNav(req);
    if (result) { 
      req.flash("success", "Classification added successfully!");
      res.render("inventory/management", { 
        title: "Inventory Management", 
        nav, 
        errors: null, 
        notice: req.flash("notice") 
      });
    } else {
      req.flash("error", "Failed to add classification.");
      res.render("inventory/add-classification", { 
        title: "Add Classification", 
        classification_name,
        nav,
        errors: [{ msg: "Database insertion failed." }]
      });
    }
  } catch (error) {
    const nav = await utilities.getNav(req);
    req.flash("error", "Server error while adding classification.");
    res.render("inventory/add-classification", { 
      title: "Add Classification", 
      classification_name: req.body.classification_name,
      nav,
      notice: req.flash("notice"),
      errors: [{ msg: "An unexpected error occurred." }]
    });
  }
};

module.exports = invCont;