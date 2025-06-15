const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")
const { classificationRules } = require("../utilities/account-validation")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
// invCont.buildByClassificationId = async function (req, res, next) {
//   const classification_id = req.params.classificationId
//   const data = await invModel.getInventoryByClassificationId(classification_id)
//   const grid = await utilities.buildClassificationGrid(data)
//   let nav = await utilities.getNav(req)
//   const className = data[0].classification_name
//   res.render("./inventory/classification", {
//     title: className + " vehicles",
//     nav,
//     grid,
//   })
// }
invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = req.params.classificationId
    const data = await invModel.getInventoryByClassificationId(classification_id)
    const nav = await utilities.getNav(req)

    if (!data || data.length === 0) {
      return res.status(404).render("./inventory/classification", {
        title: "No Vehicles Found",
        nav,
        message: "No vehicles match the selected classification.",
        grid: null
      })
    }

    const className = data[0].classification_name
    const grid = await utilities.buildClassificationGrid(data)
    res.render("./inventory/classification", {
      title: className + " vehicles",
      nav,
      grid
    })
  } catch (error) {
    console.error("Error in buildByClassificationId:", error)
    next(error)
  }
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
    const classificationSelect = await utilities.buildClassificationList()
    res.render("inventory/management", { 
      title: "Vehicle Management",
      nav, 
      errors: null, 
      notice: req.flash("notice"),
      classificationSelect
    });
  } catch (error) {
    req.flash("error", "Failed to load management view.");
    res.redirect("/");
  }
};

invCont.buildAddClassification = async (req, res) => {
  try {
    const nav = await utilities.getNav(req);
    const classificationSelect = await utilities.buildClassificationList();
    res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: null,
      classification_name: "",
      notice: req.flash("notice"),
      classificationSelect
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
    const classificationSelect = await utilities.buildClassificationList();
    if (result) { 
      req.flash("success", "Classification added successfully!");
      res.render("inventory/management", { 
        title: "Inventory Management", 
        nav, 
        errors: null, 
        notice: req.flash("notice"),
        classificationSelect
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

/* ***************************
 *  Build add inventory view
 * ************************** */
invCont.buildAddInventory = async function (req, res) {
  try {
    let nav = await utilities.getNav(req);
    let classificationSelect = await utilities.buildClassificationList();
    res.render("inventory/add-inventory", {
      title: "Add New Inventory",
      nav,
      classificationSelect,
      errors: null,
      notice: req.flash("notice"),
      classification_id: "",
      inv_make: "",
      inv_model: "",
      inv_year: "",
      inv_description: "",
      inv_image: "",
      inv_thumbnail: "",
      inv_price: "",
      inv_miles: "",
      inv_color: ""
    });
  } catch (error) {
    req.flash("error", error.toString());
    res.redirect("/inv");
  }
};

// Handle form POST
invCont.addInventory = async function (req, res) {

  let classificationSelect = await utilities.buildClassificationList(req.body.classification_id);
  const {
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color
  } = req.body;

  const result = await invModel.addInventoryItem(
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color
  );

  if (result) {
    req.flash("success", "Vehicle successfully added!");
    nav = await utilities.getNav(req);
    const classificationSelect = await utilities.buildClassificationList();
    res.status(201).render("./inventory/management", {
      title: "Inventory Management",
      nav,
      classificationSelect,
      notice: req.flash("notice")
    });
  } else {
    req.flash("notice", "Failed to add vehicle.");
    res.status(500).render("./inventory/add-inventory", {
      title: "Add New Inventory",
      nav,
      classificationSelect,
      errors: null,
      notice: req.flash("notice"),
      ...req.body
    });
  }
}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inventory_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getInventoryById(inv_id)
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  })
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body
  const updateResult = await invModel.updateInventory(
    inv_id,  
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("success", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
    })
  }
}

/* ***************************
 *  Build delete inventory view
 * ************************** */
invCont.deleteInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inventory_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getInventoryById(inv_id)
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/delete-confirm", {
    title: "Delete " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_price: itemData.inv_price,
    classification_id: itemData.classification_id
  })
}

/* ***************************
 *  Delete Inventory Data
 * ************************** */
invCont.deleteInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_price,
    inv_year,
    classification_id,
  } = req.body
  const deleteResult = await invModel.deleteInventory(
    inv_id,  
    inv_make,
    inv_model,
    inv_price,
    inv_year,
    classification_id
  )

  if (deleteResult) {
    const itemName = inv_make + " " + inv_model
    req.flash("success", `The ${itemName} was successfully deleted.`)
    res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the delete failed.")
    res.status(501).render("inventory/delete-confirm", {
    title: "Delete " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_price,
    classification_id
    })
  }
}

module.exports = invCont;