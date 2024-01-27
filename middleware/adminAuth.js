const isLogin = async(req,res,next)=>{
    try {
        if(req.session.admin_id){
            next()
            
        }
        else{
            res.render('login')
        }
    } catch (error) {
        console.log(error.message)
    }
}




const isLogout = async(req,res,next)=>{
    try {
        if(req.session.admin_id){}
            
        
        else{
            res.redirect('/admin/dashboard')
            
        }next()
    } catch (error) {
        console.log(error.message)
    }
}

module.exports = {
    isLogin,
    isLogout
}