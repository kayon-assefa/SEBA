import { useState } from "react";
import toast from "react-hot-toast";

import AuthCard from "../components/AuthCard";
import { registerUser } from "../services/auth.service";

export default function Register() {
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!businessName.trim() || !email.trim() || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);

      await registerUser(email, password, businessName);

      toast.success("Account created. Check your email.");

      // Go to verify-email page (pass email so we can show it + allow resend)
      window.location.href = `/verify-email?email=${encodeURIComponent(email)}`;
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Create account"
      subtitle="Join Ethiopia's modern business community"
    >
      <div className="space-y-5">
        <input
          className="w-full rounded-xl border p-3"
          placeholder="Business Name"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
        />

        <input
          className="w-full rounded-xl border p-3"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full rounded-xl border p-3"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full rounded-xl bg-[#FF5A5F] py-3 text-white font-bold disabled:opacity-60"
        >
          {loading ? "Creating..." : "Create Account"}
        </button>

        <p className="text-center text-sm">
          Already have an account?
          <a href="/login" className="ml-1 text-[#FF5A5F]">
            Login
          </a>
        </p>
      </div>
    </AuthCard>
  );
}