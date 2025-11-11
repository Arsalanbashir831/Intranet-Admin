// app/(auth)/page.tsx
import { ROUTES } from "@/constants/routes";
import { redirect } from "next/navigation";
export default function Page() {
  redirect(ROUTES.AUTH.LOGIN); // or any canonical route
}
