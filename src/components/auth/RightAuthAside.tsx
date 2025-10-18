// components/auth/RightAuthAside.tsx
"use client";

import Image from "next/image";
import Link from "next/link";

export default function RightAuthAside() {
	return (
		<aside className="relative h-full w-full text-white flex items-center justify-center overflow-hidden bg-[#B50B3B]">
			{/* top-right ellipse */}
			<Image
				src="/images/ellipse.svg"
				alt=""
				width={460}
				height={460}
				aria-hidden
				className="pointer-events-none select-none absolute -top-8 right-0 opacity-70"
				priority={false}
			/>

			{/* top-center support icon ONLY (no text) */}
			<div className="absolute top-7 left-1/2 -translate-x-1/2 z-10">
				<Image
					src="/icons/support.svg"
					alt="Support"
					width={110}
					height={110}
					className="opacity-90"
				/>
			</div>

			{/* center column */}
			<div className="relative z-10 w-full max-w-[540px] px-6 md:px-0">
				{/* image card */}
				<div className="relative mb-10">
					<div className="relative overflow-hidden rounded-xl shadow-xl">
						<Image
							src="/images/auth-image.svg"
							alt="Support"
							width={960}
							height={640}
							className="w-full h-[210px] md:h-[240px] lg:h-[260px] xl:h-[280px] object-cover"
							priority={false}
						/>
					</div>

					{/* white warning pill as a single image */}
					<div className="absolute -bottom-7 right-6">
						<Image
							src="/images/small-earnings.svg"
							alt="Notice"
							width={373}
							height={102}
							priority={false}
						/>
					</div>
				</div>

				{/* notice */}
				<h2 className="text-center text-[22px] font-semibold mb-3">Notice</h2>
				<p className="mx-auto text-center text-white/90 leading-relaxed text-[15px] max-w-[520px]">
					Welcome to the Cartwright King Intranet. This platform is currently in
					beta. Should you encounter any issues, please contact our support team
					at{" "}
					<Link
						href="mailto:help@cartwrightking.work"
						className="underline decoration-white/70 underline-offset-2 hover:text-white">
						help@cartwrightking.work
					</Link>{" "}
					and we will resolve them promptly.
				</p>
			</div>
		</aside>
	);
}
