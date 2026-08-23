// File:
// src/features/public-business/components/PublicShopPage.tsx

import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../../../lib/supabase";
import { usePublicBusiness } from "../hooks/usePublicBusiness";
import type { ShopCustomer } from "../types/shop";

function money(value: number | null | undefined) {
  if (value == null) return "Price on request";

  return `${new Intl.NumberFormat("en-US").format(value)} ETB`;
}

function createReference() {
  return `SEBA-${Math.random()
    .toString(36)
    .slice(2, 8)
    .toUpperCase()}`;
}

export function PublicShopPage() {
  const { username = "" } = useParams<{ username: string }>();

  const { business, loading, error: businessError } =
    usePublicBusiness(username);

  const [category, setCategory] = useState("All");

  const [cart, setCart] = useState<Record<string, number>>({});

  const [checkout, setCheckout] = useState(false);

  const [customer, setCustomer] = useState<ShopCustomer>({
    name: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const [message, setMessage] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

  /*
  |--------------------------------------------------------------------------
  | CATEGORIES
  |--------------------------------------------------------------------------
  */

  const categories = useMemo(() => {
    const values = (business?.products ?? [])
      .map((product) => product.category)
      .filter(
        (value): value is string =>
          Boolean(value && value.trim())
      );

    return ["All", ...Array.from(new Set(values))];
  }, [business]);

  /*
  |--------------------------------------------------------------------------
  | PRODUCTS
  |--------------------------------------------------------------------------
  */

  const products = useMemo(() => {
    return (business?.products ?? []).filter((product) => {
      const matchesCategory =
        category === "All" ||
        product.category === category;

      return matchesCategory;
    });
  }, [business, category]);

  /*
  |--------------------------------------------------------------------------
  | CART ITEMS
  |--------------------------------------------------------------------------
  */

  const cartItems = useMemo(() => {
    return (business?.products ?? []).filter(
      (product) => (cart[product.id] ?? 0) > 0
    );
  }, [business, cart]);

  /*
  |--------------------------------------------------------------------------
  | CART COUNT
  |--------------------------------------------------------------------------
  */

  const cartCount = useMemo(() => {
    return Object.values(cart).reduce(
      (total, quantity) => total + quantity,
      0
    );
  }, [cart]);

  /*
  |--------------------------------------------------------------------------
  | TOTAL
  |--------------------------------------------------------------------------
  */

  const total = useMemo(() => {
    return cartItems.reduce((sum, product) => {
      const quantity = cart[product.id] ?? 0;

      return (
        sum +
        (product.price ?? 0) * quantity
      );
    }, 0);
  }, [cartItems, cart]);

  /*
  |--------------------------------------------------------------------------
  | CART UPDATE
  |--------------------------------------------------------------------------
  */

  function updateCart(
    productId: string,
    delta: number
  ) {
    setCart((previous) => {
      const current =
        previous[productId] ?? 0;

      const next = Math.max(
        0,
        current + delta
      );

      if (next === 0) {
        const copy = { ...previous };

        delete copy[productId];

        return copy;
      }

      return {
        ...previous,
        [productId]: next,
      };
    });
  }

  /*
  |--------------------------------------------------------------------------
  | OPEN CHECKOUT
  |--------------------------------------------------------------------------
  */

  function openCheckout() {
    setError(null);
    setMessage(null);
    setCheckout(true);
  }

  /*
  |--------------------------------------------------------------------------
  | CLOSE CHECKOUT
  |--------------------------------------------------------------------------
  */

  function closeCheckout() {
    if (!submitting) {
      setCheckout(false);
      setError(null);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | PLACE ORDER
  |--------------------------------------------------------------------------
  |
  | IMPORTANT:
  |
  | Your current orders table has these columns:
  |
  | business_id
  | customer_id
  | customer_name
  | customer_phone
  | status
  | payment_status
  | notes
  | created_at
  | updated_at
  |
  | It does NOT have:
  |
  | customer_email
  | delivery_address
  | total_amount
  | reference
  | items
  |
  | Therefore we only insert columns that actually exist.
  |
  */

  async function placeOrder(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError(null);
    setMessage(null);

    if (!business) {
      setError("Business information is unavailable.");
      return;
    }

    if (business.ordersPaused) {
      setError(
        "This business is currently not accepting orders."
      );
      return;
    }

    if (!customer.name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!customer.phone.trim()) {
      setError("Please enter your phone number.");
      return;
    }

    if (!cartItems.length) {
      setError("Your cart is empty.");
      return;
    }

    setSubmitting(true);

    try {
      /*
       * The current database schema does not have an order-items
       * table in the information you provided.
       *
       * So we save the cart information inside `notes`.
       *
       * This allows the order to be created without sending
       * unsupported columns to Supabase.
       */

      const orderItems = cartItems.map((product) => ({
        product_id: product.id,
        product_name: product.name,
        quantity: cart[product.id] ?? 0,
        price: product.price ?? 0,
      }));

      const reference = createReference();

      const orderNotes = [
        `SEBA Reference: ${reference}`,
        "",
        "ORDER ITEMS:",
        ...orderItems.map(
          (item) =>
            `${item.product_name} × ${
              item.quantity
            } — ${money(
              item.price * item.quantity
            )}`
        ),
        "",
        `TOTAL: ${money(total)}`,
        "",
        customer.email.trim()
          ? `Email: ${customer.email.trim()}`
          : "",
        customer.address.trim()
          ? `Address: ${customer.address.trim()}`
          : "",
        customer.notes.trim()
          ? `Customer note: ${customer.notes.trim()}`
          : "",
      ]
        .filter(Boolean)
        .join("\n");

      /*
       * ONLY columns confirmed from your database schema.
       */

      const payload = {
        business_id: business.id,

        customer_id: null,

        customer_name:
          customer.name.trim(),

        customer_phone:
          customer.phone.trim(),

        status: "pending",

        payment_status: "pending",

        notes: orderNotes,
      };

      const { data, error: insertError } =
        await supabase
          .from("orders")
          .insert(payload)
          .select("id")
          .maybeSingle();

      if (insertError) {
        console.error(
          "SEBA public order error:",
          insertError
        );

        throw insertError;
      }

      if (!data) {
        throw new Error(
          "The order was not returned after creation."
        );
      }

      /*
       * Success
       */

      setCart({});

      setCustomer({
        name: "",
        phone: "",
        email: "",
        address: "",
        notes: "",
      });

      setCheckout(false);

      setMessage(
        `Order received successfully. Reference: ${reference}`
      );
    } catch (err) {
      console.error(
        "SEBA order submission failed:",
        err
      );

      const message =
        err instanceof Error
          ? err.message
          : "Unknown database error.";

      /*
       * Helpful error instead of pretending the problem
       * is the frontend.
       */

      if (
        message.toLowerCase().includes("row-level") ||
        message.toLowerCase().includes("policy") ||
        message.toLowerCase().includes("permission")
      ) {
        setError(
          "The order form is working, but Supabase is blocking public orders. The orders table needs a public INSERT policy."
        );
      } else {
        setError(
          `We could not save the order: ${message}`
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FFFDFC]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-neutral-200 border-t-[#F25F5C]" />

          <p className="mt-4 text-sm font-medium text-neutral-500">
            Loading shop...
          </p>
        </div>
      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | BUSINESS NOT FOUND
  |--------------------------------------------------------------------------
  */

  if (!business) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FFFDFC] px-6">
        <div className="max-w-md text-center">
          <h1 className="text-3xl font-black text-[#2B2B2B]">
            Business Not Found
          </h1>

          <p className="mt-3 text-neutral-500">
            {businessError?.message ??
              "We could not find this business."}
          </p>

          <Link
            to="/"
            className="mt-6 inline-flex rounded-full bg-[#F25F5C] px-6 py-3 font-bold text-white"
          >
            Go Home
          </Link>
        </div>
      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | UNPUBLISHED
  |--------------------------------------------------------------------------
  */

  if (!business.published) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FFFDFC] px-6">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 text-2xl">
            🔒
          </div>

          <h1 className="mt-6 text-3xl font-black">
            Currently Unavailable
          </h1>

          <p className="mt-3 text-neutral-500">
            This business has not published its shop yet.
          </p>

          <Link
            to={`/${business.username}`}
            className="mt-6 inline-flex rounded-full bg-[#F25F5C] px-6 py-3 font-bold text-white"
          >
            View Business
          </Link>
        </div>
      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | PAGE
  |--------------------------------------------------------------------------
  */

  return (
    <main className="min-h-screen bg-[#FFFDFC] text-[#2B2B2B]">
      {/* ========================================================
          HEADER
      ========================================================= */}

      <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
          <Link
            to={`/${business.username}`}
            className="flex min-w-0 items-center gap-3 font-bold"
          >
            <span className="text-lg">
              ←
            </span>

            <span className="truncate">
              {business.name}
            </span>
          </Link>

          <button
            type="button"
            onClick={openCheckout}
            className="relative rounded-full bg-[#F25F5C] px-5 py-2.5 font-bold text-white shadow-sm transition hover:opacity-90"
          >
            Cart

            {cartCount > 0 && (
              <span className="ml-2 rounded-full bg-white px-2 py-0.5 text-xs font-black text-[#F25F5C]">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* ========================================================
          HERO
      ========================================================= */}

      <section className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:py-20">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-[#F25F5C]">
              Shop
            </p>

            <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-6xl">
              {business.name}
            </h1>

            {business.description && (
              <p className="mt-5 max-w-2xl text-lg leading-8 text-neutral-600">
                {business.description}
              </p>
            )}

            {business.location?.city && (
              <p className="mt-4 text-sm font-medium text-neutral-500">
                📍 {business.location.city}
                {business.location.address
                  ? ` · ${business.location.address}`
                  : ""}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================
          SHOP CONTENT
      ========================================================= */}

      <section className="mx-auto max-w-7xl px-5 py-10 sm:py-14">
        {/* CATEGORY FILTER */}

        {categories.length > 1 && (
          <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
            {categories.map((item) => {
              const selected =
                category === item;

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() =>
                    setCategory(item)
                  }
                  className={`whitespace-nowrap rounded-full border px-5 py-2.5 text-sm font-bold transition ${
                    selected
                      ? "border-[#2B2B2B] bg-[#2B2B2B] text-white"
                      : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        )}

        {/* ======================================================
            EMPTY SHOP
        ====================================================== */}

        {!products.length && (
          <div className="rounded-3xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center">
            <div className="text-4xl">
              🛍️
            </div>

            <h2 className="mt-4 text-2xl font-black">
              No products yet
            </h2>

            <p className="mt-2 text-neutral-500">
              This shop hasn't added products yet.
            </p>
          </div>
        )}

        {/* ======================================================
            PRODUCTS
        ====================================================== */}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => {
            const quantity =
              cart[product.id] ?? 0;

            return (
              <article
                key={product.id}
                className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                {/* IMAGE */}

                <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover transition duration-300 hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-4xl text-neutral-300">
                      🛍️
                    </div>
                  )}

                  {!product.inStock && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/35">
                      <span className="rounded-full bg-white px-4 py-2 text-sm font-black text-red-600">
                        Out of stock
                      </span>
                    </div>
                  )}
                </div>

                {/* PRODUCT INFO */}

                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-lg font-black">
                      {product.name}
                    </h2>

                    <span className="shrink-0 text-sm font-black">
                      {money(product.price)}
                    </span>
                  </div>

                  {product.category && (
                    <p className="mt-1 text-xs font-bold uppercase tracking-wide text-neutral-400">
                      {product.category}
                    </p>
                  )}

                  {product.description && (
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-neutral-600">
                      {product.description}
                    </p>
                  )}

                  <div className="mt-5 flex items-center justify-between gap-3">
                    <div>
                      {product.inStock ? (
                        <span className="text-xs font-semibold text-green-700">
                          In stock
                          {product.stock != null
                            ? ` · ${product.stock}`
                            : ""}
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-red-600">
                          Out of stock
                        </span>
                      )}
                    </div>

                    {quantity > 0 ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            updateCart(
                              product.id,
                              -1
                            )
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-300 font-bold"
                        >
                          −
                        </button>

                        <span className="min-w-5 text-center font-black">
                          {quantity}
                        </span>

                        <button
                          type="button"
                          disabled={
                            !product.inStock
                          }
                          onClick={() =>
                            updateCart(
                              product.id,
                              1
                            )
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F25F5C] font-bold text-white disabled:opacity-40"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={
                          !product.inStock ||
                          Boolean(
                            business.ordersPaused
                          )
                        }
                        onClick={() =>
                          updateCart(
                            product.id,
                            1
                          )
                        }
                        className="rounded-full bg-[#F25F5C] px-4 py-2 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Add to cart
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* ========================================================
          SUCCESS MESSAGE
      ========================================================= */}

      {message && (
        <div className="fixed bottom-5 left-5 right-5 z-[70] mx-auto max-w-lg rounded-2xl bg-green-700 p-4 text-center font-bold text-white shadow-xl">
          {message}
        </div>
      )}

      {/* ========================================================
          CHECKOUT MODAL
      ========================================================= */}

      {checkout && (
        <div className="fixed inset-0 z-[60] overflow-y-auto bg-black/50 p-4">
          <div className="mx-auto my-6 max-h-[calc(100vh-3rem)] max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            {/* MODAL HEADER */}

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-5 sm:px-8">
              <div>
                <h2 className="text-2xl font-black">
                  Your Cart
                </h2>

                <p className="mt-1 text-sm text-neutral-500">
                  {cartCount}{" "}
                  {cartCount === 1
                    ? "item"
                    : "items"}
                </p>
              </div>

              <button
                type="button"
                onClick={closeCheckout}
                disabled={submitting}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-xl disabled:opacity-50"
              >
                ×
              </button>
            </div>

            <div className="p-6 sm:p-8">
              {/* CART */}

              {cartItems.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="text-5xl">
                    🛒
                  </div>

                  <h3 className="mt-4 text-xl font-black">
                    Your cart is empty
                  </h3>

                  <p className="mt-2 text-sm text-neutral-500">
                    Add something from the shop first.
                  </p>

                  <button
                    type="button"
                    onClick={closeCheckout}
                    className="mt-6 rounded-full bg-[#F25F5C] px-6 py-3 font-bold text-white"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <>
                  {/* CART ITEMS */}

                  <div className="space-y-3">
                    {cartItems.map(
                      (product) => {
                        const quantity =
                          cart[product.id] ?? 0;

                        return (
                          <div
                            key={product.id}
                            className="flex items-center justify-between gap-4 rounded-2xl bg-neutral-50 p-4"
                          >
                            <div className="min-w-0">
                              <p className="truncate font-black">
                                {product.name}
                              </p>

                              <p className="mt-1 text-sm text-neutral-500">
                                {money(
                                  product.price
                                )}{" "}
                                each
                              </p>

                              <p className="mt-1 text-sm font-bold">
                                {money(
                                  (product.price ??
                                    0) *
                                    quantity
                                )}
                              </p>
                            </div>

                            <div className="flex shrink-0 items-center gap-3">
                              <button
                                type="button"
                                onClick={() =>
                                  updateCart(
                                    product.id,
                                    -1
                                  )
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-300 bg-white font-bold"
                              >
                                −
                              </button>

                              <span className="w-5 text-center font-black">
                                {quantity}
                              </span>

                              <button
                                type="button"
                                onClick={() =>
                                  updateCart(
                                    product.id,
                                    1
                                  )
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F25F5C] font-bold text-white"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>

                  {/* TOTAL */}

                  <div className="mt-6 flex items-center justify-between border-t border-neutral-200 pt-5 text-xl font-black">
                    <span>Total</span>

                    <span>
                      {money(total)}
                    </span>
                  </div>

                  {/* ORDER FORM */}

                  <form
                    onSubmit={placeOrder}
                    className="mt-7 space-y-4"
                  >
                    <div>
                      <label className="mb-1.5 block text-sm font-bold">
                        Full name *
                      </label>

                      <input
                        required
                        value={customer.name}
                        onChange={(event) =>
                          setCustomer(
                            (previous) => ({
                              ...previous,
                              name: event.target.value,
                            })
                          )
                        }
                        placeholder="Your full name"
                        className="w-full rounded-xl border border-neutral-300 bg-white p-3 outline-none transition focus:border-[#F25F5C] focus:ring-2 focus:ring-[#F25F5C]/10"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-bold">
                        Phone *
                      </label>

                      <input
                        required
                        type="tel"
                        value={customer.phone}
                        onChange={(event) =>
                          setCustomer(
                            (previous) => ({
                              ...previous,
                              phone: event.target.value,
                            })
                          )
                        }
                        placeholder="09..."
                        className="w-full rounded-xl border border-neutral-300 bg-white p-3 outline-none transition focus:border-[#F25F5C] focus:ring-2 focus:ring-[#F25F5C]/10"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-bold">
                        Email
                      </label>

                      <input
                        type="email"
                        value={customer.email}
                        onChange={(event) =>
                          setCustomer(
                            (previous) => ({
                              ...previous,
                              email: event.target.value,
                            })
                          )
                        }
                        placeholder="you@example.com"
                        className="w-full rounded-xl border border-neutral-300 bg-white p-3 outline-none transition focus:border-[#F25F5C] focus:ring-2 focus:ring-[#F25F5C]/10"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-bold">
                        Delivery / pickup address
                      </label>

                      <input
                        value={customer.address}
                        onChange={(event) =>
                          setCustomer(
                            (previous) => ({
                              ...previous,
                              address:
                                event.target.value,
                            })
                          )
                        }
                        placeholder="Where should we prepare/deliver your order?"
                        className="w-full rounded-xl border border-neutral-300 bg-white p-3 outline-none transition focus:border-[#F25F5C] focus:ring-2 focus:ring-[#F25F5C]/10"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-bold">
                        Notes
                      </label>

                      <textarea
                        value={customer.notes}
                        onChange={(event) =>
                          setCustomer(
                            (previous) => ({
                              ...previous,
                              notes:
                                event.target.value,
                            })
                          )
                        }
                        placeholder="Anything the business should know?"
                        className="min-h-24 w-full resize-y rounded-xl border border-neutral-300 bg-white p-3 outline-none transition focus:border-[#F25F5C] focus:ring-2 focus:ring-[#F25F5C]/10"
                      />
                    </div>

                    {/* ERROR */}

                    {error && (
                      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        {error}
                      </div>
                    )}

                    {/* DATABASE NOTE */}

                    <div className="rounded-xl bg-neutral-50 p-4 text-xs leading-5 text-neutral-500">
                      Your order will be sent to{" "}
                      <strong className="text-neutral-700">
                        {business.name}
                      </strong>
                      .
                    </div>

                    {/* SUBMIT */}

                    <button
                      type="submit"
                      disabled={
                        submitting ||
                        Boolean(
                          business.ordersPaused
                        )
                      }
                      className="w-full rounded-xl bg-[#F25F5C] p-4 font-black text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {submitting
                        ? "Placing order..."
                        : business.ordersPaused
                        ? "Ordering is paused"
                        : `Place Order · ${money(
                            total
                          )}`}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default PublicShopPage;