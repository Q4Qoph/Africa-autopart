// src/frontend/src/pages/admin/AdminRequestsPage.tsx
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { requestApi } from "@/api/requestApi";
import { supplierApi } from "@/api/supplierApi";
import { orderApi } from "@/api/orderApi";
import type { PartRequest } from "@/types/request";
import type { Supplier } from "@/types/supplier";
import { Urgency } from "@/types/request";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

const urgencyClass: Record<number, string> = {
  [Urgency.Standard]:
    "bg-[rgba(0,200,83,0.08)] text-[#00C853] border-[rgba(0,200,83,0.2)]",
  [Urgency.Express]: "bg-blue-900/30 text-blue-300 border-blue-700/30",
  [Urgency.Urgent]: "bg-red-900/30 text-red-400 border-red-700/30",
};

interface CreateOrderPanel {
  requestId: number;
  partName: string;
}

interface FlatPart {
  id: number;
  partName: string;
  partNumber: string;
  condition: string;
  price: number;
  stock: number;
  supplierId: number;
  supplierName: string;
}

export default function AdminRequestsPage() {
  const { auth } = useAuth();
  const { t } = useTranslation("admin");
  const { t: tReq } = useTranslation("requests");
  const [requests, setRequests] = useState<PartRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "open" | "sorted">("all");

  // Create-order panel state
  const [panel, setPanel] = useState<CreateOrderPanel | null>(null);
  const [allParts, setAllParts] = useState<FlatPart[]>([]);
  const [loadingAll, setLoadingAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<FlatPart[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searching, setSearching] = useState(false);
  const [selectedPart, setSelectedPart] = useState<FlatPart | null>(null);
  const [price, setPrice] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [orderRef, setOrderRef] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const [pickUpLocation, setPickUpLocation] = useState("");
  const [pickUpPhone, setPickUpPhone] = useState("");

  const urgencyLabel: Record<number, string> = {
    [Urgency.Standard]: tReq("urgency_standard_short"),
    [Urgency.Express]: tReq("urgency_express_short"),
    [Urgency.Urgent]: tReq("urgency_urgent_short"),
  };

  const filterLabel: Record<string, string> = {
    all: t("requests_filter_all"),
    open: t("requests_filter_open"),
    sorted: t("requests_filter_sorted"),
  };

  useEffect(() => {
    if (!auth) return;
    requestApi
      .getAll(auth.token)
      .then(({ data }) => setRequests(data))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [auth]);

  async function handleMarkSorted(id: number) {
    if (!auth) return;
    try {
      await requestApi.markAsSorted(id, auth.token);
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, isSorted: true } : r)),
      );
    } catch {
      alert(t("requests_sorted_error"));
    }
  }

  async function handleDelete(id: number, partName: string) {
    if (
      !window.confirm(
        `${t("requests_delete")} "${partName}"? This cannot be undone.`,
      )
    )
      return;
    if (!auth) return;
    try {
      await requestApi.delete(id, auth.token);
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch {
      alert(t("requests_delete_error"));
    }
  }

  function flattenSuppliers(suppliers: Supplier[]): FlatPart[] {
    return suppliers.flatMap((s) =>
      (s.parts ?? []).map((p) => ({
        id: p.id,
        partName: p.partName,
        partNumber: p.partNumber,
        condition: p.condition,
        price: p.price,
        stock: p.stock,
        supplierId: s.id,
        supplierName: s.businessName,
      })),
    );
  }

  async function openPanel(req: PartRequest) {
    setPanel({ requestId: req.id, partName: req.partName });
    setSearchTerm("");
    setSearchResults([]);
    setHasSearched(false);
    setSelectedPart(null);
    setPrice("");
    setCreateError("");
    setOrderRef("");
    setLoadingAll(true);
    setPickUpLocation("");
    setPickUpPhone("");
    try {
      const { data } = await supplierApi.getAll();
      setAllParts(flattenSuppliers(data));
    } catch {
      setAllParts([]);
    } finally {
      setLoadingAll(false);
    }
    setTimeout(() => searchRef.current?.focus(), 50);
  }

  function closePanel() {
    setPanel(null);
    setOrderRef("");
    setAllParts([]);
  }

  async function handleSearch() {
    if (!auth || !searchTerm.trim()) return;
    setSearching(true);
    setSearchResults([]);
    setSelectedPart(null);
    setHasSearched(true);
    try {
      const { data } = await supplierApi.search(searchTerm.trim(), auth.token);
      const flat: FlatPart[] = data.map((p) => ({
        id: p.id,
        partName: p.partName,
        partNumber: p.partNumber,
        condition: p.condition,
        price: p.price,
        stock: p.stock,
        supplierId: p.supplierId,
        supplierName:
          allParts.find((ap) => ap.supplierId === p.supplierId)?.supplierName ??
          `Supplier #${p.supplierId}`,
      }));
      setSearchResults(flat);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }

  function clearSearch() {
    setSearchTerm("");
    setSearchResults([]);
    setHasSearched(false);
    setSelectedPart(null);
  }

  function selectPart(part: FlatPart) {
    setSelectedPart(part);
    setPrice(String(part.price));
  }

  async function handleCreateOrder() {
    if (!auth || !panel || !selectedPart) return;
    setCreateError("");
    setCreating(true);
    try {
      const { data: ref } = await orderApi.create(
        {
          partRequestId: panel.requestId,
          pickUpLocation: pickUpLocation.trim(),
          pickUpLocationPhoneNumber: pickUpPhone.trim(),
          orderItems: [
            {
              partName: selectedPart.partName,
              supplierName: selectedPart.supplierName,
              price: Number(price),
              quantity: 1,
            },
          ],
        },
        auth.token,
      )
      setOrderRef(String(ref));
      setSelectedPart(null);
      setSearchResults([]);
      setSearchTerm("");
      setHasSearched(false);
      const { data } = await requestApi.getAll(auth.token);
      setRequests(data);
    } catch {
      setCreateError(t("requests_panel_create_error"));
    } finally {
      setCreating(false);
    }
  }

  const displayParts = hasSearched ? searchResults : allParts;

  const filtered = requests.filter((r) => {
    if (filter === "open") return !r.isSorted;
    if (filter === "sorted") return r.isSorted;
    return true;
  });

  return (
    <div>
      <div className="mb-6">
        <p className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-[#00C853] mb-2">
          <span className="block w-6 h-px bg-[#00C853]" />
          {t("admin_label")}
        </p>
        <h1 className="text-2xl font-extrabold text-[#07110A] dark:text-white">
          {t("requests_heading")}
        </h1>
        <p className="text-[#4A6B50] dark:text-[#7A9A80] text-sm mt-1">
          {t("requests_count", { count: requests.length })}
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-5">
        {(["all", "open", "sorted"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors ${filter === f
                ? "bg-[rgba(0,200,83,0.12)] text-[#00C853] border border-[rgba(0,200,83,0.3)]"
                : "text-[#4A6B50] dark:text-[#7A9A80] border border-transparent hover:text-[#07110A] dark:hover:text-white"
              }`}
          >
            {filterLabel[f]}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-[#4A6B50] dark:text-[#7A9A80] text-sm">
          {t("loading")}
        </p>
      ) : (
        <div className="rounded-xl border border-border/80 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[rgba(0,200,83,0.12)] bg-[#E8F2EA] dark:bg-[#0D1810]">
                <TableHead className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-[#4A6B50] dark:text-[#7A9A80]">{t("requests_col_id")}</TableHead>
                <TableHead className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-[#4A6B50] dark:text-[#7A9A80]">{t("requests_col_part")}</TableHead>
                <TableHead className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-[#4A6B50] dark:text-[#7A9A80]">{t("requests_col_vehicle")}</TableHead>
                <TableHead className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-[#4A6B50] dark:text-[#7A9A80]">{t("requests_col_urgency")}</TableHead>
                <TableHead className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-[#4A6B50] dark:text-[#7A9A80]">{t("requests_col_orders")}</TableHead>
                <TableHead className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-[#4A6B50] dark:text-[#7A9A80]">{t("requests_col_status")}</TableHead>
                <TableHead className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-[#4A6B50] dark:text-[#7A9A80]">{t("requests_col_date")}</TableHead>
                <TableHead className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-[#4A6B50] dark:text-[#7A9A80]">{t("requests_col_actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow
                  key={r.id}
                  className="border-b border-border/50 hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors"
                >
                  <TableCell className="px-4 py-3 text-[#4A6B50] dark:text-[#7A9A80] font-mono">
                    #{r.id}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-[#07110A] dark:text-white font-medium">
                    {r.partName}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-[#4A6B50] dark:text-[#7A9A80]">
                    {r.vehicleMake} {r.model} {r.year}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Badge
                      className={`text-[10px] border ${urgencyClass[r.urgency] ?? ""}`}
                    >
                      {urgencyLabel[r.urgency] ?? r.urgency}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <span className="text-[#4A6B50] dark:text-[#7A9A80] text-xs font-mono">
                      {r.orders?.length ?? 0}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    {r.isSorted ? (
                      <Badge className="bg-[rgba(0,200,83,0.08)] text-[#00C853] border-[rgba(0,200,83,0.2)] text-[10px]">
                        {t("requests_status_sorted")}
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-900/30 text-amber-300 border-amber-700/30 text-[10px]">
                        {t("requests_status_open")}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-[#4A6B50] dark:text-[#7A9A80] text-xs">
                    {new Date(r.dateCreated).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      {!r.isSorted && (
                        <Button
                          size="sm"
                          onClick={() => openPanel(r)}
                          className="bg-blue-600 text-white hover:bg-blue-500 h-7 text-xs px-3 font-semibold"
                        >
                          {t("requests_create_order")}
                        </Button>
                      )}
                      {!r.isSorted && (
                        <Button
                          size="sm"
                          onClick={() => handleMarkSorted(r.id)}
                          className="bg-[#00C853] text-[#07110A] hover:bg-[#39FF88] h-7 text-xs px-3 font-semibold"
                        >
                          {t("requests_mark_sorted")}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(r.id, r.partName)}
                        className="border-red-400/30 text-red-400 bg-transparent hover:bg-red-400/10 h-7 text-xs px-3"
                      >
                        {t("requests_delete")}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="py-8 text-center text-[#4A6B50] dark:text-[#7A9A80] text-sm"
                  >
                    {t("requests_no_requests")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Dialog for Creating Order */}
      <Dialog open={!!panel} onOpenChange={(open) => !open && closePanel()}>
        <DialogContent className="sm:max-w-3xl bg-card dark:bg-[#111C14] text-foreground border border-border shadow-2xl p-6 rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-[#00C853] dark:text-[#39FF88]">
              {panel ? t("requests_panel_title", { partName: panel.partName }) : ""}
            </DialogTitle>
          </DialogHeader>

          {panel && (
            <div className="space-y-4 my-2">
              {/* Search bar */}
              <div className="flex gap-2">
                <Input
                  ref={searchRef}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    if (!e.target.value) clearSearch();
                  }}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleSearch()
                  }
                  placeholder={t("requests_panel_search_placeholder")}
                  className="bg-white dark:bg-[#07110A] border-[rgba(0,0,0,0.12)] dark:border-slate-800 text-[#07110A] dark:text-white placeholder:text-[#7A9A80] dark:placeholder:text-[#3D5942] focus:border-[#00C853] h-10 w-full"
                />
                <Button
                  onClick={handleSearch}
                  disabled={searching || !searchTerm.trim()}
                  className="bg-[#00C853] text-[#07110A] hover:bg-[#39FF88] h-10 px-5 font-semibold shrink-0"
                >
                  {searching ? t("requests_panel_searching") : t("requests_panel_search")}
                </Button>
                {hasSearched && (
                  <Button
                    onClick={clearSearch}
                    variant="outline"
                    className="border-[rgba(0,0,0,0.12)] dark:border-slate-800 text-[#4A6B50] dark:text-[#7A9A80] bg-transparent hover:bg-slate-100 dark:hover:bg-slate-900 h-10 px-4"
                  >
                    {t("requests_panel_clear")}
                  </Button>
                )}
              </div>

              {/* Status/Header text */}
              <p className="text-xs font-mono text-[#7A9A80] dark:text-[#3D5942]">
                {hasSearched
                  ? t(
                      searchResults.length === 1
                        ? "requests_panel_result_one"
                        : "requests_panel_results",
                      {
                        count: searchResults.length,
                        term: searchTerm,
                      },
                    )
                  : loadingAll
                    ? t("requests_panel_loading")
                    : t("requests_panel_all_parts", {
                      count: allParts.length,
                    })}
              </p>

              {/* Parts selection list */}
              {!loadingAll && displayParts.length > 0 && (
                <div className="rounded-lg border border-[rgba(0,0,0,0.1)] dark:border-slate-800 overflow-hidden max-h-60 overflow-y-auto">
                  <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr] gap-3 px-4 py-2 bg-[#E8F2EA] dark:bg-[#0D1810] border-b border-[rgba(0,0,0,0.1)] dark:border-slate-800 text-[10px] font-mono uppercase tracking-widest text-[#7A9A80] dark:text-[#3D5942] sticky top-0 z-10">
                    <span>{t("requests_panel_col_part")}</span>
                    <span>{t("requests_panel_col_supplier")}</span>
                    <span>{t("requests_panel_col_condition")}</span>
                    <span>{t("requests_panel_col_stock")}</span>
                    <span>{t("requests_panel_col_price")}</span>
                  </div>
                  <div className="divide-y divide-[rgba(0,0,0,0.06)] dark:divide-slate-800/60">
                    {displayParts.map((part) => (
                      <button
                        key={part.id}
                        type="button"
                        onClick={() => selectPart(part)}
                        className={`w-full text-left grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr] gap-3 items-center px-4 py-2.5 transition-colors ${
                          selectedPart?.id === part.id
                            ? "bg-[rgba(0,200,83,0.1)] border-l-2 border-l-[#00C853]"
                            : "hover:bg-[rgba(0,0,0,0.04)] dark:hover:bg-slate-900/60"
                        }`}
                      >
                        <div>
                          <p className="text-[#07110A] dark:text-white text-sm font-medium leading-tight">
                            {part.partName}
                          </p>
                          {part.partNumber && (
                            <p className="text-[#7A9A80] dark:text-[#3D5942] text-[10px] font-mono">
                              {part.partNumber}
                            </p>
                          )}
                        </div>
                        <p className="text-[#4A6B50] dark:text-[#7A9A80] text-xs truncate">
                          {part.supplierName}
                        </p>
                        <div>
                          <Badge className="bg-[rgba(0,200,83,0.06)] text-[#00C853] border-[rgba(0,200,83,0.15)] text-[10px] py-0 px-1.5 whitespace-nowrap">
                            {part.condition}
                          </Badge>
                        </div>
                        <span className="text-[#4A6B50] dark:text-[#7A9A80] text-xs font-mono">
                          {part.stock}
                        </span>
                        <span className="text-[#00C853] font-semibold text-sm whitespace-nowrap">
                          ${part.price.toLocaleString()}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {hasSearched && searchResults.length === 0 && !searching && (
                <p className="text-[#4A6B50] dark:text-[#7A9A80] text-xs py-4 text-center">
                  {t("requests_panel_no_match", { term: searchTerm })}
                </p>
              )}

              {/* Confirm details form */}
              {selectedPart && (
                <div className="space-y-3 p-4 bg-[rgba(0,200,83,0.04)] dark:bg-[#07110A]/40 border border-[rgba(0,200,83,0.15)] rounded-xl mt-3 animate-in fade-in duration-200">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <p className="text-[#00C853] text-[10px] font-mono uppercase tracking-wider mb-0.5">
                        {t("requests_panel_selected")}
                      </p>
                      <p className="text-[#07110A] dark:text-white text-base font-bold">
                        {selectedPart.partName}
                      </p>
                      <p className="text-xs text-[#4A6B50] dark:text-[#7A9A80]">
                        Supplier: <span className="font-semibold">{selectedPart.supplierName}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[#7A9A80] text-[10px] font-mono uppercase">Original Price</p>
                      <p className="text-base font-extrabold text-[#00C853]">${selectedPart.price}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                    <div className="space-y-1">
                      <label className="text-[#4A6B50] dark:text-[#7A9A80] text-[10px] font-mono uppercase tracking-wider">
                        {t("requests_panel_price_label")}
                      </label>
                      <Input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="bg-white dark:bg-[#07110A] border-[rgba(0,0,0,0.12)] dark:border-slate-800 text-[#07110A] dark:text-white focus:border-[#00C853] h-10 w-full"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[#4A6B50] dark:text-[#7A9A80] text-[10px] font-mono uppercase tracking-wider">
                        {t("requests_panel_location_label")}
                      </label>
                      <Input
                        value={pickUpLocation}
                        onChange={(e) => setPickUpLocation(e.target.value)}
                        placeholder="e.g. Nairobi CBD"
                        className="bg-white dark:bg-[#07110A] border-[rgba(0,0,0,0.12)] dark:border-slate-800 text-[#07110A] dark:text-white focus:border-[#00C853] h-10 w-full"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[#4A6B50] dark:text-[#7A9A80] text-[10px] font-mono uppercase tracking-wider">
                        {t("requests_panel_phone_label")}
                      </label>
                      <Input
                        value={pickUpPhone}
                        onChange={(e) => setPickUpPhone(e.target.value)}
                        placeholder="2547XXXXXXXX"
                        className="bg-white dark:bg-[#07110A] border-[rgba(0,0,0,0.12)] dark:border-slate-800 text-[#07110A] dark:text-white focus:border-[#00C853] h-10 w-full"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-3">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedPart(null)}
                      className="border-[rgba(0,0,0,0.12)] dark:border-slate-800 text-[#4A6B50] dark:text-[#7A9A80] bg-transparent hover:text-slate-800 dark:hover:text-white h-10 px-4"
                    >
                      {t("requests_panel_deselect")}
                    </Button>
                    <Button
                      onClick={handleCreateOrder}
                      disabled={creating || !price}
                      className="bg-[#00C853] text-[#07110A] hover:bg-[#39FF88] h-10 px-5 font-semibold"
                    >
                      {creating ? t("requests_panel_confirming") : t("requests_panel_confirm")}
                    </Button>
                  </div>
                </div>
              )}

              {/* Success */}
              {orderRef && (
                <div className="mt-4 flex items-center gap-3 bg-[rgba(0,200,83,0.08)] border border-[rgba(0,200,83,0.25)] rounded-lg px-4 py-3 animate-in zoom-in-95 duration-200">
                  <span className="text-[#00C853] text-lg font-bold">✓</span>
                  <div>
                    <p className="text-[#00C853] text-sm font-semibold">
                      {t("requests_panel_success")}
                    </p>
                    <p className="text-[#4A6B50] dark:text-[#7A9A80] text-xs font-mono mt-0.5">
                      {t("requests_panel_order_ref")}{" "}
                      <span className="text-[#07110A] dark:text-white font-bold">
                        {orderRef}
                      </span>
                    </p>
                  </div>
                  <Button
                    onClick={closePanel}
                    className="ml-auto bg-[#00C853] hover:bg-[#39FF88] text-[#07110A] h-9 text-xs px-4"
                  >
                    {t("requests_panel_close")}
                  </Button>
                </div>
              )}

              {createError && (
                <p className="text-red-400 text-xs mt-3 bg-red-950/20 border border-red-900/30 rounded p-2.5">
                  {createError}
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}


