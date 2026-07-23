import { Link } from "react-router-dom";

function Navbar() {
  return (
    <header className="border-b bg-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link
          to="/"
          className="text-2xl font-bold text-green-600"
        >
          SEBA
        </Link>

        <nav className="flex items-center gap-6">
          <Link to="/">Home</Link>
          <Link to="/businesses">Businesses</Link>
          <Link to="/categories">Categories</Link>
          <Link to="/login">Login</Link>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;