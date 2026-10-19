const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({

    //where to save the uploaded file
    destination: (req, file, cb) => {
        let folder;

        if (req.path === "/profile") {
            folder = "profile";
        }
        else if (req.path === "/logo") {
            folder = "brandLogo";
        }
        else if (req.path === "/products") {
            folder = "products";
        }

        //cb(err,data)
        cb(null, path.join(__dirname, "../uploads/",folder));
    },

    //What filename should I give the uploaded file?
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
        // data => creating uploaded filename
        // path.extname(file.originalname) => getting the extension of file like .png , .pdf
    }
});

const upload = multer({ storage });

module.exports = upload;
