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
const cartController = require("../controllers/cartController")
const orderController = require("../controllers/orderController")
const wishlistController = require("../controllers/wishlistController")
const couponController = require('../controllers/couponController')

user_route.get('/',auth.isLogout,userController.loadHome)
user_route.get('/home',auth.isLogin,userController.loadHome)
user_route.get('/shop',userController.loadShop)
user_route.get('/searchItems',userController.searchItems)
user_route.get('/productDetails',userController.loadProductDetails)
// user_route.get('/chairs',userController.loadChairs)
user_route.get('/about',userController.loadAbout)
user_route.get('/services',userController.loadServices)
user_route.get('/blog',userController.loadBlog)
user_route.get('/contact',userController.loadContact)
user_route.get('/cart',auth.isLogin,cartController.loadCart)
user_route.get('/wishlist',auth.isLogin,wishlistController.loadWishlist)
user_route.post('/addToWishlist',auth.isLogin,wishlistController.addToWishlist)
user_route.post('/deleteWishlist',auth.isLogin,wishlistController.deleteWishlistItem)
user_route.post('/wishlistToCart',auth.isLogin,wishlistController.addToCart)

user_route.get('/login',auth.isLogout,userController.loadLogin)
user_route.post('/login',userController.verifyUser)
user_route.get('/forgotpass',userController.loadForgotPass)
user_route.post('/forgotpass',userController.newPass)
user_route.get('/newPass',userController.loadResetPass)
user_route.post('/newPass',userController.passwordReset)


user_route.get('/register',userController.loadRegister)
user_route.post('/register',userController.insertUser)
user_route.post('/send-otp',userController.sentOtp)
user_route.post('/otpValidate',userController.otpValidate)
user_route.get('/send-otp',userController.resendOtp)
user_route.post('/addToCart',auth.isLogin,cartController.addToCart)
user_route.post('/deleteCartProduct',auth.isLogin,cartController.deleteProduct)
user_route.post('/changeQuantity',auth.isLogin,cartController.changeQuantity)
// user_route.post('/applyCoupon',auth.isLogin,cartController.applyCoupon)
// user_route.post('/getCoupon',auth.isLogin,cartController.getCoupon)
user_route.post('/applyCoupon',auth.isLogin,couponController.applyCoupon)
user_route.post('/removeUserCoupon',auth.isLogin,couponController.removeUserCoupon)

user_route.get('/checkout',auth.isLogin,orderController.loadCheckout)
user_route.post('/placeorder',auth.isLogin,orderController.placeOrder)
user_route.post('/verifyPayment',auth.isLogin,orderController.verifyPayment)
user_route.get('/thankyou',auth.isLogin,userController.loadThankYou)
user_route.get('/userProf',auth.isLogin,userController.loadUserProf)
user_route.get('/orderDetails',auth.isLogin,orderController.loadOrderDetails)
user_route.post('/changepass',auth.isLogin,userController.postChangePass)
user_route.post('/changedet',auth.isLogin,userController.postChangeDetails)
user_route.post('/addAddress',auth.isLogin,userController.postAddAddress)
user_route.post('/editAddress',auth.isLogin,userController.postEditAddress)
user_route.post('/addrdlt',auth.isLogin,userController.deleteAddress)
user_route.post('/getAddressDetails',auth.isLogin,userController.addressDetails)
user_route.post('/cancelOrder',auth.isLogin,orderController.cancelOrder)
user_route.get('/logout',auth.isLogin,userController.logout)



module.exports = user_route