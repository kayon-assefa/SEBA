import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";

import { authService } from "../services/auth.service";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);

    const { error } = await authService.signIn(
      data.email,
      data.password
    );

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Welcome back!");
    navigate("/dashboard");
  };

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "60px auto",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      <h1>Login</h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{ display: "flex", flexDirection: "column", gap: "12px" }}
      >
        <div>
          <input
            type="email"
            placeholder="Email"
            {...register("email")}
            style={{ width: "100%", padding: "10px" }}
          />
          <p style={{ color: "red" }}>{errors.email?.message}</p>
        </div>

        <div>
          <input
            type="password"
            placeholder="Password"
            {...register("password")}
            style={{ width: "100%", padding: "10px" }}
          />
          <p style={{ color: "red" }}>{errors.password?.message}</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "12px",
            cursor: "pointer",
          }}
        >
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>

      <p>
        Don't have an account?{" "}
        <Link to="/register">Create one</Link>
      </p>
    </div>
  );
}

export default Login;