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
const generateAccessAndRefreshToken = async(userId) =>
{
  try {
    const user=await User.findById(userId)
    const accessToken=user.generateAccessToken();
    const refreshToken=user.generateRefreshToken();
    
    user.refreshToken=refreshToken;
    await user.save({ValiditeBeforeSave :false});
    return {accessToken,refreshToken};
  }
  catch(error )
  {
    throw new ApiError(500,"Token generation failed");
  }
}
const registerUser=asyncHandler(async(req,res) =>{
  
  const {userName,fullName,email,password}=req.body
  if([fullName,userName,email,password].some((field) =>field?.trim()===""))
    {
      throw new ApiError(400,"All fields are required")
    }
    const existedUser=await User.findOne({
      $or :[
        {
          userName
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
    /* const coverImageLocalPath=(req.files?.//coverImage[0].path) */
    let coverImageLocalPath;
    if(req.files && req.files.coverImage && req.files.coverImage.length > 0){
     coverImageLocalPath=req.files.coverImage[0].path;
    }
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
      userName : userName.toLowerCase(),
      password
    })
   const createdUser=await User.findById(user._id).select("-password -refreshToken ")

    if(!createdUser){
      throw new ApiError(500,"User creation failed")
    }
    return res.status(201).json(new ApiResponse(201,createdUser,"User created successfully"))
  })
const loginUser=asyncHandler(async (req,res) =>{
  //get email password from frontend
  //check email exist or not
  //check password correct or not
  //generate access token and refresg token
  //store refresh token in db
  //return response with access token and user details except password and refresh token
const { userName, email, password } = req.body
  if(!(userName || email))
  {
    throw new ApiError(400,"Email and username are required")
  }
  const user=await User.findOne({
    $or:[{email},{userName}]
 } )
 if(!user)
  {
    throw new ApiError(404,"User not registered");
  }
  const isPasswordValid=await user.isPasswordCorrect(password)
  if(!isPasswordValid)
  {
    throw new ApiError(401,"Invalid credentials")
  }
  const {accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id)
  const loggedInUser=await User.findById(user._id).select("-password -refreshToken")
  
  const options={
    httpOnly:true,
    secure: false
  }
  return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options).json(new ApiResponse(200,{user:loggedInUser,accessToken,refreshToken},"Login successful"))

  }
)
const logoutUser=asyncHandler(async(req,res)=>{
  await User.findByIdAndUpdate(req.user._id,{
    $set :{
      refreshToken :undefined
    }
  },
  {
    new :   true
  }

  )
  const options={
    httpOnly:true,
    secure: false
  }
  return  res.status(200).clearCookie("accessToken",options).clearCookie("refreshToken",options).json(new ApiResponse(200,{},"Logout successful")) 
})
export {loginUser,registerUser,logoutUser}  


  




