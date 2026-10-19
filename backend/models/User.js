const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
        name : {
            type : String,
            required : true,
            trim : true
        },
        email : {
            type : String,
            required : true,
            unique : true,
            trim : true,
            lowercase : true,
        },
        phone : {
            type : String,
            trim : true,
        },
        address : {
            type : String,
            trim : true
        },
        dateOfBirth : {
            type : Date,
        },
        profilePic : {
            type : String,
            default : null,
            trim : true
        },
        password : {
            type : String,
            required : true,
        },
        role : {
            type : String,
            enum : ['Admin', 'User'],
            default : "User",
        },
        isBanned : {
            type : Boolean,
            default : false
        },
    },
    {
        timestamps: true
    },
);

const User = mongoose.model('User', UserSchema);
module.exports = User;