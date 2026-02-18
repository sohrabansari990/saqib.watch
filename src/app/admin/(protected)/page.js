"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2, Edit } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() { // Fixed Component Name
    const { user, logout } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

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
        <div className="min-h-screen bg-gradient-to-br from-[#0b0b0f] via-[#0f0f14] to-[#0f0a06] text-white">
            <div className="max-w-6xl md:max-w-full px-10 mx-auto py-14 space-y-8" style={{padding: "1vw 2vw"}}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <p className="text-xs uppercase tracking-[0.35em] text-gold/80 mb-2">Control Center</p>
                        <h1 className="text-3xl md:text-4xl font-serif mb-2">Admin Dashboard</h1>
                        <p className="text-gray-400 text-sm">Welcome, {user?.email}</p>
                    </div>
                    <div className="flex gap-3">
                        <Link href="/admin/products/new">
                            <Button className="bg-gold text-black hover:bg-gold-light shadow-lg shadow-gold/20 cursor-pointer" style={{padding: "1vw 2vw"}}>
                                <Plus size={18} className="mr-2" /> Add Product
                            </Button>
                        </Link>
                        <Button variant="outline" className="border-white/20 hover:bg-white/10 cursor-pointer" style={{padding: "1vw 2vw"}} onClick={logout}>Logout</Button>
                    </div>
                </div>

                {!loading && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4" style={{padding: "1vw 0vw"}}>
                        <Card className="bg-white/5 border-white/10 shadow-lg shadow-black/40 rounded-xl" style={{padding: "1vw 1vw"}}>
                            <CardHeader className="p-4 space-y-1">
                                <CardDescription>Total Products</CardDescription>
                                <CardTitle className="text-3xl">{summary.total}</CardTitle>
                            </CardHeader>
                        </Card>
                        <Card className="bg-white/5 border-white/10 shadow-lg shadow-black/40 rounded-xl" style={{padding: "1vw 1vw"}}>
                            <CardHeader className="p-4 space-y-1">
                                <CardDescription>Men</CardDescription>
                                <CardTitle className="text-3xl">{summary.byCategory.men || 0}</CardTitle>
                            </CardHeader>
                        </Card>
                        <Card className="bg-white/5 border-white/10 shadow-lg shadow-black/40 rounded-xl" style={{padding: "1vw 1vw"}}>
                            <CardHeader className="p-4 space-y-1">
                                <CardDescription>Women</CardDescription>
                                <CardTitle className="text-3xl">{summary.byCategory.women || 0}</CardTitle>
                            </CardHeader>
                        </Card>
                        <Card className="bg-white/5 border-white/10 shadow-lg shadow-black/40 rounded-xl" style={{padding: "1vw 1vw"}}>
                            <CardHeader className="p-4 space-y-1">
                                <CardDescription>Featured/Sale</CardDescription>
                                <CardTitle className="text-3xl">{summary.featured}</CardTitle>
                            </CardHeader>
                        </Card>
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-20">Loading products...</div>
                ) : (
                    <Card className="overflow-hidden border-white/10 bg-[#121214] shadow-2xl shadow-black/50 rounded-2xl">
                        <CardHeader className="bg-white/5 border-b border-white/10" style={{padding: "1vw 1vw"}}>
                            <CardTitle className="flex items-center justify-between">
                                <span className="text-lg">Products</span>
                                <span className="text-sm text-gray-400 font-sans">Total {products.length}</span>
                            </CardTitle>
                            <CardDescription>Manage your catalog.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-white/5 text-gray-400 text-xs uppercase tracking-[0.18em]">
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
                                                    <div className="w-12 h-16 bg-white/5 rounded-lg overflow-hidden border border-white/10">
                                                        {product.imageUrl ? (
                                                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-500">No Img</div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4 font-medium text-white">{product.name}</td>
                                                <td className="p-4 text-gray-300 capitalize space-x-2">
                                                    <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs">{product.category}</span>
                                                    {product.mode && product.mode !== "new" && (
                                                        <span className="inline-flex items-center rounded-full bg-gold/15 text-gold px-3 py-1 text-xs">{product.mode}</span>
                                                    )}
                                                </td>
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
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
