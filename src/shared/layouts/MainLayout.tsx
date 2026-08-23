import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";


export default function MainLayout(){

return(

<div className="min-h-screen bg-[#FFF8F6]">


<Navbar/>


<main>

<Outlet/>

</main>


<Footer/>


</div>

)

}