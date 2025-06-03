const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

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

module.exports = invCont;