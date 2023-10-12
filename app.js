// imports
import dotenv from "dotenv";
import express from "express";
import session from "express-session";
import helmet from "helmet";
import ejs from "ejs";
// app imports
import { connectDB } from "./common/utils.js";
import {userRouter} from "./routes/user.js";
import passport from "passport";

// load environment variables
dotenv.config();

// initialize express app
const app = express();

// middlewares
app.set('view engine','ejs');
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static("public"));
app.use(helmet());
// session middlewares
app.use(session({
    secret:process.env.SESSION_SECRET,
    resave:false,
    saveUninitialized:false
}))
// route middlewares 
app.use('/api/users',userRouter);
app.use(passport.initialize());
app.use(passport.session());
// plugins

 
// PAGES - not required when using react JS
app.get('/',(req,res)=>{res.render("home")});
app.get('/register',(req,res)=>{res.render("register")});
app.get('/login',(req,res)=>{res.render("login")});

app.get('/secrets',async (req,res)=>{
   
    if(req.isAuthenticated())
    return res.render("secrets");
    return res.redirect("/login");
})






// app server
const port =process.env.PORT || 3000;
app.listen(3000,async ()=>{
    await connectDB();
    console.log(`server running on\nhttp://localhost:${port}`);

    // await createUser('naren','narenkrithick@gmail.com','admin')
    // const data =await readUser('');
    // console.log(data);

})
