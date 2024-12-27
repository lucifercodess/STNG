import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase:true,
    minLength: [6,"email should be at least 6 characters"]
  },
  password:{
    type: String,
    required: true,
    // select: false,
    minLength: [6,"password should be at least 6 characters"]
  }
},{timestamps: true});

const User = mongoose.model("User",userSchema)

export default User;