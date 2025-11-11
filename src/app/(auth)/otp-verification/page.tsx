import { OTPVerification } from "@/components/auth/otp-verification";
import { Suspense } from "react";

export default function OTPVerificationPage(){
    return(
        <div>
            <Suspense fallback={<div>Loading...</div>}>
                <OTPVerification/>
            </Suspense>
        </div>
    )
}