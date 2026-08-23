import { useEffect,useState } from "react";
import { getCurrentStaff,getAppointments,getOrders } from "../services/staffData";

export default function StaffDashboard(){
  const [staff,setStaff]=useState<any>(null),[appointments,setAppointments]=useState<any[]>([]),
    [orders,setOrders]=useState<any[]>([]),[error,setError]=useState("");

  async function load(){
    try{
      setError("");
      const s=await getCurrentStaff(); setStaff(s);
      const [a,o]=await Promise.all([getAppointments(s.business_id),getOrders(s.business_id)]);
      setAppointments(a); setOrders(o);
    }catch(e:any){setError(e.message);}
  }
  useEffect(()=>{load()},[]);
  const today=new Date().toISOString().slice(0,10);
  const todayA=appointments.filter(x=>x.date===today);
  const pendingA=appointments.filter(x=>String(x.status).toLowerCase()==="pending");
  const todayO=orders.filter(x=>String(x.created_at).slice(0,10)===today);
  const pendingO=orders.filter(x=>String(x.status).toLowerCase()==="pending");

  return <div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <div><h1>Good day, {staff?.full_name} 👋</h1><p>Today's work at a glance.</p></div>
      <button onClick={load}>Refresh</button>
    </div>
    {error&&<p style={{padding:12,background:"#fee2e2"}}>{error}</p>}
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16}}>
      {[[`Today's appointments`,todayA.length],[`Pending appointments`,pendingA.length],
        [`Today's orders`,todayO.length],[`Pending orders`,pendingO.length]].map(([x,n])=>
        <div key={String(x)} style={{background:"#fff",padding:20,borderRadius:12}}>
          <div>{x}</div><strong style={{fontSize:32}}>{n}</strong>
        </div>)}
    </div>
    <section style={{marginTop:24,background:"#fff",padding:20,borderRadius:12}}>
      <h2>Upcoming appointments</h2>
      {appointments.length?appointments.slice(0,10).map(a=>
        <div key={a.id} style={{padding:12,borderBottom:"1px solid #eee"}}>
          <b>{a.customer}</b> — {a.service} · {a.date} {a.time} · {a.status}
        </div>):<p>No appointments.</p>}
    </section>
    <section style={{marginTop:24,background:"#fff",padding:20,borderRadius:12}}>
      <h2>Today's orders</h2>
      {todayO.length?todayO.map(o=>
        <div key={o.id} style={{padding:12,borderBottom:"1px solid #eee"}}>
          <b>{o.customer_name||"Customer"}</b> · {o.status} · {o.payment_status}
        </div>):<p>No orders today.</p>}
    </section>
  </div>
}
