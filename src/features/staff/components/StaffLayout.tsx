import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { getCurrentStaff } from "../services/staffData";

export default function StaffLayout() {
  const [staff, setStaff] = useState<any>(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    getCurrentStaff().then(setStaff).catch(e => setError(e.message));
  }, []);

  if (error) return <div style={{padding:32}}>Staff error: {error}</div>;
  if (!staff) return <div style={{padding:32}}>Loading staff account…</div>;

  const links = [
    ["/staff/dashboard","Dashboard"],
    ["/staff/appointments","Appointments"],
    ["/staff/orders","Orders"],
    ["/staff/customers","Customers"],
    ["/staff/notifications","Notifications"],
    ["/staff/schedule","Schedule"],
  ];

  return <div style={{display:"flex",minHeight:"100vh",background:"#f5f6f8"}}>
    <aside style={{width:230,padding:20,background:"#111827",color:"#fff"}}>
      <h2>SEBA Staff</h2>
      <p>{staff.full_name}</p>
      <small>{staff.email}<br/>{staff.role}</small>
      <nav style={{display:"grid",gap:8,marginTop:24}}>
        {links.map(([to,label]) => <NavLink key={to} to={to}
          style={({isActive})=>({padding:10,borderRadius:8,textDecoration:"none",
            color:"#fff",background:isActive?"#374151":"transparent"})}>{label}</NavLink>)}
      </nav>
      <button style={{marginTop:25,width:"100%",padding:10}} onClick={async()=>{
        await supabase.auth.signOut(); navigate("/login",{replace:true});
      }}>Sign out</button>
    </aside>
    <main style={{flex:1,padding:28}}><Outlet/></main>
  </div>;
}
