import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";



const connectDB =async()=>{

    try {
        const connectionInstance=await mongoose.connect(`${process.env.MONGO_URL}/${DB_NAME}`)
        console.log(`\n MONGODB CONNECTED: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MONGODB connect nhi hua hai bhai",error);
        process.exit(1);
    }
}


export default connectDB;
