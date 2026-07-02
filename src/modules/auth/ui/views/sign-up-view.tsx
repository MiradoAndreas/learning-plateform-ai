"use client";
import { Card, CardContent } from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { FaGithub, FaGoogle } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import * as z from "zod";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { OctagonAlertIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const formSchema = z
  .object({
    name: z.string().min(1, { message: "Name is required" }),
    email: z.email(),
    password: z.string().min(1, { message: "Password is required" }),
    confirmPassword: z.string().min(1, { message: "Password is required" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const SignUpView = () => {
  const router = useRouter();

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    setError(null);
    setPending(true);

    authClient.signUp.email(
      {
        name: data.name,
        email: data.email,
        password: data.password,
        callbackURL: "/",
      },
      {
        onSuccess: () => {
          toast.success("Account created successfully");
          router.push("/");
          setPending(false);
        },
        onError: ({ error }) => {
          toast.error(error.message);
          setPending(false);
          setError(error.message);
        },
      },
    );
  };

  const onSocial = (provider: "github" | "google") => {
    setError(null);
    setPending(true);

    authClient.signIn.social(
      {
        provider: provider,
        callbackURL: "/",
      },
      {
        onSuccess: () => {
          setPending(false);
        },
        onError: ({ error }) => {
          setPending(false);
          setError(error.message);
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form
            id="form-rhf"
            onSubmit={form.handleSubmit(onSubmit)}
            className="p-6 md:p-8"
          >
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Let's get started</h1>
                <p className="text-balance text-muted-foreground">
                  Create your account
                </p>
              </div>
            </div>

            <FieldGroup>
              <div className="grid gap-3">
                <Controller
                  name="name"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="form-rhf-name">Name</FieldLabel>
                      <Input
                        id="form-rhf-name"
                        {...field}
                        aria-invalid={fieldState.invalid}
                        placeholder="John Doe"
                        autoComplete="off"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>

              <div className="grid gap-3">
                <Controller
                  name="email"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="form-rhf-email">Email</FieldLabel>
                      <Input
                        type="email"
                        id="form-rhf-email"
                        {...field}
                        aria-invalid={fieldState.invalid}
                        placeholder="m@example.com"
                        autoComplete="off"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>

              <div className="grid gap-3">
                <Controller
                  name="password"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="form-rhf-password">
                        Password
                      </FieldLabel>
                      <Input
                        type="password"
                        id="form-rhf-password"
                        {...field}
                        aria-invalid={fieldState.invalid}
                        placeholder="******"
                        autoComplete="off"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>

              <div className="grid gap-3">
                <Controller
                  name="confirmPassword"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="form-rhf-confirmPassword">
                        Confirm Password
                      </FieldLabel>
                      <Input
                        type="password"
                        id="form-rhf-confirmPassword"
                        {...field}
                        aria-invalid={fieldState.invalid}
                        placeholder="******"
                        autoComplete="off"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>

              {!!error && (
                <Alert className="border-none bg-destructive/10">
                  <OctagonAlertIcon className="h-4 w-4 text-destructive!" />
                  <AlertTitle>{error}</AlertTitle>
                </Alert>
              )}

              <Field
                orientation="horizontal"
                className="flex w-full items-center"
              >
                <Button
                  disabled={pending}
                  className="w-1/2"
                  type="button"
                  variant="outline"
                  onClick={() => form.reset()}
                >
                  Reset
                </Button>
                <Button
                  disabled={pending}
                  className="w-1/2"
                  type="submit"
                  form="form-rhf"
                >
                  {pending && <Spinner className="mr-2" />}
                  Create account
                </Button>
              </Field>

              <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                <span className="relative z-10 bg-card px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  disabled={pending}
                  onClick={() => onSocial("google")}
                  variant="outline"
                  type="button"
                  className="w-full"
                >
                  <FaGoogle />
                </Button>
                <Button
                  disabled={pending}
                  onClick={() => onSocial("github")}
                  variant="outline"
                  type="button"
                  className="w-full"
                >
                  <FaGithub />
                </Button>
              </div>

              <div className="text-center text-sm">
                Already have an account?{" "}
                <Link href="/sign-in" className="underline underline-offset-4">
                  Sign in
                </Link>
              </div>
            </FieldGroup>
          </form>
          <div className="relative hidden flex-col items-center justify-center gap-y-4 bg-radial from-sidebar-accent to-sidebar md:flex">
            <img
              src="/logoipsum2.svg"
              alt="Image"
              className="h-[92px] w-[92px]"
            />
            <p className="text-2xl font-semibold text-white">AI Tutor</p>
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-xs text-balance text-muted-foreground *:[a]:underline *:[a]:underline-offset-4 *:[a]:hover:text-primary">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>
      </div>
    </div>
  );
};
