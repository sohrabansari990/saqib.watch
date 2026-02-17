"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2, Edit } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() { // Fixed Component Name
    const { user, logout } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

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
            console.error("Error fetching products:", error);
            toast.error("Failed to load products");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this product?")) return;

        try {
            await deleteDoc(doc(db, "products", id));
            setProducts(products.filter(p => p.id !== id));
            toast.success("Product deleted");
        } catch (error) {
            console.error("Error deleting product:", error);
            toast.error("Failed to delete product");
        }
    };

    return (
        <div className="min-h-screen bg-dark text-white p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-serif mb-2">Admin Dashboard</h1>
                        <p className="text-gray-400">Welcome, {user?.email}</p>
                    </div>
                    <div className="flex gap-4">
                        <Link href="/admin/products/new">
                            <Button className="bg-gold text-black hover:bg-gold-light">
                                <Plus size={18} className="mr-2" /> Add Product
                            </Button>
                        </Link>
                        <Button variant="outline" onClick={logout}>Logout</Button>
                        <Button
                            variant="secondary"
                            className="bg-white/10 hover:bg-white/20 text-white"
                            onClick={async () => {
                                if (!confirm("Add initial products to database?")) return;
                                setLoading(true);
                                try {
                                    const { products: initialProducts } = await import("@/data/products");
                                    const { addDoc, collection, serverTimestamp } = await import("firebase/firestore");

                                    let count = 0;
                                    for (const p of initialProducts) {
                                        // Convert price string "$199.00" to number (approx PKR)
                                        const usd = parseFloat(p.price.replace(/[^0-9.-]+/g, ""));
                                        const pkr = Math.round(usd * 280 / 100) * 100; // Rough conversion rounded to 100

                                        await addDoc(collection(db, "products"), {
                                            name: p.name,
                                            category: p.category,
                                            price: pkr,
                                            description: p.description,
                                            color: p.color,
                                            accent: p.accent,
                                            mode: "new",
                                            imageUrl: "", // No image initially
                                            createdAt: serverTimestamp(),
                                        });
                                        count++;
                                    }
                                    toast.success(`Seeded ${count} products`);
                                    fetchProducts();
                                    toast.success(`Seeded ${count} products`);
                                    fetchProducts();
                                } catch (e) {
                                    console.error(e);
                                    if (e.message?.includes("network") || e.code?.includes("unavailable")) {
                                        toast.error("Network blocked. Disable AdBlocker?");
                                    } else {
                                        toast.error("Failed to seed. Check console.");
                                    }
                                } finally {
                                    setLoading(false);
                                }
                            }}
                        >
                            Seed DB
                        </Button>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20">Loading products...</div>
                ) : (
                    <div className="bg-dark-card border border-white/10 rounded-lg overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 text-gray-400 text-sm uppercase tracking-wider">
                                <tr>
                                    <th className="p-4">Image</th>
                                    <th className="p-4">Name</th>
                                    <th className="p-4">Category</th>
                                    <th className="p-4">Price (PKR)</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {products.map((product) => (
                                    <tr key={product.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4">
                                            <div className="w-12 h-16 bg-white/10 rounded overflow-hidden">
                                                {product.imageUrl ? (
                                                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">No Img</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 font-medium">{product.name}</td>
                                        <td className="p-4 text-gray-400 capitalize">{product.category}</td>
                                        <td className="p-4 text-gold">Rs. {product.price?.toLocaleString()}</td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={`/admin/products/${product.id}`}>
                                                    <Button size="icon" variant="ghost" className="hover:text-gold">
                                                        <Edit size={18} />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="hover:text-red-500"
                                                    onClick={() => handleDelete(product.id)}
                                                >
                                                    <Trash2 size={18} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {products.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="p-8 text-center text-gray-500">
                                            No products found. Add one to get started.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
