const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true
    },

    email:{
        type:String,
        required:true
    },

    mobile:{
        type:String,
        required:true
    },

    password:{
        type:String,
        required:true
    },

    isVerified:{
        type:Number,
        required:true
    },
    isBlocked:{
        type:Boolean,
        required:true
    },
    address:[{name:{type:String},
            localAddress:{type:String},
            city:{type:String},
            state:{type:String},
            phone:{type:Number},
            email:{type:String},
            pincode:{type:String}}],
    token:{
        type:String,
        default:''
    },

    wishlist:[{
        product_id:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"productModel",
            required:true
        },
        date:{
            type:Date
        }
}],wallet:{
    type:Number,
    default:0
},referralCode:{
    type:String
}
        
})


module.exports = mongoose.model('User',userSchema)

