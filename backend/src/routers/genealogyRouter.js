// routers/genealogyRouter.js

const express = require('express');
const genealogyController = require('../controllers/genealogyController.js');
const router = express.Router();

router.post('/addPerson', genealogyController.addPerson);
router.post('/addParentChildRelationship', genealogyController.addParentChildRelationship);
router.get('/getAllPeople', genealogyController.getAllPeople);
router.get('/getAllMales', genealogyController.getAllMales);
router.get('/getAllFemales', genealogyController.getAllFemales);
router.post('/addMarriageRelationship', genealogyController.addMarriageRelationship);
router.delete('/deletePerson/:personId', genealogyController.deletePerson);
router.get('/getUnmarriedPeople', genealogyController.getUnmarriedPeople);
router.get('/getMarriedPeople', genealogyController.getMarriedPeople);
router.delete('/deleteMarriage/:spouse1Id/:spouse2Id', genealogyController.deleteMarriageRelationship);

module.exports = router;



