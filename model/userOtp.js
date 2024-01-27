const mongoose = require('mongoose')


const otpSchema = new mongoose.Schema({
    email:{
        type:String
        
    },
    otp:{
        type:String
        
    },
    createdDate:{
        type:Date,
        
    },
    expireAt:{
        type:Date
    }
})


module.exports = mongoose.model('otpModel',otpSchema)