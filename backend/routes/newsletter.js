const express = require('express');
const router = express.Router();
const newsletterController = require('../controllers/newsletterController');
const { verify, checkRole } = require('../middlewares/auth');

router.post('/subscribe', newsletterController.subscribe);
router.post('/', newsletterController.subscribe);
router.get('/', verify, checkRole('Admin'), newsletterController.getAllSubscribers);

module.exports = router;
