// imports
import express from "express";

// auth imports
import passport from "passport";

// app imports
import { readUser, userValidation, createUser, deleteUser } from "../models/user.js";

// initialize router
export const userRouter = express.Router();
// add the same session from app.js to our router, VERY IMPORTANT
userRouter.use(passport.session());

// Logout path
userRouter.get('/logout', async (req, res) => {
  // Call req.logOut to log the user out
  req.logOut((err)=>{
    if(err){
      console.error(err);
      return res.redirect("/");
    }
    return res.redirect("/login");
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

// post to register user
    userRouter.post('/register',async (req,res)=>{  
        try{
            const {error} = userValidation(req.body);
            if(error) {
              console.error(error.details[0].message);
              return res.redirect("/register");
            }

            const result =await createUser(req.body.username,req.body.email,req.body.password);
            if(result.error){
              console.error(result);
              return res.redirect("/register");
            } 

            console.log(result);
            res.redirect("/login");
        }
        catch(e){
            console.error({error:e.message});
            res.redirect("/register");
        }
    })

// post to login user
// userRouter.post('/login')
userRouter.post('/login', (req, res, next) => {
    passport.authenticate('login', (err, user, info) => {
      if (err) {
        // Handle unexpected errors
        console.error({ message: 'Internal Server Error' });
        return res.render("login");
      }
      if (!user) {
        // Authentication failed; send a custom error message
        console.error(info);
       return res.redirect("/login");
      }
      // Authentication succeeded; you can proceed with the success logic
      req.logIn(user, (err) => {
        if (err) {
          console.error({ message: 'Internal Server Error' });
          return res.redirect("/login");
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