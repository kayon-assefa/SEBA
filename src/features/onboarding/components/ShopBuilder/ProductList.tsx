// File: src/features/onboarding/components/ShopBuilder/ProductList.tsx
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { onboardingService } from "../../services/onboarding.service";
import ProductForm from "./ProductForm";

function IconPlus({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.25} strokeLinecap="round" className={className}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
function IconX({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className={className}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
function IconPackage({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m3.3 7 8.7 5 8.7-5M12 22V12" />
      <path d="M21 16.5V7.5a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 7.5v9a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.73Z" />
    </svg>
  );
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  price_type: "fixed" | "negotiable";
  stock: number;
  allow_backorder: boolean;
  category: string;
  images: string[];
  active: boolean;
}

function StockBadge({ product }: { product: Product }) {
  if (product.stock > 0) {
    return (
      <span className="rounded-full bg-[#2B2B2B]/5 px-2.5 py-1 text-xs font-medium text-[#2B2B2B]">
        {product.stock} in stock
      </span>
    );
  }

  if (product.allow_backorder) {
    return (
      <span className="rounded-full bg-[#D9A441]/10 px-2.5 py-1 text-xs font-medium text-[#D9A441]">
        Backorder available
      </span>
    );
  }

  return (
    <span className="rounded-full bg-[#F25F5C]/10 px-2.5 py-1 text-xs font-medium text-[#F25F5C]">
      Out of stock
    </span>
  );
}

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!showModal) return;
    document.body.style.overflow = "hidden";
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setShowModal(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [showModal]);

  async function load() {
    setLoading(true);
    try {
      const data = await onboardingService.getProducts();
      setProducts(data || []);
    } finally {
      setLoading(false);
    }
  }

  function handleSaved() {
    setShowModal(false);
    load();
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[#2B2B2B]">Products</h2>
          <p className="mt-1 text-sm text-[#707070]">
            What customers will see on your shop page.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 rounded-[16px] bg-[#F25F5C] px-5 py-3 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(242,95,92,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#e14e4b] hover:shadow-[0_6px_18px_rgba(242,95,92,0.45)] active:scale-[0.98]"
        >
          <IconPlus />
          Add Product
        </button>
      </div>

      {/* Storefront preview */}
      <div className="overflow-hidden rounded-[24px] border border-[#F0E3DE] bg-white">
        <div className="flex items-center gap-2 border-b border-[#F0E3DE] bg-[#FFF9F7] px-4 py-3">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#F25F5C]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#D9A441]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#7A263A]" />
          </div>
          <div className="ml-2 flex-1 truncate rounded-full border border-[#F0E3DE] bg-white px-3 py-1 text-xs text-[#707070]">
            seba.com/yourbusiness/shop
          </div>
        </div>

        <div className="p-5">
          {loading && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="aspect-[3/4] animate-pulse rounded-[16px] bg-[#FFF9F7]" />
              ))}
            </div>
          )}

          {!loading && products.length === 0 && (
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="flex w-full flex-col items-center justify-center gap-2 rounded-[16px] border-2 border-dashed border-[#F0E3DE] py-12 text-center transition-colors duration-200 hover:border-[#D9A441] hover:bg-[#FFF9F7]"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F25F5C]/10 text-[#F25F5C]">
                <IconPackage className="h-5 w-5" />
              </span>
              <span className="font-medium text-[#2B2B2B]">Your shop is empty</span>
              <span className="text-sm text-[#707070]">
                Add a product to see how your shop page will look
              </span>
            </button>
          )}

          {!loading && products.length > 0 && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className={`overflow-hidden rounded-[16px] border border-[#F0E3DE] transition-shadow duration-200 hover:shadow-[0_8px_20px_rgba(122,38,58,0.08)] ${
                    !product.active ? "opacity-50" : ""
                  }`}
                >
                  <div className="relative aspect-square bg-[#FFF9F7]">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[#B8ADA8]">
                        <IconPackage className="h-6 w-6" />
                      </div>
                    )}

                    {product.images && product.images.length > 1 && (
                      <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
                        {product.images.map((_, i) => (
                          <span
                            key={i}
                            className={`h-1.5 w-1.5 rounded-full ${
                              i === 0 ? "bg-white" : "bg-white/50"
                            }`}
                          />
                        ))}
                      </div>
                    )}

                    {!product.active && (
                      <span className="absolute left-2 top-2 rounded-full bg-[#2B2B2B]/80 px-2 py-0.5 text-[10px] font-medium text-white">
                        Hidden
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 p-3">
                    <p className="truncate text-xs font-medium uppercase tracking-wide text-[#D9A441]">
                      {product.category}
                    </p>
                    <p className="truncate font-medium text-[#2B2B2B]">{product.name}</p>

                    <p className="text-sm font-semibold text-[#F25F5C]">
                      {product.price_type === "negotiable"
                        ? `From ${product.price} ETB`
                        : `${product.price} ETB`}
                    </p>

                    <StockBadge product={product} />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Product modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-[#2B2B2B]/40 backdrop-blur-sm sm:items-center"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[85vh] w-full overflow-y-auto rounded-t-[24px] bg-white p-6 shadow-xl sm:max-w-lg sm:rounded-[24px]"
            >
              <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-[#F0E3DE] sm:hidden" />

              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#2B2B2B]">Add Product</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-[#707070] transition-colors duration-200 hover:bg-[#FFF9F7] hover:text-[#2B2B2B]"
                  aria-label="Close"
                >
                  <IconX />
                </button>
              </div>

              <ProductForm onSaved={handleSaved} onCancel={() => setShowModal(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}