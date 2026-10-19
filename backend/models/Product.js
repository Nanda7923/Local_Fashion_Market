const mongoose = require('mongoose');
const {Schema} = mongoose;

const ProductSchema = new Schema({
    title : {
        type : String,
        required : true,
        trim : true
    },
    brand : {
        type : Schema.Types.ObjectId,
        ref : "Brand",
        required  : true,
    },
    category : {
        type : String,
        required : true,
        lowercase: true
    },
    headCategory: {
        type: String,
        required: true,
        trim: true,
    },

    price : {
        type : Number,
        required : true,
        min : 0,
    },

    size : [{
        type : String,
        enum : ['S','M','L','XL','2XL'],
        required : true,
        trim : true,
    }],
    inStock : {
        type : Boolean,
        default : true,
    },
    color : [{
        type : String,
        trim : true,
        required : true
    }],
    imageUrl : [{
        type : String,
        required : true,
        trim : true
    }]
},{
    timestamps: true,
});

const Product =mongoose.models.Product || mongoose.model('Product', ProductSchema);

module.exports = Product;
