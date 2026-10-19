const path = require("path");
require("dotenv").config({
    path: path.resolve(__dirname, "../.env"),
    quiet: true,
});
const mongoose = require("mongoose");
const userService = require("../services/userService");

async function main(){
    if (!process.env.MONGODB_URI) {
        throw new Error("MONGODB_URI is required in the backend environment.");
    }
    const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
    if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
        throw new Error("Set ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD before running Admin setup.");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    if (mongoose.connection.name !== "Fashion_website") {
        throw new Error(`Connected to database "${mongoose.connection.name}"; expected "Fashion_website". No account was created.`);
    }

    const admin = await userService.createAdminAccount({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
    });
    if (admin.role !== "Admin") {
        throw new Error("The new account was saved without the expected Admin role.");
    }

    const loginResult = await userService.loginUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
    });
    if (loginResult.user.role !== "Admin" || !loginResult.token) {
        throw new Error("The Admin account was created, but login verification did not succeed.");
    }
    console.log("Additional Admin account created and login verification passed.");
}

main()
    .catch((error) => {
        if (error && error.code === 11000) {
            console.error("An account with this email is already registered; choose a different email.");
        } else {
            console.error(error.message || "Admin setup failed.");
        }
        process.exitCode = 1;
    })
    .finally(async () => {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
        delete process.env.ADMIN_PASSWORD;
    });
