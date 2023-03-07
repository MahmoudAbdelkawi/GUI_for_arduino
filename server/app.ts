import express from  'express';
import { Socket } from 'socket.io';
import { SerialPort, ReadlineParser } from 'serialport'
import { Server } from 'socket.io';
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
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
let csvData :any []= []
let delayTime = 0
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
      socket.on("serialdata",async(data:any)=>{    
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
                  delayTime+=obj.delayTime
                  socket.setMaxListeners(20);
                  csvData.push({...obj , delayTime})
                  socket.emit("serialdata" , obj)
                  await new Promise(resolve => setTimeout(resolve, 10));
                    
                  // }
      })
      socket.on('disconnect', () => {
        console.log('user disconnected');
      });
    });
  })
  port.write('ROBOT PLEASE RESPOND\n')

  // let index = 0
  // let arr = [
  //   { pos1: 0, pos2: 100, freq1: 100, freq2: 200, delayTime: 50 },
  //   { pos1: 100, pos2: -100, freq1: 100, freq2: 200, delayTime: 50 },
  //   { pos1: -100, pos2: 100, freq1: 100, freq2: 200, delayTime: 50 },
  //   { pos1: 0, pos2: 100, freq1: 100, freq2: 200, delayTime: 50 },
  // ]
  // // setInterval(()=>{
  // index+=1
  
  // io.on('connection',(socket:Socket)=>{
  //       socket.on("serialdata",async(data:any)=>{   
  //         let obj : SerialData = {
  //           pos1 : 0,
  //           pos2 : 0,
  //           freq1 : 0,
  //           freq2 : 0,
  //           delayTime : 0
  //         }
  //         while (true) {
  //           console.log(arr[index%4]);

  //           delayTime+=arr[index%4].delayTime
  //           socket.setMaxListeners(20);
  //           csvData.push({...arr[index%4] , delayTime})
  //           socket.emit("serialdata" , arr[index % 4])
  //           await new Promise(resolve => setTimeout(resolve, 10));
  //           index++
  //         }
          
            
          
            
  //           // let serialData = `$ 1 2 3 4 00000${index}\n`
  //           // obj=preprocess(serialData)
            
            
  //         })
  //       socket.on('disconnect', () => {
  //         console.log('user disconnected');
  //       });

  //     });
    // },1)
}
catch(err:any){
  console.log("the kit isn't connected or the path is wrong");
}


process.on('SIGINT', () => {
  // console.log(csvData);
  const ObjectsToCsv = require('objects-to-csv');
 
const save = async (csvData:any) => {
    const csv = new ObjectsToCsv(csvData);
    await csv.toDisk('./Data.csv');
  }
  save(csvData)
  rl.close();
  // process.exit();
});

server.listen(4000,()=>{
  console.log("Server is running.....");
})


