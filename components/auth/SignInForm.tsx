"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import CredentialsForm from "./CredentialsForm";
import TwoFactorVerifyForm from "./TwoFactorVerifyForm";
import TwoFactorSetupForm from "./TwoFactorSetupForm";

type Step = "credentials" | "verify" | "setup";

export default function SignInForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("credentials");
  const [provisioningUri, setProvisioningUri] = useState<string | null>(null);

  const handleSuccess = () => {
    router.push("/dashboard");
  };

  const handleCancel = () => {
    setStep("credentials");
    setProvisioningUri(null);
  };

  const handle2FARequired = () => {
    setStep("verify");
  };

  const handle2FASetupRequired = (uri: string) => {
    setProvisioningUri(uri);
    setStep("setup");
  };

  if (step === "setup" && provisioningUri) {
    return (
      <TwoFactorSetupForm
        provisioningUri={provisioningUri}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    );
  }

  if (step === "verify") {
    return <TwoFactorVerifyForm onSuccess={handleSuccess} onCancel={handleCancel} />;
  }

  return (
    <CredentialsForm
      onSuccess={handleSuccess}
      on2FARequired={handle2FARequired}
      on2FASetupRequired={handle2FASetupRequired}
    />
  );
}
