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
        <div className="min-h-screen bg-dark text-white p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8 flex items-center gap-4">
                    <Link href="/admin">
                        <Button variant="ghost" className="text-gray-400 hover:text-white">
                            <ArrowLeft size={20} />
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-serif">Add New Product</h1>
                </div>

                <div className="bg-dark-card border border-white/10 rounded-lg p-8">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Left Column: Image Upload */}
                            <div className="space-y-4">
                                <Label>Product Image</Label>

                                <div className="flex items-center space-x-2 pb-2">
                                    <input
                                        type="checkbox"
                                        id="skipImage"
                                        className="rounded border-white/10 bg-dark-card text-gold focus:ring-gold"
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setImageFile(null);
                                                setImagePreview(null);
                                            }
                                        }}
                                    />
                                    <label htmlFor="skipImage" className="text-sm text-gray-400">Skip Image Upload (Fixes CORS Stuck)</label>
                                </div>

                                <div className="border-2 border-dashed border-white/10 rounded-lg p-4 flex flex-col items-center justify-center min-h-[300px] relative bg-black/20 hover:bg-white/5 transition-colors group">
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
                                        <label className="flex flex-col items-center justify-center cursor-pointer w-full h-full">
                                            <Upload size={40} className="text-gray-500 mb-2 group-hover:text-gold transition-colors" />
                                            <span className="text-gray-400 text-sm">Click to upload image</span>
                                            <span className="text-gray-600 text-xs mt-1">PNG, JPG up to 5MB</span>
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
                                    />
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
                                    />
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
                                        >
                                            <option value="" disabled>Select Category</option>
                                            {categories.map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">▼</div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description (Optional)</Label>
                                    <textarea
                                        id="description"
                                        className="flex min-h-[100px] w-full rounded-md border border-white/10 bg-dark-card px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Product details..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
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
                                    <div className="space-y-2">
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
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <Button
                                type="submit"
                                size="lg"
                                className="bg-gold text-black hover:bg-gold-light font-bold"
                                disabled={loading}
                            >
                                {loading ? "Creating..." : "Create Product"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
