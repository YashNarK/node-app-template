// imports
import dotenv from "dotenv";
import Joi from "joi";
import mongoose from "mongoose";
import express from "express";
import {validPassword,genPassword} from "../common/utils.js"
// auth imports
import passport from "passport";
import passportLocal from "passport-local";

// app imports

// load env variables
dotenv.config();
// initialize express app & others
const app = express();
const localStrategy = passportLocal.Strategy;

// auth middlewares


// mongoose model
const userSchema = new mongoose.Schema({
    username:{type:String,unique:true,required:true,minlength:3,maxlength:20,trim:true},
    password:String,
    email:{
        type:String,
        unique:true,
        validate:{
            validator:(email)=>{
                const emailPattern=/^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;
                return emailPattern.test(email);
            },
            message:"Invalid email address"
        }
        
    },
    // for retrieving in password validation. cannot be set by users.
    salt: String,
    hash:String,
    
        
})


// plugins
// userSchema.plugin(passportLocalMongoose); // -> Only if you want default username and password auth strategy

// Model Initialization
/** @type {mongoose.Model} */
const User = new mongoose.model("User",userSchema); 

// auth strategy and serializations
// LOCAL STRATEGY
// BELOW LINE IS DEFAULT LOCAL STRATEGY FOR USERNAME + PASSWORD AUTH
// passport.use(User.createStrategy());

// LETS DEFINE A CUSTOM STRATEGY FOR USERNAME_OR_EMAIL + PASSWORD AUTH
passport.use('login',
    new localStrategy(
        {usernameField:"username_or_email",passwordField:"password"},
        async (username_or_email,password,done)=>{
        try{
            // find user by username or email
            const user = await User.findOne({
                $or:[{username:username_or_email},{email:username_or_email}]
            })
            // If user not found
            if(!user)return done(null,false,{message:"User not found. Incorrect username or email."});
            // If found verify password
            if(!validPassword(password,user.hash,user.salt))return done(null,false,{message:"Password is Incorrect."});

            // If password is verified
            return done(null,user);

        }
        catch(e){
            return(e.message);
        }
    })
)
passport.serializeUser((user,done)=>{
    done(null,user);
})
passport.deserializeUser((obj,done)=>{
    done(null,obj);
})

// Joi model and validation
export function userValidation(user){
    const userValidationSchema=Joi.object({
        username: Joi.string().min(3).max(20),
        password:Joi.string(),
        email:Joi.string()
    })
    return userValidationSchema.validate(user);
}

// CRUD implementation

// CREATE
// CREATE USER WITH LOCAL STRATEGY - passport-local-mongoose strategy
// export async function createUser(username, email, password) {
//     try {
//       const user = await User.register({ username, email }, password);
//       return user; // Return the user object if registration is successful
//     } catch (ex) {
//       // Handle the error if registration fails
//       if(ex.errors)
//       for(field in ex.errors)console.error(ex.errors[field].message);
//       console.error(ex.message);
//       throw new Error('User registration failed.');
//     }
//   }
// }
// CREATE USER WITH OUR CUSTOM METHOD
export async function createUser(username,email,password){
    try{

            const saltAndHash = genPassword(password);
            const newUser = new User({
                username, email,
                salt:saltAndHash.salt,
                hash:saltAndHash.hash
            })
            const result = await newUser.save();
            return result;
    }
    catch(ex){
    //  Handle the error if registration fails
      if(ex.errors)
      for(field in ex.errors)console.error(ex.errors[field].message);
      console.error(ex.message);
      return {error:"username or email already taken"}
    }
}


// READ
// READ USER BY USERNAME OR EMAIL
export async function readUser(searchKey){
    try{
        const user = await User.findOne({
            // either filter with username or email
            $or:[{username:searchKey},{email:searchKey}]
        },{username:1,email:1})

        if(!user)return {error:"user not found."}
        return user;
    }
    catch(ex){
        return {error:ex.message};
    }
}
// UPDATE
// PATCH USER EMAIL IF AUTHENTICATED

// DELETE
// DELETE USER BY USERNAME OR EMAIL
export async function deleteUser(searchKey){
    try{
        const result = await User.findOneAndDelete({
            $or:[{username:searchKey},{email:searchKey}]
        })
        if(!result)return {error:"user not found"}
        return result;
    }
    catch(ex){
       
        console.error(ex.message);
    }
}



