const express = require('express');
const router = express.Router();
const brandController = require('../controllers/brandController')
const { verify, checkRole } = require('../middlewares/auth');

router.get('/',brandController.getAllBrands);
router.post('/',verify,checkRole("Admin"),brandController.addBrand);
router.put('/:brandId',verify,checkRole("Admin"),brandController.updateBrand);
router.delete('/:brandId',verify,checkRole("Admin"),brandController.deleteBrand);

module.exports = router;
