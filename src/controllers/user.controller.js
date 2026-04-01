// get user details from frontend
  //validation -not empty
  //chek if user already exists-username-email
  // check for images
  //chedk for avatar
  //upload them to cloudinary,avatar
  //user object-create entry in db
  //remove password and refresh token from response
  //check for user creation
  //return response
import { asyncHandler } from "../util/asyncHandler.js";
import {ApiError} from "../util/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary} from "../util/cloudinary.js";
import { ApiResponse } from "../util/APIResponse.js";
const registerUser=asyncHandler(async(req,res) =>{
  
  const {username,fullName,email,password}=req.body
  if([fullName,username,email,password].some((field) =>field?.trim()===""))
    {
      throw new ApiError(400,"All fields are required")
    }
    const existedUser=User.findOne({
      $or :[
        {
          username
        },
        {
          email
        }
      ]
    })
    if(existedUser){
      throw new ApiError(409,"User already exists")
    }
    const avatarLocalPath=req.files?.avatar[0].path;
    const coverImageLocalPath=req.files?.coverImage[0].path;
    if(!avatarLocalPath)
    {
      throw new ApiError(400,"Avatar is required")
    }
    const avatar=await uploadOnCloudinary(avatarLocalPath);
    const coverImage=await uploadOnCloudinary(coverImageLocalPath);
    if(!avatar)
    {
      throw new ApiError(400,"Avatar upload failed")
    }
    const user=await User.create({
      fullName,
      avatar:avatar.url,
      coverImage:coverImage?.url || "",
      email,
      username : username.toLowerCase(),
      password
    })
   const createdUser=await User.findById(user._id).select("-password -refreshToken ")

    if(!createdUser){
      throw new ApiError(500,"User creation failed")
    }
    return res.status(201).json(new ApiResponse(201,createdUser,"User created successfully"))
  })


  




export {registerUser}
