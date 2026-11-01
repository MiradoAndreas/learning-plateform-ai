"use client";
import { useRef, useState, type ChangeEvent } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Preloaded, useConvex, useMutation, useQuery } from "convex/react";
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
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
});

interface ProfileViewProps {
  preloadedUserQuery: Preloaded<typeof api.auth.getCurrentUser>;
}

export const ProfileView = ({ preloadedUserQuery }: ProfileViewProps) => {
  const user = usePreloadedAuthQuery(preloadedUserQuery);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const convex = useConvex();

  const generateUploadUrl = useMutation(api.auth.generateUploadUrl);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user?.name,
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      await authClient.updateUser({
        name: data.name,
      });
      toast.success("Nom changé");
    } catch {
      toast.error("Erreur lors du changement de nom");
    }
  };

  const handleChangePictureProfile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // 1. URL d'upload
      const uploadUrl = await generateUploadUrl();

      // 2. Upload du fichier
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();

      // 3. Appel ponctuel de la query (pas de hook, appel direct)
      const imageUrl = await convex.query(api.auth.getImageUrl, { storageId });
      if (!imageUrl) throw new Error("Impossible de récupérer l'URL");

      // 4. Mise à jour via Better Auth
      await authClient.updateUser({ image: imageUrl });

      toast.success("Photo de profil mise à jour");
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors du changement de photo");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  return (
    <Card className="w-full overflow-hidden p-0">
      <CardContent className="flex flex-col gap-3 px-3 py-5">
        <div className="flex items-center gap-4">
          <div className="overflow-hidden rounded-full bg-primary-foreground">
            {user?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.image}
                alt="Photo de profil"
                className="h-16 w-16 object-cover"
              />
            ) : (
              <div className="p-7">
                <CircleUserRound />
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          <Button onClick={handleChangePictureProfile} disabled={isUploading}>
            {isUploading ? "Envoi..." : "Upload"}
          </Button>
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
                    or a pseudonym.
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
