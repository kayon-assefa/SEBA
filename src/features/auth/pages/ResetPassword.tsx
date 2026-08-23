import { type FormEvent, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabase";

type Lang = "en" | "am";

const texts = {
  en: {
    title: "Reset Password",
    tagline: "Book. Manage. Grow.",
    newPassword: "New Password",
    confirmPassword: "Confirm Password",
    update: "Update Password",
    updating: "Updating Password...",
    strength: "Strength",
    show: "Show",
    hide: "Hide",
    afterUpdate: "After updating you will be signed out for security.",
    invalid: "Invalid or expired reset link",
    forgotAgain: "Forgot password again?",
    backLogin: "Back to Login",
    tips: {
      length: "At least 8 characters",
      upper: "One uppercase letter",
      lower: "One lowercase letter",
      number: "One number",
      special: "One special character (!@#$%…)",
    },
    strengthLabels: ["Very Weak", "Weak", "Fair", "Good", "Strong"],
    success: "Password Updated",
    successSub: "Redirecting you securely...",
    passkeyTitle: "Save a Passkey?",
    passkeyDesc: "Use Face ID, Touch ID or your device PIN for faster & more secure sign-in next time.",
    savePasskey: "Save Passkey to this device",
    skip: "Skip for now",
    mfaTitle: "Enable Two-Factor Authentication?",
    mfaDesc: "Add an extra layer of security to your SEBA account.",
    enable2fa: "Enable 2FA",
    notNow: "Not now",
  },
  am: {
    title: "የይለፍ ቃል ዳግም ማስጀመር",
    tagline: "መጽሐፍ. አስተዳድር. አድግ.",
    newPassword: "አዲስ የይለፍ ቃል",
    confirmPassword: "የይለፍ ቃል አረጋግጥ",
    update: "የይለፍ ቃል አዘምን",
    updating: "በማዘመን ላይ...",
    strength: "ጥንካሬ",
    show: "አሳይ",
    hide: "ደብቅ",
    afterUpdate: "ከማዘመን በኋላ ለደህንነት ይወጣሉ።",
    invalid: "ልክ ያልሆነ ወይም ጊዜው ያለፈበት አገናኝ",
    forgotAgain: "የይለፍ ቃል እንደገና ረሱ?",
    backLogin: "ወደ መግቢያ ተመለስ",
    tips: {
      length: "ቢያንስ 8 ቁምፊዎች",
      upper: "አንድ ትልቅ ፊደል",
      lower: "አንድ ትንሽ ፊደል",
      number: "አንድ ቁጥር",
      special: "አንድ ልዩ ቁምፊ (!@#$%…)",
    },
    strengthLabels: ["በጣም ደካማ", "ደካማ", "መካከለኛ", "ጥሩ", "ጠንካራ"],
    success: "የይለፍ ቃል ተዘምኗል",
    successSub: "በደህንነት ወደ መግቢያ በመሄድ ላይ...",
    passkeyTitle: "ፓስኪ ማስቀመጥ?",
    passkeyDesc: "ለቀጣይ ፈጣንና ደህንነቱ የተጠበቀ መግቢያ Face ID፣ Touch ID ወይም የመሣሪያ PIN ይጠቀሙ።",
    savePasskey: "ፓስኪ በዚህ መሣሪያ ላይ አስቀምጥ",
    skip: "አሁን ዝለል",
    mfaTitle: "ሁለት-ደረጃ ማረጋገጫ ማንቃት?",
    mfaDesc: "ለSEBA መለያዎ ተጨማሪ የደህንነት ንብርብር ያክሉ።",
    enable2fa: "2FA አንቃ",
    notNow: "አሁን አይደለም",
  },
};

export default function ResetPassword() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  const [lang, setLang] = useState<Lang>("en");
  const t = texts[lang];

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validSession, setValidSession] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [strength, setStrength] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPasskeyPrompt, setShowPasskeyPrompt] = useState(false);
  const [showMfaPrompt, setShowMfaPrompt] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  const checkStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    setStrength(score);
  };

  const getLiveTips = (pwd: string) => {
    const tips: string[] = [];
    if (pwd.length < 8) tips.push(t.tips.length);
    if (!/[A-Z]/.test(pwd)) tips.push(t.tips.upper);
    if (!/[a-z]/.test(pwd)) tips.push(t.tips.lower);
    if (!/[0-9]/.test(pwd)) tips.push(t.tips.number);
    if (!/[^A-Za-z0-9]/.test(pwd)) tips.push(t.tips.special);
    return tips;
  };

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        setValidSession(true);
        setSessionInfo({
          device: navigator.userAgent.split(")")[0] + ")",
          email: data.session.user.email,
        });
      } else {
        setValidSession(false);
      }
      setCheckingSession(false);
    };
    checkSession();
  }, []);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setMouse({
        x: (e.clientX - rect.left) / rect.width - 0.5,
        y: (e.clientY - rect.top) / rect.height - 0.5,
      });
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  const validatePassword = (pwd: string) => {
    if (pwd.length < 8) return t.tips.length;
    if (!/[A-Z]/.test(pwd)) return t.tips.upper;
    if (!/[a-z]/.test(pwd)) return t.tips.lower;
    if (!/[0-9]/.test(pwd)) return t.tips.number;
    if (!/[^A-Za-z0-9]/.test(pwd)) return t.tips.special;
    return "";
  };

  const checkPasswordHistory = async (newPwd: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return true;
    const history: string[] = user.user_metadata?.password_history || [];
    const simpleHash = btoa(newPwd).slice(0, 24);
    return !history.includes(simpleHash);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;

    const pwdError = validatePassword(password);
    setPasswordError(pwdError);
    if (pwdError) return;

    if (password !== confirmPassword) {
      setConfirmError(lang === "en" ? "Passwords do not match" : "የይለፍ ቃሎች አይዛመዱም");
      return;
    }
    setConfirmError("");

    const isNew = await checkPasswordHistory(password);
    if (!isNew) {
      setPasswordError(
        lang === "en"
          ? "You cannot reuse any of your last 3 passwords"
          : "የመጨረሻዎቹን 3 የይለፍ ቃሎች መድገም አይቻልም"
      );
      return;
    }

    setLoading(true);

    const simpleHash = btoa(password).slice(0, 24);
    const { data: { user } } = await supabase.auth.getUser();
    const prevHistory: string[] = user?.user_metadata?.password_history || [];
    const newHistory = [simpleHash, ...prevHistory].slice(0, 3);

    const { error } = await supabase.auth.updateUser({
      password,
      data: {
        password_history: newHistory,
        password_changed_at: new Date().toISOString(),
      },
    });

    setLoading(false);

    if (error) {
      alert(
        lang === "en"
          ? "Unable to update password. Please try again."
          : "የይለፍ ቃል ማዘመን አልተሳካም። እባክዎ እንደገና ይሞክሩ።"
      );
      return;
    }

    // Success appears inside the card
    setShowSuccess(true);

    setTimeout(() => {
      setShowSuccess(false);
      setShowPasskeyPrompt(true);
    }, 4000);
  };

  const enrollPasskey = async () => {
    if (!window.PublicKeyCredential) {
      alert(
        lang === "en"
          ? "Passkeys are not supported on this device."
          : "ፓስኪ በዚህ መሣሪያ ላይ አይደገፍም።"
      );
      setShowPasskeyPrompt(false);
      setShowMfaPrompt(true);
      return;
    }

    try {
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);
      await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: { name: "SEBA", id: window.location.hostname },
          user: {
            id: new Uint8Array(16),
            name: sessionInfo?.email || "user@seba.app",
            displayName: "SEBA User",
          },
          pubKeyCredParams: [{ alg: -7, type: "public-key" }],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required",
          },
          timeout: 60000,
        },
      });
      alert(lang === "en" ? "Passkey saved successfully!" : "ፓስኪ በተሳካ ሁኔታ ተቀምጧል!");
    } catch {
      // cancelled
    }

    setShowPasskeyPrompt(false);
    setShowMfaPrompt(true);
  };

  const handleMfaChoice = async () => {
    setShowMfaPrompt(false);
    await supabase.auth.signOut();
    navigate("/login");
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF2E6]">
        <p className="text-[#8B1E2D] font-medium">Checking reset link...</p>
      </div>
    );
  }

  if (!validSession) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-[#FFF2E6]">
        <div className="text-center space-y-5 max-w-sm">
          <p className="text-lg font-semibold text-[#8B1E2D]">{t.invalid}</p>
          <button
            onClick={() => navigate("/forgot-password")}
            className="w-full px-6 py-3 rounded-xl bg-[#FF5A5F] text-white font-medium hover:bg-[#e04a4f] transition"
          >
            {t.forgotAgain}
          </button>
          <button
            onClick={() => navigate("/login")}
            className="text-sm underline text-[#8B1E2D]/70"
          >
            {t.backLogin}
          </button>
        </div>
      </div>
    );
  }

  const strengthColors = ["bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-lime-400", "bg-green-500"];
  const liveTips = getLiveTips(password);

  return (
    <div
      ref={containerRef}
      className="h-screen w-full relative flex items-center justify-center overflow-hidden"
      style={{
        background: "linear-gradient(145deg, #FFF8F4 0%, #FFF2E6 35%, #FFE8DE 70%, #FFF5F0 100%)",
      }}
    >
      {/* ── Impressive floating Bauhaus background ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large soft coral blob */}
        <div
          className="absolute -top-48 -left-48 w-[520px] h-[520px] rounded-full opacity-30 animate-drift"
          style={{
            background: "radial-gradient(circle, #FF5A5F 0%, transparent 70%)",
            transform: `translate(${mouse.x * 32}px, ${mouse.y * 22}px)`,
          }}
        />
        {/* Deep red arc */}
        <div
          className="absolute top-[15%] -right-32 w-80 h-80 rounded-full border-[28px] border-[#8B1E2D]/15 animate-breathe"
          style={{ transform: `translate(${mouse.x * -22}px, ${mouse.y * 14}px)` }}
        />
        {/* Gold accent */}
        <div
          className="absolute bottom-20 left-6 w-44 h-44 rounded-full opacity-40 animate-float-move"
          style={{
            background: "radial-gradient(circle, #D9A441 0%, transparent 70%)",
            transform: `translate(${mouse.x * 16}px, ${mouse.y * -12}px)`,
          }}
        />
        {/* Soft cream circle */}
        <div
          className="absolute top-1/3 left-[20%] w-56 h-56 rounded-full bg-white/40 animate-drift-delayed"
          style={{ transform: `translate(${mouse.x * 10}px, ${mouse.y * 8}px)` }}
        />
        {/* Small floating dots */}
        <div className="absolute top-24 right-1/3 w-3 h-3 rounded-full bg-[#D9A441]/50 animate-float-move" />
        <div className="absolute bottom-40 right-20 w-2.5 h-2.5 rounded-full bg-[#FF5A5F]/40 animate-breathe" />
        <div className="absolute top-1/2 left-12 w-2 h-2 rounded-full bg-[#8B1E2D]/30 animate-drift" />
      </div>

      {/* Language toggle - Liquid glass */}
      <div className="absolute top-6 right-6 z-30">
        <div className="flex items-center gap-1 p-1.5 rounded-full
                        bg-white/40 backdrop-blur-2xl border border-white/50
                        shadow-[0_8px_32px_rgba(139,30,45,0.08),inset_0_1px_0_rgba(255,255,255,0.8)]">
          <button
            onClick={() => setLang("en")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
              lang === "en"
                ? "bg-[#FF5A5F] text-white shadow-md"
                : "text-[#8B1E2D]/70 hover:text-[#8B1E2D]"
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLang("am")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
              lang === "am"
                ? "bg-[#FF5A5F] text-white shadow-md"
                : "text-[#8B1E2D]/70 hover:text-[#8B1E2D]"
            }`}
          >
            አማ
          </button>
        </div>
      </div>

      {/* ── Main Card ── */}
      <div className="relative w-full max-w-[460px] mx-5 my-8">
        <div
          className="rounded-[36px] p-9 sm:p-10
                     bg-white/60 backdrop-blur-2xl border border-white/50
                     shadow-[0_20px_60px_rgba(139,30,45,0.12),inset_0_1px_0_rgba(255,255,255,0.8)]
                     transition-all duration-500"
        >
          {/* ── SUCCESS STATE (inside card) ── */}
          {showSuccess ? (
            <div className="flex flex-col items-center justify-center py-16 animate-success-in">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-xl mb-6">
                <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-[#1a1a1a] mb-2">{t.success}</h2>
              <p className="text-sm text-[#8B1E2D]/60">{t.successSub}</p>
            </div>
          ) : (
            /* ── FORM STATE ── */
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Header */}
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF5A5F] to-[#8B1E2D] shadow-lg mb-1">
                  <span className="text-white text-2xl font-bold">S</span>
                </div>
                <h1 className="text-[28px] sm:text-[32px] font-bold text-[#1a1a1a] leading-tight tracking-tight">
                  {t.title}
                </h1>
                <p className="text-sm text-[#8B1E2D]/55 tracking-wide">{t.tagline}</p>
              </div>

              {/* Session – always English */}
              {sessionInfo && (
                <div className="text-xs rounded-2xl p-4 bg-[#FFF2E6]/70 border border-[#FF5A5F]/10 text-[#8B1E2D]/80">
                  <p className="font-semibold mb-1.5 text-[#8B1E2D]">Current session</p>
                  <p className="truncate opacity-80">{sessionInfo.device}</p>
                  <p className="opacity-70 mt-0.5">{sessionInfo.email}</p>
                </div>
              )}

              {/* New Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#8B1E2D]">{t.newPassword}</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="w-full rounded-2xl border border-[#FF5A5F]/15 bg-white/80 p-4 pr-16
                               text-[#1a1a1a] placeholder:text-[#8B1E2D]/30 text-[15px]
                               focus:outline-none focus:ring-2 focus:ring-[#D9A441]/45 focus:border-transparent transition"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      checkStrength(e.target.value);
                      setPasswordError("");
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-[#8B1E2D]/60 hover:text-[#8B1E2D] transition"
                  >
                    {showPassword ? t.hide : t.show}
                  </button>
                </div>

                {password && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex gap-1.5">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                            i < strength ? strengthColors[strength - 1] : "bg-gray-200/60"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-[#8B1E2D]/60">
                      {t.strength}: {t.strengthLabels[strength - 1] || (lang === "en" ? "Too short" : "በጣም አጭር")}
                    </p>
                  </div>
                )}

                {password && liveTips.length > 0 && (
                  <ul className="text-xs space-y-1 text-[#8B1E2D]/70 pt-1">
                    {liveTips.map((tip) => (
                      <li key={tip}>• {tip}</li>
                    ))}
                  </ul>
                )}
                {passwordError && <p className="text-xs text-red-600 pt-1">{passwordError}</p>}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#8B1E2D]">{t.confirmPassword}</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="w-full rounded-2xl border border-[#FF5A5F]/15 bg-white/80 p-4
                             text-[#1a1a1a] placeholder:text-[#8B1E2D]/30 text-[15px]
                             focus:outline-none focus:ring-2 focus:ring-[#D9A441]/45 focus:border-transparent transition"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setConfirmError("");
                  }}
                />
                {confirmError && <p className="text-xs text-red-600 pt-1">{confirmError}</p>}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || strength < 4}
                className="w-full rounded-2xl bg-gradient-to-r from-[#FF5A5F] to-[#c94a4e] py-4
                           text-white font-semibold text-[15px] shadow-lg shadow-[#FF5A5F]/25
                           hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                {loading ? t.updating : t.update}
              </button>

              <p className="text-center text-xs text-[#8B1E2D]/45">{t.afterUpdate}</p>
            </form>
          )}
        </div>
      </div>

      {/* Passkey prompt */}
      {showPasskeyPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="max-w-sm w-full rounded-3xl p-8 space-y-5 bg-white/95 backdrop-blur-xl border border-white/70 shadow-2xl">
            <h2 className="text-xl font-bold text-center text-[#8B1E2D]">{t.passkeyTitle}</h2>
            <p className="text-sm text-center text-[#8B1E2D]/70">{t.passkeyDesc}</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={enrollPasskey}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#FF5A5F] to-[#8B1E2D] text-white font-semibold"
              >
                {t.savePasskey}
              </button>
              <button
                onClick={() => {
                  setShowPasskeyPrompt(false);
                  setShowMfaPrompt(true);
                }}
                className="w-full py-3.5 rounded-xl border border-[#8B1E2D]/20 text-[#8B1E2D] font-medium"
              >
                {t.skip}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MFA prompt */}
      {showMfaPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="max-w-sm w-full rounded-3xl p-8 space-y-5 bg-white/95 backdrop-blur-xl border border-white/70 shadow-2xl">
            <h2 className="text-xl font-bold text-center text-[#8B1E2D]">{t.mfaTitle}</h2>
            <p className="text-sm text-center text-[#8B1E2D]/70">{t.mfaDesc}</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleMfaChoice}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#FF5A5F] to-[#8B1E2D] text-white font-semibold"
              >
                {t.enable2fa}
              </button>
              <button
                onClick={handleMfaChoice}
                className="w-full py-3.5 rounded-xl border border-[#8B1E2D]/20 text-[#8B1E2D] font-medium"
              >
                {t.notNow}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes breathe {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.08); opacity: 1; }
        }
        .animate-breathe {
          animation: breathe 8s ease-in-out infinite;
        }

        @keyframes drift {
          0% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(24px, -16px) scale(1.04); }
          66% { transform: translate(-16px, 12px) scale(0.97); }
          100% { transform: translate(0, 0) scale(1); }
        }
        .animate-drift {
          animation: drift 18s ease-in-out infinite;
        }
        .animate-drift-delayed {
          animation: drift 22s ease-in-out infinite reverse;
          animation-delay: 4s;
        }

        @keyframes float-move {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-6px) translateX(-8px); }
          75% { transform: translateY(-24px) translateX(5px); }
        }
        .animate-float-move {
          animation: float-move 14s ease-in-out infinite;
        }

        @keyframes success-in {
          0% { opacity: 0; transform: scale(0.85); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-success-in {
          animation: success-in 0.5s cubic-bezier(0.34, 1.4, 0.64, 1) forwards;
        }
      `}</style>
    </div>
  );
}