"use client";

import { useState } from "react"; // Added missing import
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Eye } from "lucide-react";

export default function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState(""); // Fixed variable name
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const [show, setShow] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            toast.success("Welcome back, Admin");
            router.push("/admin");
        } catch (error) {
            console.error(error);
            toast.error("Invalid credentials");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-[#0f0f0f] to-[#1a1208] text-white flex items-center justify-center px-6 py-10">
            <div className="w-full max-w-5xl md:max-w-[60%] mx-auto grid grid-cols-1  gap-8 items-center" style={{padding: "2vw 1vw"}}>
                <div className="relative hidden lg:block">
                    <div className="absolute -inset-6 bg-gold/10 blur-3xl rounded-full" />
                    <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-10 shadow-2xl" style={{padding: "2vw 1vw"}}>
                        <div className="text-gold text-xs tracking-[0.4em] uppercase mb-4">Sveston Admin</div>
                        <h1 className="font-serif text-4xl leading-tight mb-4">Control center for your catalog.</h1>
                        <p className="text-gray-400 mb-8">Secure access to manage products, prices, and new arrivals.</p>
                        <div className="grid grid-cols-2 gap-4" style={{padding: "1vw 1vw"}}>
                            {[
                                { label: "Uptime", value: "99.9%" },
                                { label: "Products", value: "Live" },
                                { label: "Security", value: "In-memory auth" },
                                { label: "Support", value: "24/7" },
                            ].map((item) => (
                                <div key={item.label} className="rounded-lg border border-white/10 bg-black/30 px-4 py-3" style={{padding: "1vw 1vw"}}>
                                    <p className="text-xs text-gray-400 uppercase tracking-widest">{item.label}</p>
                                    <p className="text-xl font-semibold text-white mt-1">{item.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <Card className="bg-dark-card border-white/10 shadow-2xl" style={{padding: "2vw 1vw"}}>
                    <CardHeader className="space-y-2">
                        <CardTitle className="text-3xl">Admin Login</CardTitle>
                        <CardDescription>Enter credentials to access the dashboard.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    style={{padding: "1vw 1vw"}}
                                />
                            </div>
                            <div className="space-y-2 relative">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type= {show ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    style={{padding: "1vw 1vw"}}
                                />
                                <Eye className="absolute top-1/2 right-4 cursor-pointer hover:text-zinc-700"
                                onClick={()=> setShow(!show) }
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full bg-gold cursor-pointer text-black hover:bg-gold-light font-bold tracking-[0.2em] uppercase"
                                disabled={loading}
                                style={{marginTop: "1vw"}}
                            >
                                {loading ? "Signing in..." : "Login"}
                            </Button>
                        </form>
                        <p className="text-xs text-gray-500 mt-4 text-center" style={{padding: "1vw 1vw"}}>
                            In-memory session for security. Refreshing will sign you out.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
