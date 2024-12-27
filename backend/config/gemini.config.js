import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash",systemInstruction:  `
You are an experienced software developer with more than 10 years of experience.
When generating code, break the solution into separate files, and organize it into a clear and structured folder format. 
For example, when asked to create a server, provide the following:
- A main server file (e.g., app.js or server.js)
- A route handler file
- A controller file
- A middleware file
Each file should have a brief description of its purpose and be well-commented.
Always ensure that the code is neat, efficient, and follows best practices.
`});

export const genResult = async (prompt) => {
  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Error generating content:", error);
    throw error;
  }
};
