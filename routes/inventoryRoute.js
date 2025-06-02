// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Deliver vehicle detail view by inventoryId
router.get('/detail/:inventoryId', invController.buildById);

router.get('/error-link', invController.triggerError);

module.exports = router;