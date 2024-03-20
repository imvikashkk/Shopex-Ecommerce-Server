import express from "express";
import {createUser, loginUser, resetPassword, resetPasswordRequest } from "../controller/Auth.js"
import passport from 'passport'

const localHandler = (req, res, next)=>{
    passport.authenticate('local', (err, user, info)=>{
        if(err){return res.status(500).json({message:err.message ,error:err})}
        else if(!user){return res.status(401).json({message:info.message, error:"User not found !"})}
        else{
            req.user = user
            next()
        }
    })(req, res, next)
}

const jwtHandler = (req, res, next)=>{
    passport.authenticate('jwt', (err, user, info)=>{
        if(err){return res.status(500).json({message:err.message, error:err})}
        else if(!user){return res.status(401).json({ message: "user not found !", error:"unauthorized"})}
        else{
            req.user = user
            next()
        }
    })(req, res, next)
}

/* Routes */
const router = express.Router();
router.post('/signup', createUser)
.post('/login',localHandler , loginUser)
.post('/reset-password-request', resetPasswordRequest)
.post('/reset-password', resetPassword)







export default router
