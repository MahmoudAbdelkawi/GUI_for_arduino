import express from  'express';
import { Socket } from 'socket.io';
import { SerialPort, ReadlineParser } from 'serialport'
import { Server } from 'socket.io';
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));
const server =  require('http').createServer(app)

const io = new Server(server, {
  cors: {
      origin: "*",
      methods: "*",
        credentials: true
    }
});
io.setMaxListeners(20);

try{
  interface SerialData {
    pos1 : number,
    pos2 : number,
    freq1 : number,
    freq2 : number,
    delayTime : number,
  }

  let preprocess : Function = (data:string) : SerialData =>{
    let newData : SerialData
    try{
      let arr : string []= data.split(" ")
      newData = {pos1: Number(arr[1].split("\x00")[0]) , pos2:Number(arr[2].split("\x00")[0]), freq1:Number(arr[3].split("\x00")[0]), freq2:Number(arr[4].split("\x00")[0]),  delayTime : Number(arr[5].split("\x00")[0])}
    }
    catch(err:any){
      newData = {
        pos1 : 0,
        pos2 : 0,
        freq1 : 0,
        freq2 : 0,
        delayTime : 0
      }
    }
    
    return newData
  } 

  const port = new SerialPort({ path:"COM3", baudRate:9600 })

  const parser:any = new ReadlineParser()

  port.pipe(parser)

  parser.on('data', (serialData:any)=>{
    console.log(serialData);
    io.on('connection',(socket:Socket)=>{
      socket.on("serialdata",(data:any)=>{    
        let obj : SerialData = {
                    pos1 : 0,
                    pos2 : 0,
                    freq1 : 0,
                    freq2 : 0,
                    delayTime : 0
                  }
                  // for (let index = 0; index < 10; index++) {
                    
                    // let serialData = `$ 1 2 3 4 00000${index}\n`
                  obj=preprocess(serialData)
                  socket.setMaxListeners(20);

                  socket.emit("serialdata" , obj)
                    
                  // }
      })
      socket.on('disconnect', () => {
        console.log('user disconnected');
      });
    });
  })
  port.write('ROBOT PLEASE RESPOND\n')
  // io.on('connection',(socket:Socket)=>{
  //       socket.on("serialdata",(data:any)=>{   
  //         let obj : SerialData = {
  //           pos1 : 0,
  //           pos2 : 0,
  //           freq1 : 0,
  //           freq2 : 0,
  //           delayTime : 0
  //         }
  //         for (let index = 0; index < 10; index++) {
            
  //           let serialData = `$ 1 2 3 4 00000${index}\n`
  //           obj=preprocess(serialData)
  //           socket.emit("serialdata" , obj)
            
  //         }
  //       })
  //       socket.on('disconnect', () => {
  //         console.log('user disconnected');
  //       });
  //     });
}
catch(err:any){
  console.log("the kit isn't connected or the path is wrong");
}


server.listen(4000,()=>{
  console.log("Server is running.....");
})


