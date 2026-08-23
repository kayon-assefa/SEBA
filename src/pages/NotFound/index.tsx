import { Link } from "react-router-dom";


export default function NotFound(){

return (

<div className="min-h-[70vh] flex items-center justify-center bg-[#FFF8F6]">


<div className="text-center">


<div className="text-[150px] font-black text-[#FF5A5F]">
404
</div>


<h1 className="text-4xl font-black">
Oops! Page doesn't exist
</h1>


<p className="mt-4 text-gray-600">
The page you are looking for cannot be found.
</p>



<div className="mt-8 flex gap-4 justify-center">


<Link

to="/"

className="rounded-full bg-[#FF5A5F] px-8 py-4 text-white font-bold"

>

Go Home

</Link>



<Link

to="/businesses"

className="rounded-full border px-8 py-4"

>

Explore Businesses

</Link>


</div>


</div>


</div>

)

}