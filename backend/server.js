import {createServer} from "http"
import {Server} from "socket.io"
import {YSocketIO} from "y-socket.io/dist/server"
import express from "express"

const app = express();
const httpServer = createServer(app);

app.get("/",(req,res)=>{
res.status(200).json({
    message:"hello world",
    success:true
})
});

app.get("/health",(req,res)=>{
res.status(200).json({
    message:"ok",
    success:true
})
});

const io = new Server(httpServer,{
    cors:{
        origin:"*",
        methods:["GET","POST"]
    }
})

const ySocketIO= new YSocketIO(io)
ySocketIO.initialize();


httpServer.listen(3000, ()=>{
console.log("server is running on port 3000");
});