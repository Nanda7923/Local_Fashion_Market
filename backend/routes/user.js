const express = require('express');
const router = express.Router();
const User = require('../controllers/userController')
const {verify,checkRole} = require('./../middlewares/auth');

router.post('/register',User.registerUser);
router.post('/login',User.loginUser);
router.post('/google-login',User.googleLoginUser);

router.get('/',verify,checkRole("Admin"),User.getAllUsers);
router.get('/banned',verify,checkRole("Admin"),User.getUserByBanned);

router.post('/:userId/ban',verify,checkRole("Admin"),User.banUser);
router.post('/:userId/unban',verify,checkRole("Admin"),User.unBanUser);

router.delete('/:id',verify,User.deleteUser);
router.get('/:id',verify,User.getUserById);
router.put('/:id',verify,User.updateUser);

module.exports = router;