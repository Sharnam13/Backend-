import asyncHandler from "../util/asyncHandler.js";
import { ApiError } from "../util/APIResponse.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT= asyncHandler(async(req,res,next) =>{
  try {
    const token=req.cookies?.accessToken||req.header("Authorization")?.replace("Bearer ","")
    if(!token){
      throw new ApiError(401,"Unauthorized Reques")
    }
    const decodedTOken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    const user =await User.findById(decodedTOken._id).select("-password -refreshToken");
    if(!user){
      throw new ApiError(401,"Invalid Access Token")
    }
    req.user=user;
    next();
  } catch (error) {
    throw new ApiError(401,"Invalid Access Token")
  }


  

})