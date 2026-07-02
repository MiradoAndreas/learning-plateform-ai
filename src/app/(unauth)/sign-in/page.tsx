import { isAuthenticated } from "@/lib/auth-server";
import { SignInView } from "@/modules/auth/ui/views/sign-in-view";
import { redirect } from "next/navigation";

const SignIn = async () => {
  const hasToken = await isAuthenticated();

  if (hasToken) {
    console.log("HasToken : ", hasToken);
    redirect("/dashboard");
  }

  return (
    <>
      <SignInView />
    </>
  );
};

export default SignIn;
