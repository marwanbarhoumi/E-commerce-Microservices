import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../api/axios";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700"
};

export default function DashboardPage() {
  const { t } = useTranslation();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState("stats");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, ordersRes] = await Promise.all([
        api.get("/orders/admin/stats"),
        api.get("/admin/users"),
        api.get("/orders/admin/all")
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data.users);
      setOrders(ordersRes.data.orders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, status) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      fetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Chargement...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">
            {t("dashboard.title")}
          </h1>
          <p className="text-gray-500">
            {t("dashboard.welcome")},{" "}
            <span className="font-medium text-gray-700">{user.name}</span> 👋
          </p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {[
            {
              label: t("dashboard.orders"),
              value: stats?.totalOrders ?? 0,
              icon: "📦"
            },
            {
              label: t("dashboard.revenue"),
              value: `${(stats?.totalRevenue ?? 0).toLocaleString()} TND`,
              icon: "💰"
            },
            {
              label: "En attente",
              value: stats?.pendingOrders ?? 0,
              icon: "⏳"
            },
            {
              label: t("dashboard.users"),
              value: users?.length ?? 0,
              icon: "👥"
            }
          ].map((s, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
            >
              <div className="text-3xl mb-2">{s.icon}</div>
              <div className="text-2xl font-semibold text-gray-800">
                {s.value}
              </div>
              <div className="text-sm text-gray-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {["stats", "orders", "users"].map((t2) => (
            <button
              key={t2}
              onClick={() => setTab(t2)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                tab === t2
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {t2 === "orders"
                ? "📦 Commandes"
                : t2 === "users"
                  ? "👥 Utilisateurs"
                  : "📊 Stats"}
            </button>
          ))}
        </div>

        {/* Tab: Orders */}
        {tab === "orders" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">User</th>
                  <th className="px-4 py-3 text-left">Total</th>
                  <th className="px-4 py-3 text-left">Statut</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">
                      {order._id.slice(-6)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{order.userId}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {order.total} TND
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {order.status === "pending" && (
                          <button
                            onClick={() => updateStatus(order._id, "confirmed")}
                            className="px-3 py-1 bg-green-50 text-green-700 rounded-lg text-xs hover:bg-green-100 transition"
                          >
                            ✓ Accepter
                          </button>
                        )}
                        {!["cancelled", "delivered"].includes(order.status) && (
                          <button
                            onClick={() => updateStatus(order._id, "cancelled")}
                            className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-xs hover:bg-red-100 transition"
                          >
                            ✕ Annuler
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-gray-400"
                    >
                      Aucune commande
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab: Users */}
        {tab === "users" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-4 py-3 text-left">Nom</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Rôle</th>
                  <th className="px-4 py-3 text-left">Inscrit le</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {u.name}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{u.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          u.role === "admin"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {new Date(u.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab: Stats placeholder */}
        {tab === "stats" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-gray-400">
            Les stats sont affichées dans les cartes ci-dessus 👆
          </div>
        )}
      </div>
    </div>
  );
}
