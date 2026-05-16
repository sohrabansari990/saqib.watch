"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc, serverTimestamp, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { uploadToVPS } from "@/lib/vpsUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Upload, X, ArrowLeft, Plus, Palette, Sparkles, Trash2, Square, RectangleVertical } from "lucide-react";
import Link from "next/link";
import { IMAGE_FRAME_OPTIONS } from "@/lib/imageFrame";

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

export default function AddProductPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [existingCategories, setExistingCategories] = useState([]);
    const [customCategory, setCustomCategory] = useState("");
    const [showCustomCategory, setShowCustomCategory] = useState(false);
    const [activeSaleName, setActiveSaleName] = useState("");

    // Responsive track
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
        imageAspect: "auto",
        soldOut: false,
        ratingPercentage: "95", // Default
    });

    useEffect(() => {
        const fetchData = async () => {
            const snapshot = await getDocs(collection(db, "products"));
            const cats = new Set();
            snapshot.docs.forEach((doc) => {
                const cat = doc.data().category;
                if (cat) cats.add(cat);
            });
            setExistingCategories([...cats].sort());

            // Fetch active sale name
            const saleSnap = await getDoc(doc(db, "settings", "sale"));
            if (saleSnap.exists() && saleSnap.data().active) {
                setActiveSaleName(saleSnap.data().name);
            }
        };
        fetchData();
    }, []);

    const allCategories = [...new Set([...existingCategories, "men", "women", "couples"])].sort();

    const uploadToVPSFile = async (file) => {
        return await uploadToVPS(file);
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
        setVariants(prev => [...prev, { color: preset.name, hex: preset.hex, available: true, files: [], previews: [] }]);
        setShowCustomColorForm(false);
    };

    const handleAddCustomColor = () => {
        if (!customColor.name) return toast.error("Enter color name");
        addVariant(customColor);
        setCustomColor({ name: "", hex: "#000000" });
    };

    const removeVariant = (index) => setVariants(prev => prev.filter((_, i) => i !== index));

    const toggleVariantAvailability = (index) => {
        setVariants(prev => prev.map((variant, i) => i === index ? { ...variant, available: variant.available === false } : variant));
    };

    const handleVariantImageAdd = (vIdx, e) => {
        const files = Array.from(e.target.files);
        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => setVariants(prev => prev.map((v, i) => i === vIdx ? { ...v, files: [...v.files, file], previews: [...v.previews, reader.result] } : v));
            reader.readAsDataURL(file);
        });
        e.target.value = "";
    };

    const removeVariantImage = (vIdx, iIdx) => {
        setVariants(prev => prev.map((v, i) => i === vIdx ? { ...v, files: v.files.filter((_, j) => j !== iIdx), previews: v.previews.filter((_, j) => j !== iIdx) } : v));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const category = showCustomCategory ? customCategory.trim().toLowerCase() : formData.category;
        if (!category) return toast.error("Select category");

        setLoading(true);
        try {
            let imageUrl = "";
            let images = [];
            let variantsData = [];

            if (variants.length > 0) {
                for (const variant of variants) {
                    const urls = [];
                    for (const file of variant.files) urls.push(await uploadToVPSFile(file));
                    variantsData.push({ color: variant.color, hex: variant.hex, images: urls, available: variant.available !== false });
                }
                imageUrl = variantsData[0].images[0];
                images = variantsData.flatMap(v => v.images);
            } else {
                for (const img of generalImages) images.push(await uploadToVPSFile(img.file));
                imageUrl = images[0] || "";
            }

            await addDoc(collection(db, "products"), {
                ...formData,
                category,
                price: parseFloat(formData.price),
                discount: formData.discount ? parseFloat(formData.discount) : 0,
                imageAspect: formData.imageAspect || "auto",
                soldOut: formData.soldOut,
                ratingPercentage: formData.ratingPercentage ? parseFloat(formData.ratingPercentage) : 0,
                imageUrl,
                images,
                variants: variantsData,
                createdAt: serverTimestamp(),
            });

            toast.success("Piece added to vault");
            router.push("/admin");
        } catch (error) {
            console.error(error);
            toast.error("Failed to save");
        } finally {
            setLoading(false);
        }
    };

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
                        <p style={{ fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.3em", color: "rgba(201,168,76,0.8)", marginBottom: "4px", fontWeight: "bold" }}>Addition</p>
                        <h1 style={{ fontSize: isMobile ? "28px" : "40px", fontFamily: "serif", fontWeight: "300" }}>Curate New Piece</h1>
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

                            {showCustomColorForm && (
                                <div style={{ background: "rgba(0,0,0,0.2)", padding: "20px", borderRadius: "16px", marginBottom: "24px", display: "flex", gap: "12px", alignItems: "end" }}>
                                    <div style={{ flex: 1 }}><Input value={customColor.name} onChange={(e) => setCustomColor({...customColor, name: e.target.value})} placeholder="Color Name" style={{ height: "40px" }} /></div>
                                    <div><input type="color" value={customColor.hex} onChange={(e) => setCustomColor({...customColor, hex: e.target.value})} style={{ width: "40px", height: "40px", background: "none", border: "none", cursor: "pointer" }} /></div>
                                    <Button type="button" onClick={handleAddCustomColor} style={{ background: "#C9A84C", color: "black", height: "40px" }}>Add</Button>
                                </div>
                            )}

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
                                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                <label style={{ display: "flex", alignItems: "center", gap: "6px", color: "#9ca3af", fontSize: "10px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                                                    <input type="checkbox" checked={v.available !== false} onChange={() => toggleVariantAvailability(vIdx)} />
                                                    Available
                                                </label>
                                                <button type="button" onClick={() => removeVariant(vIdx)} style={{ color: "#ef4444", opacity: 0.6 }} className="hover:opacity-100"><Trash2 size={16} /></button>
                                            </div>
                                        </div>
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                                            {v.previews.map((p, pIdx) => (
                                                <div key={pIdx} style={{ width: "70px", height: "70px", borderRadius: "10px", overflow: "hidden", position: "relative" }}>
                                                    <img src={p} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                                                    <button type="button" onClick={() => removeVariantImage(vIdx, pIdx)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0 }} className="hover:opacity-100"><X size={14} /></button>
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
                                            {activeSaleName && <option value={activeSaleName.toLowerCase()}>{activeSaleName.toUpperCase()}</option>}
                                        </select>
                                        <Input type="number" value={formData.discount} onChange={(e) => setFormData({ ...formData, discount: e.target.value })} placeholder="D. %" style={{ borderRadius: "10px" }} />
                                    </div>
                                </div>
                                <div>
                                    <Label style={{ fontSize: "9px", textTransform: "uppercase", color: "#6b7280", marginBottom: "10px", display: "block" }}>Image Frame</Label>
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "8px" }}>
                                        {IMAGE_FRAME_OPTIONS.map((option) => {
                                            const Icon = option.value === "portrait" ? RectangleVertical : option.value === "square" ? Square : Sparkles;
                                            const isSelected = formData.imageAspect === option.value;
                                            return (
                                                <button
                                                    key={option.value}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, imageAspect: option.value })}
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        gap: "6px",
                                                        minHeight: "42px",
                                                        borderRadius: "10px",
                                                        border: isSelected ? "1px solid #C9A84C" : "1px solid rgba(255,255,255,0.1)",
                                                        background: isSelected ? "rgba(201,168,76,0.16)" : "rgba(0,0,0,0.25)",
                                                        color: isSelected ? "#C9A84C" : "#d1d5db",
                                                        fontSize: "10px",
                                                        fontWeight: 800,
                                                        textTransform: "uppercase",
                                                        letterSpacing: "0.08em",
                                                    }}
                                                >
                                                    <Icon size={13} />
                                                    {option.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div>
                                    <Label style={{ fontSize: "9px", textTransform: "uppercase", color: "#6b7280", marginBottom: "10px", display: "block" }}>Customer Reviews (%)</Label>
                                    <Input type="number" min="0" max="100" value={formData.ratingPercentage} onChange={(e) => setFormData({ ...formData, ratingPercentage: e.target.value })} placeholder="e.g. 95 for 4.75 stars" style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px" }} />
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "16px", background: "rgba(0,0,0,0.2)", borderRadius: "12px" }}>
                                    <input type="checkbox" checked={formData.soldOut} onChange={(e) => setFormData({...formData, soldOut: e.target.checked})} id="soldOut" />
                                    <Label htmlFor="soldOut" style={{ fontSize: "11px", fontWeight: "bold" }}>MARK SOLD OUT</Label>
                                </div>
                            </div>
                        </Card>

                        {variants.length === 0 && (
                            <Card style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", padding: "24px", borderRadius: "24px" }}>
                                <h3 style={{ fontSize: "15px", marginBottom: "16px" }}>Visual Assets</h3>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                                    {generalImages.map((img, idx) => (
                                        <div key={idx} style={{ width: "70px", height: "70px", borderRadius: "10px", overflow: "hidden", border: idx === 0 ? "2px solid #C9A84C" : "1px solid rgba(255,255,255,0.1)", position: "relative" }}>
                                            <img src={img.preview} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                                            <button type="button" onClick={() => removeGeneralImage(idx)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0 }} className="hover:opacity-100"><X size={14} /></button>
                                        </div>
                                    ))}
                                    <label style={{ width: "70px", height: "70px", borderRadius: "10px", border: "2px dashed rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Upload size={20} style={{ color: "#6b7280" }} /><input type="file" className="hidden" multiple accept="image/*" onChange={handleGeneralImageAdd} /></label>
                                </div>
                            </Card>
                        )}

                        <Button type="submit" disabled={loading} style={{ width: "100%", height: "64px", background: "#C9A84C", color: "black", borderRadius: "16px", fontWeight: "900", letterSpacing: "0.2em", fontSize: "11px" }}>
                            {loading ? "INITIALIZING VAULT..." : "COMMIT TO CATALOG"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
