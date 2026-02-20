import type {Metadata} from "next";
import {Schibsted_Grotesk, Martian_Mono} from "next/font/google";
import "./globals.css";
import LightRays from "@/components/LightRays"
import Navbar from "@/components/Navbar"

const schibstedGrotesk = Schibsted_Grotesk({
    variable: "--font-schibsted-grotesk",
    subsets: ["latin"],
});

const martianMono = Martian_Mono({
    variable: "--font-martian-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "DevEvent",
    description: "The Hub for Every Dev Event You Mustn't Miss",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <body
            className={`${schibstedGrotesk.variable} ${martianMono.variable} min-h-screen antialiased`}
        >
            <Navbar />
            <div className="absolute inset-0 top-0 z-[-1] min-h-screen">
                <LightRays
                    raysOrigin="top-center-offset"
                    raysColor="#58aac6"
                    raysSpeed={2}
                    lightSpread={1.8}
                    rayLength={3}
                    followMouse={true}
                    mouseInfluence={0.2}
                    noiseAmount={0.2}
                    distortion={0.3}
                    className="custom-rays"
                    pulsating={false}
                    fadeDistance={0.7}
                    saturation={1.6}
                />
            </div>

            <main>
                {children}
            </main>

        </body>
        </html>
    );
}
