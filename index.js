import express from 'express';
import dotenv from "dotenv"
import cors from "cors"
import session from "express-session"
import passport from "passport"
import localstrategy from "passport-local"
import jwtstrategy from "passport-jwt"
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import cookieParser from'cookie-parser'
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import {connectDataBase} from "./database.js"
import { User } from './src/model/User.js';
import authRouter from "./src/routes/Auth.js"
import brandRoute from "./src/routes/Brand.js"
import cartRouter from "./src/routes/Cart.js"
import categoryRouter from './src/routes/Category.js'
import orderRouter from "./src/routes/Order.js"
import productRouter from "./src/routes/Product.js"
import userRouter from "./src/routes/User.js"
import addressRouter from "./src/routes/Address.js"
import {sanitizeUser, isAuth, tokenExtraction} from "./src/services/common.js"
import {razorpayOrder, razorpayOrderValidate} from "./src/controller/Payment.js"

dotenv.config()
const app = express();
const PORT = process.env.PORT || 8080
const DATABASE_URL = `mongodb+srv://imvikashkk:${process.env.DATABASE_PASS}@cluster0.hwjqrbc.mongodb.net/main?retryWrites=true&w=majority&appName=Cluster0`
const LocalStrategy = localstrategy.Strategy
const JwtStrategy = jwtstrategy.Strategy
const __dirname = dirname(fileURLToPath(import.meta.url));
const publicPath = path.join(__dirname, "public");

// Middleware to ignore SSL certificate errors (not recommended for production) (handling certificate error)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/* ************************** MIDDLEWARES ************************* */
app.use(cors({
    exposedHeaders: '*' ,
}));
app.use(express.static(publicPath));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_KEY,
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
}))
app.use(cookieParser());
app.use(passport.authenticate('session'))

/* option for jwt */
const opts = {};
opts.jwtFromRequest = tokenExtraction;
opts.secretOrKey = process.env.JWT_SECRET_KEY; 


/* ************************ PASSPORT STRATEGIES ******************** */

/* local strategy */
passport.use('local', new LocalStrategy(  
    { usernameField: 'email' },
  async function(email, password, done){
        // by default passport uses username
       try{
            const user = await User.findOne({email: email})
            if(!user){ //No such user email
               return done(null, false, {message: "Invalid Credentals !"});
            }
            crypto.pbkdf2( // method gives an asynchronous Password-Based Key Derivation 
                password, // password
                user.salt, // salt
                310000,  // iterations
                32,      // keylen
                'sha256', // digest
                async (error, hashedPassword) => { // callback function
                    if(error){
                        return done(null, false, error)
                    }
                   else if(!crypto.timingSafeEqual(user.password, hashedPassword)){
                        return done(null, false, {message: 'Invalid Credentials !'})
                    }else{ // password matched
                        const token = jwt.sign(
                            sanitizeUser(user),
                            process.env.JWT_SECRET_KEY
                        )
                        done(null, {id: user.id, role: user.role, token})
                    }
                }
            )
       }catch(error){
        done(error, false);
       }
    }
))

/* jwt strategy */
passport.use('jwt', 
   new JwtStrategy(opts, async function(jwt_payload, done){
    try{
        const user = await User.findById(jwt_payload.id);
        if (user) {
            return done(null, sanitizeUser(user)); // this calls serializer
          } else {
            return done(null, false);
          }
    }catch(error){
        return done(error, false);
    }
}))

passport.serializeUser(function (user, cb){ // this creates session variable req.user on being called from callback
    process.nextTick(function () {
        return cb(null, {id:user.id, role:user.role})
    })
})

passport.deserializeUser(function (user, cb){
    // this create session variable req.user when callled from authorized request
    process.nextTick(function () {
        return cb(null, user)
    })
})


/* *************************** ROUTES **************************** */
app.use("/auth", authRouter)
app.use("/brand", isAuth, brandRoute)
app.use("/cart", isAuth, cartRouter)
app.use("/category", isAuth, categoryRouter)
app.use("/order",isAuth, orderRouter)
app.use("/product",isAuth, productRouter)
app.use("/user",isAuth, userRouter)
app.use("/address", isAuth, addressRouter)

//Order and pay online
app.post("/razorpay/order", isAuth, razorpayOrder)
app.post("/razorpay/order/validate", isAuth, razorpayOrderValidate)

/* *************************** MongoDB Database Connection ********** */
connectDataBase(DATABASE_URL);

/* ************************* Server Running/Listening ************** */
app.listen(PORT, ()=>{
    console.log(`Server is running on PORT:${PORT}.....`)
})
