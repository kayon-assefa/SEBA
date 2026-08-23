// File: src/features/onboarding/components/BusinessForm.tsx
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L, { type LeafletMouseEvent } from "leaflet";
import "leaflet/dist/leaflet.css";

import { businessSchema } from "../validation/business.schema";
import type { BusinessFormData } from "../types/business";
import { onboardingService } from "../services/onboarding.service";
import { BUSINESS_CATEGORIES } from "../data/categories";

/* ============================================================
   Constants
   ============================================================ */

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const ETHIOPIAN_CITIES = [
  "Addis Ababa", "Adama", "Bahir Dar", "Mekelle", "Hawassa", "Gondar",
  "Dire Dawa", "Jimma", "Dessie", "Bishoftu", "Sodo", "Arba Minch",
  "Hosaena", "Harar", "Dilla", "Nekemte", "Debre Birhan", "Asella",
  "Debre Markos", "Kombolcha", "Debre Tabor", "Adigrat", "Axum",
  "Shashamane", "Ambo", "Woldiya", "Gambela", "Jijiga", "Assosa",
  "Semera", "Nazret", "Bonga", "Wolaita Sodo", "Metu", "Robe",
  "Goba", "Negele Borana", "Yirgalem", "Butajira", "Ziway",
  "Fiche", "Holeta", "Sebeta", "Burayu", "Sululta", "Legetafo",
  "Adwa", "Maychew", "Alamata", "Korem", "Mekelle", "Wukro",
  "Shire", "Humera", "Dangla", "Finote Selam", "Injibara",
  "Motta", "Bure", "Chagni", "Debark", "Metema", "Lalibela",
  "Kobo", "Sekota", "Bati", "Kemise", "Chiro", "Gimbi",
  "Dembi Dolo", "Bedele", "Agaro", "Sebeta", "Weliso", "Ginchi",
  "Mojo", "Meki", "Sheno", "Gelemso", "Kuyera", "Wondo Genet",
  "Areka", "Boditi", "Durame", "Alaba Kulito", "Wolkite",
  "Waliso", "Buta Jira", "Adet",
];

const PIN_ICON = L.divIcon({
  className: "seba-map-pin",
  html: `<svg width="36" height="46" viewBox="0 0 36 46" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 0C8 0 0 8 0 18c0 13 18 28 18 28s18-15 18-28C36 8 28 0 18 0z" fill="#F25F5C"/>
    <circle cx="18" cy="18" r="7" fill="white"/>
  </svg>`,
  iconSize: [36, 46],
  iconAnchor: [18, 46],
});

const inputClass =
  "w-full rounded-[16px] border border-[#F0E3DE] bg-white px-4 py-3 text-[#2B2B2B] placeholder:text-[#B8ADA8] outline-none transition-all duration-200 focus:border-[#F25F5C] focus:ring-4 focus:ring-[#F25F5C]/10";

/* ============================================================
   Small icons (no external icon library dependency)
   ============================================================ */

