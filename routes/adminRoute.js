const express = require('express')
const admin_route = express()

admin_route.set('view engine','ejs')
admin_route.set('views','./views/admin')

const bodyParser = require('body-parser')
admin_route.use(bodyParser.json())
admin_route.use(bodyParser.urlencoded({extended:true}))

const config = require('../config/config')
const auth = require('../middleware/adminAuth')

const session = require('express-session')

admin_route.use(session({secret:config.adminSession,resave:false,saveUninitialized:true}))

const adminController = require('../controllers/adminController')
const couponController = require('../controllers/couponController')
const orderController = require('../controllers/orderController')
const offerController = require('../controllers/offerController')

admin_route.get('/',auth.isLogin,adminController.loadLogin)
admin_route.post('/',adminController.verifyAdmin)
// admin_route.get('/login',adminController.loadLogin)
admin_route.get('/dashboard',auth.isLogin,adminController.loadDashboard)
admin_route.get('/productList',auth.isLogin,adminController.loadProductList)
admin_route.get('/category',auth.isLogin,adminController.loadCategory)
admin_route.post('/category',auth.isLogin,adminController.postCategory)

admin_route.get('/orders',auth.isLogin,adminController.loadOrders)
admin_route.get('/orderDetails',auth.isLogin,orderController.loadOrderDetailsAdmin)
admin_route.post('/updateStatus',auth.isLogin,orderController.updateStatus)

admin_route.get('/editCategory',auth.isLogin,adminController.loadEditCategory)
admin_route.post('/editCategory',auth.isLogin,adminController.postEditCategory)
admin_route.get('/deleteCategory',auth.isLogin,adminController.deleteCategory)

admin_route.get('/users',auth.isLogin,adminController.loadUsers)

admin_route.get('/addProducts',auth.isLogin,adminController.loadAddProducts)
admin_route.post('/addProducts',auth.isLogin,adminController.postAddProduct)
admin_route.get('/unListProduct',auth.isLogin,adminController.unListProducts)
admin_route.get('/listProduct',auth.isLogin,adminController.listProducts)

admin_route.get('/logout',auth.isLogout,adminController.logout)

admin_route.get('/changeUserStatus',auth.isLogin,adminController.postChangeUserStatus)
admin_route.get('/unblockUser',auth.isLogin,adminController.unblockUser)


admin_route.get('/deleteProduct',auth.isLogin,adminController.dltProducts)
admin_route.post('/dltPreviewImg',auth.isLogin,adminController.dltImage)
admin_route.get('/editProduct',auth.isLogin,adminController.editProduct)
admin_route.post('/editProduct',auth.isLogin,adminController.postEditProduct)


admin_route.get('/coupon',auth.isLogin,couponController.loadCoupon)
admin_route.get('/addCoupon',auth.isLogin,couponController.loadAddCoupon)
admin_route.post('/addCoupon',auth.isLogin,couponController.postAddCoupon)
admin_route.post('/dltCoupon',auth.isLogin,couponController.dltCoupon)

admin_route.get('/offer',auth.isLogin,offerController.loadOffer)
admin_route.get('/addOffer',auth.isLogin,offerController.loadAddOffer)
admin_route.post('/addOffer',auth.isLogin,offerController.postAddOffer)
admin_route.post('/dltOffer',auth.isLogin,offerController.dltOffer)
admin_route.post('/addProductOffer',auth.isLogin,offerController.addProductOffer)
admin_route.post('/removeProductOffer',auth.isLogin,offerController.removeProductOffer)

admin_route.post('/addCategoryOffer',auth.isLogin,offerController.addCategoryOffer)
admin_route.post('/removeCategoryOffer',auth.isLogin,offerController.removeCategoryOffer)

admin_route.get('/salesReport',auth.isLogin,adminController.loadSalesReport)


module.exports = admin_route