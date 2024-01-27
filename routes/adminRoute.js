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


admin_route.get('/',auth.isLogin,adminController.loadLogin)
admin_route.post('/',adminController.verifyAdmin)
// admin_route.get('/login',adminController.loadLogin)
admin_route.get('/dashboard',auth.isLogin,adminController.loadDashboard)
admin_route.get('/productList',auth.isLogin,adminController.loadProductList)
admin_route.get('/category',auth.isLogin,adminController.loadCategory)
admin_route.post('/category',auth.isLogin,adminController.postCategory)

admin_route.get('/editCategory',auth.isLogin,adminController.loadEditCategory)
admin_route.post('/editCategory',auth.isLogin,adminController.postEditCategory)
admin_route.get('/deleteCategory',auth.isLogin,adminController.deleteCategory)
admin_route.get('/users',auth.isLogin,adminController.loadUsers)
admin_route.get('/addProducts',auth.isLogin,adminController.loadAddProducts)
admin_route.post('/addProducts',auth.isLogin,adminController.postAddProduct)
admin_route.get('/logout',auth.isLogout,adminController.logout)
admin_route.get('/changeUserStatus',adminController.postChangeUserStatus)
admin_route.get('/unblockUser',adminController.unblockUser)

module.exports = admin_route