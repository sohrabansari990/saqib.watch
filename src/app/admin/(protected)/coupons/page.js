"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Trash2, Ticket, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CouponsAdmin() {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [newCoupon, setNewCoupon] = useState({
        code: "",
        type: "percentage",
        value: "",
        minAmount: "0",
        isActive: true
    });

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, "coupons"));
            const couponsList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setCoupons(couponsList);
        } catch (error) { toast.error("Failed to load coupons"); } finally { setLoading(false); }
    };

    const handleAddCoupon = async (e) => {
        e.preventDefault();
        if (!newCoupon.code || !newCoupon.value) return toast.error("Fill all fields");

        try {
            await addDoc(collection(db, "coupons"), {
                ...newCoupon,
                code: newCoupon.code.toUpperCase(),
                value: parseFloat(newCoupon.value),
                minAmount: parseFloat(newCoupon.minAmount || 0),
                createdAt: serverTimestamp()
            });
            toast.success("Coupon added");
            setNewCoupon({ code: "", type: "percentage", value: "", minAmount: "0", isActive: true });
            setIsAdding(false);
            fetchCoupons();
        } catch (error) { toast.error("Failed to add coupon"); }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure?")) return;
        try {
            await deleteDoc(doc(db, "coupons", id));
            setCoupons(coupons.filter(c => c.id !== id));
            toast.success("Coupon deleted");
        } catch (error) { toast.error("Failed to delete"); }
    };

    return (
        <div className="min-h-screen text-white" style={{ background: "linear-gradient(135deg, #0b0b0f 0%, #0f0f14 50%, #0f0a06 100%)" }}>
            <div style={{ maxWidth: "1200px", margin: "0 auto", padding: isMobile ? "40px 20px" : "60px 40px" }}>
                <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "center", justifyContent: "space-between", marginBottom: "40px", gap: "24px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <Link href="/admin">
                            <Button variant="ghost" style={{ padding: "0", color: "#6b7280", borderRadius: "50%", width: "40px", height: "40px", border: "1px solid rgba(255,255,255,0.05)" }} className="hover:bg-white/5 hover:text-white">
                                <ArrowLeft size={20} />
                            </Button>
                        </Link>
                        <div>
                            <p style={{ fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.3em", color: "rgba(201,168,76,0.8)", marginBottom: "4px", fontWeight: "bold" }}>Promotions</p>
                            <h1 style={{ fontSize: isMobile ? "28px" : "40px", fontFamily: "serif", fontWeight: "300" }}>Coupons</h1>
                        </div>
                    </div>
                    <Button 
                        onClick={() => setIsAdding(!isAdding)}
                        style={{ background: "#C9A84C", color: "black", height: "50px", padding: "0 24px", borderRadius: "12px", fontWeight: "bold", width: isMobile ? "100%" : "auto" }}
                        className="hover:bg-[#d4b55c]"
                    >
                        {isAdding ? "Cancel" : <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><Plus size={18} /> Create Coupon</div>}
                    </Button>
                </div>

                {isAdding && (
                    <Card style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", padding: isMobile ? "24px" : "32px", borderRadius: "24px", marginBottom: "40px" }}>
                        <form onSubmit={handleAddCoupon} style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", alignItems: "end" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                <label style={{ fontSize: "10px", color: "#9ca3af", textTransform: "uppercase", fontWeight: "bold" }}>Code</label>
                                <input type="text" placeholder="SUMMER20" style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "12px", color: "white" }} className="uppercase" value={newCoupon.code} onChange={(e) => setNewCoupon({...newCoupon, code: e.target.value})} />
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                <label style={{ fontSize: "10px", color: "#9ca3af", textTransform: "uppercase", fontWeight: "bold" }}>Type</label>
                                <select style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "12px", color: "white" }} value={newCoupon.type} onChange={(e) => setNewCoupon({...newCoupon, type: e.target.value})}>
                                    <option value="percentage" style={{ background: "#1a1a1a" }}>% OFF</option>
                                    <option value="fixed" style={{ background: "#1a1a1a" }}>FIXED OFF</option>
                                </select>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                <label style={{ fontSize: "10px", color: "#9ca3af", textTransform: "uppercase", fontWeight: "bold" }}>Value</label>
                                <input type="number" style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "12px", color: "white" }} value={newCoupon.value} onChange={(e) => setNewCoupon({...newCoupon, value: e.target.value})} />
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                <label style={{ fontSize: "10px", color: "#9ca3af", textTransform: "uppercase", fontWeight: "bold" }}>Min Order</label>
                                <input type="number" style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "12px", color: "white" }} value={newCoupon.minAmount} onChange={(e) => setNewCoupon({...newCoupon, minAmount: e.target.value})} />
                            </div>
                            <Button type="submit" style={{ background: "white", color: "black", height: "50px", borderRadius: "10px", fontWeight: "bold", width: "100%" }}>SAVE</Button>
                        </form>
                    </Card>
                )}

                <Card style={{ border: "1px solid rgba(255,255,255,0.08)", background: "#121214", borderRadius: "24px", overflow: "hidden" }}>
                    <div style={{ padding: "24px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <h2 style={{ fontSize: "18px", fontWeight: "300" }}>Active Coupons</h2>
                    </div>
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse", minWidth: isMobile ? "600px" : "auto" }}>
                            <thead style={{ background: "rgba(255,255,255,0.02)", color: "#9ca3af", fontSize: "9px", textTransform: "uppercase" }}>
                                <tr>
                                    <th style={{ padding: "16px 24px" }}>Code</th>
                                    <th style={{ padding: "16px 24px" }}>Benefit</th>
                                    <th style={{ padding: "16px 24px" }}>Min. Order</th>
                                    <th style={{ padding: "16px 24px" }}>Status</th>
                                    <th style={{ padding: "16px 24px", textAlign: "right" }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {coupons.map((c) => (
                                    <tr key={c.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }} className="hover:bg-white/5">
                                        <td style={{ padding: "16px 24px" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(201,168,76,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#C9A84C" }}><Ticket size={16} /></div>
                                                <span style={{ fontWeight: "bold", fontSize: "15px" }}>{c.code}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: "16px 24px" }}>{c.type === 'percentage' ? `${c.value}% OFF` : `Rs. ${c.value.toLocaleString()} OFF`}</td>
                                        <td style={{ padding: "16px 24px", color: "#6b7280" }}>Rs. {c.minAmount?.toLocaleString()}</td>
                                        <td style={{ padding: "16px 24px" }}>
                                            <span style={{ fontSize: "8px", fontWeight: "bold", padding: "4px 10px", borderRadius: "99px", background: c.isActive ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", color: c.isActive ? "#22c55e" : "#ef4444" }}>{c.isActive ? 'ACTIVE' : 'OFF'}</span>
                                        </td>
                                        <td style={{ padding: "16px 24px", textAlign: "right" }}>
                                            <Button size="icon" variant="ghost" style={{ color: "#6b7280" }} className="hover:text-red-500" onClick={() => handleDelete(c.id)}><Trash2 size={16} /></Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    );
}
