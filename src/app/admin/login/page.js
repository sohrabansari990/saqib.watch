"use client";

import { useState } from "react"; // Added missing import
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState(""); // Fixed variable name
    const [loading, setLoading] = useState(false);
    const router = useRouter();

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
        <div className="min-h-screen bg-dark flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-dark-card border border-white/10 p-8 rounded-lg">
                <div className="text-center mb-8">
                    <h1 className="font-serif text-3xl text-white mb-2">Admin Login</h1>
                    <p className="text-gray-400 text-sm">Enter your credentials to access the dashboard</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="admin@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <Button
                        type="submit"
                        className="w-full bg-gold text-black hover:bg-gold-light font-bold tracking-widest uppercase"
                        disabled={loading}
                    >
                        {loading ? "Signing in..." : "Login"}
                    </Button>
                </form>
            </div>
        </div>
    );
}
