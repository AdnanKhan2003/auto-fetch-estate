"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth/auth-client";
import AuthInput from "./auth-input";
import { Lock, Mail } from "lucide-react";
import { Button } from "../ui/button";

function LoginForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn.email({
        email: form.email,
        password: form.password,
        callbackURL: "/",
      });
      router.push("/");
    } catch (error) {
      console.error("Signup Failed: ", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <AuthInput
        id="login-email"
        label="Email"
        icon={Mail}
        type="email"
        placeholder="Enter Your Email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        required
      />
      <AuthInput
        id="login-password"
        label="Password"
        icon={Lock}
        isPassword
        placeholder="Enter Your Password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        required
      />
      <Button type="submit" className="w-full font-semibold" disabled={loading}>
        {loading ? "Loggin In..." : "Log In"}
      </Button>
    </form>
  );
}

export default LoginForm;
