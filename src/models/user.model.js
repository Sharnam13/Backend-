import mongoose from "mongoose";  
import jwt from "jsonwebtoken"; 
import bcrypt from "bcryptjs";

const UserSchema =new mongoose.Schema({
  userName :{
    type :String,
    unique :true,
    required :true,
    lowercase :true,
    trim :true,
    index :true
  },
  email :{
    type :String,
    unique :true,
    required :true,
    lowercase :true,
    trim :true,

  },
  fullName :{
    type :String,
    required :true,
    trim :true,
    index :true
  },
  avatar :{
    type :String,
    required :true

  },
  coverImage :{
    type :String
  },
  watchHistory:[{
    type: mongoose.Schema.Types.ObjectId,
    ref : "video"

  }],
  password :{
    type :String,
    required :[true,"Password is required"],
  },
  refreshToken :{
    type :String
  }
},{timestamps:true});
UserSchema.pre("save",async function ()
{
  if(!this.isModified("password")){
   return ;
  }
  this.password =  await bcrypt.hash(this.password,10);
})
  UserSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password)
  }
  UserSchema.methods.generateAccessToken = function(){
    return jwt.sign({
      _id : this._id,
      email : this.email,
      userName : this.userName,
      fullName : this.fullName
     
    },process.env.ACCESS_TOKEN_SECRET,{
      expiresIn : process.env.Access_TOKEN_EXPIRY
    })
  }
  UserSchema.methods.generateRefreshToken = function(){ 
    return jwt.sign({
      _id : this._id  
    },process.env.REFRESH_TOKEN_SECRET,{
      expiresIn : process.env.REFRESH_TOKEN_EXPIRY
    })
  }
export const User=mongoose.model("User",UserSchema)