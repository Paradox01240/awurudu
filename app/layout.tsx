import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import SplashScreen from "./components/SplashScreen";
import {LanguageProvider} from "./contexts/LanguageContext";
import AlertProvider from "./components/AlertProvider";
import {Toaster} from "react-hot-toast";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Smart Youth Vasanth Udhanaya 2026",
    description: "Celebrating Sri Lankan New Year with Smart Technology - Kumara Kumari Pageant, Traditional Games, and Cultural Events at Panadura Beach",
};

// Initialize database on server side
async function initializeDatabase() {
    try {
        const {initDatabase} = await import("@/lib/database-clean");
        await initDatabase();
    } catch (error) {
        console.error('Database initialization failed:', error);
    }
}

// Initialize database
initializeDatabase();

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
        >
        <body className="min-h-full flex flex-col">
        <LanguageProvider>
            <AlertProvider/>
            <SplashScreen/>
            {children}
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#1f2937',
                        color: '#ffffff',
                        border: '1px solid #374151',
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontWeight: '500',
                        padding: '12px 16px',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                    },
                }}
            />
        </LanguageProvider>
        </body>
        </html>
    );
}
