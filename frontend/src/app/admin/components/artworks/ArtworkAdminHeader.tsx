import { Grip } from "lucide-react";

export function ArtworkAdminHeader({
  artworkCount,
  isFormOpen,
  isOrderingShop,
  payloadRefreshLoading,
  onRefreshPayloads,
  onToggleShopOrder,
  onToggleEditor,
}: {
  artworkCount: number;
  isFormOpen: boolean;
  isOrderingShop: boolean;
  payloadRefreshLoading: boolean;
  onRefreshPayloads: () => void;
  onToggleShopOrder: () => void;
  onToggleEditor: () => void;
}) {
  return (
    <div className="flex flex-wrap justify-between items-start gap-4 pb-6 border-b border-[#31323E]/8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-[#31323E] mb-1">
          Artwork Workbench
        </h2>
        <p className="text-sm text-[#31323E]/50 font-medium">
          {artworkCount} artworks in one editor
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {!isOrderingShop ? (
          <>
            <button
              type="button"
              onClick={onRefreshPayloads}
              disabled={payloadRefreshLoading}
              className="px-5 py-2.5 rounded-xl border border-[#31323E]/15 bg-white text-[#31323E] text-sm font-bold uppercase tracking-[0.14em] disabled:opacity-50"
            >
              {payloadRefreshLoading ? "Refreshing..." : "Refresh Payloads"}
            </button>
            <button
              type="button"
              onClick={onToggleEditor}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold uppercase tracking-[0.14em] transition-colors ${isFormOpen ? "bg-[#31323E]/10 text-[#31323E] border border-[#31323E]/15" : "bg-[#31323E] text-white hover:bg-[#434455]"}`}
            >
              {isFormOpen ? "Close Editor" : "New Artwork"}
            </button>
          </>
        ) : null}
        <button
          type="button"
          onClick={onToggleShopOrder}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold uppercase tracking-[0.14em] transition-colors ${isOrderingShop ? "bg-[#31323E]/10 text-[#31323E] border border-[#31323E]/15" : "bg-white text-[#31323E] border border-[#31323E]/15 hover:bg-[#31323E]/5"}`}
        >
          <Grip className="h-4 w-4" aria-hidden="true" />
          {isOrderingShop ? "Close Order" : "Arrange Shop"}
        </button>
      </div>
    </div>
  );
}

export function ArtworkNotice({
  message,
  tone,
}: {
  message: string | null;
  tone: "success" | "error";
}) {
  if (!message) return null;
  const classes =
    tone === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-rose-200 bg-rose-50 text-rose-700";
  return (
    <div
      className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${classes}`}
    >
      {message}
    </div>
  );
}
