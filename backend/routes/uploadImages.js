const express = require("express");
const router = express.Router();
const uploadController = require("../controllers/uploadedImageController");
const upload = require("../middlewares/multer");
const { verify, checkRole } = require("../middlewares/auth");

router.post(
    "/profile",
    verify,
    upload.single("profilePic"),
     uploadController.uploadProductImages);

router.post(
    "/logo",
    verify,
    checkRole("Admin"),
    upload.single("logo"),
    uploadController.uploadProductImages
)

router.post(
    "/products",
    verify,
    checkRole("Admin"),
    upload.array("productImages", 10),
    uploadController.uploadProductImages
);

module.exports = router;
