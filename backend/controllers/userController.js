const userService = require("../services/userService");
const resError = require('./../middlewares/resError');

async function getAllUsers(req, res){
    try{
        let users = await userService.getAllUsers();
        if(!users){
            return resError(res,"Users not found",404);
        }else{
            res.json({
                message : "Success!",
                data : users,
            })
        }
    }catch(err){
        return resError(res,err);
    }
}

async function getUserById(req, res){
    try{
        let id = req.params.id;
        let user = await userService.getUserById(id);
        if(!user){
            return resError(res,"Users not found",404);
        }else{
            res.json({
                message : "Success!",
                data : user,
            })
        }
    }catch(err){
        return resError(res,err);
    }
}

async function getUserByBanned(req, res){
    try{
        let user = await userService.getUserByBanned();
        if(!user){
            return resError(res,"Users not found",404);
        }else{
            res.json({
                message : "Success!",
                data : user,
            })
        }
    }catch(err){
        return resError(res,err);
    }
}

async function registerUser(req, res){
    try{
        const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
        const email = typeof req.body?.email === 'string' ? req.body.email.trim() : '';
        const password = typeof req.body?.password === 'string' ? req.body.password : '';

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email, and password are required." });
        }

        let newUser = await userService.registerUser(req.body);
        res.status(201).json({
            message : "Successfully created User!",
            data : newUser,
        });
    }catch(err){
        if (err && err.code === 11000) {
            return res.status(409).json({ message: "An account with this email already exists." });
        }
        if (err && (err.name === 'ValidationError' || err.name === 'CastError' || err.statusCode === 400)) {
            return res.status(400).json({ message: err.message });
        }
        return resError(res, err);
    }
}

async function deleteUser(req, res){
    try{
        let id = req.params.id;
        let user = await userService.deleteUser(id);
        if(!user){
            return resError(res,"Users not found",404);
        }else{
            res.json({
                message : "Successfully deleted User!",
                data : user,
            })
        }
    }catch(err){
        return resError(res,err);
    }
}

async function updateUser(req, res){
    try{
        let id = req.params.id;
        let user = req.body;
        let updatedUser = await userService.updateUser(id, user);
        if(!updatedUser){
            return resError(res,"Users not found",404);
        }else{
            res.json({
                message : "Successfully updated User!",
                data : updatedUser,
            })
        }
    }catch(err){
        return resError(res,err);
    }
}

async function loginUser(req, res){
    try{
        const email = typeof req.body?.email === 'string' ? req.body.email.trim() : '';
        const password = typeof req.body?.password === 'string' ? req.body.password : '';

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required." });
        }

        let alreadyUser = await userService.loginUser(req.body);
        if(!alreadyUser){
            return res.status(401).json({ message: "Invalid email or password" });
        }else{
            res.json({
                message : "Login Successfully!",
                data : alreadyUser,
            });
        }
    }catch(err){
        if (err && err.statusCode) {
            return res.status(err.statusCode).json({ message: err.message });
        }
        if (err && (err.message === "User not found" || err.message === "Invalid User")) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        return resError(res, err);
    }

}

function getUserOperationStatusCode(err) {
    if (err && typeof err.statusCode === 'number') {
        return err.statusCode;
    }
    if (err && (err.name === 'CastError' || err.name === 'ValidationError')) {
        return 400;
    }
    if (err && (err.message === 'User not found' || err.message === 'Users not found')) {
        return 404;
    }
    return 500;
}

async function banUser(req, res){
    try{
        let userId = req.params.userId;
        let user = await userService.banUser(userId);
        console.log("user ",user);
        if(!user){
            return resError(res,"Users not found",404);
        }else{
            res.json({
                message : `This User with ${userId} is banned!`,
                data : user
            })
        }
    }catch(err){
        return resError(res, err, getUserOperationStatusCode(err));
    }
}

async function unBanUser(req, res){
    try{
        let userId = req.params.userId;
        let user = await userService.unBanUser(userId);
        console.log("user ",user);
        if(!user){
             return resError(res,"Users not found",404);
        }else{
            res.json({
                message : `This User with ${userId} is unbanned!`,
                data : user
            })
        }
    }catch(err){
        return resError(res, err, getUserOperationStatusCode(err));
    }
}

module.exports = {
    getAllUsers,
    getUserById,
    getUserByBanned,
    registerUser,
    deleteUser,
    updateUser,
    loginUser,
    banUser,
    unBanUser,
}