function IconCheck({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m5 12 5 5L20 7" />
    </svg>
  );
}
function IconX({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.25} strokeLinecap="round" className={className}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
function IconSearch({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
function IconLocation({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 21s7-6.6 7-11.5A7 7 0 0 0 5 9.5C5 14.4 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  );
}
function IconClock({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}
function IconSpinner({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={`animate-spin ${className}`}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.2" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

/* ============================================================
   Ethiopian time conversion
   Ethiopia's traditional clock starts counting at dawn (~6:00
   standard time = 12:00 Ethiopian). This is an approximation
   used for display purposes, not an official DST-aware source.
   ============================================================ */

function toEthiopianTime(time24: string): string {
  if (!time24) return "";
  const [h, m] = time24.split(":").map(Number);
  if (Number.isNaN(h)) return "";

  let ethHour = h - 6;
  if (ethHour <= 0) ethHour += 12;
  if (ethHour > 12) ethHour -= 12;

  const period = h >= 6 && h < 18 ? "day" : "night";
  return `${ethHour}:${String(m).padStart(2, "0")} ${period === "day" ? "(ጠዋት)" : "(ማታ)"}`;
}

/* ============================================================
   Field wrapper
   ============================================================ */

function FieldWrapper({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <label htmlFor={htmlFor} className="text-sm font-medium text-[#2B2B2B]">
          {label}
        </label>
        {hint && <span className="text-xs text-[#707070]">{hint}</span>}
      </div>
      {children}
      {error && <p className="text-sm text-[#F25F5C]">{error}</p>}
    </div>
  );
}

/* ============================================================
   Map helper components
   ============================================================ */

function MapFlyTo({ target }: { target: { lat: number; lng: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) {
      map.flyTo([target.lat, target.lng], 16, { duration: 1.1 });
    }
  }, [target, map]);
  return null;
}

function MapClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e: LeafletMouseEvent) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

/* ============================================================
   Main component
   ============================================================ */

export default function BusinessForm() {
  const navigate = useNavigate();

  const [logo, setLogo] = useState("");
  const [category, setCategory] = useState("");
  const [descriptionLength, setDescriptionLength] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BusinessFormData>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      timezone: "Africa/Addis_Ababa",
      working_days: [],
      opening_time: "08:00",
      closing_time: "18:00",
    },
  });

  const selectedDays = watch("working_days") || [];
  const username = watch("username");
  const phone = watch("phone");
  const openingTime = watch("opening_time");
  const closingTime = watch("closing_time");

  /* ---------- Username real-time availability ---------- */
  const [usernameStatus, setUsernameStatus] = useState<
    "idle" | "checking" | "available" | "taken" | "invalid"
  >("idle");
  const usernameCheckRef = useRef(0);

  useEffect(() => {
    if (!username) {
      setUsernameStatus("idle");
      return;
    }

    const isValidFormat = /^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])?$/.test(username);
    if (!isValidFormat) {
      setUsernameStatus("invalid");
      return;
    }

    setUsernameStatus("checking");
    const requestId = ++usernameCheckRef.current;

    const timeout = setTimeout(async () => {
      try {
        const available = await onboardingService.checkUsername(username);
        if (usernameCheckRef.current === requestId) {
          setUsernameStatus(available ? "available" : "taken");
        }
      } catch {
        if (usernameCheckRef.current === requestId) setUsernameStatus("idle");
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [username]);

  /* ---------- City combobox ---------- */
  const [cityQuery, setCityQuery] = useState("");
  const [cityOpen, setCityOpen] = useState(false);
  const filteredCities = ETHIOPIAN_CITIES.filter((c) =>
    c.toLowerCase().includes(cityQuery.toLowerCase())
  ).slice(0, 8);

  /* ---------- Phone ---------- */
  function handlePhoneChange(raw: string) {
    let digits = raw.replace(/[^\d+]/g, "");

    if (digits.startsWith("0")) digits = "251" + digits.slice(1);
    if (digits.startsWith("+251")) digits = digits.slice(1);
    if (!digits.startsWith("251") && digits.length > 0) digits = "251" + digits;

    const formatted = digits ? `+${digits}` : "";
    setValue("phone", formatted, { shouldValidate: true });
  }

  const phoneValid = phone ? /^\+251[79]\d{8}$/.test(phone) : null;

  /* ---------- Map / location ---------- */
  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(null);
  const [flyTarget, setFlyTarget] = useState<{ lat: number; lng: number } | null>(null);
  const [mapQuery, setMapQuery] = useState("");
  const [mapResults, setMapResults] = useState<any[]>([]);
  const [mapSearching, setMapSearching] = useState(false);
  const [reverseLoading, setReverseLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [chosenSuggestion, setChosenSuggestion] = useState<string | null>(null);

  useEffect(() => {
    if (!mapQuery.trim()) {
      setMapResults([]);
      return;
    }

    setMapSearching(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&countrycodes=et&limit=5&q=${encodeURIComponent(
            mapQuery
          )}`
        );
        const data = await res.json();
        setMapResults(data);
      } catch {
        setMapResults([]);
      } finally {
        setMapSearching(false);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [mapQuery]);

  function pickSearchResult(result: any) {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setMarker({ lat, lng });
    setFlyTarget({ lat, lng });
    setMapResults([]);
    setMapQuery(result.display_name);
    setSuggestions([]);
    setChosenSuggestion(null);
  }

  function handleMapClick(lat: number, lng: number) {
    setMarker({ lat, lng });
    setSuggestions([]);
    setChosenSuggestion(null);
  }

  async function confirmLocation() {
    if (!marker) {
      toast.error("Tap the map to drop a pin first");
      return;
    }

    setReverseLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${marker.lat}&lon=${marker.lng}`
      );
      const data = await res.json();
      const addr = data.address || {};

      const road = addr.road || addr.pedestrian || "the main road";
      const area =
        addr.suburb || addr.neighbourhood || addr.city_district || addr.town || addr.village || "this area";
      const city = addr.city || addr.town || addr.village || "";

      const built = [
        `Next to ${road}, ${area}`,
        `On ${road}, ground floor entrance`,
        `${area}, near the main junction`,
        `Behind the buildings along ${road}`,
        `${area}${city ? `, ${city}` : ""} — ask locally on arrival`,
      ];

      setSuggestions(built);
    } catch {
      toast.error("Couldn't fetch address details — try again");
    } finally {
      setReverseLoading(false);
    }
  }

  function selectSuggestion(text: string) {
    setChosenSuggestion(text);
    setValue("latitude" as any, marker?.lat, { shouldValidate: false });
    setValue("longitude" as any, marker?.lng, { shouldValidate: false });
    setValue("location_description" as any, text, { shouldValidate: false });
  }

  /* ---------- Ethiopian time toggle ---------- */
  const [showEthiopianTime, setShowEthiopianTime] = useState(false);

  /* ---------- Logo ---------- */
  async function convertLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setLogo(base64);
      setValue("logo", base64);
    };
    reader.readAsDataURL(file);
  }

  /* ---------- Submit ---------- */
  async function onSubmit(values: BusinessFormData) {
    if (usernameStatus === "taken" || usernameStatus === "invalid") {
      toast.error("Choose a different username first");
      return;
    }

    if (phone && !phoneValid) {
      toast.error("Enter a valid Ethiopian phone number");
      return;
    }

    try {
      const available = await onboardingService.checkUsername(values.username);

      if (!available) {
        toast.error("Username already exists");
        return;
      }

      values.logo = logo;

      const business = await onboardingService.createBusiness(values);

      await onboardingService.createProgress(business.id);

      toast.success("Business Created!");

      navigate("/onboarding/templates");
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-3xl space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="space-y-6"
      >
        {/* Business Name */}
        <FieldWrapper label="Business Name" htmlFor="business_name" error={errors.business_name?.message}>
          <input
            id="business_name"
            className={inputClass}
            {...register("business_name")}
            placeholder="Legend Barber"
          />
        </FieldWrapper>

        {/* Username with real-time availability */}
        <FieldWrapper label="Business Username" htmlFor="username" error={errors.username?.message}>
          <div className="relative">
            <div
              className={`flex items-stretch overflow-hidden rounded-[16px] border bg-white transition-all duration-200 ${
                usernameStatus === "available"
                  ? "border-[#3FA65A] ring-4 ring-[#3FA65A]/10"
                  : usernameStatus === "taken" || usernameStatus === "invalid"
                  ? "border-[#F25F5C] ring-4 ring-[#F25F5C]/10"
                  : "border-[#F0E3DE] focus-within:border-[#F25F5C] focus-within:ring-4 focus-within:ring-[#F25F5C]/10"
              }`}
            >
              <span className="flex items-center border-r border-[#F0E3DE] bg-[#FFF9F7] px-4 text-sm text-[#707070]">
                seba.com/
              </span>
              <input
                id="username"
                className="w-full bg-transparent px-4 py-3 text-[#2B2B2B] placeholder:text-[#B8ADA8] outline-none"
                {...register("username")}
                onChange={(e) => setValue("username", e.target.value.toLowerCase(), { shouldValidate: true })}
                placeholder="legendbarber"
                autoComplete="off"
              />
              <span className="flex items-center px-4">
                {usernameStatus === "checking" && <IconSpinner className="h-4 w-4 text-[#707070]" />}
                {usernameStatus === "available" && <IconCheck className="h-4 w-4 text-[#3FA65A]" />}
                {(usernameStatus === "taken" || usernameStatus === "invalid") && (
                  <IconX className="h-4 w-4 text-[#F25F5C]" />
                )}
              </span>
            </div>

            <AnimatePresence>
              {usernameStatus !== "idle" && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`mt-1.5 text-xs font-medium ${
                    usernameStatus === "available"
                      ? "text-[#3FA65A]"
                      : usernameStatus === "checking"
                      ? "text-[#707070]"
                      : "text-[#F25F5C]"
                  }`}
                >
                  {usernameStatus === "checking" && "Checking availability..."}
                  {usernameStatus === "available" && "seba.com/" + username + " is available"}
                  {usernameStatus === "taken" && "That username is already taken"}
                  {usernameStatus === "invalid" &&
                    "Use lowercase letters, numbers, and dashes only"}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </FieldWrapper>

        {/* Category */}
        <FieldWrapper label="Category" htmlFor="category" error={errors.category?.message}>
          <select
            id="category"
            className={`${inputClass} appearance-none`}
            {...register("category")}
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setValue("category", e.target.value);
            }}
          >
            <option value="">Select Category</option>
            {BUSINESS_CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </FieldWrapper>

        <AnimatePresence>
          {category === "Other" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <FieldWrapper label="Custom Category" htmlFor="custom_category">
                <input
                  id="custom_category"
                  className={inputClass}
                  {...register("custom_category")}
                  placeholder="Enter category"
                />
              </FieldWrapper>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Phone with live Ethiopian validation */}
        <div className="grid gap-6 sm:grid-cols-2">
          <FieldWrapper
            label="Phone"
            htmlFor="phone"
            error={phone && !phoneValid ? "Enter a valid Ethiopian number (+251 9XX XXX XXX)" : undefined}
          >
            <div
              className={`flex items-center overflow-hidden rounded-[16px] border bg-white transition-all duration-200 ${
                phoneValid === true
                  ? "border-[#3FA65A] ring-4 ring-[#3FA65A]/10"
                  : phoneValid === false
                  ? "border-[#F25F5C] ring-4 ring-[#F25F5C]/10"
                  : "border-[#F0E3DE] focus-within:border-[#F25F5C] focus-within:ring-4 focus-within:ring-[#F25F5C]/10"
              }`}
            >
              <input
                id="phone"
                className="w-full bg-transparent px-4 py-3 text-[#2B2B2B] placeholder:text-[#B8ADA8] outline-none"
                value={phone || ""}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="+251 9XX XXX XXX"
                inputMode="tel"
              />
              {phoneValid !== null && (
                <span className="pr-4">
                  {phoneValid ? (
                    <IconCheck className="h-4 w-4 text-[#3FA65A]" />
                  ) : (
                    <IconX className="h-4 w-4 text-[#F25F5C]" />
                  )}
                </span>
              )}
            </div>
          </FieldWrapper>

          {/* City combobox */}
          <FieldWrapper label="City" htmlFor="city" error={errors.city?.message}>
            <div className="relative">
              <input
                id="city"
                className={inputClass}
                value={cityQuery}
                onChange={(e) => {
                  setCityQuery(e.target.value);
                  setValue("city", e.target.value);
                  setCityOpen(true);
                }}
                onFocus={() => setCityOpen(true)}
                onBlur={() => setTimeout(() => setCityOpen(false), 150)}
                placeholder="Search a city"
                autoComplete="off"
              />

              <AnimatePresence>
                {cityOpen && cityQuery && filteredCities.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute z-10 mt-2 w-full overflow-hidden rounded-[16px] border border-[#F0E3DE] bg-white shadow-lg"
                  >
                    {filteredCities.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setCityQuery(c);
                          setValue("city", c, { shouldValidate: true });
                          setCityOpen(false);
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-[#2B2B2B] transition-colors duration-150 hover:bg-[#FFF9F7]"
                      >
                        <IconLocation className="h-3.5 w-3.5 text-[#707070]" />
                        {c}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </FieldWrapper>
        </div>

        {/* Address (kept for freeform notes, map fills the precise location) */}
        <FieldWrapper label="Address" htmlFor="address" error={errors.address?.message}>
          <textarea
            id="address"
            rows={2}
            className={`${inputClass} resize-none`}
            {...register("address")}
            placeholder="Bole Road..."
          />
        </FieldWrapper>

        {/* ============ MAP LOCATION PICKER ============ */}
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-[#2B2B2B]">Pin Your Exact Location</label>
            <p className="mt-1 text-xs text-[#707070]">
              Search for your area, then tap the map to drop a pin exactly where your business is.
            </p>
          </div>

          <div className="overflow-hidden rounded-[24px] border border-[#F0E3DE] bg-white">
            {/* Search bar */}
            <div className="relative border-b border-[#F0E3DE] p-3">
              <div className="flex items-center gap-2 rounded-[16px] border border-[#F0E3DE] bg-[#FFF9F7] px-4 py-2.5">
                <IconSearch className="h-4 w-4 shrink-0 text-[#707070]" />
                <input
                  value={mapQuery}
                  onChange={(e) => setMapQuery(e.target.value)}
                  placeholder="Search for a place in Ethiopia..."
                  className="w-full bg-transparent text-sm text-[#2B2B2B] placeholder:text-[#B8ADA8] outline-none"
                />
                {mapSearching && <IconSpinner className="h-4 w-4 shrink-0 text-[#707070]" />}
              </div>

              <AnimatePresence>
                {mapResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-3 right-3 z-[500] mt-1 overflow-hidden rounded-[16px] border border-[#F0E3DE] bg-white shadow-lg"
                  >
                    {mapResults.map((result: any) => (
                      <button
                        key={result.place_id}
                        type="button"
                        onClick={() => pickSearchResult(result)}
                        className="flex w-full items-start gap-2 px-4 py-3 text-left transition-colors duration-150 hover:bg-[#FFF9F7]"
                      >
                        <IconLocation className="mt-0.5 h-4 w-4 shrink-0 text-[#F25F5C]" />
                        <span className="text-sm text-[#2B2B2B]">{result.display_name}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Map */}
            <div className="relative h-80 w-full">
              <style>{`
                .leaflet-container {
                  background: #f5f4f1;
                  font-family: inherit;
                  border-radius: 24px;
                  overflow: hidden;
                }
                .leaflet-marker-icon { transition: transform 0.35s ease-out; }
                .seba-map-pin {
                  filter: drop-shadow(0 7px 10px rgba(122,38,58,0.28));
                  transform: translateY(-2px);
                }
                .leaflet-control-zoom {
                  border: none;
                  box-shadow: none;
                  margin: 14px;
                }
                .leaflet-control-zoom a {
                  width: 38px;
                  height: 38px;
                  line-height: 38px;
                  border: 1px solid rgba(15, 23, 42, 0.06);
                  border-radius: 50%;
                  margin-bottom: 8px;
                  background: rgba(255, 255, 255, 0.95);
                  color: #1f2937;
                  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.12);
                  transition: all 0.2s ease;
                  font-size: 19px;
                  font-weight: 500;
                }
                .leaflet-control-zoom a:hover {
                  background: #fbfbfb;
                  transform: translateY(-1px);
                }
                .leaflet-bar {
                  border: none;
                  box-shadow: none;
                  background: transparent;
                }
                .leaflet-control-attribution {
                  background: rgba(255, 255, 255, 0.86);
                  color: #6b7280;
                  border-radius: 999px;
                  padding: 5px 10px;
                  font-size: 10px;
                  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
                  margin: 12px;
                }
                .leaflet-control-attribution a {
                  color: #6b7280;
                }
                .leaflet-container .leaflet-control-attribution,
                .leaflet-container .leaflet-control-zoom {
                  backdrop-filter: blur(10px);
                }
              `}</style>

              <MapContainer
                center={[9.03, 38.74]}
                zoom={13}
                scrollWheelZoom
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors &copy; CARTO'
                  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                  subdomains={["a", "b", "c", "d"]}
                />
                <MapFlyTo target={flyTarget} />
                <MapClickHandler onPick={handleMapClick} />
                {marker && <Marker position={[marker.lat, marker.lng]} icon={PIN_ICON} />}
              </MapContainer>
            </div>

            {/* Confirm + suggestions */}
            <div className="space-y-4 p-4">
              <button
                type="button"
                onClick={confirmLocation}
                disabled={!marker || reverseLoading}
                className="flex w-full items-center justify-center gap-2 rounded-[16px] bg-[#F25F5C] px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#e14e4b] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {reverseLoading ? <IconSpinner className="h-4 w-4" /> : <IconLocation className="h-4 w-4" />}
                {reverseLoading ? "Looking up address..." : "Confirm This Location"}
              </button>

              <AnimatePresence>
                {suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-2 overflow-hidden"
                  >
                    <p className="text-xs font-medium uppercase tracking-wide text-[#707070]">
                      Choose how customers should find you
                    </p>

                    {suggestions.map((s, i) => {
                      const active = chosenSuggestion === s;
                      return (
                        <motion.button
                          key={i}
                          type="button"
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.15, delay: i * 0.05 }}
                          onClick={() => selectSuggestion(s)}
                          className={`flex w-full items-center justify-between gap-3 rounded-[16px] border px-4 py-3 text-left text-sm transition-all duration-200 ${
                            active
                              ? "border-[#F25F5C] bg-[#F25F5C]/10 text-[#2B2B2B]"
                              : "border-[#F0E3DE] bg-[#FFF9F7] text-[#707070] hover:border-[#D9A441]"
                          }`}
                        >
                          {s}
                          <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                              active ? "border-[#F25F5C] bg-[#F25F5C] text-white" : "border-[#F0E3DE] text-transparent"
                            }`}
                          >
                            <IconCheck className="h-3 w-3" />
                          </span>
                        </motion.button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>

              {chosenSuggestion && (
                <div className="rounded-[16px] bg-[#3FA65A]/10 px-4 py-2.5 text-sm font-medium text-[#3FA65A]">
                  Location saved: {chosenSuggestion}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Logo */}
        <FieldWrapper label="Business Logo">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[24px] border border-dashed border-[#F0E3DE] bg-[#FFF9F7]">
              {logo ? (
                <img src={logo} alt="Business logo" className="h-full w-full object-cover" />
              ) : (
                <span className="text-xs text-[#B8ADA8]">No logo</span>
              )}
            </div>

            <label
              htmlFor="logo-upload"
              className="cursor-pointer rounded-[16px] border border-[#F0E3DE] bg-white px-5 py-2.5 text-sm font-medium text-[#2B2B2B] transition-all duration-200 hover:border-[#D9A441] hover:bg-[#FFF9F7]"
            >
              {logo ? "Change logo" : "Upload logo"}
              <input id="logo-upload" type="file" accept="image/*" onChange={convertLogo} className="hidden" />
            </label>
          </div>
        </FieldWrapper>

        {/* Description */}
        <FieldWrapper
          label="Description"
          htmlFor="description"
          error={errors.description?.message}
          hint={`${descriptionLength}/300`}
        >
          <textarea
            id="description"
            rows={4}
            maxLength={300}
            className={`${inputClass} resize-none`}
            {...register("description")}
            onChange={(e) => {
              setDescriptionLength(e.target.value.length);
              setValue("description", e.target.value);
            }}
            placeholder="Tell customers what makes your business special..."
          />
        </FieldWrapper>

        {/* Working Days */}
        <FieldWrapper label="Working Days">
          <div className="flex flex-wrap gap-2">
            {DAYS.map((day) => {
              const checked = selectedDays.includes(day);
              return (
                <label
                  key={day}
                  className={`cursor-pointer rounded-[16px] border px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    checked
                      ? "border-[#F25F5C] bg-[#F25F5C]/10 text-[#F25F5C]"
                      : "border-[#F0E3DE] bg-white text-[#707070] hover:border-[#D9A441]"
                  }`}
                >
                  <input type="checkbox" value={day} {...register("working_days")} className="hidden" />
                  {day}
                </label>
              );
            })}
          </div>
        </FieldWrapper>

        {/* Opening / Closing + Ethiopian time toggle */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-[#2B2B2B]">Working Hours</label>

            <button
              type="button"
              onClick={() => setShowEthiopianTime((value) => !value)}
              aria-pressed={showEthiopianTime}
              aria-label={showEthiopianTime ? "Hide Ethiopian time" : "Show Ethiopian time"}
              className="flex items-center gap-2 rounded-full border border-[#F0E3DE] bg-white px-3 py-1.5 text-xs font-medium text-[#707070] transition-all duration-200 hover:border-[#D9A441]"
            >
              <IconClock />
              {showEthiopianTime ? "Hide Ethiopian time" : "Show Ethiopian time"}
              <span
                className={`relative h-4 w-7 rounded-full transition-colors duration-200 ${
                  showEthiopianTime ? "bg-[#F25F5C]" : "bg-[#F0E3DE]"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-3 w-3 rounded-full bg-white shadow transition-transform duration-200 ${
                    showEthiopianTime ? "translate-x-3.5" : "translate-x-0.5"
                  }`}
                />
              </span>
            </button>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <FieldWrapper label="Opening Time" htmlFor="opening_time">
              <input id="opening_time" type="time" className={inputClass} {...register("opening_time")} />
              <AnimatePresence>
                {showEthiopianTime && openingTime && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden text-xs font-medium text-[#D9A441]"
                  >
                    Ethiopian time: {toEthiopianTime(openingTime)}
                  </motion.p>
                )}
              </AnimatePresence>
            </FieldWrapper>

            <FieldWrapper label="Closing Time" htmlFor="closing_time">
              <input id="closing_time" type="time" className={inputClass} {...register("closing_time")} />
              <AnimatePresence>
                {showEthiopianTime && closingTime && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden text-xs font-medium text-[#D9A441]"
                  >
                    Ethiopian time: {toEthiopianTime(closingTime)}
                  </motion.p>
                )}
              </AnimatePresence>
            </FieldWrapper>
          </div>
        </div>

        {/* Timezone */}
        <FieldWrapper label="Timezone" htmlFor="timezone">
          <select id="timezone" className={`${inputClass} appearance-none`} {...register("timezone")}>
            <option value="Africa/Addis_Ababa">Africa/Addis_Ababa</option>
          </select>
        </FieldWrapper>
      </motion.div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-[16px] bg-[#F25F5C] px-6 py-3.5 font-medium text-white shadow-[0_4px_14px_rgba(242,95,92,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#e14e4b] hover:shadow-[0_6px_18px_rgba(242,95,92,0.45)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 sm:w-auto"
      >
        {isSubmitting ? "Saving..." : "Continue"}
      </button>
    </form>
  );
}