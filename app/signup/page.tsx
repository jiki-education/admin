import SignUpForm from "@/components/auth/SignupForm";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8">
        <SignUpForm />
      </div>
    </div>
  );
}