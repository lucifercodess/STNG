import jwt from 'jsonwebtoken';


export const TokenAndCookie = (userId,res)=>{
  const token = jwt.sign({userId},process.env.JWT_SECRET,{
    expiresIn: '1d'
  })
  res.cookie('token',token,{
    expires: new Date(Date.now() + 86400000),
    httpOnly: true,
    sameSite: "None"
  })
  return token;
}

