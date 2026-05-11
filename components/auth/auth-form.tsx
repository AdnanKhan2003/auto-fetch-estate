"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2, Lock, Mail, User } from "lucide-react";
import { Input } from "../ui/input";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { signIn, signUp } from "@/lib/auth/auth-client";

function AuthForm() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleAuth = async (type: "login" | "signup") => {
    setLoading(true);
    try {
      if (type == "signup") {
        await signUp.email({ ...form, callbackURL: "/" });
      } else {
        await signIn.email({
          email: form.email,
          password: form.password,
          callbackURL: "/",
        });
      }
      router.push("/");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-background-to-muted p-4">
      <Tabs defaultValue="login" className="w-full max-w-[400px] shadow-2xl">
        <TabsList
          className="grid w-full grid-cols-2 bg-muted/50"
          aria-label="Authentication Options"
        >
          <TabsTrigger
            value="login"
            className="dta-[state=active]:bg-primary dta-[state=active]:text-primary-foreground cursor-pointer"
          >
            Log In
          </TabsTrigger>
          <TabsTrigger
            value="signup"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground cursor-pointer"
          >
            Sign Up
          </TabsTrigger>
        </TabsList>

        <TabsContent value="login">
          <Card className="border-none shadow-none">
            <CardHeader>
              <CardTitle className="text-2xl font-bold tracking-tight">
                Login
              </CardTitle>
              <CardDescription>
                Enter your email below to login to your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    className="pl-10"
                    placeholder="Enter Your Email"
                    value={form.email}
                    aria-label="Email Address"
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock
                    aria-hidden="true"
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                  />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="pl-10 pr-10"
                    value={form.password}
                    aria-label="Password"
                    placeholder="Enter Your Password"
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-transparent cursor-pointer text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    <span className="sr-only">
                      {showPassword ? "Hide password" : "Show password"}
                    </span>
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full font-semibold cursor-pointer"
                onClick={() => handleAuth("login")}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{" "}
                Login
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="signup">
          <Card className="border-none shadow-none">
            <CardHeader>
              <CardTitle className="text-2xl font-bold tracking-tight">
                Create an account
              </CardTitle>
              <CardDescription>
                Enter your details below to create your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    className="pl-10"
                    placeholder="Enter Your Name"
                    aria-label="Name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-up">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email-up"
                    className="pl-10"
                    placeholder="Enter Your Email"
                    aria-label="Email Address"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pass-up">Password</Label>
                <div className="relative">
                  <Lock
                    aria-hidden="true"
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                  />
                  <Input
                    id="pass-up"
                    type={showPassword ? "text" : "password"}
                    className="pl-10"
                    placeholder="Enter Your Password"
                    value={form.password}
                    aria-label="Password"
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-transparent cursor-pointer text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    <span className="sr-only">
                      {showPassword ? "Hide password" : "Show password"}
                    </span>
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full font-semibold cursor-pointer"
                onClick={() => handleAuth("signup")}
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{" "}
                Create Account
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AuthForm;
