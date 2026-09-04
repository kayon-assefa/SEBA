import { Link } from "react-router-dom";
import { ArrowLeft } from "react-bootstrap-icons";
import { useLanguage } from "../context/Languagecontext";
import { seba } from "../design/tokens";

/**
 * Placeholder legal text so the Register page's "I agree to the Terms and
 * Privacy Policy" checkbox links to something real instead of a 404.
 *
 * IMPORTANT: this copy is a structural placeholder, not reviewed legal
 * language, and is English-only. Have an actual lawyer draft/review the
 * real terms for Ethiopia before launch, then translate to Amharic and
 * wire that translation through useLanguage() the same way every other
 * page in this app does.
 */
export default function Terms() {
  const { t } = useLanguage();
  return (
    <div className="mx-auto max-w-2xl px-5 py-10 sm:px-8" style={{ color: seba.ink }}>
      <Link to="/register" className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: seba.red }}>
        <ArrowLeft className="h-3.5 w-3.5" /> {t("back")}
      </Link>
      <h1 className="mt-6 text-3xl font-black">{t("termsOfService")}</h1>
      <p className="mt-2 text-sm" style={{ color: seba.inkMuted }}>
        Placeholder — replace with reviewed legal terms before launch.
      </p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed" style={{ color: seba.inkMuted }}>
        <section>
          <h2 className="mb-1 font-bold" style={{ color: seba.ink }}>1. Your account</h2>
          <p>
            You're responsible for keeping your login credentials confidential and for all
            activity that happens under your account. Tell us right away if you suspect
            unauthorized access.
          </p>
        </section>
        <section>
          <h2 className="mb-1 font-bold" style={{ color: seba.ink }}>2. Acceptable use</h2>
          <p>
            Don't use SEBA to break the law, infringe anyone's rights, or interfere with the
            service — including attempts to bypass rate limits, the CAPTCHA, or account
            lockouts.
          </p>
        </section>
        <section>
          <h2 className="mb-1 font-bold" style={{ color: seba.ink }}>3. Staff accounts</h2>
          <p>
            Business owners are responsible for the staff accounts they create and for
            deactivating them when someone leaves.
          </p>
        </section>
        <section>
          <h2 className="mb-1 font-bold" style={{ color: seba.ink }}>4. Changes</h2>
          <p>We may update these terms and will let you know before changes take effect.</p>
        </section>
      </div>
    </div>
  );
}
