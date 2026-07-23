import { Link } from "react-router-dom";

function Hero() {
  return (
    <section className="bg-gradient-to-br from-green-600 to-emerald-700 text-white">
      <div className="mx-auto flex min-h-[80vh] max-w-7xl flex-col items-center justify-center px-6 text-center">
        <span className="rounded-full bg-white/20 px-4 py-2 text-sm font-medium">
          🇪🇹 Discover Local Businesses Across Ethiopia
        </span>

        <h1 className="mt-6 max-w-4xl text-5xl font-extrabold leading-tight md:text-7xl">
          Find Trusted Businesses Near You
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-green-100 md:text-xl">
          Search restaurants, hotels, pharmacies, salons, mechanics, shops,
          hospitals, and thousands of verified businesses—all in one place.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            to="/businesses"
            className="rounded-xl bg-white px-8 py-4 font-semibold text-green-700 transition hover:bg-gray-100"
          >
            Explore Businesses
          </Link>

          <Link
            to="/register"
            className="rounded-xl border border-white px-8 py-4 font-semibold transition hover:bg-white hover:text-green-700"
          >
            List Your Business
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Hero;