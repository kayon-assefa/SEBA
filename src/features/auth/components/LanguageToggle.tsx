import { useLanguage } from "../context/Languagecontext";

export default function LanguageToggle() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="inline-flex items-center rounded-full border border-[#8B1E2D]/10 bg-white/80 p-1 shadow-sm backdrop-blur">
      <button
        type="button"
        onClick={() => setLang("en")}
        className={`rounded-full px-3 py-1 text-sm font-semibold transition ${
          lang === "en"
            ? "bg-[#8B1E2D] text-white"
            : "text-[#6B4D4A] hover:bg-[#8B1E2D]/10"
        }`}
        aria-pressed={lang === "en"}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLang("am")}
        className={`rounded-full px-3 py-1 text-sm font-semibold transition ${
          lang === "am"
            ? "bg-[#8B1E2D] text-white"
            : "text-[#6B4D4A] hover:bg-[#8B1E2D]/10"
        }`}
        aria-pressed={lang === "am"}
      >
        AM
      </button>
    </div>
  );
}
