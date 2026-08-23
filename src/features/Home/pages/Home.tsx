import Hero from "../components/Hero";
import CategoriesSection from "../components/CategoriesSection";
import FeaturedBusinesses from "../components/FeaturedBusinesses";
import HowItWorks from "../components/HowItWorks";
import WhySeba from "../components/WhyChoose";
import BusinessCTA from "../components/BusinessCTA";
import FinalCTA from "../components/FinalCTA";


export default function Home(){

return (

<div className="overflow-hidden">

<Hero />

<CategoriesSection />

<FeaturedBusinesses />

<HowItWorks />

<WhySeba />

<BusinessCTA />

<FinalCTA />


</div>

)

}