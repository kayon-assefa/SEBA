import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import type { Product } from "../types/product";
import { formatCurrency } from "../utils/currency";

/**
 * Feature #50 - public shareable catalog link.
 * Route this at something like /catalog/:slug in your router. It reads
 * a single product via its public_slug, relying on the
 * "products_public_read" RLS policy in schema.sql, which only allows
 * anonymous reads for rows explicitly marked is_public = true.
 */
export default function PublicCatalog({ slug }: { slug: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("public_slug", slug)
        .eq("is_public", true)
        .maybeSingle();

      if (error || !data) {
        setNotFound(true);
      } else {
        setProduct(data);
      }

      setLoading(false);
    })();
  }, [slug]);

  if (loading) {
    return <div className="p-10 text-center text-gray-400">Loading…</div>;
  }

  if (notFound || !product) {
    return (
      <div className="p-10 text-center">
        <p className="text-lg font-semibold text-[#2B2B2B]">Product not found</p>
        <p className="mt-1 text-sm text-gray-500">This link may be private or no longer available.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg p-6">
      {product.image ? (
        <img src={product.image} alt={product.name} className="h-64 w-full rounded-2xl object-cover" />
      ) : (
        <div className="flex h-64 w-full items-center justify-center rounded-2xl bg-gray-100 text-5xl text-gray-300">📦</div>
      )}

      <h1 className="mt-5 text-2xl font-bold text-[#2B2B2B]">{product.name}</h1>
      {product.category && <p className="text-sm text-gray-500">{product.category}</p>}
      <p className="mt-3 text-3xl font-bold text-[#F25F5C]">
        {formatCurrency(product.price, product.currency)}
      </p>
      {product.description && <p className="mt-4 text-gray-600">{product.description}</p>}
    </div>
  );
}
