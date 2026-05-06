// src/frontend/src/pages/supplier/SupplierDashboardPage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { supplierApi } from "@/api/supplierApi";
import { orderApi } from "@/api/orderApi";
import { inventoryApi } from "@/api/inventoryApi";
import { imageApi } from "@/api/imageApi";
import type { Supplier } from "@/types/supplier";
import type { Order } from "@/types/order";
import type { InventoryItem, AddInventoryDTO } from "@/types/inventory";
import { OrderStatusCode } from "@/types/order";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { EditProfilePanel } from "@/components/supplier/EdirProfilePanel";

// import { AdvertModal } from "@/components/supplier/AdvertModal";

// ‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐
// Helpers
// ‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐

function statusBadge(status: number) {
  if (status === 2)
    return "bg-[rgba(0,200,83,0.1)] text-[#00C853] border-[rgba(0,200,83,0.2)]";
  if (status === 1) return "bg-blue-400/10 text-blue-400 border-blue-400/20";
  return "bg-amber-400/10 text-amber-400 border-amber-400/20";
}

// ‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐
// Local state types
// ‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐

interface OrderEdit {
  status: number;
  trackingNumber: string;
  saving: boolean;
  error: string;
}

// ‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐
// Component
// ‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐

export default function SupplierDashboardPage() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation("dashboard");
  const [activeTab, setActiveTab] = useState<"inventory" | "orders">(
    "inventory",
  );

  // ── Supplier ──────────────────────────────────────────────────────────────
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [loadingSupplier, setLoadingSupplier] = useState(true);
  const [supplierError, setSupplierError] = useState(false);

  // ── Inventory ─────────────────────────────────────────────────────────────
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loadingInventory, setLoadingInventory] = useState(true);

  // Add inventory
  const [showAddInventory, setShowAddInventory] = useState(false);
  const [addInventoryForm, setAddInventoryForm] = useState<AddInventoryDTO>({
    partName: "",
    description: "",
    vehicleMake: "",
    vehicleModel: "",
    price: 0,
    supplierName: "",
    imageURL: "",
  });
  const [addingInventory, setAddingInventory] = useState(false);
  const [addInventoryError, setAddInventoryError] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  // Edit inventory
  const [editingInventoryId, setEditingInventoryId] = useState<number | null>(
    null,
  );
  const [inventoryEditForm, setInventoryEditForm] = useState<AddInventoryDTO>({
    partName: "",
    description: "",
    vehicleMake: "",
    vehicleModel: "",
    price: 0,
    supplierName: "",
    imageURL: "",
  });
  const [uploadingEditImage, setUploadingEditImage] = useState(false);
  const [savingInventory, setSavingInventory] = useState(false);
  const [inventoryEditError, setInventoryEditError] = useState("");

  // ── Orders ────────────────────────────────────────────────────────────────
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState<number | null>(null);
  const [orderEdit, setOrderEdit] = useState<OrderEdit>({
    status: OrderStatusCode.Pending,
    trackingNumber: "",
    saving: false,
    error: "",
  });

  // ── Profile ───────────────────────────────────────────────────────────────
  const [editingProfile, setEditingProfile] = useState(false);

  const orderStatusLabel: Record<number, string> = {
    0: t("supplier_order_status_pending"),
    1: t("supplier_order_status_shipped"),
    2: t("supplier_order_status_delivered"),
  };

  // ── Advertisement Modal (still commented out, but keep state if needed) ──
  // const [advertModal, setAdvertModal] = ...

  const tabLabel: Record<string, string> = {
    inventory: t("supplier_tab_parts"),
    orders: t("supplier_tab_orders"),
  };

  // ‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐
  // Effects
  // ‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐

  useEffect(() => {
    if (!auth) return;
    supplierApi
      .myProducts(auth.userId, auth.token)
      .then(({ data }) => setSupplier(data[0] ?? null))
      .catch(() => setSupplierError(true))
      .finally(() => setLoadingSupplier(false));
  }, [auth]);

  useEffect(() => {
    if (!auth || !supplier) return;
    setLoadingInventory(true);
    inventoryApi
      .getAllAdverts()
      .then(({ data }) => {
        const mine = data.filter(
          (item) => item.supplierName === supplier.businessName,
        );
        setInventory(mine);
      })
      .catch(() => {})
      .finally(() => setLoadingInventory(false));
  }, [auth, supplier]);

  useEffect(() => {
    if (!auth || !supplier || activeTab !== "orders") return;
    setLoadingOrders(true);
    orderApi
      .getBySupplierId(supplier.id, auth.token)
      .then(({ data }) => setOrders(Array.isArray(data) ? data : [data]))
      .catch(() => {})
      .finally(() => setLoadingOrders(false));
  }, [auth, supplier, activeTab]);

  // ‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐
  // Inventory handlers
  // ‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐

  async function handleAddInventory() {
    if (!auth || !supplier) return;
    setAddInventoryError("");
    setAddingInventory(true);
    try {
      await inventoryApi.add({
        ...addInventoryForm,
        supplierName: supplier.businessName,
      });
      const { data } = await inventoryApi.getAllAdverts();
      setInventory(
        data.filter((item) => item.supplierName === supplier.businessName),
      );
      setAddInventoryForm({
        partName: "",
        description: "",
        vehicleMake: "",
        vehicleModel: "",
        price: 0,
        supplierName: supplier.businessName,
        imageURL: "",
      });
      setShowAddInventory(false);
    } catch {
      setAddInventoryError(t("supplier_add_error"));
    } finally {
      setAddingInventory(false);
    }
  }

  function startEditInventory(item: InventoryItem) {
    setEditingInventoryId(item.id);
    setInventoryEditForm({
      partName: item.partName,
      description: item.description,
      vehicleMake: item.vehicleMake,
      vehicleModel: item.vehicleModel,
      price: item.price,
      supplierName: item.supplierName,
      imageURL: item.imageURL ?? "",
    });
    setInventoryEditError("");
  }

  async function handleSaveInventory(itemId: number) {
    if (!auth) return;
    setInventoryEditError("");
    setSavingInventory(true);
    try {
      await inventoryApi.update(itemId, inventoryEditForm);
      const { data } = await inventoryApi.getAllAdverts();
      setInventory(
        data.filter((item) => item.supplierName === supplier?.businessName),
      );
      setEditingInventoryId(null);
    } catch {
      setInventoryEditError(t("supplier_save_part_error"));
    } finally {
      setSavingInventory(false);
    }
  }

  function makeImageUploadHandler(
    setUploading: (v: boolean) => void,
    setForm: (fn: (f: AddInventoryDTO) => AddInventoryDTO) => void,
    setError: (e: string) => void,
  ) {
    return async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploading(true);
      setError("");
      try {
        const { data: url } = await imageApi.upload(file);
        setForm((f) => ({ ...f, imageURL: url }));
      } catch {
        setError(t("supplier_add_error"));
      } finally {
        setUploading(false);
        e.target.value = "";
      }
    };
  }

  // ‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐
  // Order handlers
  // ‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐

  function startEditOrder(order: Order) {
    setEditingOrderId(order.id);
    setOrderEdit({
      status: order.status,
      trackingNumber: order.trackingNumber ?? "",
      saving: false,
      error: "",
    });
  }

  async function saveOrderEdit(order: Order) {
    if (!auth) return;
    setOrderEdit((s) => ({ ...s, saving: true, error: "" }));
    try {
      await orderApi.updateStatus(
        order.id,
        { status: orderEdit.status },
        auth.token,
      );
      await orderApi.update(
        order.id,
        {
          supplierName: order.supplierName,
          partName: order.partName,
          partRequestId: order.partRequestId,
          price: order.price,
          pickUpLocation: order.pickUpLocation,
          pickUpLocationPhoneNumber: order.pickUpLocationPhoneNumber,
          trackingNumber: orderEdit.trackingNumber,
        },
        auth.token,
      );
      if (!supplier) return;
      const { data } = await orderApi.getBySupplierId(supplier.id, auth.token);
      setOrders(Array.isArray(data) ? data : [data]);
      setEditingOrderId(null);
    } catch {
      setOrderEdit((s) => ({
        ...s,
        saving: false,
        error: t("supplier_order_save_error"),
      }));
    }
  }

  // ‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐
  // Render
  // ‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐

  return (
    <div className="min-h-screen bg-[#F7FDF8] dark:bg-[#07110A]">
      {/* Top bar */}
      <header className="border-b border-[rgba(0,200,83,0.1)] bg-[#E8F2EA] dark:bg-[#0D1810]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/images/logo.png"
              alt="Africa Autopart"
              className="w-36 h-auto"
            />
            {supplier && (
              <span className="text-[#4A6B50] dark:text-[#7A9A80] text-xs border-l border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.1)] pl-3">
                {supplier.businessName}
              </span>
            )}
          </div>
          <Button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="text-[#4A6B50] dark:text-[#7A9A80] bg-transparent border border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] hover:bg-[rgba(0,0,0,0.04)] dark:hover:bg-[rgba(255,255,255,0.04)] hover:text-[#07110A] dark:hover:text-white text-sm h-9 px-4"
          >
            {t("supplier_sign_out")}
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Page heading */}
        <div className="mb-6">
          <p className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-[#00C853] mb-2">
            <span className="block w-6 h-px bg-[#00C853]" />
            {t("supplier_portal_label")}
          </p>
          <h1 className="text-2xl font-extrabold text-[#07110A] dark:text-white">
            {loadingSupplier
              ? t("supplier_dashboard")
              : (supplier?.businessName ?? t("supplier_dashboard"))}
          </h1>
          {supplier && (
            <p className="text-[#4A6B50] dark:text-[#7A9A80] text-sm mt-0.5">
              {supplier.category}
            </p>
          )}
        </div>

        {loadingSupplier && (
          <p className="text-[#4A6B50] dark:text-[#7A9A80] text-sm">
            {t("supplier_saving")}
          </p>
        )}
        {supplierError && !loadingSupplier && (
          <p className="text-red-400 text-sm">{t("supplier_error_profile")}</p>
        )}

        {!loadingSupplier && !supplierError && (
          <>
            {/* Business info */}
            {supplier && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2">
                  <InfoCard
                    label={t("supplier_info_email")}
                    value={supplier.email}
                  />
                  <InfoCard
                    label={t("supplier_field_phone")}
                    value={supplier.phone}
                  />
                  <InfoCard
                    label={t("supplier_info_status")}
                    value={
                      <Badge className="bg-[rgba(0,200,83,0.1)] text-[#00C853] border-[rgba(0,200,83,0.2)] text-[10px]">
                        {t("supplier_status_active")}
                      </Badge>
                    }
                  />
                </div>
                <div className="flex justify-end mb-6">
                  <Button
                    size="sm"
                    onClick={() => setEditingProfile(true)}
                    className="bg-transparent border border-[rgba(0,200,83,0.2)] text-[#00C853] hover:bg-[rgba(0,200,83,0.08)] h-8 text-xs px-3"
                  >
                    {t("supplier_profile_edit")}
                  </Button>
                </div>
              </>
            )}

            {/* Edit profile panel – extracted component */}
            {editingProfile && supplier && (
              <EditProfilePanel
                supplier={supplier}
                onClose={() => setEditingProfile(false)}
                onSaved={(updated) => setSupplier(updated)}
              />
            )}

            {/* Tabs */}
            <div className="flex gap-1 mb-6 border-b border-[rgba(0,200,83,0.1)]">
              {(["inventory", "orders"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-5 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px",
                    activeTab === tab
                      ? "border-[#00C853] text-[#00C853]"
                      : "border-transparent text-[#4A6B50] dark:text-[#7A9A80] hover:text-[#07110A] dark:hover:text-white",
                  )}
                >
                  {tabLabel[tab]}
                  {tab === "inventory" && (
                    <span className="ml-1.5 text-xs text-[#7A9A80] dark:text-[#3D5942]">
                      ({inventory.length})
                    </span>
                  )}
                  {tab === "orders" && orders.length > 0 && (
                    <span className="ml-1.5 text-xs text-[#7A9A80] dark:text-[#3D5942]">
                      ({orders.length})
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* ── INVENTORY TAB ── */}
            {activeTab === "inventory" && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[#4A6B50] dark:text-[#7A9A80] text-sm">
                    {t("supplier_parts_count", { count: inventory.length })}
                  </p>
                  <Button
                    onClick={() => {
                      setShowAddInventory((v) => !v);
                      setAddInventoryError("");
                    }}
                    className="bg-[#00C853] text-[#07110A] hover:bg-[#39FF88] font-semibold h-9 px-4 text-sm"
                  >
                    {showAddInventory
                      ? t("supplier_cancel")
                      : t("supplier_add_part")}
                  </Button>
                </div>

                {/* Add inventory form */}
                {showAddInventory && (
                  <div className="bg-white dark:bg-[#111C14] border border-[rgba(0,200,83,0.2)] rounded-xl p-5 mb-5">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-[#00C853] mb-4">
                      {t("supplier_new_part_label")}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs">
                          {t("supplier_field_partName")}
                        </Label>
                        <Input
                          value={addInventoryForm.partName}
                          onChange={(e) =>
                            setAddInventoryForm((f) => ({
                              ...f,
                              partName: e.target.value,
                            }))
                          }
                          placeholder="Front Brake Pad Set"
                          className="bg-[#E8F2EA] dark:bg-[#0D1810] border-[rgba(0,0,0,0.08)] h-9 text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Vehicle Make</Label>
                        <Input
                          value={addInventoryForm.vehicleMake}
                          onChange={(e) =>
                            setAddInventoryForm((f) => ({
                              ...f,
                              vehicleMake: e.target.value,
                            }))
                          }
                          placeholder="Toyota"
                          className="bg-[#E8F2EA] dark:bg-[#0D1810] border-[rgba(0,0,0,0.08)] h-9 text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Vehicle Model</Label>
                        <Input
                          value={addInventoryForm.vehicleModel}
                          onChange={(e) =>
                            setAddInventoryForm((f) => ({
                              ...f,
                              vehicleModel: e.target.value,
                            }))
                          }
                          placeholder="Hilux"
                          className="bg-[#E8F2EA] dark:bg-[#0D1810] border-[rgba(0,0,0,0.08)] h-9 text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">
                          {t("supplier_field_price")}
                        </Label>
                        <Input
                          type="number"
                          value={addInventoryForm.price || ""}
                          onChange={(e) =>
                            setAddInventoryForm((f) => ({
                              ...f,
                              price: Number(e.target.value),
                            }))
                          }
                          placeholder="0"
                          className="bg-[#E8F2EA] dark:bg-[#0D1810] border-[rgba(0,0,0,0.08)] h-9 text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">
                          {t("supplier_field_image_label")}
                        </Label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <div className="flex-1 h-9 px-3 rounded-lg bg-[#E8F2EA] dark:bg-[#0D1810] border border-[rgba(0,0,0,0.08)] group-hover:border-[#00C853] transition-colors flex items-center gap-2 overflow-hidden">
                            {uploadingImage ? (
                              <span className="text-xs">
                                {t("supplier_uploading")}
                              </span>
                            ) : addInventoryForm.imageURL ? (
                              <>
                                <img
                                  src={addInventoryForm.imageURL}
                                  alt="preview"
                                  className="h-6 w-6 rounded object-cover shrink-0"
                                />
                                <span className="text-xs truncate">
                                  {t("supplier_image_uploaded")}
                                </span>
                              </>
                            ) : (
                              <span className="text-xs">
                                {t("supplier_image_placeholder")}
                              </span>
                            )}
                          </div>
                          {addInventoryForm.imageURL && !uploadingImage && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                setAddInventoryForm((f) => ({
                                  ...f,
                                  imageURL: "",
                                }));
                              }}
                              className="text-[#4A6B50] dark:text-[#7A9A80] hover:text-red-400 text-xs transition-colors shrink-0"
                            >
                              {t("supplier_image_remove")}
                            </button>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            disabled={uploadingImage}
                            onChange={makeImageUploadHandler(
                              setUploadingImage,
                              setAddInventoryForm,
                              setAddInventoryError,
                            )}
                          />
                        </label>
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label className="text-xs">
                          {t("supplier_field_description")}
                        </Label>
                        <textarea
                          value={addInventoryForm.description}
                          onChange={(e) =>
                            setAddInventoryForm((f) => ({
                              ...f,
                              description: e.target.value,
                            }))
                          }
                          rows={2}
                          placeholder="Additional notes…"
                          className="w-full px-3 py-2 rounded-lg bg-[#E8F2EA] dark:bg-[#0D1810] border border-[rgba(0,0,0,0.08)] text-sm resize-none"
                        />
                      </div>
                    </div>
                    {addInventoryError && (
                      <p className="text-red-400 text-xs mt-3">
                        {addInventoryError}
                      </p>
                    )}
                    <div className="flex gap-3 mt-4">
                      <Button
                        onClick={handleAddInventory}
                        disabled={
                          addingInventory ||
                          uploadingImage ||
                          !addInventoryForm.partName ||
                          !addInventoryForm.price
                        }
                        className="bg-[#00C853] text-[#07110A] hover:bg-[#39FF88] font-semibold h-9 px-5 text-sm"
                      >
                        {addingInventory
                          ? t("supplier_adding")
                          : t("supplier_add_part")}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowAddInventory(false)}
                        className="border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.1)] h-9 px-4 text-sm"
                      >
                        {t("supplier_cancel")}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Inventory table with inline edit row */}
                <div className="rounded-xl border border-[rgba(0,200,83,0.15)] overflow-hidden">
                  <div className="overflow-x-auto">
                    {inventory.length === 0 && !loadingInventory ? (
                      <div className="px-6 py-12 text-center">
                        <p className="text-[#4A6B50] dark:text-[#7A9A80] text-sm mb-1">
                          {t("supplier_no_parts")}
                        </p>
                        <p className="text-[#7A9A80] dark:text-[#3D5942] text-xs">
                          {t("supplier_no_parts_hint")}
                        </p>
                      </div>
                    ) : (
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-[#E8F2EA] dark:bg-[#0D1810] border-b border-[rgba(0,200,83,0.12)]">
                            <Th>{t("supplier_col_part_name")}</Th>
                            <Th>Vehicle</Th>
                            <Th>{t("supplier_col_price")}</Th>
                            <Th>{t("supplier_col_actions")}</Th>
                          </tr>
                        </thead>
                        <tbody>
                          {inventory.map((item) => (
                            <>
                              <tr
                                key={item.id}
                                className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                              >
                                <td className="px-5 py-3 text-[#07110A] dark:text-white">
                                  {item.partName}
                                </td>
                                <td className="px-5 py-3 text-[#4A6B50] dark:text-[#7A9A80] text-xs">
                                  {item.vehicleMake} {item.vehicleModel}
                                </td>
                                <td className="px-5 py-3 text-[#4A6B50] dark:text-[#C5DEC8]">
                                  ${item.price.toLocaleString()}
                                </td>
                                <td className="px-5 py-3">
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      editingInventoryId === item.id
                                        ? setEditingInventoryId(null)
                                        : startEditInventory(item)
                                    }
                                    className="bg-[rgba(0,200,83,0.12)] text-[#00C853] hover:bg-[rgba(0,200,83,0.2)] border border-[rgba(0,200,83,0.2)] h-7 text-xs px-3"
                                  >
                                    {editingInventoryId === item.id
                                      ? t("supplier_close")
                                      : t("supplier_edit_part")}
                                  </Button>
                                </td>
                              </tr>

                              {/* Inline edit row for inventory */}
                              {editingInventoryId === item.id && (
                                <tr key={`edit-${item.id}`}>
                                  <td
                                    colSpan={4}
                                    className="bg-[#0A1510] border-b border-[rgba(0,200,83,0.12)] px-5 py-5"
                                  >
                                    <p className="text-[10px] font-mono uppercase tracking-widest text-[#00C853] mb-4">
                                      {t("supplier_edit_part_label")}
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      <div className="space-y-1.5">
                                        <Label className="text-xs">
                                          {t("supplier_field_partName")}
                                        </Label>
                                        <Input
                                          value={inventoryEditForm.partName}
                                          onChange={(e) =>
                                            setInventoryEditForm((f) => ({
                                              ...f,
                                              partName: e.target.value,
                                            }))
                                          }
                                          className="bg-white dark:bg-[#111C14] border-[rgba(0,0,0,0.08)] h-9 text-sm"
                                        />
                                      </div>
                                      <div className="space-y-1.5">
                                        <Label className="text-xs">
                                          Vehicle Make
                                        </Label>
                                        <Input
                                          value={inventoryEditForm.vehicleMake}
                                          onChange={(e) =>
                                            setInventoryEditForm((f) => ({
                                              ...f,
                                              vehicleMake: e.target.value,
                                            }))
                                          }
                                          className="bg-white dark:bg-[#111C14] border-[rgba(0,0,0,0.08)] h-9 text-sm"
                                        />
                                      </div>
                                      <div className="space-y-1.5">
                                        <Label className="text-xs">
                                          Vehicle Model
                                        </Label>
                                        <Input
                                          value={inventoryEditForm.vehicleModel}
                                          onChange={(e) =>
                                            setInventoryEditForm((f) => ({
                                              ...f,
                                              vehicleModel: e.target.value,
                                            }))
                                          }
                                          className="bg-white dark:bg-[#111C14] border-[rgba(0,0,0,0.08)] h-9 text-sm"
                                        />
                                      </div>
                                      <div className="space-y-1.5">
                                        <Label className="text-xs">
                                          {t("supplier_field_price")}
                                        </Label>
                                        <Input
                                          type="number"
                                          value={inventoryEditForm.price || ""}
                                          onChange={(e) =>
                                            setInventoryEditForm((f) => ({
                                              ...f,
                                              price: Number(e.target.value),
                                            }))
                                          }
                                          className="bg-white dark:bg-[#111C14] border-[rgba(0,0,0,0.08)] h-9 text-sm"
                                        />
                                      </div>
                                      <div className="space-y-1.5">
                                        <Label className="text-xs">
                                          {t("supplier_field_image_label")}
                                        </Label>
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                          <div className="flex-1 h-9 px-3 rounded-lg bg-white dark:bg-[#111C14] border border-[rgba(0,0,0,0.08)] group-hover:border-[#00C853] transition-colors flex items-center gap-2 overflow-hidden">
                                            {uploadingEditImage ? (
                                              <span className="text-xs">
                                                {t("supplier_uploading")}
                                              </span>
                                            ) : inventoryEditForm.imageURL ? (
                                              <>
                                                <img
                                                  src={
                                                    inventoryEditForm.imageURL
                                                  }
                                                  alt="preview"
                                                  className="h-6 w-6 rounded object-cover shrink-0"
                                                />
                                                <span className="text-xs truncate">
                                                  {t("supplier_image_uploaded")}
                                                </span>
                                              </>
                                            ) : (
                                              <span className="text-xs">
                                                {t(
                                                  "supplier_image_placeholder",
                                                )}
                                              </span>
                                            )}
                                          </div>
                                          {inventoryEditForm.imageURL &&
                                            !uploadingEditImage && (
                                              <button
                                                type="button"
                                                onClick={(e) => {
                                                  e.preventDefault();
                                                  setInventoryEditForm((f) => ({
                                                    ...f,
                                                    imageURL: "",
                                                  }));
                                                }}
                                                className="text-[#4A6B50] dark:text-[#7A9A80] hover:text-red-400 text-xs transition-colors shrink-0"
                                              >
                                                {t("supplier_image_remove")}
                                              </button>
                                            )}
                                          <input
                                            type="file"
                                            accept="image/*"
                                            className="sr-only"
                                            disabled={uploadingEditImage}
                                            onChange={makeImageUploadHandler(
                                              setUploadingEditImage,
                                              setInventoryEditForm,
                                              setInventoryEditError,
                                            )}
                                          />
                                        </label>
                                      </div>
                                      <div className="space-y-1.5 sm:col-span-2">
                                        <Label className="text-xs">
                                          {t("supplier_field_description")}
                                        </Label>
                                        <textarea
                                          value={inventoryEditForm.description}
                                          onChange={(e) =>
                                            setInventoryEditForm((f) => ({
                                              ...f,
                                              description: e.target.value,
                                            }))
                                          }
                                          rows={2}
                                          className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#111C14] border border-[rgba(0,0,0,0.08)] text-sm resize-none"
                                        />
                                      </div>
                                    </div>
                                    {inventoryEditError && (
                                      <p className="text-red-400 text-xs mt-3">
                                        {inventoryEditError}
                                      </p>
                                    )}
                                    <div className="flex gap-3 mt-4">
                                      <Button
                                        onClick={() =>
                                          handleSaveInventory(item.id)
                                        }
                                        disabled={
                                          savingInventory ||
                                          uploadingEditImage ||
                                          !inventoryEditForm.partName ||
                                          !inventoryEditForm.price
                                        }
                                        className="bg-[#00C853] text-[#07110A] hover:bg-[#39FF88] font-semibold h-9 px-5 text-sm"
                                      >
                                        {savingInventory
                                          ? t("supplier_saving")
                                          : t("supplier_save_changes")}
                                      </Button>
                                      <Button
                                        variant="outline"
                                        onClick={() =>
                                          setEditingInventoryId(null)
                                        }
                                        className="border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.1)] h-9 px-4 text-sm"
                                      >
                                        {t("supplier_cancel")}
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* ── ORDERS TAB ── */}
            {activeTab === "orders" && (
              <>
                {loadingOrders && (
                  <p className="text-[#4A6B50] dark:text-[#7A9A80] text-sm">
                    {t("supplier_loading_orders")}
                  </p>
                )}
                {!loadingOrders && (
                  <div className="rounded-xl border border-[rgba(0,200,83,0.15)] overflow-hidden">
                    {orders.length === 0 ? (
                      <div className="px-6 py-12 text-center">
                        <p className="text-[#4A6B50] dark:text-[#7A9A80] text-sm">
                          {t("supplier_no_orders")}
                        </p>
                        <p className="text-[#7A9A80] dark:text-[#3D5942] text-xs mt-1">
                          {t("supplier_no_orders_hint")}
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-[#E8F2EA] dark:bg-[#0D1810] border-b border-[rgba(0,200,83,0.12)]">
                              <Th>#</Th>
                              <Th>{t("supplier_col_part_name")}</Th>
                              <Th>{t("supplier_col_vehicle")}</Th>
                              <Th>{t("supplier_col_price")}</Th>
                              <Th>{t("supplier_col_tracking")}</Th>
                              <Th>{t("supplier_col_status")}</Th>
                              <Th>{t("supplier_col_actions")}</Th>
                            </tr>
                          </thead>
                          <tbody>
                            {orders.map((order) => (
                              <>
                                <tr
                                  key={order.id}
                                  className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                                >
                                  <td className="px-5 py-3 text-[#7A9A80] dark:text-[#3D5942] font-mono text-xs">
                                    #{order.id}
                                  </td>
                                  <td className="px-5 py-3 text-[#07110A] dark:text-white">
                                    {order.partRequest?.partName ??
                                      order.partName ??
                                      "—"}
                                  </td>
                                  <td className="px-5 py-3 text-[#4A6B50] dark:text-[#7A9A80] text-xs">
                                    {order.partRequest?.vehicleMake ?? "—"}{" "}
                                    {order.partRequest?.model ?? ""}
                                  </td>
                                  <td className="px-5 py-3 text-[#00C853] font-semibold">
                                    ${order.price.toLocaleString()}
                                  </td>
                                  <td className="px-5 py-3 font-mono text-xs">
                                    <span
                                      className={
                                        order.trackingNumber
                                          ? "text-[#07110A] dark:text-white"
                                          : "text-[#7A9A80] dark:text-[#3D5942]"
                                      }
                                    >
                                      {order.trackingNumber || "—"}
                                    </span>
                                  </td>
                                  <td className="px-5 py-3">
                                    <Badge
                                      className={cn(
                                        "text-[10px]",
                                        statusBadge(order.status),
                                      )}
                                    >
                                      {orderStatusLabel[order.status] ??
                                        String(order.status)}
                                    </Badge>
                                  </td>
                                  <td className="px-5 py-3">
                                    <Button
                                      size="sm"
                                      onClick={() =>
                                        editingOrderId === order.id
                                          ? setEditingOrderId(null)
                                          : startEditOrder(order)
                                      }
                                      className="bg-[rgba(0,200,83,0.12)] text-[#00C853] hover:bg-[rgba(0,200,83,0.2)] border border-[rgba(0,200,83,0.2)] h-7 text-xs px-3"
                                    >
                                      {editingOrderId === order.id
                                        ? t("supplier_close")
                                        : t("supplier_update_order")}
                                    </Button>
                                  </td>
                                </tr>
                                {editingOrderId === order.id && (
                                  <tr key={`edit-${order.id}`}>
                                    <td
                                      colSpan={7}
                                      className="bg-[#0A1510] border-b border-[rgba(0,200,83,0.12)] px-5 py-4"
                                    >
                                      <div className="flex items-end gap-4 flex-wrap">
                                        <div className="space-y-1">
                                          <p className="text-[#4A6B50] dark:text-[#7A9A80] text-[10px] font-mono uppercase tracking-widest">
                                            {t("supplier_order_status")}
                                          </p>
                                          <select
                                            value={orderEdit.status}
                                            onChange={(e) =>
                                              setOrderEdit((s) => ({
                                                ...s,
                                                status: Number(e.target.value),
                                              }))
                                            }
                                            className="h-9 px-3 rounded-lg bg-white dark:bg-[#111C14] border border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.1)] text-[#07110A] dark:text-white focus:outline-none focus:border-[#00C853] text-sm"
                                          >
                                            <option value={0}>
                                              {t(
                                                "supplier_order_status_pending",
                                              )}
                                            </option>
                                            <option value={1}>
                                              {t(
                                                "supplier_order_status_shipped",
                                              )}
                                            </option>
                                            <option value={2}>
                                              {t(
                                                "supplier_order_status_delivered",
                                              )}
                                            </option>
                                          </select>
                                        </div>
                                        <div className="space-y-1">
                                          <p className="text-[#4A6B50] dark:text-[#7A9A80] text-[10px] font-mono uppercase tracking-widest">
                                            {t("supplier_order_tracking")}
                                          </p>
                                          <Input
                                            value={orderEdit.trackingNumber}
                                            onChange={(e) =>
                                              setOrderEdit((s) => ({
                                                ...s,
                                                trackingNumber: e.target.value,
                                              }))
                                            }
                                            placeholder="e.g. TRK-00123"
                                            className="bg-white dark:bg-[#111C14] border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.1)] text-[#07110A] dark:text-white placeholder:text-[#7A9A80] dark:placeholder:text-[#3D5942] focus:border-[#00C853] h-9 w-44"
                                          />
                                        </div>
                                        <Button
                                          onClick={() => saveOrderEdit(order)}
                                          disabled={orderEdit.saving}
                                          className="bg-[#00C853] text-[#07110A] hover:bg-[#39FF88] h-9 px-5 text-sm font-semibold"
                                        >
                                          {orderEdit.saving
                                            ? t("supplier_saving")
                                            : t("supplier_save_order")}
                                        </Button>
                                        <Button
                                          variant="outline"
                                          onClick={() =>
                                            setEditingOrderId(null)
                                          }
                                          className="border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.1)] text-[#4A6B50] dark:text-[#7A9A80] bg-transparent hover:text-[#07110A] dark:hover:text-white h-9 px-4 text-sm"
                                        >
                                          {t("supplier_cancel")}
                                        </Button>
                                      </div>
                                      {orderEdit.error && (
                                        <p className="text-red-400 text-xs mt-2">
                                          {orderEdit.error}
                                        </p>
                                      )}
                                    </td>
                                  </tr>
                                )}
                              </>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* ── Advertisement Modal (commented out, you can enable later) ── */}
            {/* <AdvertModal ... /> */}
          </>
        )}
      </main>
    </div>
  );
}

// ‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐
// Helper components
// ‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-5 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-[#4A6B50] dark:text-[#7A9A80]">
      {children}
    </th>
  );
}

function InfoCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-[#111C14] rounded-xl border border-[rgba(0,200,83,0.1)] px-4 py-3">
      <p className="text-[10px] font-mono uppercase tracking-widest text-[#4A6B50] dark:text-[#7A9A80] mb-1">
        {label}
      </p>
      <div className="text-[#07110A] dark:text-white text-sm">{value}</div>
    </div>
  );
}
