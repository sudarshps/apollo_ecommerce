const mongoose = require('mongoose')
mongoose.connect("mongodb://127.0.0.1:27017/user_detailsFurni")

const express = require('express')
const  morgan = require('morgan')
const app = express()
const path = require('path')
//app.use(morgan('tiny'))
app.use(express.static(path.join(__dirname,'public')))
app.use(express.static(path.join(__dirname,'/public/style')))



const userRoute = require('./routes/userRoute')
app.use('/',userRoute)

const adminRoute = require('./routes/adminRoute')
app.use('/admin',adminRoute)

app.listen(3000,()=>{
    console.log('server running ')
})