import mongoose from "mongoose";
import dotenv from 'dotenv';

// Load envvariables
dotenv.config()

// connect to DB function
// best practise is to create only one session for an app lifecycle
export async function connectDB(URL = process.env.MONGODB_CONNECTION_STRING) {
    try {
        await mongoose.connect(URL, {
            useNewUrlParser: true
        })
        console.log("connected to DB");
    }
    catch (e) {
        console.log(`Cannot connect to DB:${e.message}`);
    }
}



// Export the connectDB function as the default export
export default connectDB;

