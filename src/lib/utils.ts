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

export const getIconStyle = (iconSrc: string) => {
	return {
		WebkitMaskImage: `url(${iconSrc})`,
		maskImage: `url(${iconSrc})`,
		WebkitMaskRepeat: "no-repeat",
		maskRepeat: "no-repeat",
		WebkitMaskPosition: "center",
		maskPosition: "center",
		WebkitMaskSize: "contain",
		maskSize: "contain",
	};
};

export const getInitials = (name?: string) => {
	if (!name) return "U";
	return name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);
};
