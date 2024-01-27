const express = require('express')
const user_route = express();

user_route.set('view engine','ejs')
user_route.set('views','./views/users')

const bodyParser = require('body-parser')
user_route.use(bodyParser.json())
user_route.use(bodyParser.urlencoded({extended:true}))

const config = require('../config/config')

const auth = require('../middleware/userAuth')

const session = require('express-session')
user_route.use(session({secret:config.userSession,resave:false,saveUninitialized:true}))

const userController = require("../controllers/userController")

user_route.get('/',userController.loadHome)
user_route.get('/home',userController.loadHome)
user_route.get('/shop',userController.loadShop)
// user_route.get('/chairs',userController.loadChairs)
user_route.get('/about',userController.loadAbout)
user_route.get('/services',userController.loadServices)
user_route.get('/blog',userController.loadBlog)
user_route.get('/contact',userController.loadContact)
user_route.get('/cart',auth.cartSession,userController.loadCart)

user_route.get('/login',auth.isLogin,userController.loadLogin)
user_route.post('/login',userController.verifyUser)
user_route.get('/forgotpass',userController.loadForgotPass)
user_route.post('/forgotpass',userController.newPass)


user_route.get('/register',userController.loadRegister)
user_route.post('/register',userController.insertUser)
user_route.post('/send-otp',userController.sentOtp)
user_route.post('/otpValidate',userController.otpValidate)
user_route.get('/send-otp',userController.resendOtp)


user_route.get('/checkout',userController.loadCheckout)
user_route.get('/thankyou',userController.loadThankYou)
user_route.get('/userProf',userController.loadUserProf)
user_route.get('/logout',auth.isLogout,userController.logout)



module.exports = user_route