// imports
import dotenv from "dotenv";
import Joi from "joi";
import mongoose from "mongoose";
import express from "express"

// auth imports
import passport from "passport";
import passportLocalMongoose from "passport-local-mongoose";

// app imports

// load env variables
dotenv.config();
// initialize express app
const app = express();

// auth middlewares
app.use(passport.initialize());
app.use(passport.session());

// mongoose model
const userSchema = new mongoose.Schema({
    username:{type:String,required:true,minlength:3,maxlength:20,trim:true},
    password:String,
    email:{
        type:String,
        validate:{
            validator:(email)=>{
                const emailPattern=/^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;
                return emailPattern.test(email);
            },
            message:"Invalid email address"
        }
        
    }
        
})

// plugins
userSchema.plugin(passportLocalMongoose);

// Model Initialization
const User = new mongoose.model("User",userSchema); 

// auth strategy and serializations
// LOCAL STRATEGY
passport.use(User.createStrategy());
passport.serializeUser((user,done)=>{
    done(null,user);
})
passport.deserializeUser((obj,done)=>{
    done(null,obj);
})

// Joi model and validation
function userValidation(user){
    const userValidationSchema=Joi.object({
        username: Joi.string().min(3).max(20),
        password:Joi.string(),
        email:Joi.string()
    })
    return userValidationSchema.validate(user);
}

// CRUD implementation

// CREATE
// CREATE USER WITH LOCAL STRATEGY
export async function createUser(username, email, password) {
    try {
      const user = await User.register({ username, email }, password);
      return user; // Return the user object if registration is successful
    } catch (err) {
      // Handle the error if registration fails
      if(err.errors)
      for(field in err.errors)console.error(err.errors[field].message);
      console.error(err.message);
      throw new Error('User registration failed.');
    }
  }
// READ
// READ USER BY USERNAME OR EMAIL

// UPDATE
// PATCH USER EMAIL IF AUTHENTICATED

// DELETE
// DELETE USER BY USERNAME OR EMAIL


