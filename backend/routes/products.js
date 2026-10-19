const express = require('express');
const router = express.Router();
const productController = require("../controllers/ProductController");
const { verify, checkRole } = require("../middlewares/auth");

router.get('/',productController.getAllProducts );
router.get('/new-arrivals',productController.getNewArrivals );
router.get("/head-categories",productController.getHeadCategories);
router.get('/trending',productController.getProductsByRating);
router.get('/:id',productController.getProductById);
router.get('/brands/:brandId',productController.getProductByBrand);
router.get("/categories/:category",productController.getProductsByCategory);
router.get('/head-categories/:headCategory',productController.getProductsByHeadCategory);
router.post("/",verify,checkRole("Admin"),productController.addProducts);
router.delete('/:id',verify,checkRole("Admin"),productController.deleteProducts);
router.put("/:id",verify,checkRole("Admin"),productController.updateProducts);

module.exports = router;
