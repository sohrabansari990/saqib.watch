"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
// import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Removed Firebase Storage
import { db } from "@/lib/firebase"; // Keep auth/db
import { supabase } from "@/lib/supabase"; // Add Supabase
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Upload, X, ArrowLeft } from "lucide-react";
import Link from "next/link";

const categories = ["men", "women", "couples", "monitor", "other"];

export default function AddProductPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
        category: "",
        price: "",
        description: "",
        color: "#000000",
        accent: "#c9a96e",
        mode: "new", // new, sale, featured
    });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // if (!imageFile) {
        //     toast.error("Please upload a product image");
        //     return;
        // }

        if (!formData.category) {
            toast.error("Please select a category");
            return;
        }

        // Image is now optional to allow bypassing CORS issues during dev
        // if (!imageFile) { ... } 

        setLoading(true);

        try {
            let downloadURL = "";

            // 1. Upload Image (if exists) - SUPABASE MIGRATION
            if (imageFile) {
                try {
                    console.log("Starting Supabase upload...");

                    // Sanitize filename
                    const fileExt = imageFile.name.split('.').pop();
                    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
                    const filePath = `${fileName}`;

                    const { data, error } = await supabase.storage
                        .from('products')
                        .upload(filePath, imageFile);

                    if (error) throw error;

                    // Get Public URL
                    const { data: { publicUrl } } = supabase.storage
                        .from('products')
                        .getPublicUrl(filePath);

                    downloadURL = publicUrl;
                    console.log("Upload complete:", downloadURL);

                } catch (imgErr) {
                    console.error("Supabase Upload Failed:", imgErr);
                    toast.error(`Image upload failed: ${imgErr.message}`);
                    // Optional: return here if image is strictly required
                    // return; 
                }
            }

            // 2. Save to Firestore (Metadata only)
            // We still use Firestore for product data, just Supabase for image storage
            await addDoc(collection(db, "products"), {
                ...formData,
                price: parseFloat(formData.price),
                imageUrl: downloadURL,
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
        <div className="min-h-screen w-full flex justify-center items-center bg-gradient-to-br from-[#0b0b0f] via-[#0f0f14] to-[#0f0a06] text-white">
            <div className="max-w-5xl md:max-w-[70%] mx-auto px-6 py-14" style={{padding: "2vw 1vw"}}>
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

                <Card className="bg-[#121214] border border-white/10 shadow-2xl shadow-black/50 rounded-2xl" style={{padding: "2vw 1vw"}}>
                    <CardHeader className="space-y-2">
                        <CardTitle className="text-2xl">Product Details</CardTitle>
                        <CardDescription>Upload imagery and metadata for the catalog.</CardDescription>
                    </CardHeader>
                    <CardContent style={{padding: "2vw 1vw"}} >
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            {/* Left Column: Image Upload */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm">Product Image</Label>
                                    <span className="text-xs text-gray-500">Required</span>
                                </div>

                                <div className="border-2 border-dashed border-white/10 rounded-xl p-6 flex flex-col items-center justify-center min-h-[340px] relative bg-gradient-to-br from-black/50 via-black/30 to-black/50 hover:border-gold/60 transition-colors group">
                                    {imagePreview ? (
                                        <>
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="w-full h-full object-contain max-h-[400px]"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => { setImageFile(null); setImagePreview(null); }}
                                                className="absolute top-2 right-2 bg-red-500 rounded-full p-1 text-white hover:bg-red-600 transition-colors"
                                            >
                                                <X size={16} />
                                            </button>
                                        </>
                                    ) : (
                                        <label className="flex flex-col items-center justify-center cursor-pointer w-full h-full py-8">
                                            <Upload size={40} className="text-gray-500 mb-3 group-hover:text-gold transition-colors" />
                                            <span className="text-gray-300 text-sm">Drag & drop or click to upload</span>
                                            <span className="text-gray-600 text-xs mt-1">PNG/JPG up to 5MB</span>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                            />
                                        </label>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 text-center">
                                    Image will be displayed in full width on details page.
                                </p>
                            </div>

                            {/* Right Column: Details */}
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Product Name</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Royal SV-7513"
                                        required
                                        style={{padding: "1vw 1vw"}}
                                    />
                                    <p className="text-xs text-gray-500">Visible in listings and product page.</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="price">Price (PKR)</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        placeholder="e.g. 5000"
                                        required    
                                        style={{padding: "1vw 1vw"}}
                                    />
                                    <p className="text-xs text-gray-500">Enter numeric value only.</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="category">Category</Label>
                                    <div className="relative">
                                        <select
                                            id="category"
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="flex h-10 w-full rounded-md border border-white/10 bg-dark-card px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold appearance-none cursor-pointer capitalize"
                                            required
                                            style={{padding: "0vw 1vw 0vw 1vw"}}
                                        >
                                            <option value="" disabled>Select Category</option>
                                            {categories.map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">v</div>
                                    </div>
                                    <p className="text-xs text-gray-500">Used for gallery filters.</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description (Optional)</Label>
                                    <textarea
                                        id="description"
                                        className="flex min-h-[100px] w-full rounded-md border border-white/10 bg-dark-card px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Product details..."
                                        style={{padding: "1vw 1vw"}}
                                    />
                                    <p className="text-xs text-gray-500">Tip: keep it short and benefits-focused.</p>
                                </div>

                                {/* <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="color">Color (Hex)</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="color"
                                                value={formData.color}
                                                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                                placeholder="#000000"
                                            />
                                            <div
                                                className="w-10 h-10 rounded border border-white/20 shrink-0"
                                                style={{ backgroundColor: formData.color }}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2" style={{padding: "1vw 1vw"}}>
                                        <Label htmlFor="accent">Accent (Hex)</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="accent"
                                                value={formData.accent}
                                                onChange={(e) => setFormData({ ...formData, accent: e.target.value })}
                                                placeholder="#c9a96e"
                                            />
                                            <div
                                                className="w-10 h-10 rounded border border-white/20 shrink-0"
                                                style={{ backgroundColor: formData.accent }}
                                            />
                                        </div>
                                    </div>
                                </div> */}
                            </div>
                        </div>

                        <div className="pt-4 flex justify-center">
                            <Button
                                type="submit"
                                size="lg"
                                className="bg-gold cursor-pointer text-black hover:bg-gold-light font-bold shadow-lg shadow-gold/20"
                                disabled={loading}
                                style={{padding: "1vw 1vw", marginTop: "2vw"}}
                            >
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
