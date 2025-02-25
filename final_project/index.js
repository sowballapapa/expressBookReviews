const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const {authenticatedUser} = require("./router/auth_users");

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res,next){
//Write the authenication mechanism here
    const username = req.body.username;
    const password = req.body.password;

    if(!username || !password){
        return res.status(401).send("Username or password is required");
    }
    if(authenticatedUser(username,password)){
        let access_token = jwt.sign({
            data: password
        }, 'access', {expiresIn: 60*60});

        req.session.authorization = {
            access_token, username
        }
        return res.status(200).send("User logged in successfully");
    }else {
        return res.status(401).json({message:'Invalid username or password.'});
    }
});
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
