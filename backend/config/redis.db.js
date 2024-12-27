import Redis from "ioredis";

const redisClient = new Redis({
  host: process.env.HOST,
  port: process.env.PORT,
  password: process.env.PASSWORD,
})

redisClient.on("connect",()=>{
  console.log("Redis connected");
})

export default redisClient;