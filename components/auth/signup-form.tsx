"use client";

import { Lock, Mail, User } from "lucide-react";
import AuthInput from "./auth-input";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth/auth-client";
import { Button } from "../ui/button";

function SignupForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signUp.email({
        name: form.name,
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
    <form onSubmit={handleSignup} className="space-y-4">
      <AuthInput
        id="name"
        label="Name"
        icon={User}
        type="name"
        placeholder="Enter Your Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        required
      />
      <AuthInput
        id="email"
        label="Email"
        icon={Mail}
        type="email"
        placeholder="Enter Your Email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        required
      />
      <AuthInput
        id="password"
        label="Password"
        icon={Lock}
        isPassword
        placeholder="Enter Your Password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        required
      />
      <Button type="submit" className="w-full font-semibold" disabled={loading}>
        {loading ? "Creating Account..." : "Sign Up"}
      </Button>
    </form>
  );
}

export default SignupForm;
