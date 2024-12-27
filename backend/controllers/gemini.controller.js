import { genResult } from "../config/gemini.config.js";


export const getResult = async(req,res)=>{
  try{
    const {prompt} = req.query;
    const result = await genResult(prompt);
    return res.send(result);
  }
  catch(error){
    console.log(error);
    return res
     .status(500)
     .json({ code: 0, message: "Error in getResult controller" });
  }
}