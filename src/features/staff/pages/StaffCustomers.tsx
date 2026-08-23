import {useEffect,useState} from "react";
import {getCurrentStaff,getCustomers} from "../services/staffData";
export default function StaffCustomers(){
 const [rows,setRows]=useState<any[]>([]),[error,setError]=useState("");
 useEffect(()=>{getCurrentStaff().then(s=>getCustomers(s.business_id)).then(setRows).catch(e=>setError(e.message))},[]);
 return <section><h1>Customers</h1>{error&&<p>{error}</p>}{rows.map(c=><div key={c.id} style={{background:"#fff",padding:16,marginBottom:8}}><b>{c.name}</b> · {c.phone}<br/>{c.email||""}</div>)}</section>
}
