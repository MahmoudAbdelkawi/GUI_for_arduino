import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import Papa from 'papaparse';
import io from "socket.io-client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";

const socket = io("http://localhost:4000");

// const d = [
//   {
//     delayTime: 0,
//     pos2: 4000,
//     pos1: 2400,
//     amt: 2400,
//   },
//   {
//     delayTime: 1,
//     pos2: 3000,
//     pos1: 1398,
//     amt: 2210,
//   },
//   {
//     delayTime: 2,
//     pos2: 2000,
//     pos1: 9800,
//     amt: 2290,
//   },
//   {
//     delayTime: 3,
//     pos2: 2780,
//     pos1: 3908,
//     amt: 2000,
//   },
//   {
//     delayTime: 4,
//     pos2: 1890,
//     pos1: 4800,
//     amt: 2181,
//   },
//   {
//     delayTime: 5,
//     pos2: 2390,
//     pos1: 3800,
//     amt: 2500,
//   },
//   {
//     delayTime: 6,
//     pos2: 3490,
//     pos1: 4300,
//     amt: 2100,
//   },
// ];

function downloadCSV(data:any) {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'data.csv');
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function App() {
  const [Data, setData] = useState<any>([]);
  const [stop , setStop] = useState<boolean>(false);
  const ref = useRef(false);
  const ref2 = useRef(0);
  useEffect(() => {
    if (!ref.current) {
      ref.current = true;
      return;
    }
    if (!stop) {
      socket.emit("serialdata", "");
      socket.on("serialdata", (data) => {
        ref2.current += data.delayTime;
        data.delayTime = ref2.current;
        setData((prev: any) => [...prev, data]);
      });
    } 
  }, []);

  return (
    <div className="App ">
      <LineChart
        width={1500}
        height={600}
        data={Data}

        margin={{
          top: 20,
          // right: 50,
          // left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="delayTime" />
        <YAxis />
        <Tooltip />
        <Legend />
        <ReferenceLine x="Page C" stroke="red" label="Max pos1 delayTime" />
        <ReferenceLine y={9800} label="Max" stroke="red" />
        <Line type="monotone" dataKey="pos1" stroke="#8884d8" />
        <Line type="monotone" dataKey="pos2" stroke="#82ca9d" />
      </LineChart>
      <div>
        <p>Fruequency 1 : {Data.length > 0  && Data[Data.length-1].freq1}</p>
        <p>Fruequency 2 : {Data.length > 0  && Data[Data.length-1].freq2}</p>
      </div>
      <div className="">
        <button onClick={()=>{
          ref2.current = 0
          setStop(false)
        }}>Start</button>
        <button onClick={()=>setStop(true)}>Stop</button>
        <button onClick={() => downloadCSV(Data)}>Download CSV</button>
      </div>
    </div>
  );
}

export default App;
