"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Trash2, Edit, Tag, Ticket, LayoutDashboard, ShoppingBag, Users, BarChart3, LogOut } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
    const { user, logout } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    const summary = (() => {
        const total = products.length;
        const byCategory = products.reduce((acc, p) => {
            acc[p.category] = (acc[p.category] || 0) + 1;
            return acc;
        }, {});
        const featured = products.filter((p) => p.mode && p.mode !== "new").length;
        return { total, byCategory, featured };
    })();

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, "products"));
            const productsList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setProducts(productsList);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load products");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure?")) return;
        try {
            await deleteDoc(doc(db, "products", id));
            setProducts(products.filter(p => p.id !== id));
            toast.success("Product deleted");
        } catch (error) {
            toast.error("Failed to delete");
        }
    };

    return (
        <div className="min-h-screen text-white" style={{ background: "linear-gradient(135deg, #0b0b0f 0%, #0f0f14 50%, #0f0a06 100%)" }}>
            <div style={{ maxWidth: "1400px", margin: "0 auto", padding: isMobile ? "40px 20px" : "60px 40px" }}>
                
                {/* Header */}
                <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "start", marginBottom: isMobile ? "40px" : "60px", gap: "32px" }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                            <LayoutDashboard size={14} style={{ color: "#C9A84C" }} />
                            <p style={{ fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.3em", color: "rgba(201,168,76,0.8)", fontWeight: "bold" }}>Control Center</p>
                        </div>
                        <h1 style={{ fontSize: isMobile ? "32px" : "44px", fontFamily: "serif", fontWeight: "300", marginBottom: "8px" }}>Management Console</h1>
                        <p style={{ color: "#6b7280", fontSize: "13px" }}>Authenticated as <span style={{ color: "white" }}>{user?.email}</span></p>
                    </div>
                    
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", width: isMobile ? "100%" : "auto" }}>
                        <Link href="/admin/coupons" style={{ flex: isMobile ? "1" : "none" }}>
                            <Button variant="outline" style={{ width: "100%", height: "50px", padding: "0 20px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)", color: "#C9A84C", gap: "8px", fontSize: "12px" }} className="hover:bg-gold/10">
                                <Ticket size={16} /> Coupons
                            </Button>
                        </Link>
                        <Link href="/admin/sale" style={{ flex: isMobile ? "1" : "none" }}>
                            <Button variant="outline" style={{ width: "100%", height: "50px", padding: "0 20px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)", color: "#C9A84C", gap: "8px", fontSize: "12px" }} className="hover:bg-gold/10">
                                <Tag size={16} /> Sale
                            </Button>
                        </Link>
                        <Link href="/admin/products/new" style={{ flex: isMobile ? "1 0 100%" : "none" }}>
                            <Button style={{ width: "100%", height: "50px", padding: "0 24px", borderRadius: "12px", background: "#C9A84C", color: "black", gap: "8px", fontWeight: "bold", fontSize: "12px" }} className="hover:bg-[#d4b55c]">
                                <Plus size={16} /> New Piece
                            </Button>
                        </Link>
                        <Button 
                            variant="ghost" 
                            style={{ height: "50px", width: "50px", padding: "0", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)", color: "#ef4444" }} 
                            onClick={logout}
                            className="hover:bg-red-500/10"
                        >
                            <LogOut size={18} />
                        </Button>
                    </div>
                </div>

                {/* Statistics Grid */}
                {!loading && (
                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(auto-fit, minmax(240px, 1fr))", gap: isMobile ? "12px" : "24px", marginBottom: isMobile ? "40px" : "60px" }}>
                        {[
                            { label: "Active Inventory", val: `${summary.total} Pieces`, icon: <ShoppingBag size={18} />, color: "#22c55e" },
                            { label: "Men's Coll.", val: `${summary.byCategory.men || 0} Items`, icon: <Users size={18} /> },
                            { label: "Women's Coll.", val: `${summary.byCategory.women || 0} Items`, icon: <Users size={18} /> },
                            { label: "Special Edit.", val: `${summary.featured} On Sale`, icon: <BarChart3 size={18} /> }
                        ].map((s, idx) => (
                            <Card key={idx} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", padding: isMobile ? "20px" : "32px", borderRadius: "20px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                                    <div style={{ color: "#6b7280" }}>{s.icon}</div>
                                    {s.color && <span style={{ fontSize: "8px", color: s.color, fontWeight: "bold" }}>• LIVE</span>}
                                </div>
                                <p style={{ fontSize: "10px", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>{s.label}</p>
                                <h3 style={{ fontSize: isMobile ? "18px" : "28px", fontWeight: "300", fontFamily: "serif" }}>{s.val}</h3>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Inventory Table */}
                <Card style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "24px", overflow: "hidden" }}>
                    <div style={{ padding: isMobile ? "24px" : "32px 40px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center", gap: "16px" }}>
                        <div>
                            <h2 style={{ fontSize: "18px", fontFamily: "serif", fontWeight: "300" }}>Inventory Overview</h2>
                            <p style={{ fontSize: "11px", color: "#6b7280" }}>Comprehensive curated catalog pieces.</p>
                        </div>
                        <div style={{ padding: "6px 12px", borderRadius: "99px", background: "rgba(255,255,255,0.05)", fontSize: "9px", color: "#9ca3af", letterSpacing: "0.1em", fontWeight: "bold" }}>
                            {products.length} TOTAL PIECES
                        </div>
                    </div>

                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: isMobile ? "600px" : "auto" }}>
                            <thead>
                                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.01)" }}>
                                    <th style={{ padding: "16px 40px", textAlign: "left", fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.2em", color: "#6b7280" }}>Reference</th>
                                    <th style={{ padding: "16px 40px", textAlign: "left", fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.2em", color: "#6b7280" }}>Collection</th>
                                    <th style={{ padding: "16px 40px", textAlign: "left", fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.2em", color: "#6b7280" }}>Investment</th>
                                    <th style={{ padding: "16px 40px", textAlign: "right", fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.2em", color: "#6b7280" }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((p) => (
                                    <tr key={p.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }} className="hover:bg-white/[0.02]">
                                        <td style={{ padding: "20px 40px" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                                <div style={{ width: "48px", height: "60px", borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", overflow: "hidden" }}>
                                                    {p.imageUrl ? <img src={p.imageUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "7px", color: "#374151" }}>NULL</div>}
                                                </div>
                                                <div>
                                                    <p style={{ fontWeight: "bold", fontSize: "14px", color: "white" }}>{p.name}</p>
                                                    <p style={{ fontSize: "10px", color: "#6b7280" }}>{p.model || "Ref: N/A"}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: "20px 40px" }}>
                                            <div style={{ display: "flex", gap: "6px" }}>
                                                <span style={{ fontSize: "8px", textTransform: "uppercase", padding: "3px 8px", borderRadius: "4px", background: "rgba(255,255,255,0.05)", color: "#9ca3af", fontWeight: "bold" }}>{p.category}</span>
                                                {p.mode && p.mode !== "new" && (
                                                    <span style={{ fontSize: "8px", textTransform: "uppercase", padding: "3px 8px", borderRadius: "4px", background: "rgba(201,168,76,0.1)", color: "#C9A84C", fontWeight: "bold" }}>{p.mode}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td style={{ padding: "20px 40px" }}>
                                            <p style={{ color: "#C9A84C", fontWeight: "bold", fontSize: "14px" }}>Rs. {p.price?.toLocaleString()}</p>
                                        </td>
                                        <td style={{ padding: "20px 40px", textAlign: "right" }}>
                                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                                                <Link href={`/admin/products/${p.id}`}>
                                                    <Button variant="ghost" style={{ width: "36px", height: "36px", padding: "0", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }} className="hover:text-gold">
                                                        <Edit size={14} />
                                                    </Button>
                                                </Link>
                                                <Button 
                                                    onClick={() => handleDelete(p.id)}
                                                    variant="ghost" 
                                                    style={{ width: "36px", height: "36px", padding: "0", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }} 
                                                    className="hover:text-red-500"
                                                >
                                                    <Trash2 size={14} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {products.length === 0 && !loading && (
                            <div style={{ padding: "60px", textAlign: "center", color: "#6b7280", fontSize: "13px" }}>No pieces found in the vault.</div>
                        )}
                        {loading && <div style={{ padding: "60px", textAlign: "center", color: "#6b7280", fontSize: "13px" }}>Connecting to vault...</div>}
                    </div>
                </Card>
            </div>
        </div>
    );
}
