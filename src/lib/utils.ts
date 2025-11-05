import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const getBaseUrl = () => {
	const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
	if (apiBaseUrl) {
		// Remove /api suffix if present
		return apiBaseUrl.replace(/\/api$/, "");
	}
	return "http://localhost:8000"; // fallback
};
