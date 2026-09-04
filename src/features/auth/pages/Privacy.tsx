import { Link } from "react-router-dom";
import { ArrowLeft } from "react-bootstrap-icons";
import { useLanguage } from "../context/Languagecontext";
import { seba } from "../design/tokens";

/** Same placeholder disclaimer as Terms.tsx — see that file's comment. */
export default function Privacy() {
  const { t } = useLanguage();
  return (
    <div className="mx-auto max-w-2xl px-5 py-10 sm:px-8" style={{ color: seba.ink }}>
      <Link to="/register" className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: seba.red }}>
        <ArrowLeft className="h-3.5 w-3.5" /> {t("back")}
      </Link>
      <h1 className="mt-6 text-3xl font-black">{t("privacyPolicy")}</h1>
      <p className="mt-2 text-sm" style={{ color: seba.inkMuted }}>
        Placeholder — replace with reviewed legal terms before launch.
      </p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed" style={{ color: seba.inkMuted }}>
        <section>
          <h2 className="mb-1 font-bold" style={{ color: seba.ink }}>What we collect</h2>
          <p>
            Account details you provide (email, business name), authentication metadata
            needed for security (IP address and device info tied to login attempts, for
            fraud and abuse prevention only), and product usage you generate.
          </p>
        </section>
        <section>
          <h2 className="mb-1 font-bold" style={{ color: seba.ink }}>Why we collect it</h2>
          <p>
            To run your account, to protect it (rate limiting, lockouts, breach-password
            checks, suspicious-login alerts), and to improve the product.
          </p>
        </section>
        <section>
          <h2 className="mb-1 font-bold" style={{ color: seba.ink }}>What we never store</h2>
          <p>
            Your password itself — only a salted hash. Your password isn't stored anywhere
            in plain or reversible form, including in the reuse-prevention history.
          </p>
        </section>
        <section>
          <h2 className="mb-1 font-bold" style={{ color: seba.ink }}>Your controls</h2>
          <p>
            You can view and revoke active sessions, review recent sign-in activity, and
            delete your account, from account settings.
          </p>
        </section>
      </div>
    </div>
  );
}
