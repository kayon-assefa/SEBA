import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { registerSchema } from "../../../shared/validation/auth.schema";
import type { RegisterFormData } from "../../../shared/validation/auth.schema";



import { authService } from "../services/auth.service";

function Register() {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });
const onSubmit = async (data: RegisterFormData) => {
  setLoading(true);

  const { data: authData, error } = await authService.signUp(
    data.email,
    data.password,
    data.fullName
  );

  setLoading(false);

  if (error) {
    toast.error(error.message);
    return;
  }

  toast.success("Account created successfully!");
  console.log(authData);
};
  

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "50px auto",
      }}
    >
      <h1>Create Account</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          placeholder="Full Name"
          {...register("fullName")}
        />
        <p>{errors.fullName?.message}</p>

        <input
          placeholder="Email"
          {...register("email")}
        />
        <p>{errors.email?.message}</p>

        <input
          type="password"
          placeholder="Password"
          {...register("password")}
        />
        <p>{errors.password?.message}</p>

        <input
          type="password"
          placeholder="Confirm Password"
          {...register("confirmPassword")}
        />
        <p>{errors.confirmPassword?.message}</p>

        <button disabled={loading}>
          {loading ? "Creating..." : "Create Account"}
        </button>
      </form>
    </div>
  );
}

export default Register;