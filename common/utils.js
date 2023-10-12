import mongoose from "mongoose";
import dotenv from 'dotenv';
import crypto from "crypto";
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


export function validPassword(password, hash, salt) {
    var hashVerify = crypto
      .pbkdf2Sync(password, salt, 10000, 64, "sha512")
      .toString("hex");
    return hash === hashVerify;
  }

export function genPassword(password) {
    var salt = crypto.randomBytes(32).toString("hex");
    var genHash = crypto
      .pbkdf2Sync(password, salt, 10000, 64, "sha512")
      .toString("hex");
  
    return {
      salt: salt,
      hash: genHash,
    };
  }




// Export the connectDB function as the default export
export default connectDB;

