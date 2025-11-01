import { Inter, Calistoga } from "next/font/google";
import "../../globals.css";
import { twMerge } from "tailwind-merge";

const inter = Inter({ 
    subsets: ["latin"], 
    variable: "--font-sans", 
    display: "swap",
    preload: true,
    fallback: ['system-ui', 'arial']
});

const calistoga = Calistoga({
    subsets: ["latin"],
    weight: "400",
    variable: "--font-serif",
    display: "swap",
    preload: true,
    fallback: ['Georgia', 'serif']
});

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className={twMerge(
            inter.variable, 
            calistoga.variable, 
            "bg-gray-50 text-black antialiased font-sans"
        )}>
            {children}
        </div>
    );
}