"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/context";
import { formatPrice } from "@/lib/utils";
import {
  User,
  Mail,
  MapPin,
  Package,
  Heart,
  ChevronRight,
  Plus,
  Loader2,
  AlertCircle,
  ShoppingBag,
  Clock,
  CheckCircle,
  Truck,
  Star,
  Edit,
  Trash2,
} from "lucide-react";

interface Address {
  id: string;
  fullName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  isDefault: boolean;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  items: { productName: string; quantity: number; price: number }[];
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const statusIcons: Record<string, any> = {
  PENDING: Clock,
  CONFIRMED: CheckCircle,
  SHIPPED: Truck,
  DELIVERED: Package,
  CANCELLED: AlertCircle,
};

export default function AccountPage() {
  const { t } = useLanguage();
  const [user, setUser] = useState<any>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingAddr, setEditingAddr] = useState<string | null>(null);
  const [addrFullName, setAddrFullName] = useState("");
  const [addrStreet, setAddrStreet] = useState("");
  const [addrCity, setAddrCity] = useState("");
  const [addrState, setAddrState] = useState("");
  const [addrZip, setAddrZip] = useState("");
  const [addrPhone, setAddrPhone] = useState("");
  const [addrDefault, setAddrDefault] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [addrError, setAddrError] = useState("");

  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => {
        if (!r.ok) {
          window.location.href = "/auth/login?redirect=/account";
          return null;
        }
        return r.json();
      })
      .then((userData) => {
        if (!userData) return;
        if (userData.role === "ADMIN") {
          window.location.href = "/admin";
          return;
        }
        setUser(userData);

        return Promise.all([
          fetch("/api/addresses", { cache: "no-store" }).then((r) => r.ok ? r.json() : []),
          fetch("/api/orders", { cache: "no-store" }).then((r) => r.ok ? r.json() : []),
          fetch("/api/wishlist", { cache: "no-store" }).then((r) => r.ok ? r.json() : []),
        ]);
      })
      .then((results) => {
        if (!results) return;
        setAddresses(Array.isArray(results[0]) ? results[0] : []);
        setOrders(Array.isArray(results[1]) ? results[1] : []);
        setWishlistCount(Array.isArray(results[2]) ? results[2].length : 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setAddrError("");
    try {
      const url = editingAddr ? `/api/addresses/${editingAddr}` : "/api/addresses";
      const method = editingAddr ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: addrFullName,
          street: addrStreet,
          city: addrCity,
          state: addrState,
          zipCode: addrZip,
          phone: addrPhone,
          isDefault: addrDefault,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save address");
      if (editingAddr) {
        setAddresses((prev) => prev.map((a) => (a.id === editingAddr ? data : a)));
      } else {
        setAddresses((prev) => [data, ...prev]);
      }
      resetForm();
    } catch (err: any) {
      setAddrError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      await fetch(`/api/addresses/${id}`, { method: "DELETE" });
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch {}
  };

  const startEdit = (addr: Address) => {
    setEditingAddr(addr.id);
    setAddrFullName(addr.fullName);
    setAddrStreet(addr.street);
    setAddrCity(addr.city);
    setAddrState(addr.state);
    setAddrZip(addr.zipCode);
    setAddrPhone(addr.phone);
    setAddrDefault(addr.isDefault);
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingAddr(null);
    setShowForm(false);
    setAddrFullName("");
    setAddrStreet("");
    setAddrCity("");
    setAddrState("");
    setAddrZip("");
    setAddrPhone("");
    setAddrDefault(false);
  };

  const deliveredOrders = orders.filter((o) => o.status === "DELIVERED").length;

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center px-4">
        <Loader2 size={32} className="animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* Welcome Header */}
      <div className="mb-8 rounded-2xl bg-gradient-to-r from-purple-500 to-violet-600 p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-2xl font-bold">
            {(user?.name || "U")[0]}
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold">مرحباً، {user?.name}</h1>
            <p className="text-white/80">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-purple-100 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-purple-100 p-3">
              <ShoppingBag className="text-purple-600" size={20} />
            </div>
            <div>
              <p className="text-xs text-purple-500">Total Orders</p>
              <p className="font-serif text-xl font-bold text-purple-900">{orders.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-purple-100 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-green-100 p-3">
              <CheckCircle className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-xs text-green-500">Delivered</p>
              <p className="font-serif text-xl font-bold text-green-900">{deliveredOrders}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-purple-100 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-violet-100 p-3">
              <Heart className="text-violet-600" size={20} />
            </div>
            <div>
              <p className="text-xs text-violet-500">Wishlist</p>
              <p className="font-serif text-xl font-bold text-violet-900">{wishlistCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Sidebar */}
        <div className="space-y-2 lg:col-span-1">
          <Link
            href="/account"
            className="flex items-center gap-3 rounded-xl bg-purple-100 px-4 py-3 text-sm font-medium text-purple-700"
          >
            <User size={18} />
            My Profile
          </Link>
          <Link
            href="/account/orders"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-purple-500 transition-colors hover:bg-purple-50 hover:text-purple-700"
          >
            <Package size={18} />
            My Orders
          </Link>
          <Link
            href="/account/wishlist"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-purple-500 transition-colors hover:bg-purple-50 hover:text-purple-700"
          >
            <Heart size={18} />
            My Wishlist
          </Link>
        </div>

        {/* Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Recent Orders */}
          <div className="rounded-2xl border border-purple-100 bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-serif text-lg font-semibold text-purple-900">Recent Orders</h2>
              <Link href="/account/orders" className="text-sm font-medium text-purple-600 hover:text-purple-800">
                View All →
              </Link>
            </div>
            {orders.length === 0 ? (
              <div className="py-8 text-center">
                <Package size={40} className="mx-auto mb-3 text-purple-300" />
                <p className="text-purple-500">No orders yet</p>
                <Link href="/products" className="mt-3 inline-block text-sm font-medium text-purple-600 hover:text-purple-800">
                  Start Shopping →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 3).map((order) => {
                  const StatusIcon = statusIcons[order.status] || Clock;
                  return (
                    <div key={order.id} className="flex items-center justify-between rounded-xl border border-purple-100 p-4 transition-colors hover:bg-purple-50">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-purple-100 p-2">
                          <StatusIcon size={16} className="text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-purple-900">{order.orderNumber}</p>
                          <p className="text-xs text-purple-500">
                            {order.items.length} items
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-purple-900">{formatPrice(order.total)}</p>
                        <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColors[order.status] || "bg-gray-100 text-gray-800"}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Addresses */}
          <div className="rounded-2xl border border-purple-100 bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-purple-500" />
                <h2 className="font-serif text-lg font-semibold text-purple-900">Saved Addresses</h2>
              </div>
              <button
                onClick={() => { resetForm(); setShowForm(!showForm); }}
                className="inline-flex items-center gap-1 text-sm font-medium text-purple-600 hover:text-purple-800"
              >
                <Plus size={16} />
                {showForm ? "Cancel" : "Add Address"}
              </button>
            </div>

            {showForm && (
              <form onSubmit={handleAddAddress} className="mb-6 space-y-3 rounded-xl bg-purple-50 p-4">
                {addrError && (
                  <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                    <AlertCircle size={16} />
                    {addrError}
                  </div>
                )}
                <div className="grid gap-3 sm:grid-cols-2">
                  <input type="text" value={addrFullName} onChange={(e) => setAddrFullName(e.target.value)} placeholder="Full Name" required className="rounded-lg border border-purple-200 bg-white px-3 py-2 text-sm text-purple-900 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500" />
                  <input type="text" value={addrStreet} onChange={(e) => setAddrStreet(e.target.value)} placeholder="Street Address" required className="rounded-lg border border-purple-200 bg-white px-3 py-2 text-sm text-purple-900 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500" />
                  <input type="text" value={addrCity} onChange={(e) => setAddrCity(e.target.value)} placeholder="City" required className="rounded-lg border border-purple-200 bg-white px-3 py-2 text-sm text-purple-900 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500" />
                  <input type="text" value={addrState} onChange={(e) => setAddrState(e.target.value)} placeholder="State" required className="rounded-lg border border-purple-200 bg-white px-3 py-2 text-sm text-purple-900 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500" />
                  <input type="text" value={addrZip} onChange={(e) => setAddrZip(e.target.value)} placeholder="Zip Code" required className="rounded-lg border border-purple-200 bg-white px-3 py-2 text-sm text-purple-900 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500" />
                  <input type="tel" value={addrPhone} onChange={(e) => setAddrPhone(e.target.value)} placeholder="Phone" required className="rounded-lg border border-purple-200 bg-white px-3 py-2 text-sm text-purple-900 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500" />
                </div>
                <label className="flex items-center gap-2 text-sm text-purple-700">
                  <input type="checkbox" checked={addrDefault} onChange={(e) => setAddrDefault(e.target.checked)} className="rounded border-purple-300 text-purple-600 focus:ring-purple-500" />
                  Set as default
                </label>
                <button type="submit" disabled={submitting} className="rounded-full bg-purple-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700 disabled:opacity-60">
                  {submitting ? "Saving..." : editingAddr ? "Update Address" : "Save Address"}
                </button>
              </form>
            )}

            {addresses.length > 0 ? (
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <div key={addr.id} className="flex items-start justify-between rounded-xl border border-purple-100 p-4">
                    <div className="text-sm">
                      <p className="font-medium text-purple-900">
                        {addr.fullName}
                        {addr.isDefault && (
                          <span className="ml-2 rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-semibold text-purple-700">DEFAULT</span>
                        )}
                      </p>
                      <p className="mt-0.5 text-purple-500">{addr.street}</p>
                      <p className="text-purple-500">{addr.city}, {addr.state} {addr.zipCode}</p>
                      <p className="text-purple-500">{addr.phone}</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => startEdit(addr)} className="rounded-lg p-1.5 text-purple-400 hover:bg-purple-100 hover:text-purple-600">
                        <Edit size={14} />
                      </button>
                      <button onClick={() => handleDeleteAddress(addr.id)} className="rounded-lg p-1.5 text-purple-400 hover:bg-red-100 hover:text-red-600">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-4 text-center text-sm text-purple-400">No saved addresses</p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Link href="/account/orders" className="flex items-center justify-between rounded-2xl border border-purple-100 bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-center gap-3">
                <Package size={20} className="text-purple-500" />
                <div>
                  <p className="font-medium text-purple-900">My Orders</p>
                  <p className="text-xs text-purple-500">Track and manage orders</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-purple-400" />
            </Link>
            <Link href="/account/wishlist" className="flex items-center justify-between rounded-2xl border border-purple-100 bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-center gap-3">
                <Heart size={20} className="text-purple-500" />
                <div>
                  <p className="font-medium text-purple-900">My Wishlist</p>
                  <p className="text-xs text-purple-500">{wishlistCount} saved items</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-purple-400" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
