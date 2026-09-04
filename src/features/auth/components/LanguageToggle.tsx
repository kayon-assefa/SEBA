import { useLanguage } from "../context/Languagecontext";
import { seba } from "../design/tokens";

export default function LanguageToggle() {
  const { lang, setLang } = useLanguage();

  return (
    <div
      className="inline-flex items-center rounded-full border bg-white p-1 shadow-sm"
      style={{ borderColor: seba.hairline }}
    >
      <button
        type="button"
        onClick={() => setLang("en")}
        className="rounded-full px-3 py-1 text-sm font-semibold transition"
        style={
          lang === "en"
            ? { background: seba.red, color: "#fff" }
            : { color: seba.inkMuted }
        }
        aria-pressed={lang === "en"}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLang("am")}
        className="rounded-full px-3 py-1 text-sm font-semibold transition"
        style={
          lang === "am"
            ? { background: seba.red, color: "#fff" }
            : { color: seba.inkMuted }
        }
        aria-pressed={lang === "am"}
      >
        አማ
      </button>
    </div>
  );
}
