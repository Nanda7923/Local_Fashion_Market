const uploadedImageService = require("../services/uplodedImageService");
const resError = require('../middlewares/resError')

async function uploadProductImages(req, res) {
    try {
        const files = req.file ? [req.file] : req.files;
        if (!files || files.length === 0) {
            return res.status(400).json({ message: "Choose an image to upload." });
        }

        const protocol = req.protocol;
        const host = req.get("host");

        let folder;
        const fieldName = files[0].fieldname;
        if (fieldName === "logo") {
            folder = "brandLogo";
        } else if (fieldName === "profilePic") {
            folder = "profile";
        } else if (fieldName === "productImages") {
            folder = "products";
        } else {
            return res.status(400).json({
                message: "Invalid upload type"
            });
        }
        const imageUrls = await uploadedImageService.uploadedImages(files, protocol, host,folder);

        return res.status(200).json({
            message: "Images uploaded successfully",
            urls: imageUrls
        });
    } catch (err) {
        return resError(res, err);
    }
}

module.exports = {
    uploadProductImages
}
