// File: src/features/onboarding/components/ShopBuilder/ProductForm.tsx
import { useState } from "react";
import toast from "react-hot-toast";
import { onboardingService } from "../../services/onboarding.service";
import type { PriceType } from "../../types/product";

const PRODUCT_CATEGORIES = [
  "Hair Care",
  "Skin Care",
  "Grooming Tools",
  "Fragrances",
  "Beauty Accessories",
  "Apparel",
  "Other",
];

const inputClass =
  "w-full rounded-[16px] border border-[#F0E3DE] bg-white px-4 py-3 text-[#2B2B2B] placeholder:text-[#B8ADA8] outline-none transition-all duration-200 focus:border-[#F25F5C] focus:ring-4 focus:ring-[#F25F5C]/10";

function IconImage({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <circle cx="9" cy="9" r="1.5" fill="currentColor" stroke="none" />
      <path d="m21 15-5-5-9 9" />
    </svg>
  );
}

function IconX({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.25} strokeLinecap="round" className={className}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${
        checked ? "bg-[#F25F5C]" : "bg-[#F0E3DE]"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

interface ProductFormProps {
  onSaved: () => void;
  onCancel: () => void;
}

const emptyImages: (string | null)[] = [null, null, null];

export default function ProductForm({ onSaved, onCancel }: ProductFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState(0);
  const [priceType, setPriceType] = useState<PriceType>("fixed");
  const [stock, setStock] = useState(0);
  const [allowBackorder, setAllowBackorder] = useState(false);
  const [active, setActive] = useState(true);
  const [images, setImages] = useState<(string | null)[]>(emptyImages);
  const [saving, setSaving] = useState(false);

  function handleImageUpload(index: number, file: File | undefined) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImages((prev) => {
        const next = [...prev];
        next[index] = reader.result as string;
        return next;
      });
    };
    reader.readAsDataURL(file);
  }

  function removeImage(index: number) {
    setImages((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
  }

  async function save() {
    if (!name.trim()) {
      toast.error("Give the product a name first");
      return;
    }

    if (!category) {
      toast.error("Choose a category");
      return;
    }

    setSaving(true);
    try {
      await onboardingService.createProduct({
        name,
        description,
        price,
        price_type: priceType,
        stock,
        allow_backorder: allowBackorder,
        category,
        images: images.filter((img): img is string => Boolean(img)),
        active,
      });

      toast.success("Product Added");

      setName("");
      setDescription("");
      setCategory("");
      setPrice(0);
      setPriceType("fixed");
      setStock(0);
      setAllowBackorder(false);
      setActive(true);
      setImages(emptyImages);

      onSaved();
    } catch (err) {
      console.error(err);
      toast.error("Failed to add product");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Name */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[#2B2B2B]">Product Name</label>
        <input
          className={inputClass}
          placeholder="Classic Fade Kit"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[#2B2B2B]">Description</label>
        <textarea
          rows={3}
          className={`${inputClass} resize-none`}
          placeholder="Describe the product..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {/* Category */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[#2B2B2B]">Category</label>
        <select
          className={`${inputClass} appearance-none`}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Select a category</option>
          {PRODUCT_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Price + price type */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-[#2B2B2B]">
            {priceType === "fixed" ? "Price (ETB)" : "Starting Price (ETB)"}
          </label>

          <div className="flex overflow-hidden rounded-full border border-[#F0E3DE]">
            <button
              type="button"
              onClick={() => setPriceType("fixed")}
              className={`px-3 py-1 text-xs font-medium transition-colors duration-200 ${
                priceType === "fixed" ? "bg-[#F25F5C] text-white" : "bg-white text-[#707070]"
              }`}
            >
              Fixed
            </button>
            <button
              type="button"
              onClick={() => setPriceType("negotiable")}
              className={`px-3 py-1 text-xs font-medium transition-colors duration-200 ${
                priceType === "negotiable" ? "bg-[#F25F5C] text-white" : "bg-white text-[#707070]"
              }`}
            >
              Negotiable
            </button>
          </div>
        </div>

        <input
          type="number"
          className={inputClass}
          placeholder="150"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
        />

        {priceType === "negotiable" && (
          <p className="text-xs text-[#707070]">
            Customers will see this as a starting price and can message you to negotiate.
          </p>
        )}
      </div>

      {/* Stock + backorder */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[#2B2B2B]">Stock Quantity</label>
        <input
          type="number"
          className={inputClass}
          placeholder="10"
          value={stock}
          onChange={(e) => setStock(Number(e.target.value))}
        />

        <div className="flex items-center justify-between rounded-[16px] border border-[#F0E3DE] px-4 py-3">
          <div>
            <p className="text-sm font-medium text-[#2B2B2B]">Allow backorders</p>
            <p className="text-xs text-[#707070]">
              Let customers order even after stock reaches zero
            </p>
          </div>
          <Toggle checked={allowBackorder} onChange={setAllowBackorder} />
        </div>
      </div>

      {/* Images */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[#2B2B2B]">Product Photos</label>
        <p className="text-xs text-[#707070]">Add up to 3 photos. The first is used as the cover.</p>

        <div className="grid grid-cols-3 gap-3">
          {images.map((img, index) => (
            <div key={index} className="relative aspect-square">
              {img ? (
                <>
                  <img
                    src={img}
                    alt={`Product photo ${index + 1}`}
                    className="h-full w-full rounded-[16px] border border-[#F0E3DE] object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#2B2B2B] text-white shadow transition-transform duration-150 hover:scale-110"
                    aria-label={`Remove photo ${index + 1}`}
                  >
                    <IconX />
                  </button>
                  {index === 0 && (
                    <span className="absolute bottom-1.5 left-1.5 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-medium text-[#2B2B2B]">
                      Cover
                    </span>
                  )}
                </>
              ) : (
                <label
                  htmlFor={`product-image-${index}`}
                  className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-[16px] border-2 border-dashed border-[#F0E3DE] text-[#B8ADA8] transition-colors duration-200 hover:border-[#D9A441] hover:text-[#D9A441]"
                >
                  <IconImage />
                  <span className="text-[10px] font-medium">Photo {index + 1}</span>
                  <input
                    id={`product-image-${index}`}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(index, e.target.files?.[0])}
                  />
                </label>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Active */}
      <div className="flex items-center justify-between rounded-[16px] border border-[#F0E3DE] px-4 py-3">
        <div>
          <p className="text-sm font-medium text-[#2B2B2B]">Active</p>
          <p className="text-xs text-[#707070]">Show this product on your shop page</p>
        </div>
        <Toggle checked={active} onChange={setActive} />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-[16px] border border-[#F0E3DE] bg-white px-6 py-3 font-medium text-[#2B2B2B] transition-all duration-200 hover:border-[#D9A441] hover:bg-[#FFF9F7] active:scale-[0.98]"
        >
          Cancel
        </button>

        <button
          onClick={save}
          disabled={saving}
          className="flex-1 rounded-[16px] bg-[#F25F5C] px-6 py-3 font-medium text-white shadow-[0_4px_14px_rgba(242,95,92,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#e14e4b] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {saving ? "Adding..." : "Add Product"}
        </button>
      </div>
    </div>
  );
}