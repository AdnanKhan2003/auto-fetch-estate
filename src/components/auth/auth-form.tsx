import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import LoginForm from "./login-form";

function AuthForm() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-background-to-muted p-4">
      <Card className="w-full max-w-[400px] shadow-2xl border-none">
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
    </div>
  );
}

export default AuthForm;
