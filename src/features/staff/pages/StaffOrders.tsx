import {useEffect,useState} from "react";
import {getCurrentStaff,getOrders} from "../services/staffData";
export default function StaffOrders(){
 const [rows,setRows]=useState<any[]>([]),[error,setError]=useState("");
 useEffect(()=>{getCurrentStaff().then(s=>getOrders(s.business_id)).then(setRows).catch(e=>setError(e.message))},[]);
 return <section><h1>Orders</h1>{error&&<p>{error}</p>}{rows.map(o=><div key={o.id} style={{background:"#fff",padding:16,marginBottom:8}}><b>{o.customer_name||"Customer"}</b> · {o.status} · {o.payment_status}<br/>{o.customer_phone||""}</div>)}</section>
}
