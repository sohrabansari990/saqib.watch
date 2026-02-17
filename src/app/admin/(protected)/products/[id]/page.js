"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Correct hook for App Router
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Upload, X, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { use } from "react";

const categories = ["men", "women", "couples", "monitor", "other"]; // Added categories

export default function EditProductPage({ params }) {
    // Correctly unwrap params using React.use()
    const { id } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
        category: "",
        price: "",
        description: "",
        color: "#000000",
        accent: "#c9a96e",
        mode: "new",
        imageUrl: "",
    });

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const docRef = doc(db, "products", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setFormData({
                        ...data,
                        price: data.price.toString(),
                    });
                    if (data.imageUrl) {
                        setImagePreview(data.imageUrl);
                    }
                } else {
                    toast.error("Product not found");
                    router.push("/admin");
                }
            } catch (error) {
                console.error("Error fetching product:", error);
                toast.error("Failed to load product");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProduct();
        }
    }, [id, router]);

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

        if (!formData.category) {
            toast.error("Please select a category");
            return;
        }

        setSaving(true);

        try {
            let downloadURL = formData.imageUrl;

            if (imageFile) {
                const storageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
                const snapshot = await uploadBytes(storageRef, imageFile);
                downloadURL = await getDownloadURL(snapshot.ref);
            }

            await updateDoc(doc(db, "products", id), {
                ...formData,
                price: parseFloat(formData.price),
                imageUrl: downloadURL,
                updatedAt: serverTimestamp(),
            });

            toast.success("Product updated successfully");
            router.push("/admin");
        } catch (error) {
            console.error("Error updating product:", error);
            toast.error("Failed to update product");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="text-white text-center py-20">Loading...</div>;

    return (
        <div className="min-h-screen bg-dark text-white p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8 flex items-center gap-4">
                    <Link href="/admin">
                        <Button variant="ghost" className="text-gray-400 hover:text-white">
                            <ArrowLeft size={20} />
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-serif">Edit Product</h1>
                </div>

                <div className="bg-dark-card border border-white/10 rounded-lg p-8">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Left Column: Image Upload */}
                            <div className="space-y-4">
                                <Label>Product Image</Label>
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
                                                onClick={() => { setImageFile(null); setImagePreview(formData.imageUrl || null); }}
                                                className="absolute top-2 right-2 bg-red-500 rounded-full p-1 text-white hover:bg-red-600 transition-colors"
                                            >
                                                <X size={16} />
                                            </button>
                                        </>
                                    ) : (
                                        <label className="flex flex-col items-center justify-center cursor-pointer w-full h-full">
                                            <Upload size={40} className="text-gray-500 mb-2 group-hover:text-gold transition-colors" />
                                            <span className="text-gray-400 text-sm">Click to upload new image</span>
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
                            </div>

                            {/* Right Column: Details */}
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Product Name</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                                    <Label htmlFor="description">Description</Label>
                                    <textarea
                                        id="description"
                                        className="flex min-h-[100px] w-full rounded-md border border-white/10 bg-dark-card px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end gap-4">
                            <Link href="/admin">
                                <Button variant="outline" type="button">Cancel</Button>
                            </Link>
                            <Button
                                type="submit"
                                size="lg"
                                className="bg-gold text-black hover:bg-gold-light font-bold"
                                disabled={saving}
                            >
                                {saving ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
