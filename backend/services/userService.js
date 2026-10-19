let Users = require("../models/User");
let bcrypt = require("bcrypt");
let jwt = require("jsonwebtoken");

async function getAllUsers(){
	let users =await Users.find().select('-password').sort({ createdAt: -1 });
    return users;
}

async function getUserById(id){
	let user = await Users.findById(id).select('-password');
    return user;
}

async function getUserByBanned(){
	let user = await Users.find({isBanned : true}).select('-password');
    return user;
}

async function registerUser(user){
    const password = typeof user?.password === 'string' ? user.password : '';
    if (!password) {
        const error = new Error("Password is required.");
        error.statusCode = 400;
        throw error;
    }
    let hashedPassword = await hashPassword(password);
    let newUser = new Users({
        ...user,
        role: "User",
        password: hashedPassword,
    });
    let registeredUser = await newUser.save();
    let payload = {
        userId: registeredUser._id,
        role : registeredUser.role,
    };
    let token = jwt.sign(payload, process.env.TOKEN_SECRET,{ expiresIn: "1d" });
    return {
        token,
        user: {
            _id: registeredUser._id,
            name: registeredUser.name,
            email: registeredUser.email,
            role: registeredUser.role,
            profilePic: registeredUser.profilePic
        }};
}

async function hashPassword(password){
    let salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

async function createAdminAccount(user){
    const name = typeof user.name === "string" ? user.name.trim() : "";
    const email = typeof user.email === "string" ? user.email.trim().toLowerCase() : "";
    const password = typeof user.password === "string" ? user.password : "";
    if (!name || name.length > 18 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8 || password.length > 16) {
        throw new Error("Admin details are invalid. Provide a name (1-18 characters), valid email, and password (8-16 characters).");
    }
    const existingAccount = await Users.findOne({ email }).select("role");
    if (existingAccount) {
        throw new Error(`Email ${email} is already registered as ${existingAccount.role}; no account was changed.`);
    }
    const adminUser = new Users({
        name,
        email,
        profilePic: user.profilePic || null,
        password: await hashPassword(password),
        role: "Admin",
    });
    try {
        await adminUser.save();
    } catch (error) {
        if (error && error.code === 11000) {
            throw new Error(`Email ${email} is already registered; choose a different email. No existing account was changed.`);
        }
        throw error;
    }
    return adminUser;
}

async function deleteUser(id){
    let user = await Users.findByIdAndDelete(id);
    return user;
}

async function updateUser(id,user){
    const { role, ...profileUpdates } = user;
    let updatedUser =  await Users.findByIdAndUpdate({_id : id},profileUpdates,{new : true});
    return updatedUser;
}

async function loginUser(user){
    let email = typeof user?.email === "string" ? user.email.trim().toLowerCase() : "";
    let password = typeof user?.password === "string" ? user.password : "";
    if (!email || !password) {
        const error = new Error("Email and password are required.");
        error.statusCode = 400;
        throw error;
    }
    let alreadyUser = await Users.findOne({email});
    if(!alreadyUser){
        const error = new Error("Invalid email or password");
        error.statusCode = 401;
        throw error;
    }
    let valid = await bcrypt.compare(password, alreadyUser.password);
    if(!valid){
        const error = new Error("Invalid email or password");
        error.statusCode = 401;
        throw error;
    }
    let payload = {
        userId : alreadyUser._id,
        role : alreadyUser.role
    };
    let token = jwt.sign(payload, process.env.TOKEN_SECRET,{ expiresIn: "1d" });
    return {
        token,
        user: {
            _id: alreadyUser._id,
            name: alreadyUser.name,
            email: alreadyUser.email,
            role: alreadyUser.role,
            profilePic: alreadyUser.profilePic
        }
    };
}

async function banUser(userId){
	let user = await Users.findOneAndUpdate({_id: userId, role: 'User'},{isBanned : true},{new : true}).select('-password');
    if(!user){
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }
    return user;
}

async function unBanUser(userId){
	let user = await Users.findOneAndUpdate({_id: userId, role: 'User'},{isBanned : false},{new : true}).select('-password');
    if(!user){
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }
    return user;
}

module.exports = {
    getAllUsers,
    getUserById,
    getUserByBanned,
    registerUser,
    createAdminAccount,
    deleteUser,
    updateUser,
    loginUser,
    banUser,
    unBanUser
}
