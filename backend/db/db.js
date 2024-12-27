import mongoose from "mongoose";

export const connectDB = async()=>{
  const db = await mongoose.connect(process.env.MONGO_URI);
  if(db){
    console.log(`MongoDB Connected: ${db.connection.host}`);
  }
  else{
    console.error("Error connecting to MongoDB");
    process.exit(1);
  }
}
