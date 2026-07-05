"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Preloaded } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { usePreloadedAuthQuery } from "@convex-dev/better-auth/nextjs/client";
import { CircleUserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.email(),
});

interface ProfileViewProps {
  preloadedUserQuery: Preloaded<typeof api.auth.getCurrentUser>;
}

export const ProfileView = ({ preloadedUserQuery }: ProfileViewProps) => {
  const user = usePreloadedAuthQuery(preloadedUserQuery);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user?.name,
      email: user?.email,
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    // todos: add the logic later when the user change his name or email for now just console.log
    console.log("Values : ", data);
  };

  const handleChangePictureProfile = () => {
    alert("This is a feature later");
  };
  return (
    <Card className="w-full overflow-hidden p-0">
      <CardContent className="flex flex-col gap-3 px-3 py-5">
        <div className="flex items-center gap-4">
          <div className="rounded-full bg-primary-foreground p-7">
            <CircleUserRound />
          </div>
          <Button onClick={handleChangePictureProfile}>Upload</Button>
        </div>
        <form id="form-settings-profile" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-settings-profile-name">
                    Name
                  </FieldLabel>
                  <Input
                    {...field}
                    id="form-settings-profile-name"
                    aria-invalid={fieldState.invalid}
                    placeholder="John Doe"
                    autoComplete="off"
                  />
                  <FieldDescription>
                    This is your public display name. It can be your real name
                    or a pseudonym. You can only change this once every 30 days.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-settings-profile-email">
                    Email
                  </FieldLabel>
                  <Input
                    {...field}
                    id="form-settings-profile-email"
                    aria-invalid={fieldState.invalid}
                    placeholder="m@gmail.com"
                    autoComplete="off"
                    type="email"
                  />
                  <FieldDescription>
                    You can manage verified email addresses in your email
                    settings.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Button
              className="mt-5 max-w-fit disabled:cursor-not-allowed"
              type="submit"
              form="form-settings-profile"
              disabled={!form.formState.isDirty}
            >
              Update Change
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
};
