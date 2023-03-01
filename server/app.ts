import express from  'express';
import { Socket } from 'socket.io';
import { SerialPort, ReadlineParser } from 'serialport'
import { Server } from 'socket.io';


const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const server =  require('http').createServer(app)

const io = new Server(server, {
  cors: {
      origin: "*",
      methods: "*",
        credentials: true
    }
});

server.listen(4000,()=>{
  console.log("Server is running.....");
})



io.on('connection',(socket:any)=>{
  socket.on("serialdata",(data:any)=>{    
    socket.emit("serialdata" , "hi")
    socket.emit("serialdata" , "hi")
    socket.emit("serialdata" , "hi")
    socket.emit("serialdata" , "hi")
  })
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});


const port = new SerialPort({ path:"COM4", baudRate:9600 })

const parser:any = new ReadlineParser()

port.pipe(parser)

parser.on('data', (data:any)=>{
  console.log(data);
})


port.write('ROBOT PLEASE RESPOND\n')

