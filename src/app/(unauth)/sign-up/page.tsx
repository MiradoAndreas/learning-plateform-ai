import { isAuthenticated } from "@/lib/auth-server";
import { SignUpView } from "@/modules/auth/ui/views/sign-up-view";
import { redirect } from "next/navigation";

const SignUp = async () => {
  const hasToken = await isAuthenticated();

  if (hasToken) {
    console.log(hasToken);
    redirect("/dashboard");
  }
  return <SignUpView />;
};

export default SignUp;
