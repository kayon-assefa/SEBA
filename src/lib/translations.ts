export type Language = "en" | "am";

export const translations = {
  en: {
    loginTitle: "Welcome back",
    loginSubtitle: "Log in to manage your business",
    emailLabel: "Email",
    emailPlaceholder: "you@business.com",
    next: "Next",
    back: "Back",
    passwordLabel: "Password",
    passwordPlaceholder: "Enter your password",
    login: "Log in",
    loggingIn: "Logging in…",
    forgotPassword: "Forgot password?",
    noAccount: "Don't have an account?",
    signUp: "Sign up",
    invalidEmail: "Enter a valid email address.",
    genericError: "Something went wrong. Please check your details and try again.",
    forgotTitle: "Reset your password",
    forgotSubtitle: "Enter your email and we'll send you a reset link",
    sendReset: "Send reset link",
    sending: "Sending…",
    resetSentTitle: "Check your inbox",
    resetSentBody:
      "If an account exists for that email, we've sent a link to reset your password.",
    backToLogin: "Back to login",
    loadingApp: "Getting things ready…",
  },
  am: {
    loginTitle: "እንኳን ደህና መጡ",
    loginSubtitle: "ንግድዎን ለማስተዳደር ይግቡ",
    emailLabel: "ኢሜይል",
    emailPlaceholder: "your@business.com",
    next: "ቀጣይ",
    back: "ተመለስ",
    passwordLabel: "የይለፍ ቃል",
    passwordPlaceholder: "የይለፍ ቃልዎን ያስገቡ",
    login: "ግባ",
    loggingIn: "በመግባት ላይ…",
    forgotPassword: "የይለፍ ቃል ረሱ?",
    noAccount: "አካውንት የለዎትም?",
    signUp: "ይመዝገቡ",
    invalidEmail: "ትክክለኛ ኢሜይል ያስገቡ።",
    genericError: "የሆነ ችግር ተፈጥሯል። እባክዎ መረጃዎን በድጋሚ ያረጋግጡ።",
    forgotTitle: "የይለፍ ቃልዎን ዳግም ያስጀምሩ",
    forgotSubtitle: "ኢሜይልዎን ያስገቡ፣ የማደሻ ማገናኛ እንልክልዎታለን",
    sendReset: "ማገናኛ ላክ",
    sending: "በመላክ ላይ…",
    resetSentTitle: "ኢሜይልዎን ይመልከቱ",
    resetSentBody:
      "ለዚህ ኢሜይል አካውንት ካለ፣ የይለፍ ቃል ማደሻ ማገናኛ ልከንልዎታል።",
    backToLogin: "ወደ መግቢያ ተመለስ",
    loadingApp: "በማዘጋጀት ላይ…",
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

/* NOTE: the Amharic strings above are a solid first pass, not a certified
   translation — worth a native-speaker review before shipping to production. */