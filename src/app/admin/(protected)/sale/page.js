"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft, Save, Tag } from "lucide-react";

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
    const [form, setForm] = useState({
        active: false,
        name: "Summer Sale",
        discount: 30,
        endDate: "",
        category: "Men",
        customCategory: "",
    });

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
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleSave = async () => {
        if (!form.name.trim()) return toast.error("Please enter an offer name.");
        if (!form.discount || form.discount < 1 || form.discount > 99) return toast.error("Discount must be between 1–99%.");
        if (!form.endDate) return toast.error("Please set an end date for the offer.");

        setSaving(true);
        try {
            await setDoc(doc(db, "settings", "sale"), {
                active: form.active,
                name: form.name.trim(),
                discount: Number(form.discount),
                endDate: form.endDate,
                category: form.customCategory.trim() || form.category,
            });
            toast.success("Sale banner updated!");
        } catch (e) {
            console.error(e);
            toast.error("Failed to save settings.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0b0b0f] flex items-center justify-center text-white">
                Loading...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0b0b0f] via-[#0f0f14] to-[#0f0a06] text-white">
            <div className="max-w-2xl mx-auto px-6 py-12">
                {/* Header */}
                <div className="flex items-center gap-4 mb-10">
                    <Link href="/admin" className="text-gray-400 hover:text-gold transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <p className="text-xs uppercase tracking-[0.35em] text-gold/80 mb-1">Admin</p>
                        <h1 className="text-3xl font-serif">Sale Banner Settings</h1>
                    </div>
                </div>

                <div className="space-y-8 bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl shadow-black/40">
                    {/* Active Toggle */}
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-semibold text-white">Enable Sale Banner</p>
                            <p className="text-xs text-gray-400 mt-1">Show the announcement banner on the storefront</p>
                        </div>
                        <button
                            onClick={() => setForm(f => ({ ...f, active: !f.active }))}
                            style={{
                                width: "52px",
                                height: "28px",
                                borderRadius: "14px",
                                background: form.active ? "#c9a96e" : "#374151",
                                position: "relative",
                                transition: "background 0.3s",
                                border: "none",
                                cursor: "pointer",
                                flexShrink: 0,
                            }}
                        >
                            <span style={{
                                position: "absolute",
                                top: "3px",
                                left: form.active ? "27px" : "3px",
                                width: "22px",
                                height: "22px",
                                borderRadius: "50%",
                                background: "#fff",
                                transition: "left 0.3s",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                            }} />
                        </button>
                    </div>

                    <hr style={{ borderColor: "rgba(255,255,255,0.08)" }} />

                    {/* Preset Offers */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">Offer Type</label>
                        <div className="flex flex-wrap gap-2">
                            {PRESET_OFFERS.map((o) => (
                                <button
                                    key={o.name}
                                    onClick={() => setForm(f => ({ ...f, name: o.name === "Custom" ? f.name : o.name }))}
                                    style={{
                                        padding: "6px 14px",
                                        borderRadius: "20px",
                                        border: form.name === o.name
                                            ? "1px solid #c9a96e"
                                            : "1px solid rgba(255,255,255,0.15)",
                                        background: form.name === o.name ? "rgba(201,169,110,0.2)" : "transparent",
                                        color: form.name === o.name ? "#c9a96e" : "#9ca3af",
                                        fontSize: "13px",
                                        cursor: "pointer",
                                        transition: "all 0.2s",
                                    }}
                                >
                                    {o.emoji} {o.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Offer Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Offer Name</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                            placeholder="e.g. Eid Sale"
                            style={{
                                width: "100%",
                                background: "rgba(255,255,255,0.05)",
                                border: "1px solid rgba(255,255,255,0.15)",
                                borderRadius: "10px",
                                padding: "10px 14px",
                                color: "#fff",
                                fontSize: "14px",
                                outline: "none",
                            }}
                        />
                    </div>

                    {/* Discount */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Discount Percentage — <span className="text-gold font-bold">{form.discount}%</span>
                        </label>
                        <div className="flex items-center gap-4">
                            <input
                                type="range"
                                min={1}
                                max={99}
                                value={form.discount}
                                onChange={e => setForm(f => ({ ...f, discount: Number(e.target.value) }))}
                                style={{ flex: 1, accentColor: "#c9a96e" }}
                            />
                            <input
                                type="number"
                                min={1}
                                max={99}
                                value={form.discount}
                                onChange={e => setForm(f => ({ ...f, discount: Number(e.target.value) }))}
                                style={{
                                    width: "70px",
                                    background: "rgba(255,255,255,0.05)",
                                    border: "1px solid rgba(255,255,255,0.15)",
                                    borderRadius: "8px",
                                    padding: "8px 10px",
                                    color: "#c9a96e",
                                    fontWeight: "bold",
                                    fontSize: "14px",
                                    outline: "none",
                                    textAlign: "center",
                                }}
                            />
                            <span className="text-gray-400 text-sm">%</span>
                        </div>
                    </div>

                    {/* End Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Sale End Date & Time</label>
                        <input
                            type="datetime-local"
                            value={form.endDate}
                            onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                            style={{
                                width: "100%",
                                background: "rgba(255,255,255,0.05)",
                                border: "1px solid rgba(255,255,255,0.15)",
                                borderRadius: "10px",
                                padding: "10px 14px",
                                color: "#fff",
                                fontSize: "14px",
                                outline: "none",
                                colorScheme: "dark",
                            }}
                        />
                        <p className="text-xs text-gray-500 mt-1">The countdown timer stops and banner hides when this time is reached.</p>
                    </div>

                    {/* Gallery Category */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Link to Gallery Category <span className="text-gray-500">(for "Shop Now" redirect)</span>
                        </label>
                        <div className="flex flex-wrap gap-2 mb-3">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setForm(f => ({ ...f, category: cat, customCategory: "" }))}
                                    style={{
                                        padding: "6px 14px",
                                        borderRadius: "20px",
                                        border: form.category === cat && !form.customCategory
                                            ? "1px solid #c9a96e"
                                            : "1px solid rgba(255,255,255,0.15)",
                                        background: form.category === cat && !form.customCategory
                                            ? "rgba(201,169,110,0.2)"
                                            : "transparent",
                                        color: form.category === cat && !form.customCategory ? "#c9a96e" : "#9ca3af",
                                        fontSize: "13px",
                                        cursor: "pointer",
                                        transition: "all 0.2s",
                                    }}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                        <input
                            type="text"
                            value={form.customCategory}
                            onChange={e => setForm(f => ({ ...f, customCategory: e.target.value }))}
                            placeholder="Or type a custom category..."
                            style={{
                                width: "100%",
                                background: "rgba(255,255,255,0.05)",
                                border: "1px solid rgba(255,255,255,0.15)",
                                borderRadius: "10px",
                                padding: "10px 14px",
                                color: "#fff",
                                fontSize: "14px",
                                outline: "none",
                            }}
                        />
                    </div>

                    {/* Preview */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Preview</label>
                        <div style={{
                            borderRadius: "10px",
                            overflow: "hidden",
                            border: "1px solid rgba(255,255,255,0.1)",
                            height: "40px",
                            background: "linear-gradient(90deg, #1a1000 0%, #c9a96e 30%, #c9a96e 70%, #1a1000 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "12px",
                            position: "relative",
                            padding: "0 40px",
                        }}>
                            <span style={{ color: "#000", fontWeight: "bold", fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase" }}>
                                {form.name || "Sale Name"}
                            </span>
                            <span style={{ background: "rgba(0,0,0,0.3)", color: "#fff", fontSize: "10px", fontWeight: "bold", borderRadius: "4px", padding: "2px 6px" }}>
                                00D 00H 00M 00S
                            </span>
                            <span style={{ background: "#DC2626", color: "#fff", fontWeight: "bold", fontSize: "11px", borderRadius: "20px", padding: "2px 12px" }}>
                                Upto {form.discount || 0}% Off
                            </span>
                            <span style={{ color: "#000", fontWeight: "bold", fontSize: "11px", textDecoration: "underline" }}>Shop Now →</span>
                        </div>
                    </div>

                    {/* Save */}
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        style={{
                            width: "100%",
                            background: saving ? "#8a7040" : "#c9a96e",
                            color: "#000",
                            fontWeight: "bold",
                            fontSize: "14px",
                            padding: "14px",
                            borderRadius: "12px",
                            border: "none",
                            cursor: saving ? "not-allowed" : "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            transition: "background 0.2s",
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                        }}
                    >
                        <Save size={16} />
                        {saving ? "Saving..." : "Save Sale Settings"}
                    </button>
                </div>
            </div>
        </div>
    );
}
