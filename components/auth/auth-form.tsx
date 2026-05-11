import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Lock, Mail, User } from "lucide-react";
import { Button } from "../ui/button";
import AuthInput from "./auth-input";
import LoginForm from "./login-form";
import SignupForm from "./signup-form";

function AuthForm() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-background-to-muted p-4">
      <Tabs defaultValue="login" className="w-full max-w-[400px] shadow-2xl">
        <TabsList
          className="grid w-full grid-cols-2 bg-muted/50"
          aria-label="Authentication Options"
        >
          <TabsTrigger
            value="login"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground cursor-pointer"
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
              <LoginForm />
            </CardContent>
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
              <SignupForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AuthForm;
