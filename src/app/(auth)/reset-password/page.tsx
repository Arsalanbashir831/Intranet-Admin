import { ResetPassword } from "../../../components/auth/reset-password";
import { Suspense } from "react";

export default function ResetPasswordPage() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <ResetPassword />
      </Suspense>
    </div>
  );
}