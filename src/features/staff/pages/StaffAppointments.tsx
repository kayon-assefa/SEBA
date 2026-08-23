import {useEffect,useState} from "react";
import {getCurrentStaff,getAppointments} from "../services/staffData";
export default function StaffAppointments(){
 const [rows,setRows]=useState<any[]>([]),[error,setError]=useState("");
 useEffect(()=>{getCurrentStaff().then(s=>getAppointments(s.business_id)).then(setRows).catch(e=>setError(e.message))},[]);
 return <section><h1>Appointments</h1>{error&&<p>{error}</p>}{rows.map(a=><div key={a.id} style={{background:"#fff",padding:16,marginBottom:8}}><b>{a.customer}</b> — {a.service}<br/>{a.date} {a.time} · {a.status}</div>)}</section>
}
