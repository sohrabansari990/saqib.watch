"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft, Save, Tag, Sparkles, Clock, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const PRESET_OFFERS = [
    { name: "Eid Sale", emoji: "🌙" },
    { name: "Summer Sale", emoji: "☀️" },
    { name: "Winter Sale", emoji: "❄️" },
    { name: "Black Friday", emoji: "🖤" },
    { name: "New Year Sale", emoji: "🎆" },
    { name: "Flash Sale", emoji: "⚡" },
    { name: "Clearance", emoji: "🏷️" },
    { name: "Custom", emoji: "✏️" },
];

const CATEGORIES = ["Men", "Women", "Unisex", "Luxury", "Sport", "Classic"];

export default function AdminSalePage() {
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [form, setForm] = useState({
        active: false,
        name: "Summer Sale",
        discount: 30,
        endDate: "",
        category: "Men",
        customCategory: "",
    });

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 1024);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    useEffect(() => {
        const load = async () => {
            try {
                const snap = await getDoc(doc(db, "settings", "sale"));
                if (snap.exists()) {
                    const data = snap.data();
                    setForm({
                        active: data.active ?? false,
                        name: data.name ?? "Summer Sale",
                        discount: data.discount ?? 30,
                        endDate: data.endDate ?? "",
                        category: CATEGORIES.includes(data.category) ? data.category : "Men",
                        customCategory: CATEGORIES.includes(data.category) ? "" : (data.category ?? ""),
                    });
                }
            } catch (e) { console.error(e); } finally { setLoading(false); }
        };
        load();
    }, []);

    const handleSave = async () => {
        if (!form.name.trim()) return toast.error("Enter offer name.");
        if (!form.discount || form.discount < 1 || form.discount > 99) return toast.error("Discount 1–99%.");
        if (!form.endDate) return toast.error("Set end date.");

        setSaving(true);
        try {
            await setDoc(doc(db, "settings", "sale"), {
                active: form.active,
                name: form.name.trim(),
                discount: Number(form.discount),
                endDate: form.endDate,
                category: form.customCategory.trim() || form.category,
            });
            toast.success("Broadcast updated!");
        } catch (e) { toast.error("Failed to save."); } finally { setSaving(false); }
    };

    if (loading) return <div className="min-h-screen text-white flex items-center justify-center">Loading Settings...</div>;

    return (
        <div className="min-h-screen text-white" style={{ background: "linear-gradient(135deg, #0b0b0f 0%, #0f0f14 50%, #0f0a06 100%)" }}>
            <div style={{ maxWidth: "1000px", margin: "0 auto", padding: isMobile ? "40px 20px" : "60px 40px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "40px" }}>
                    <Link href="/admin">
                        <Button variant="ghost" style={{ padding: "0", color: "#6b7280", borderRadius: "50%", width: "40px", height: "40px", border: "1px solid rgba(255,255,255,0.05)" }} className="hover:bg-white/5 hover:text-white">
                            <ArrowLeft size={20} />
                        </Button>
                    </Link>
                    <div>
                        <p style={{ fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.3em", color: "rgba(201,168,76,0.8)", marginBottom: "4px", fontWeight: "bold" }}>Marketing</p>
                        <h1 style={{ fontSize: isMobile ? "28px" : "40px", fontFamily: "serif", fontWeight: "300" }}>Broadcast Banner</h1>
                    </div>
                </div>

                <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: "32px", alignItems: "start" }}>
                    <div style={{ flex: 1, width: "100%", display: "flex", flexDirection: "column", gap: "32px" }}>
                        <Card style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", padding: isMobile ? "24px" : "40px", borderRadius: "24px" }}>
                            <div style={{ marginBottom: "32px" }}>
                                <label style={{ fontSize: "10px", textTransform: "uppercase", color: "#6b7280", marginBottom: "16px", display: "block" }}>Select Campaign Type</label>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                                    {PRESET_OFFERS.map((o) => (
                                        <button
                                            key={o.name}
                                            onClick={() => setForm(f => ({ ...f, name: o.name === "Custom" ? f.name : o.name }))}
                                            style={{
                                                padding: "8px 16px",
                                                borderRadius: "12px",
                                                border: form.name === o.name ? "1px solid #C9A84C" : "1px solid rgba(255,255,255,0.1)",
                                                background: form.name === o.name ? "rgba(201,168,110,0.1)" : "rgba(255,255,255,0.02)",
                                                color: form.name === o.name ? "#C9A84C" : "#9ca3af",
                                                fontSize: "12px",
                                                cursor: "pointer",
                                            }}
                                        >
                                            {o.emoji} {o.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                                <div>
                                    <label style={{ fontSize: "10px", textTransform: "uppercase", color: "#6b7280", marginBottom: "12px", display: "block" }}>Display Name</label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                        style={{ width: "100%", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", height: "50px", padding: "0 16px", color: "white", outline: "none" }}
                                    />
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "24px" }}>
                                    <div>
                                        <label style={{ fontSize: "10px", textTransform: "uppercase", color: "#6b7280", marginBottom: "12px", display: "block" }}>Discount (%)</label>
                                        <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", height: "50px", padding: "0 16px" }}>
                                            <input
                                                type="range"
                                                min={1}
                                                max={99}
                                                value={form.discount}
                                                onChange={e => setForm(f => ({ ...f, discount: Number(e.target.value) }))}
                                                style={{ flex: 1, accentColor: "#C9A84C" }}
                                            />
                                            <span style={{ fontWeight: "bold", color: "#C9A84C", fontSize: "13px" }}>{form.discount}%</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: "10px", textTransform: "uppercase", color: "#6b7280", marginBottom: "12px", display: "block" }}>Ends At</label>
                                        <input
                                            type="datetime-local"
                                            value={form.endDate}
                                            onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                                            style={{ width: "100%", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", height: "50px", padding: "0 16px", color: "white", colorScheme: "dark" }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Preview */}
                        <div style={{ padding: "24px", borderRadius: "20px", border: "1px dashed rgba(201,168,76,0.3)", background: "rgba(201,168,76,0.02)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                                <Sparkles size={14} style={{ color: "#C9A84C" }} />
                                <span style={{ fontSize: "9px", textTransform: "uppercase", color: "#C9A84C", fontWeight: "bold" }}>Live Preview</span>
                            </div>
                            <div style={{
                                borderRadius: "10px",
                                overflow: "hidden",
                                height: isMobile ? "auto" : "40px",
                                minHeight: "40px",
                                padding: isMobile ? "12px" : "0",
                                background: "linear-gradient(90deg, #000 0%, #C9A84C 35%, #C9A84C 65%, #000 100%)",
                                display: "flex",
                                flexDirection: isMobile ? "column" : "row",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "12px",
                            }}>
                                <span style={{ color: "black", fontWeight: "900", fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.2em" }}>{form.name}</span>
                                <div style={{ background: "rgba(0,0,0,0.2)", padding: "4px 8px", borderRadius: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                                    <Clock size={10} color="white" />
                                    <span style={{ color: "white", fontSize: "8px", fontWeight: "bold" }}>02D : 14H : 55M</span>
                                </div>
                                <span style={{ background: "#ef4444", color: "white", fontSize: "8px", fontWeight: "900", padding: "3px 10px", borderRadius: "12px" }}>UPTO {form.discount}% OFF</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ width: isMobile ? "100%" : "300px", display: "flex", flexDirection: "column", gap: "32px", position: isMobile ? "static" : "sticky", top: "40px" }}>
                        <Card style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", padding: "24px", borderRadius: "20px" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px", background: "rgba(0,0,0,0.2)", borderRadius: "12px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                        <Globe size={16} style={{ color: form.active ? "#22c55e" : "#6b7280" }} />
                                        <span style={{ fontSize: "11px", fontWeight: "bold" }}>PUBLIC</span>
                                    </div>
                                    <button
                                        onClick={() => setForm(f => ({ ...f, active: !f.active }))}
                                        style={{ width: "40px", height: "20px", borderRadius: "10px", background: form.active ? "#C9A84C" : "#374151", position: "relative", border: "none", cursor: "pointer" }}
                                    >
                                        <div style={{ position: "absolute", top: "2px", left: form.active ? "22px" : "2px", width: "16px", height: "16px", borderRadius: "50%", background: "white", transition: "all 0.2s" }} />
                                    </button>
                                </div>

                                <div>
                                    <label style={{ fontSize: "9px", textTransform: "uppercase", color: "#6b7280", marginBottom: "10px", display: "block" }}>Target Path</label>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "10px" }}>
                                        {CATEGORIES.map(c => (
                                            <button key={c} onClick={() => setForm(f => ({ ...f, category: c, customCategory: "" }))} style={{ fontSize: "9px", padding: "4px 10px", borderRadius: "6px", border: form.category === c && !form.customCategory ? "1px solid #C9A84C" : "1px solid rgba(255,255,255,0.1)", background: form.category === c && !form.customCategory ? "rgba(201,168,76,0.1)" : "transparent", color: form.category === c && !form.customCategory ? "white" : "#6b7280", cursor: "pointer" }}>{c}</button>
                                        ))}
                                    </div>
                                    <input
                                        type="text"
                                        value={form.customCategory}
                                        onChange={e => setForm(f => ({ ...f, customCategory: e.target.value }))}
                                        placeholder="Or Custom..."
                                        style={{ width: "100%", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", height: "40px", padding: "0 12px", fontSize: "12px", color: "white" }}
                                    />
                                </div>

                                <Button onClick={handleSave} disabled={saving} style={{ height: "56px", background: "#C9A84C", color: "black", borderRadius: "14px", fontWeight: "900", letterSpacing: "0.1em", fontSize: "11px", gap: "8px" }}>
                                    <Save size={16} /> {saving ? "UPDATING..." : "COMMIT"}
                                </Button>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
