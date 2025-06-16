// Needed Resources
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities");
const validate = require("../utilities/account-validation");

// Route to build inventory by classification view (public)
router.get("/type/:classificationId", invController.buildByClassificationId);

// Deliver vehicle detail view by inventoryId (public)
router.get("/detail/:inventoryId", invController.buildById);

// Error link route (public, assuming for testing)
router.get("/error-link", invController.triggerError);

// Management view (admin-restricted)
router.get("/", utilities.restrictToEmployeeOrAdmin, invController.buildManagement);

// Add classification routes (admin-restricted)
router.get(
  "/add-classification",
  utilities.restrictToEmployeeOrAdmin,
  utilities.handleErrors(invController.buildAddClassification)
);
router.post(
  "/add-classification",
  utilities.restrictToEmployeeOrAdmin,
  validate.classificationRules(),
  validate.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
);

// Add inventory routes (admin-restricted)
router.get(
  "/add-inventory",
  utilities.restrictToEmployeeOrAdmin,
  utilities.handleErrors(invController.buildAddInventory)
);
router.post(
  "/add-inventory",
  utilities.restrictToEmployeeOrAdmin,
  validate.inventoryRules(),
  validate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
);

// Get inventory JSON (admin-restricted, assuming management-related)
router.get(
  "/getInventory/:classification_id",
  utilities.restrictToEmployeeOrAdmin,
  utilities.handleErrors(invController.getInventoryJSON)
);

// Edit inventory routes (admin-restricted)
router.get(
  "/edit/:inventory_id",
  utilities.restrictToEmployeeOrAdmin,
  utilities.handleErrors(invController.editInventoryView)
);
router.post(
  "/update/",
  utilities.restrictToEmployeeOrAdmin,
  validate.inventoryRules(),
  validate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
);

// Delete inventory routes (admin-restricted)
router.get(
  "/delete/:inventory_id",
  utilities.restrictToEmployeeOrAdmin,
  utilities.handleErrors(invController.deleteInventoryView)
);
router.post(
  "/delete",
  utilities.restrictToEmployeeOrAdmin,
  utilities.handleErrors(invController.deleteInventory)
);

module.exports = router;