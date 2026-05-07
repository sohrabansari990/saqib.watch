"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, getDocs, updateDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Upload, X, ArrowLeft, Plus, Trash2, Palette } from "lucide-react";
import Link from "next/link";
import { use } from "react";

const COLOR_PRESETS = [
    { name: "Gold", hex: "#D4AF37" },
    { name: "Silver", hex: "#C0C0C0" },
    { name: "Gold + Silver", hex: "linear-gradient(45deg, #D4AF37 50%, #C0C0C0 50%)" },
    { name: "Black", hex: "#000000" },
    { name: "Black + Silver", hex: "linear-gradient(45deg, #000000 50%, #C0C0C0 50%)" },
    { name: "Black + Gold", hex: "linear-gradient(45deg, #000000 50%, #D4AF37 50%)" },
    { name: "Rose Gold", hex: "#B76E79" },
    { name: "Blue", hex: "#2563EB" },
    { name: "Green", hex: "#16A34A" },
    { name: "Red", hex: "#DC2626" },
    { name: "White", hex: "#FFFFFF" },
    { name: "Navy", hex: "#001F3F" },
];

export default function EditProductPage({ params }) {
    const { id } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [existingCategories, setExistingCategories] = useState([]);
    const [customCategory, setCustomCategory] = useState("");
    const [showCustomCategory, setShowCustomCategory] = useState(false);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 1024);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    const [variants, setVariants] = useState([]);
    const [generalImages, setGeneralImages] = useState([]);

    const [showCustomColorForm, setShowCustomColorForm] = useState(false);
    const [customColor, setCustomColor] = useState({ name: "", hex: "#000000" });

    const [formData, setFormData] = useState({
        name: "",
        model: "",
        category: "",
        price: "",
        discount: "",
        description: "",
        mode: "new",
        soldOut: false,
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const snapshot = await getDocs(collection(db, "products"));
                const cats = new Set();
                snapshot.docs.forEach((d) => {
                    const cat = d.data().category;
                    if (cat) cats.add(cat);
                });
                setExistingCategories([...cats].sort());

                const docSnap = await getDoc(doc(db, "products", id));
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setFormData({
                        name: data.name || "",
                        model: data.model || "",
                        category: data.category || "",
                        price: data.price?.toString() || "",
                        discount: data.discount?.toString() || "",
                        description: data.description || "",
                        mode: data.mode || "new",
                        soldOut: data.soldOut || false,
                    });

                    if (data.variants && data.variants.length > 0) {
                        setVariants(data.variants.map(v => ({
                            color: v.color,
                            hex: v.hex,
                            existingUrls: v.images || [],
                            newFiles: [],
                            newPreviews: []
                        })));
                    } else if (data.images && data.images.length > 0) {
                        setGeneralImages(data.images.map(url => ({ url, preview: url })));
                    }
                }
            } catch (error) { console.error(error); } finally { setLoading(false); }
        };
        if (id) fetchData();
    }, [id]);

    const allCategories = [...new Set([...existingCategories, "men", "women", "couples"])].sort();

    const uploadToSupabase = async (file) => {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { error } = await supabase.storage.from("products").upload(fileName, file);
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage.from("products").getPublicUrl(fileName);
        return publicUrl;
    };

    const handleGeneralImageAdd = (e) => {
        const files = Array.from(e.target.files);
        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => setGeneralImages(prev => [...prev, { file, preview: reader.result }]);
            reader.readAsDataURL(file);
        });
        e.target.value = "";
    };

    const removeGeneralImage = (index) => setGeneralImages(prev => prev.filter((_, i) => i !== index));

    const addVariant = (preset) => {
        if (variants.find(v => v.color === preset.name)) return toast.error("Already added");
        setVariants(prev => [...prev, { color: preset.name, hex: preset.hex, existingUrls: [], newFiles: [], newPreviews: [] }]);
        setShowCustomColorForm(false);
    };

    const handleAddCustomColor = () => {
        if (!customColor.name) return toast.error("Enter color name");
        addVariant(customColor);
        setCustomColor({ name: "", hex: "#000000" });
    };

    const removeVariant = (index) => setVariants(prev => prev.filter((_, i) => i !== index));

    const handleVariantImageAdd = (vIdx, e) => {
        const files = Array.from(e.target.files);
        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => setVariants(prev => prev.map((v, i) => i === vIdx ? { ...v, newFiles: [...v.newFiles, file], newPreviews: [...v.newPreviews, reader.result] } : v));
            reader.readAsDataURL(file);
        });
        e.target.value = "";
    };

    const removeVariantImage = (vIdx, iIdx, isNew) => {
        setVariants(prev => prev.map((v, i) => {
            if (i !== vIdx) return v;
            if (isNew) return { ...v, newFiles: v.newFiles.filter((_, j) => j !== iIdx), newPreviews: v.newPreviews.filter((_, j) => j !== iIdx) };
            return { ...v, existingUrls: v.existingUrls.filter((_, j) => j !== iIdx) };
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const category = showCustomCategory ? customCategory.trim().toLowerCase() : formData.category;
        if (!category) return toast.error("Select category");

        setSaving(true);
        try {
            let imageUrl = "";
            let images = [];
            let variantsData = [];

            if (variants.length > 0) {
                for (const variant of variants) {
                    const newUrls = [];
                    for (const file of variant.newFiles) newUrls.push(await uploadToSupabase(file));
                    const allUrls = [...variant.existingUrls, ...newUrls];
                    variantsData.push({ color: variant.color, hex: variant.hex, images: allUrls });
                }
                imageUrl = variantsData[0].images[0];
                images = variantsData.flatMap(v => v.images);
            } else {
                for (const img of generalImages) {
                    if (img.url) images.push(img.url);
                    else images.push(await uploadToSupabase(img.file));
                }
                imageUrl = images[0] || "";
            }

            await updateDoc(doc(db, "products", id), {
                ...formData,
                category,
                price: parseFloat(formData.price),
                discount: formData.discount ? parseFloat(formData.discount) : 0,
                imageUrl,
                images,
                variants: variantsData,
                updatedAt: serverTimestamp(),
            });

            toast.success("Piece updated");
            router.push("/admin");
        } catch (error) { toast.error("Failed to update"); } finally { setSaving(false); }
    };

    if (loading) return <div className="min-h-screen text-white flex items-center justify-center">Loading Piece Data...</div>;

    return (
        <div className="min-h-screen text-white" style={{ background: "linear-gradient(135deg, #0b0b0f 0%, #0f0f14 50%, #0f0a06 100%)" }}>
            <div style={{ maxWidth: "1200px", margin: "0 auto", padding: isMobile ? "40px 20px" : "60px 40px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "40px" }}>
                    <Link href="/admin">
                        <Button variant="ghost" style={{ padding: "0", color: "#6b7280", borderRadius: "50%", width: "40px", height: "40px", border: "1px solid rgba(255,255,255,0.05)" }} className="hover:bg-white/5 hover:text-white">
                            <ArrowLeft size={20} />
                        </Button>
                    </Link>
                    <div>
                        <p style={{ fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.3em", color: "rgba(201,168,76,0.8)", marginBottom: "4px", fontWeight: "bold" }}>Edit</p>
                        <h1 style={{ fontSize: isMobile ? "28px" : "40px", fontFamily: "serif", fontWeight: "300" }}>Refine Masterpiece</h1>
                    </div>
                </div>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: "32px", alignItems: "start" }}>
                    <div style={{ flex: 1, width: "100%", display: "flex", flexDirection: "column", gap: "32px" }}>
                        <Card style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", padding: isMobile ? "24px" : "40px", borderRadius: "24px" }}>
                            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "24px" }}>
                                <div style={{ gridColumn: isMobile ? "auto" : "1 / -1" }}>
                                    <Label style={{ fontSize: "10px", textTransform: "uppercase", color: "#9ca3af", marginBottom: "12px", display: "block" }}>Masterpiece Name</Label>
                                    <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)", height: "50px", borderRadius: "12px" }} />
                                </div>
                                <div>
                                    <Label style={{ fontSize: "10px", textTransform: "uppercase", color: "#9ca3af", marginBottom: "12px", display: "block" }}>Reference</Label>
                                    <Input value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} placeholder="Ref #" style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)", height: "50px", borderRadius: "12px" }} />
                                </div>
                                <div>
                                    <Label style={{ fontSize: "10px", textTransform: "uppercase", color: "#9ca3af", marginBottom: "12px", display: "block" }}>Price (PKR)</Label>
                                    <Input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)", height: "50px", borderRadius: "12px" }} />
                                </div>
                                <div style={{ gridColumn: isMobile ? "auto" : "1 / -1" }}>
                                    <Label style={{ fontSize: "10px", textTransform: "uppercase", color: "#9ca3af", marginBottom: "12px", display: "block" }}>Description</Label>
                                    <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} style={{ width: "100%", minHeight: "120px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "16px", color: "white", outline: "none", resize: "none" }} />
                                </div>
                            </div>
                        </Card>

                        <Card style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", padding: isMobile ? "24px" : "40px", borderRadius: "24px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                                <h3 style={{ fontSize: "18px", fontFamily: "serif", fontWeight: "300" }}>Edition Allocation</h3>
                                <Button type="button" onClick={() => setShowCustomColorForm(!showCustomColorForm)} variant="ghost" style={{ fontSize: "9px", color: "#C9A84C", gap: "6px" }} className="hover:bg-gold/10">
                                    <Palette size={12} /> Custom
                                </Button>
                            </div>

                            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "32px" }}>
                                {COLOR_PRESETS.map((p) => (
                                    <button key={p.name} type="button" onClick={() => addVariant(p)} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", borderRadius: "99px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", fontSize: "11px", color: "#d1d5db" }} className="hover:border-gold">
                                        <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: p.hex, border: "1px solid rgba(255,255,255,0.2)" }} /> {p.name}
                                    </button>
                                ))}
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                {variants.map((v, vIdx) => (
                                    <div key={v.color} style={{ background: "rgba(0,0,0,0.3)", padding: "20px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                <div style={{ width: "18px", height: "18px", borderRadius: "50%", background: v.hex, border: "1px solid rgba(255,255,255,0.2)" }} />
                                                <span style={{ fontWeight: "bold", fontSize: "13px" }}>{v.color}</span>
                                            </div>
                                            <button type="button" onClick={() => removeVariant(vIdx)} style={{ color: "#ef4444", opacity: 0.6 }} className="hover:opacity-100"><Trash2 size={16} /></button>
                                        </div>
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                                            {v.existingUrls.map((p, pIdx) => (
                                                <div key={`e-${pIdx}`} style={{ width: "70px", height: "70px", borderRadius: "10px", overflow: "hidden", position: "relative" }}>
                                                    <img src={p} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                                                    <button type="button" onClick={() => removeVariantImage(vIdx, pIdx, false)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0 }} className="hover:opacity-100"><X size={14} /></button>
                                                </div>
                                            ))}
                                            {v.newPreviews.map((p, pIdx) => (
                                                <div key={`n-${pIdx}`} style={{ width: "70px", height: "70px", borderRadius: "10px", overflow: "hidden", border: "1px solid #C9A84C", position: "relative" }}>
                                                    <img src={p} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                                                    <button type="button" onClick={() => removeVariantImage(vIdx, pIdx, true)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0 }} className="hover:opacity-100"><X size={14} /></button>
                                                </div>
                                            ))}
                                            <label style={{ width: "70px", height: "70px", borderRadius: "10px", border: "2px dashed rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} className="hover:border-gold/50">
                                                <Plus size={20} style={{ color: "#6b7280" }} />
                                                <input type="file" className="hidden" multiple accept="image/*" onChange={(e) => handleVariantImageAdd(vIdx, e)} />
                                            </label>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>

                    <div style={{ width: isMobile ? "100%" : "350px", display: "flex", flexDirection: "column", gap: "32px", position: isMobile ? "static" : "sticky", top: "40px" }}>
                        <Card style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", padding: "24px", borderRadius: "24px" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                                <div>
                                    <Label style={{ fontSize: "9px", textTransform: "uppercase", color: "#6b7280", marginBottom: "10px", display: "block" }}>Collection</Label>
                                    {!showCustomCategory ? (
                                        <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} style={{ width: "100%", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "12px", color: "white", outline: "none" }}>
                                            <option value="">Select Category</option>
                                            {allCategories.map(c => <option key={c} value={c} style={{ background: "#1a1a1a" }}>{c.toUpperCase()}</option>)}
                                        </select>
                                    ) : (
                                        <Input value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} placeholder="New Category" />
                                    )}
                                    <button type="button" onClick={() => setShowCustomCategory(!showCustomCategory)} style={{ fontSize: "9px", color: "#C9A84C", marginTop: "8px" }}>{showCustomCategory ? "← Cancel" : "+ Add Custom"}</button>
                                </div>
                                <div>
                                    <Label style={{ fontSize: "9px", textTransform: "uppercase", color: "#6b7280", marginBottom: "10px", display: "block" }}>Configuration</Label>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                                        <select value={formData.mode} onChange={(e) => setFormData({ ...formData, mode: e.target.value })} style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "12px", color: "white" }}>
                                            <option value="new">NEW</option>
                                            <option value="sale">SALE</option>
                                            <option value="featured">FEATURED</option>
                                        </select>
                                        <Input type="number" value={formData.discount} onChange={(e) => setFormData({ ...formData, discount: e.target.value })} placeholder="D. %" style={{ borderRadius: "10px" }} />
                                    </div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "16px", background: "rgba(0,0,0,0.2)", borderRadius: "12px" }}>
                                    <input type="checkbox" checked={formData.soldOut} onChange={(e) => setFormData({...formData, soldOut: e.target.checked})} id="soldOut" />
                                    <Label htmlFor="soldOut" style={{ fontSize: "11px", fontWeight: "bold" }}>MARK SOLD OUT</Label>
                                </div>
                            </div>
                        </Card>

                        <Button type="submit" disabled={saving} style={{ width: "100%", height: "64px", background: "#C9A84C", color: "black", borderRadius: "16px", fontWeight: "900", letterSpacing: "0.2em", fontSize: "11px" }}>
                            {saving ? "UPDATING VAULT..." : "SAVE REFINEMENTS"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
