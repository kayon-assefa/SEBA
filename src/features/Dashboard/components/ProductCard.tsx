// File: src/features/Dashboard/components/ProductCard.tsx
// Shows the product's real image. If a product has more than one image,
// it auto-advances every 5 seconds (pauses while hovered) instead of
// showing a static placeholder icon.

import { useEffect, useState } from "react";
import { Store } from "lucide-react";

type Props = {
  name: string;
  price: string;
  images?: (string | null | undefined)[] | null;
};

export default function ProductCard({ name, price, images }: Props) {
  const gallery = (images ?? []).filter(Boolean) as string[];
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (gallery.length < 2 || paused) return;

    const id = setInterval(() => {
      setIndex((i) => (i + 1) % gallery.length);
    }, 5000);

    return () => clearInterval(id);
  }, [gallery.length, paused]);

  return (
    <div
      className="seba-card-hover overflow-hidden rounded-2xl border border-[#F0E3DE]/80 bg-white/60"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative h-36 w-full overflow-hidden bg-[#FFF2E6]">
        {gallery.length > 0 ? (
          gallery.map((src, i) => (
            <img
              key={src + i}
              src={src}
              alt={name}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                i === index ? "opacity-100" : "opacity-0"
              }`}
            />
          ))
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[#D9A441]">
            <Store size={26} />
          </div>
        )}

        {gallery.length > 1 && (
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
            {gallery.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-4 bg-white" : "w-1.5 bg-white/60"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex min-w-0 items-center justify-between gap-3 p-4">
        <p className="min-w-0 truncate font-medium text-[#241413]">{name}</p>
        <p className="shrink-0 text-sm font-semibold text-[#B4841F]">
          {price}
        </p>
      </div>
    </div>
  );
}
