"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/auth/auth-client";
import AuthInput from "./auth-input";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Button } from "../ui/button";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import LoadingButton from "../button/loading-button";
import PasswordInput from "./password-input";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid Email Address"),
  password: z.string().min(8, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleLogin = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      const { error } = await signIn.email({
        email: values.email,
        password: values.password,
        callbackURL: "/",
      });

      if (error) {
        form.setError("root", {
          message: error.message || "Invalid Credentials",
        });
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error("Signup Failed: ", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
      <FieldGroup>
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Email Address</FieldLabel>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  {...field}
                  id={field.name}
                  type="email"
                  placeholder="Enter your email"
                  className="pl-10 h-11"
                  aria-invalid={fieldState.invalid}
                />
              </div>
              <FieldError errors={fieldState.error ? [fieldState.error] : []} />
            </Field>
          )}
        />

        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Password</FieldLabel>
              <PasswordInput
                {...field}
                id={field.name}
                placeholder="**********"
                aria-invalid={fieldState.invalid}
              />

              <FieldError errors={fieldState.error ? [fieldState.error] : []} />
            </Field>
          )}
        />

        {form.formState.errors.root && (
          <p className="text-[10px] font-medium text-destructive text-center">
            {form.formState.errors.root.message}
          </p>
        )}

        <LoadingButton
          type="submit"
          className="w-full font-semibold cursor-pointer"
          loading={loading}
        >
          Log In
        </LoadingButton>
      </FieldGroup>
    </form>
  );
}

export default LoginForm;
