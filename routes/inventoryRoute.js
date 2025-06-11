// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities")
const validate = require("../utilities/account-validation")

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Deliver vehicle detail view by inventoryId
router.get('/detail/:inventoryId', invController.buildById);

router.get('/error-link', invController.triggerError);

router.get('/', invController.buildManagement);

// Add classification routes
router.get(
    "/add-classification", 
    utilities.handleErrors(invController.buildAddClassification));

router.post(
    "/add-classification", 
    validate.classificationRules(), 
    validate.checkClassificationData,
    utilities.handleErrors(invController.addClassification));

router.get(
    "/add-inventory",
    utilities.handleErrors(invController.buildAddInventory));

// Handle form submission for adding a new inventory item
router.post(
    "/add-inventory",
    validate.inventoryRules(),
    validate.checkInventoryData,
    utilities.handleErrors(invController.addInventory)
    );

module.exports = router;