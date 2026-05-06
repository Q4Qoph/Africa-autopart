// src/frontend/src/pages/shop/CartPage.tsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { inventoryApi } from "@/api/inventoryApi";
import { inventoryOrderApi } from "@/api/inventoryOrderApi";
import type { InventoryItem } from "@/types/inventory";
import { useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CartPage() {
  const { t } = useTranslation("shop");
  const { auth } = useAuth();
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, clearCart } = useCart();
  const [inventoryMap, setInventoryMap] = useState<
    Record<number, InventoryItem>
  >({});
  const [shipment, setShipment] = useState({
    city: "",
    postalCode: "",
    county: "",
  });
  const [orderError, setOrderError] = useState("");
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    // Fetch all inventory details for cart items
    const ids = items.map((i) => i.inventoryId);
    if (ids.length === 0) return;
    Promise.all(ids.map((id) => inventoryApi.getById(id)))
      .then((responses) => {
        const map: Record<number, InventoryItem> = {};
        responses.forEach((res) => {
          map[res.data.id] = res.data;
        });
        setInventoryMap(map);
      })
      .catch(() => {});
  }, [items]);

  const total = items.reduce((sum, cartItem) => {
    const inv = inventoryMap[cartItem.inventoryId];
    return sum + (inv ? inv.price * cartItem.quantity : 0);
  }, 0);

  // replace the existing handlePlaceOrder
  async function handlePlaceOrder() {
    if (!auth) return;
    if (!shipment.city.trim() || !shipment.county.trim()) {
      setOrderError("City and county are required for delivery");
      return;
    }
    setPlacing(true);
    setOrderError("");
    try {
      const { data: orderId } = await inventoryOrderApi.create(
        {
          userId: auth.userId,
          items: items.map((i) => ({
            inventoryId: i.inventoryId,
            quantity: i.quantity,
          })),
          shipment: {
            city: shipment.city.trim(),
            postalCode: shipment.postalCode.trim(),
            county: shipment.county.trim(),
          },
        },
        auth.token,
      );
      clearCart();
      navigate(`/checkout/${orderId}`, { replace: true });
    } catch {
      setOrderError("Failed to place order. Please try again.");
    } finally {
      setPlacing(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#F7FDF8] dark:bg-[#07110A]">
        <Navbar />
        <main className="pt-[68px] md:pt-[132px] max-w-[900px] mx-auto px-6 py-12 text-center">
          <h1 className="text-2xl font-extrabold mb-4">{t("cart_empty")}</h1>
          <Link to="/shop" className="text-[#00C853] hover:underline">
            {t("continue_shopping")}
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7FDF8] dark:bg-[#07110A]">
      <Navbar />
      <main className="pt-[68px] md:pt-[132px] max-w-[900px] mx-auto px-6 py-10">
        <h1 className="text-2xl font-extrabold mb-6">{t("cart_heading")}</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            {items.map((cartItem) => {
              const inv = inventoryMap[cartItem.inventoryId];
              if (!inv) return null;
              return (
                <div
                  key={cartItem.inventoryId}
                  className="flex items-center gap-4 bg-white dark:bg-[#111C14] p-4 rounded-xl border border-[rgba(0,200,83,0.1)]"
                >
                  {inv.imageURL && (
                    <img
                      src={inv.imageURL}
                      alt={inv.partName}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold">{inv.partName}</h3>
                    <p className="text-xs text-[#4A6B50]">
                      {inv.vehicleMake} {inv.vehicleModel} – {inv.supplierName}
                    </p>
                    <p className="text-sm font-bold text-[#00C853]">
                      KES {inv.price.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      value={cartItem.quantity}
                      onChange={(e) =>
                        updateQuantity(
                          cartItem.inventoryId,
                          parseInt(e.target.value) || 1,
                        )
                      }
                      className="w-16 h-8 text-center"
                    />
                    <button
                      onClick={() => removeItem(cartItem.inventoryId)}
                      className="text-red-400 text-xs hover:underline"
                    >
                      {t("remove")}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-white dark:bg-[#111C14] p-5 rounded-xl border border-[rgba(0,200,83,0.1)] h-fit">
            <h2 className="text-lg font-bold mb-4">{t("summary")}</h2>
            <div className="flex justify-between text-sm">
              <span>{t("subtotal")}</span>
              <span>KES {total.toLocaleString()}</span>
            </div>
            <div className="mt-4 space-y-2">
              <Input
                placeholder={t("city")}
                value={shipment.city}
                onChange={(e) =>
                  setShipment((s) => ({ ...s, city: e.target.value }))
                }
              />
              <Input
                placeholder={t("postal_code")}
                value={shipment.postalCode}
                onChange={(e) =>
                  setShipment((s) => ({ ...s, postalCode: e.target.value }))
                }
              />
              <Input
                placeholder={t("county")}
                value={shipment.county}
                onChange={(e) =>
                  setShipment((s) => ({ ...s, county: e.target.value }))
                }
              />
            </div>
            {orderError && (
              <p className="text-red-400 text-xs mt-2">{orderError}</p>
            )}
            <Button
              onClick={handlePlaceOrder}
              disabled={placing}
              className="w-full mt-4 bg-[#00C853] text-[#07110A] hover:bg-[#39FF88] h-10"
            >
              {placing ? t("placing_order") : t("place_order")}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
