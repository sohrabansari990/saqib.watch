"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc, getDocs, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Upload, X, ArrowLeft, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

const COLOR_PRESETS = [
    { name: "Red", hex: "#DC2626" },
    { name: "Black", hex: "#000000" },
    { name: "Green", hex: "#16A34A" },
    { name: "White", hex: "#FFFFFF" },
    { name: "Silver", hex: "#C0C0C0" },
    { name: "Gold", hex: "#D4AF37" },
    { name: "Blue", hex: "#2563EB" },
    { name: "Rose Gold", hex: "#B76E79" },
    { name: "Brown", hex: "#8B4513" },
    { name: "Black with Silver", hex: "#2F4F4F" },
    { name: "Black with Gold", hex: "#3D3D00" },
    { name: "Navy", hex: "#001F3F" },
];

export default function AddProductPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [existingCategories, setExistingCategories] = useState([]);
    const [customCategory, setCustomCategory] = useState("");
    const [showCustomCategory, setShowCustomCategory] = useState(false);

    // Variants: array of { color, hex, imageFiles: File[], imagePreviews: string[] }
    const [variants, setVariants] = useState([]);
    // General images (used when NO variants are added)
    const [generalImages, setGeneralImages] = useState([]);

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

    // Fetch existing categories from Firestore
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const snapshot = await getDocs(collection(db, "products"));
                const cats = new Set();
                snapshot.docs.forEach((d) => {
                    const cat = d.data().category;
                    if (cat) cats.add(cat);
                });
                setExistingCategories([...cats].sort());
            } catch (err) {
                console.error("Failed to load categories:", err);
            }
        };
        fetchCategories();
    }, []);

    const allCategories = [...new Set([...existingCategories, "men", "women", "couples"])].sort();

    // --- General image handlers ---
    const handleGeneralImageAdd = (e) => {
        const files = Array.from(e.target.files);
        files.forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setGeneralImages((prev) => [...prev, { file, preview: reader.result }]);
            };
            reader.readAsDataURL(file);
        });
        e.target.value = "";
    };

    const removeGeneralImage = (index) => {
        setGeneralImages((prev) => prev.filter((_, i) => i !== index));
    };

    // --- Variant handlers ---
    const addVariant = (colorPreset) => {
        if (variants.find((v) => v.color === colorPreset.name)) {
            toast.error(`${colorPreset.name} variant already added`);
            return;
        }
        setVariants((prev) => [
            ...prev,
            { color: colorPreset.name, hex: colorPreset.hex, imageFiles: [], imagePreviews: [] },
        ]);
    };

    const removeVariant = (index) => {
        setVariants((prev) => prev.filter((_, i) => i !== index));
    };

    const handleVariantImageAdd = (variantIndex, e) => {
        const files = Array.from(e.target.files);
        files.forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setVariants((prev) =>
                    prev.map((v, i) =>
                        i === variantIndex
                            ? {
                                  ...v,
                                  imageFiles: [...v.imageFiles, file],
                                  imagePreviews: [...v.imagePreviews, reader.result],
                              }
                            : v
                    )
                );
            };
            reader.readAsDataURL(file);
        });
        e.target.value = "";
    };

    const removeVariantImage = (variantIndex, imgIndex) => {
        setVariants((prev) =>
            prev.map((v, i) =>
                i === variantIndex
                    ? {
                          ...v,
                          imageFiles: v.imageFiles.filter((_, j) => j !== imgIndex),
                          imagePreviews: v.imagePreviews.filter((_, j) => j !== imgIndex),
                      }
                    : v
            )
        );
    };

    // --- Supabase upload helper ---
    const uploadToSupabase = async (file) => {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { error } = await supabase.storage.from("products").upload(fileName, file);
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage.from("products").getPublicUrl(fileName);
        return publicUrl;
    };

    // --- Submit ---
    const handleSubmit = async (e) => {
        e.preventDefault();

        const hasVariants = variants.length > 0;
        const hasGeneralImages = generalImages.length > 0;

        if (!hasVariants && !hasGeneralImages) {
            toast.error("Please upload at least one product image");
            return;
        }

        if (hasVariants) {
            const emptyVariant = variants.find((v) => v.imageFiles.length === 0);
            if (emptyVariant) {
                toast.error(`Please add at least one image for the ${emptyVariant.color} variant`);
                return;
            }
        }

        const category = showCustomCategory ? customCategory.trim().toLowerCase() : formData.category;
        if (!category) {
            toast.error("Please select or enter a category");
            return;
        }

        setLoading(true);

        try {
            let imageUrl = "";
            let images = [];
            let variantsData = [];

            if (hasVariants) {
                for (const variant of variants) {
                    const urls = [];
                    for (const file of variant.imageFiles) {
                        const url = await uploadToSupabase(file);
                        urls.push(url);
                    }
                    variantsData.push({ color: variant.color, hex: variant.hex, images: urls });
                }
                imageUrl = variantsData[0].images[0];
                images = variantsData.flatMap((v) => v.images);
            } else {
                for (const img of generalImages) {
                    const url = await uploadToSupabase(img.file);
                    images.push(url);
                }
                imageUrl = images[0];
            }

            await addDoc(collection(db, "products"), {
                name: formData.name,
                model: formData.model || "",
                category,
                price: parseFloat(formData.price),
                discount: formData.discount ? parseFloat(formData.discount) : 0,
                description: formData.description,
                mode: formData.mode,
                soldOut: formData.soldOut,
                imageUrl,
                images,
                variants: variantsData.length > 0 ? variantsData : [],
                createdAt: serverTimestamp(),
            });

            toast.success("Product created successfully");
            router.push("/admin");
        } catch (error) {
            console.error("Error adding product:", error);
            toast.error("Failed to add product");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex justify-center items-start bg-gradient-to-br from-[#0b0b0f] via-[#0f0f14] to-[#0f0a06] text-white">
            <div className="max-w-5xl md:max-w-[70%] w-full mx-auto px-6 py-14" style={{ padding: "2vw 1vw" }}>
                <div className="mb-8 flex items-center gap-4">
                    <Link href="/admin">
                        <Button variant="ghost" className="text-gray-400 hover:text-white">
                            <ArrowLeft size={20} />
                        </Button>
                    </Link>
                    <div>
                        <p className="text-xs uppercase tracking-[0.35em] text-gold/80 mb-2">Create</p>
                        <h1 className="text-3xl font-serif">Add New Product</h1>
                    </div>
                </div>

                <Card className="bg-[#121214] border border-white/10 shadow-2xl shadow-black/50 rounded-2xl" style={{ padding: "2vw 1vw" }}>
                    <CardHeader className="space-y-2">
                        <CardTitle className="text-2xl">Product Details</CardTitle>
                        <CardDescription>Upload imagery and metadata for the catalog.</CardDescription>
                    </CardHeader>
                    <CardContent style={{ padding: "2vw 1vw" }}>
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* --- Basic Info --- */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Product Name *</Label>
                                    <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Rollie Date Just Watch" required style={{ padding: "1vw" }} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="model">Model Number</Label>
                                    <Input id="model" value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} placeholder="e.g. RLX-3499" style={{ padding: "1vw" }} />
                                    <p className="text-xs text-gray-500">Displayed on the product page.</p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="price">Price (PKR) *</Label>
                                    <Input id="price" type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} placeholder="e.g. 5000" required style={{ padding: "1vw" }} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="discount">Discount (%)</Label>
                                    <Input id="discount" type="number" value={formData.discount} onChange={(e) => setFormData({ ...formData, discount: e.target.value })} placeholder="e.g. 20" min="0" max="100" style={{ padding: "1vw" }} />
                                    <p className="text-xs text-gray-500">Leave empty if no discount.</p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="category">Category *</Label>
                                    {!showCustomCategory ? (
                                        <div className="space-y-2">
                                            <div className="relative">
                                                <select id="category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="flex h-10 w-full rounded-md border border-white/10 bg-dark-card px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold appearance-none cursor-pointer capitalize" style={{ padding: "0vw 1vw" }}>
                                                    <option value="" disabled>Select Category</option>
                                                    {allCategories.map((cat) => (
                                                        <option key={cat} value={cat} className="capitalize">{cat}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">▼</div>
                                            </div>
                                            <button type="button" onClick={() => setShowCustomCategory(true)} className="text-xs text-gold hover:text-gold-light transition-colors">
                                                + Add new category
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <Input value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} placeholder="Type new category name" style={{ padding: "1vw" }} />
                                            <button type="button" onClick={() => { setShowCustomCategory(false); setCustomCategory(""); }} className="text-xs text-gray-400 hover:text-white transition-colors">
                                                ← Back to existing categories
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="mode">Badge / Mode</Label>
                                    <div className="relative">
                                        <select id="mode" value={formData.mode} onChange={(e) => setFormData({ ...formData, mode: e.target.value })} className="flex h-10 w-full rounded-md border border-white/10 bg-dark-card px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold appearance-none cursor-pointer" style={{ padding: "0vw 1vw" }}>
                                            <option value="new">New</option>
                                            <option value="sale">Sale</option>
                                            <option value="featured">Featured</option>
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">▼</div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="soldOut" className="flex items-center gap-2 cursor-pointer h-full pt-6">
                                        <input
                                            type="checkbox"
                                            id="soldOut"
                                            checked={formData.soldOut}
                                            onChange={(e) => setFormData({ ...formData, soldOut: e.target.checked })}
                                            className="w-4 h-4 text-gold border-white/10 rounded focus:ring-gold bg-dark-card"
                                        />
                                        Mark as Sold Out
                                    </Label>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="description">Description (Optional)</Label>
                                    <textarea id="description" className="flex min-h-[100px] w-full rounded-md border border-white/10 bg-dark-card px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Product details..." style={{ padding: "1vw" }} />
                                </div>
                            </div>

                            {/* --- Color Variants Section --- */}
                            <div className="space-y-4 border-t border-white/10 pt-8">
                                <div>
                                    <h3 className="text-lg font-serif text-white mb-1">Color Variants</h3>
                                    <p className="text-xs text-gray-500">Add color variants with separate images for each. If you don&apos;t need color variants, skip this and add general images below.</p>
                                </div>

                                <div className="space-y-2">
                                    <Label>Select Colors to Add</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {COLOR_PRESETS.map((preset) => {
                                            const isAdded = variants.some((v) => v.color === preset.name);
                                            return (
                                                <button key={preset.name} type="button" onClick={() => !isAdded && addVariant(preset)} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs transition-all ${isAdded ? "border-gold/50 bg-gold/10 text-gold cursor-default" : "border-white/10 text-gray-300 hover:border-gold hover:text-gold cursor-pointer"}`}>
                                                    <span className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0" style={{ backgroundColor: preset.hex }} />
                                                    {preset.name}
                                                    {isAdded && <span className="text-gold">✓</span>}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {variants.length > 0 && (
                                    <div className="space-y-4">
                                        {variants.map((variant, vIdx) => (
                                            <div key={variant.color} className="border border-white/10 rounded-lg p-4 space-y-3 bg-white/[0.02]">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: variant.hex }} />
                                                        <span className="text-sm font-medium text-white">{variant.color}</span>
                                                        <span className="text-xs text-gray-500">({variant.imagePreviews.length} images)</span>
                                                    </div>
                                                    <button type="button" onClick={() => removeVariant(vIdx)} className="text-red-400 hover:text-red-300 transition-colors cursor-pointer">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                                <div className="flex flex-wrap gap-3">
                                                    {variant.imagePreviews.map((preview, iIdx) => (
                                                        <div key={iIdx} className="relative w-20 h-20 rounded-md overflow-hidden border border-white/10 group">
                                                            <img src={preview} alt="" className="w-full h-full object-cover" />
                                                            <button type="button" onClick={() => removeVariantImage(vIdx, iIdx)} className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                                                <X size={16} className="text-red-400" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <label className="w-20 h-20 rounded-md border-2 border-dashed border-white/10 hover:border-gold/50 flex items-center justify-center cursor-pointer transition-colors">
                                                        <Plus size={20} className="text-gray-500" />
                                                        <input type="file" className="hidden" accept="image/*" multiple onChange={(e) => handleVariantImageAdd(vIdx, e)} />
                                                    </label>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* --- General Images (when no variants) --- */}
                            {variants.length === 0 && (
                                <div className="space-y-4 border-t border-white/10 pt-8">
                                    <div>
                                        <h3 className="text-lg font-serif text-white mb-1">Product Images *</h3>
                                        <p className="text-xs text-gray-500">Upload one or more images. First image will be the main thumbnail.</p>
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        {generalImages.map((img, idx) => (
                                            <div key={idx} className={`relative w-28 h-28 rounded-lg overflow-hidden border group ${idx === 0 ? "border-gold/50 ring-2 ring-gold/20" : "border-white/10"}`}>
                                                <img src={img.preview} alt="" className="w-full h-full object-cover" />
                                                {idx === 0 && <span className="absolute top-1 left-1 bg-gold text-black text-[9px] font-bold px-1.5 py-0.5 rounded">MAIN</span>}
                                                <button type="button" onClick={() => removeGeneralImage(idx)} className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                                    <X size={18} className="text-red-400" />
                                                </button>
                                            </div>
                                        ))}
                                        <label className="w-28 h-28 rounded-lg border-2 border-dashed border-white/10 hover:border-gold/50 flex flex-col items-center justify-center cursor-pointer transition-colors gap-1">
                                            <Upload size={24} className="text-gray-500" />
                                            <span className="text-[10px] text-gray-500">Add Image</span>
                                            <input type="file" className="hidden" accept="image/*" multiple onChange={handleGeneralImageAdd} />
                                        </label>
                                    </div>
                                </div>
                            )}

                            <div className="pt-4 flex justify-center">
                                <Button type="submit" size="lg" className="bg-gold cursor-pointer text-black hover:bg-gold-light font-bold shadow-lg shadow-gold/20" disabled={loading} style={{ padding: "1vw 2vw", marginTop: "2vw" }}>
                                    {loading ? "Creating..." : "Create Product"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
