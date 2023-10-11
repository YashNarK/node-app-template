// imports
import dotenv from "dotenv";
import express from "express";
import session from "express-session";
import helmet from "helmet";

// app imports
import { connectDB } from "./common/utils.js";
import { createUser } from "./models/user.js";
// load environment variables
dotenv.config();

// initialize express app
const app = express();

// middlewares
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

// plugins

// create a connect session with mongodb

// app server
const port =process.env.PORT || 3000;
app.listen(3000,async ()=>{
    await connectDB();
    console.log(`server running on\nhttp://localhost:${port}`);

    await createUser('naren','narenkrithick@gmail.com','admin')
})
