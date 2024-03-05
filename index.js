require('dotenv').config()
const mongoose = require('mongoose')
const uri = process.env.MONGO_URI
mongoose.connect(uri)


const express = require('express')
// const  morgan = require('morgan')
const app = express()
const path = require('path')
//app.use(morgan('tiny'))
const port = process.env.PORT || 3000
app.use(express.static(path.join(__dirname,'public')))
app.use(express.static(path.join(__dirname,'/public/style')))



const userRoute = require('./routes/userRoute')
app.use('/',userRoute)

const adminRoute = require('./routes/adminRoute')
app.use('/admin',adminRoute)

app.listen(port,()=>{
    console.log(`port is running at http://localhost:${port}
port is running at http://localhost:${port}/admin`)
})