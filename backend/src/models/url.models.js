import mongoose from "mongoose";



const urlSchema = new mongoose.Schema({
  shortId:  { type: String, required: true, unique: true },
  longUrl:  { type: String, required: true },
  clicks: {type:Number ,default:0},
  expiresAt: {type: Date, default: null},
 
},{timestamps:true});

export default mongoose.model('Url', urlSchema);