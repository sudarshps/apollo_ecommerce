const mongoose = require('mongoose')
const schema = mongoose.Schema

const tokenSchema = new schema({
    userId:{
        type:schema.Types.ObjectId,
        required:true,
        ref:'User'
    },
    token:{
        type:String,
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now,
        expires:3600
    }
})

module.exports = mongoose.model('token',tokenSchema)