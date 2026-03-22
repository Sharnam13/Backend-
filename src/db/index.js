import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

const connectDB=async() =>{
  try{
    const connectionInstance=await mongoose.connect(`${process.env.MONGO_URL}/${DB_NAME}`);
    console.log(`MONGO DB CONNECTED ${connectionInstance.connection.host}`);

  }
  catch(error){
    console.log("MONGO DB CONNECTION ERROR ",error);
    process.exit(1);

  }
}
export default connectDB