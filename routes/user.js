// imports
import express from "express";

// auth imports
import passport from "passport";

// app imports
import { readUser, userValidation, createUser, deleteUser, readAllUser } from "../models/user.js";

// initialize router
export const userRouter = express.Router();
// add the same session from app.js to our router, VERY IMPORTANT FOR logOut()
userRouter.use(passport.session());

// Logout path
userRouter.get('/logout', async (req, res) => {
  // Call req.logOut to log the user out
  req.logOut((err)=>{
    if(err){
      console.error(err);
      return res.redirect("/");
    }
    return res.redirect("/");
  })
});

// get by username or email
userRouter.get('/:user',async (req,res)=>{
    try{
        const user = (req.params.user);
        const result = await readUser(user);
        res.send(result);
    }
    catch(e){
        res.status(500).send({error:e.message});
    }
})

//get all users /api/users
userRouter.get('/',async(req,res)=>{
  try{
    const userList = await readAllUser();
    res.send(userList);
  }
  catch(e){
    res.status(500).send({error:e.message});
  }
})

// post to home /api/users with username or email
userRouter.post('/',async (req,res)=>{
  try{
    // clear session variables
    req.session.email='';
    req.session.username='';
    // try to find user in db
    const result = await readUser(req.body.username_or_email);

    // if user not found then redirect to register
    if(result.error){
      // find whether user entered email or username
      const emailPattern = /^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

      //storing username/email to be used in register page
      if(emailPattern.test(req.body.username_or_email))
      req.session.email=req.body.username_or_email;
      else
      req.session.username=req.body.username_or_email;

      console.error(result);
      return res.render("register",{username:req.session.username,email:req.session.email});
    }
    // storing username to be used in login page
    // another approach is to pass the data in query parameter
    req.session.username = result.username;

    res.render("login",{username:req.session.username});
  }
  catch(e){
    console.error(e.message);
    res.redirect("/");
  }
})

// post to registerandauthenticate user
    userRouter.post('/registerandauthenticate',async (req,res)=>{  
        try{
            req.session.username=req.body.username;
            req.session.email=req.body.email;
            const {error} = userValidation(req.body);
            if(error) {
              console.error(error.details[0].message);
              return res.render("register",{username:req.session.username,email:req.session.email});
            }

            const result =await createUser(req.body.username,req.body.email,req.body.password);
            if(result.error){
              return res.render("register",{username:req.session.username,email:req.session.email});
            }  

            console.log(result);
            console.log(req.session.email);
            console.log(req.session.username);
            res.render("login",{username:req.session.username});
        }
        catch(e){
            console.error({error:e.message});
            return res.render("register",{username:req.session.username,email:req.session.email});
        }
    })

// post to login user 
// userRouter.post('/login')
userRouter.post('/login', (req, res, next) => {
    passport.authenticate('login', (err, user, info) => {
      if (err) {
        // Handle unexpected errors
        console.error({ message: 'Internal Server Error' });
        return  res.render("login",{username:req.session.username});
      }
      if (!user) {
        // Authentication failed; send a custom error message
        console.error(info);
       return  res.render("login",{username:req.session.username});
      }
      // Authentication succeeded; you can proceed with the success logic
      req.logIn(user, (err) => {
        if (err) {
          console.error({ message: 'Internal Server Error' });
          return  res.render("login",{username:req.session.username});
        }
          console.log({ message: 'Authentication successful' });
          return res.redirect("/secrets");
      });
    })(req, res, next);
  });



// delete user by username
userRouter.delete('/:user',async (req,res)=>{
  try{
    const searchKey = req.params.user;
    const result = await deleteUser(searchKey);
    if(result.error)return res.status(404).send(result);
    res.send(result);
  }
  catch(e){
    res.status(500).send({error:e.message});
  }
})


export default userRouter;