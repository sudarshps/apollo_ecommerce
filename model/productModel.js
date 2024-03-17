const mongoose = require('mongoose')


const productSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    brand:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    quantity:{
        type:Number,
        required:true
    },
    category:{
        type:String,
        required:true
    },
    categoryId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'categoryModel'
    },
    images:{
        type:[String],
        
    },
    offer:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'offerModel',
        default:null
        
    },
    isListed:{
        type:Boolean,
        required:true
    }

})


module.exports = mongoose.model('productModel',productSchema)