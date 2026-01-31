"use client";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import CredentialsForm from "./CredentialsForm";
import TwoFactorVerifyForm from "./TwoFactorVerifyForm";
import TwoFactorSetupForm from "./TwoFactorSetupForm";

export default function SignInForm() {
  const router = useRouter();
  const { twoFactorPending } = useAuthStore();

  const handleSuccess = () => {
    router.push("/dashboard");
  };

  if (twoFactorPending === "setup") {
    return <TwoFactorSetupForm onSuccess={handleSuccess} />;
  }

  if (twoFactorPending === "verify") {
    return <TwoFactorVerifyForm onSuccess={handleSuccess} />;
  }

  return <CredentialsForm />;
}
