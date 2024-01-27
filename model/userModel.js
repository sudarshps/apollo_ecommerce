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
    }
})


module.exports = mongoose.model('User',userSchema)

