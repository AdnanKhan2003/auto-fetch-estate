"use client";

import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { authClient } from "@/lib/auth/auth-client";

function CreateMakersForm() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { error } = await authClient.admin.createUser({
      name,
      email,
      password,
      role: "maker" as any,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
    } else {
      alert("User Created Successfully");
      (e.target as HTMLFormElement).reset();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input name="name" placeholder="Full Name" required />
      <Input name="email" placeholder="Enter Email" type="email" required />
      <Input
        name="password"
        type="password"
        placeholder="Enter Password"
        required
      />
      <Button
        type="submit"
        className="w-full cursor-pointer"
        disabled={loading}
      >
        {loading ? "Creating..." : "Create Account"}
      </Button>
    </form>
  );
}

export default CreateMakersForm;
