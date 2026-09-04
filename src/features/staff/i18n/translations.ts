/**
 * SEBA Staff — translations
 * -----------------------------------------------------------------------
 * Four languages: English (en), Amharic (am), Tigrigna (ti), Afaan Oromo (om).
 * Covers navigation, page chrome, statuses, buttons, and empty states —
 * i.e. everything a staff member reads on every shift. Free-form toast
 * messages (e.g. "3 appointments updated") stay in English for now since
 * they're generated dynamically; translating the static UI around them
 * still makes the app usable end-to-end in each language.
 *
 * These were translated in good faith for everyday business/UI vocabulary.
 * If you have a native speaker on staff, a quick read-through before
 * shipping to production is worth it — nuance in formal vs. casual address
 * can vary by region.
 */

type WidenStrings<T> = {
  [K in keyof T]: T[K] extends string
    ? string
    : T[K] extends object
      ? WidenStrings<T[K]>
      : T[K];
};

export type Dict = WidenStrings<typeof en>;

export const en = {
  nav: {
    dashboard: "Dashboard", appointments: "Appointments", orders: "Orders",
    customers: "Customers", schedule: "Schedule", scan: "Scan",
    notifications: "Notifications", settings: "Settings", signOut: "Sign out",
  },
  common: {
    search: "Search", searchOrJump: "Search or jump to…", add: "Add", save: "Save",
    saving: "Saving…", cancel: "Cancel", close: "Close", edit: "Edit", delete: "Delete",
    filters: "Filters", allStatuses: "All statuses", allStaff: "All staff", allServices: "All services",
    loading: "Loading…", today: "Today", upcoming: "Upcoming", past: "Past", all: "All",
    table: "Table", board: "Board", calendar: "Calendar", list: "List",
    markAllRead: "Mark all read", refresh: "Refresh", noContactInfo: "No contact info",
    notes: "Notes", reason: "Reason (optional)", from: "From", to: "To", date: "Date",
    time: "Time", status: "Status", payment: "Payment", total: "Total", phone: "Phone",
    customer: "Customer", service: "Service", staff: "Staff", placed: "Placed", shown: "shown",
    name: "Name", saveChanges: "Save changes",
  },
  status: {
    pending: "Pending", confirmed: "Confirmed", completed: "Completed", cancelled: "Cancelled",
    "no-show": "No-show", waitlisted: "Waitlisted", processing: "Processing", ready: "Ready",
    unpaid: "Unpaid", deposit: "Deposit", paid: "Paid", failed: "Failed", refunded: "Refunded",
    unknown: "Unknown",
  },
  dashboard: {
    greeting: "Good day, {name}", subtitle: "Here's today's work at a glance.",
    todaysAppointments: "Today's appointments", pendingAppointments: "Pending appointments",
    todaysOrders: "Today's orders", noShowRate: "No-show rate", last7Days: "Appointments · last 7 days",
    nextUp: "Next up", nothingLeftToday: "Nothing left today", enjoyQuiet: "Enjoy the quiet.",
    upcomingAppointments: "Upcoming appointments", todaysOrdersSection: "Today's orders",
    noAppointmentsYet: "No appointments yet", noOrdersToday: "No orders today", tracked: "tracked",
  },
  appointments: {
    title: "Appointments", subtitle: "shown", addAppointment: "Add Appointment",
    confirm: "Confirm", complete: "Complete", reschedule: "Reschedule", cancel: "Cancel",
    selected: "selected", confirmAll: "Confirm all", completeAll: "Complete all",
    cancelAll: "Cancel all", clear: "Clear", searchPlaceholder: "Search customer, staff, or service…",
    noMatch: "No appointments match", tryClearingFilters: "Try clearing filters.",
    cancelConfirmTitle: "Cancel appointment?", rescheduleTitle: "Reschedule",
    dateRange: "Date range", newTime: "Save new time", slotTaken: "This slot is already taken. Pick a different time.",
  },
  orders: {
    title: "Orders", addOrder: "Add Order", allOrders: "All Orders",
    searchPlaceholder: "Search customer or phone…", noMatch: "No orders match",
    orderDetail: "Order", noItemsYet: "No itemized line items on this order yet.",
  },
  customers: {
    title: "Customers", addCustomer: "Add Customer", searchPlaceholder: "Search name or phone…",
    noMatch: "No customers match", visits: "visits", visit: "visit",
    repeatCustomer: "repeat customer", visitHistory: "Visit history", noVisitsYet: "No matched appointments yet.",
    tagsLabel: "Tags (comma-separated — e.g. VIP, allergic to nuts)", notesLabel: "Notes",
  },
  schedule: {
    title: "Schedule", subtitle: "Your shifts and time off.", requestTimeOff: "Request time off",
    yourShifts: "Your upcoming shifts", noShifts: "No shifts scheduled",
    askManager: "Ask your manager to add you to the roster.", appointmentSchedule: "Appointment schedule",
    nothingBooked: "Nothing on the books", timeOffRequests: "Your time-off requests", noRequestsYet: "No requests yet",
    submitRequest: "Submit request", submitting: "Submitting…",
  },
  notifications: {
    title: "Notifications", unread: "unread", noneYet: "No notifications yet",
    preferences: "Preferences", sms: "SMS", push: "Push (this device)",
    pushUnsupported: "Push isn't supported in this browser.", caughtUp: "You're all caught up.",
  },
  settings: {
    title: "Settings", subtitle: "Manage your profile and preferences.", profile: "Profile",
    fullName: "Full name", saveProfile: "Save profile", appearance: "Appearance",
    light: "Light", dark: "Dark", language: "Language", changePassword: "Change password",
    newPassword: "New password", confirmPassword: "Confirm new password", updatePassword: "Update password",
  },
  scan: {
    title: "Scan a SEBA pass", subtitle: "Point the camera at a customer's appointment or order pass.",
    startScanning: "Start scanning", startingCamera: "Starting camera…", stopCamera: "Stop camera",
    lookUp: "Look up", scannedNotFound: "Scanned, but not found",
    notFoundBody: "That code isn't a valid SEBA pass for this business. It may belong to a different business, or the pass may be expired.",
    scanAgain: "Scan again", appointmentFound: "Appointment found", orderFound: "Order found",
    scanAnother: "Scan another", lookingUp: "Looking up code…",
    manualHint: "If the camera cannot read this code, enter the code printed under the QR instead.",
    manualHintUnsupported: "This browser can't decode QR codes from live video yet. Enter the code printed under the QR instead.",
  },
} as const;

export const am: Dict = {
  nav: {
    dashboard: "ዳሽቦርድ", appointments: "ቀጠሮዎች", orders: "ትዕዛዞች",
    customers: "ደንበኞች", schedule: "መርሃ ግብር", scan: "ስካን",
    notifications: "ማሳወቂያዎች", settings: "ቅንብሮች", signOut: "ውጣ",
  },
  common: {
    search: "ፈልግ", searchOrJump: "ፈልግ ወይም ሂድ ወደ…", add: "አክል", save: "አስቀምጥ",
    saving: "በማስቀመጥ ላይ…", cancel: "ተወው", close: "ዝጋ", edit: "አርትዕ", delete: "ሰርዝ",
    filters: "ማጣሪያዎች", allStatuses: "ሁሉም ሁኔታዎች", allStaff: "ሁሉም ሠራተኞች", allServices: "ሁሉም አገልግሎቶች",
    loading: "በመጫን ላይ…", today: "ዛሬ", upcoming: "የሚመጡ", past: "ያለፉ", all: "ሁሉም",
    table: "ሠንጠረዥ", board: "ሰሌዳ", calendar: "ቀን መቁጠሪያ", list: "ዝርዝር",
    markAllRead: "ሁሉንም እንደተነበበ ምልክት አድርግ", refresh: "አድስ", noContactInfo: "የመገኛ መረጃ የለም",
    notes: "ማስታወሻዎች", reason: "ምክንያት (አማራጭ)", from: "ከ", to: "እስከ", date: "ቀን",
    time: "ሰዓት", status: "ሁኔታ", payment: "ክፍያ", total: "ጠቅላላ", phone: "ስልክ",
    customer: "ደንበኛ", service: "አገልግሎት", staff: "ሠራተኛ", placed: "ተይዟል", shown: "ታይቷል",
    name: "ስም", saveChanges: "ለውጦችን አስቀምጥ",
  },
  status: {
    pending: "በመጠባበቅ ላይ", confirmed: "ተረጋግጧል", completed: "ተጠናቅቋል", cancelled: "ተሰርዟል",
    "no-show": "አልመጣም", waitlisted: "በተጠባባቂ ዝርዝር", processing: "በሂደት ላይ", ready: "ዝግጁ",
    unpaid: "ያልተከፈለ", deposit: "ቅድመ ክፍያ", paid: "ተከፍሏል", failed: "አልተሳካም", refunded: "ተመላሽ ተደርጓል",
    unknown: "ያልታወቀ",
  },
  dashboard: {
    greeting: "እንደምን አደርክ፣ {name}", subtitle: "የዛሬው ስራ በአጭሩ እነሆ።",
    todaysAppointments: "የዛሬ ቀጠሮዎች", pendingAppointments: "በመጠባበቅ ላይ ያሉ ቀጠሮዎች",
    todaysOrders: "የዛሬ ትዕዛዞች", noShowRate: "ያለመምጣት መጠን", last7Days: "ቀጠሮዎች · ያለፉት 7 ቀናት",
    nextUp: "ቀጣይ", nothingLeftToday: "ለዛሬ ምንም አልቀረም", enjoyQuiet: "እረፍት ይውሰዱ።",
    upcomingAppointments: "የሚመጡ ቀጠሮዎች", todaysOrdersSection: "የዛሬ ትዕዛዞች",
    noAppointmentsYet: "እስካሁን ቀጠሮ የለም", noOrdersToday: "ዛሬ ትዕዛዝ የለም", tracked: "ተመዝግቧል",
  },
  appointments: {
    title: "ቀጠሮዎች", subtitle: "ታይቷል", addAppointment: "ቀጠሮ ጨምር",
    confirm: "አረጋግጥ", complete: "አጠናቅ", reschedule: "ቀን ቀይር", cancel: "ሰርዝ",
    selected: "ተመርጠዋል", confirmAll: "ሁሉንም አረጋግጥ", completeAll: "ሁሉንም አጠናቅ",
    cancelAll: "ሁሉንም ሰርዝ", clear: "አጽዳ", searchPlaceholder: "ደንበኛ፣ ሠራተኛ ወይም አገልግሎት ፈልግ…",
    noMatch: "ምንም ቀጠሮ አልተገኘም", tryClearingFilters: "ማጣሪያዎችን አጽዳ።",
    cancelConfirmTitle: "ቀጠሮውን ትሰርዛለህ?", rescheduleTitle: "ቀን ቀይር",
    dateRange: "የቀን ክልል", newTime: "አዲሱን ሰዓት አስቀምጥ", slotTaken: "ይህ ሰዓት ተይዟል። ሌላ ሰዓት ምረጥ።",
  },
  orders: {
    title: "ትዕዛዞች", addOrder: "ትዕዛዝ ጨምር", allOrders: "ሁሉም ትዕዛዞች",
    searchPlaceholder: "ደንበኛ ወይም ስልክ ፈልግ…", noMatch: "ምንም ትዕዛዝ አልተገኘም",
    orderDetail: "ትዕዛዝ", noItemsYet: "በዚህ ትዕዛዝ ላይ እስካሁን ዕቃዎች የሉም።",
  },
  customers: {
    title: "ደንበኞች", addCustomer: "ደንበኛ ጨምር", searchPlaceholder: "ስም ወይም ስልክ ፈልግ…",
    noMatch: "ምንም ደንበኛ አልተገኘም", visits: "ጉብኝቶች", visit: "ጉብኝት",
    repeatCustomer: "ተደጋጋሚ ደንበኛ", visitHistory: "የጉብኝት ታሪክ", noVisitsYet: "ምንም ተዛማጅ ቀጠሮ የለም።",
    tagsLabel: "መለያዎች (በኮማ ተለያይተው — ለምሳሌ VIP)", notesLabel: "ማስታወሻዎች",
  },
  schedule: {
    title: "መርሃ ግብር", subtitle: "የስራ ሰዓቶችህ እና እረፍትህ።", requestTimeOff: "እረፍት ጠይቅ",
    yourShifts: "የሚመጡ የስራ ሰዓቶችህ", noShifts: "ምንም የስራ ሰዓት አልተያዘም",
    askManager: "ወደ መርሃ ግብሩ እንዲጨምርህ አስተዳዳሪህን ጠይቅ።", appointmentSchedule: "የቀጠሮ መርሃ ግብር",
    nothingBooked: "ምንም አልተያዘም", timeOffRequests: "የእረፍት ጥያቄዎችህ", noRequestsYet: "እስካሁን ጥያቄ የለም",
    submitRequest: "ጥያቄ አስገባ", submitting: "በማስገባት ላይ…",
  },
  notifications: {
    title: "ማሳወቂያዎች", unread: "ያልተነበቡ", noneYet: "እስካሁን ማሳወቂያ የለም",
    preferences: "ምርጫዎች", sms: "ኤስኤምኤስ", push: "ግፋ (በዚህ መሳሪያ)",
    pushUnsupported: "ግፋ ማሳወቂያ በዚህ አሳሽ አይደገፍም።", caughtUp: "ሁሉንም አይተሃል።",
  },
  settings: {
    title: "ቅንብሮች", subtitle: "መገለጫህን እና ምርጫዎችህን ያስተዳድሩ።", profile: "መገለጫ",
    fullName: "ሙሉ ስም", saveProfile: "መገለጫ አስቀምጥ", appearance: "መልክ",
    light: "ብሩህ", dark: "ጨለማ", language: "ቋንቋ", changePassword: "የይለፍ ቃል ቀይር",
    newPassword: "አዲስ የይለፍ ቃል", confirmPassword: "አዲሱን የይለፍ ቃል አረጋግጥ", updatePassword: "የይለፍ ቃል አዘምን",
  },
  scan: {
    title: "የSEBA ፓስ ስካን አድርግ", subtitle: "ካሜራውን ወደ ደንበኛው የቀጠሮ ወይም የትዕዛዝ ፓስ አመልክት።",
    startScanning: "ስካን ጀምር", startingCamera: "ካሜራ በመክፈት ላይ…", stopCamera: "ካሜራ አቁም",
    lookUp: "ፈልግ", scannedNotFound: "ተስካን ተደርጓል፣ ግን አልተገኘም",
    notFoundBody: "ይህ ኮድ ለዚህ ንግድ ትክክለኛ የSEBA ፓስ አይደለም። ለሌላ ንግድ ሊሆን ወይም ጊዜው አልፎበት ሊሆን ይችላል።",
    scanAgain: "እንደገና ስካን አድርግ", appointmentFound: "ቀጠሮ ተገኝቷል", orderFound: "ትዕዛዝ ተገኝቷል",
    scanAnother: "ሌላ ስካን አድርግ", lookingUp: "ኮድ በመፈለግ ላይ…",
    manualHint: "ካሜራው ይህን ኮድ ማንበብ ካልቻለ ከQR ስር የተጻፈውን ኮድ አስገባ።",
    manualHintUnsupported: "ይህ አሳሽ ገና ከቀጥታ ቪዲዮ QR ኮድ ማንበብ አይችልም። ከQR ስር የተጻፈውን ኮድ አስገባ።",
  },
};

export const ti: Dict = {
  nav: {
    dashboard: "ዳሽቦርድ", appointments: "ቆጸራታት", orders: "ትእዛዛት",
    customers: "ዓማዊል", schedule: "መደብ ግዜ", scan: "ስካን",
    notifications: "ማሳወቕታት", settings: "ቅጥዕታት", signOut: "ውጻእ",
  },
  common: {
    search: "ድለ", searchOrJump: "ድለ ወይ ኪድ ናብ…", add: "ወስኽ", save: "ኣቐምጥ",
    saving: "ይቕመጥ ኣሎ…", cancel: "ስረዝ", close: "ዕጸው", edit: "ኣርትዕ", delete: "ሰርዝ",
    filters: "መጻረዪ", allStatuses: "ኩሎም ኩነታት", allStaff: "ኩሎም ሰራሕተኛታት", allServices: "ኩሎም ኣገልግሎታት",
    loading: "ይጽዕን ኣሎ…", today: "ሎሚ", upcoming: "ዝመጹ", past: "ዝሓለፉ", all: "ኩሎም",
    table: "ሰሌዳ", board: "ቦርድ", calendar: "ካላንደር", list: "ዝርዝር",
    markAllRead: "ኩሉ ከም ዝተነበበ ምልክት ግበር", refresh: "ኣሐድስ", noContactInfo: "ናይ ርክብ ሓበሬታ የለን",
    notes: "ማስታወሻ", reason: "ምኽንያት (ኣማራጺ)", from: "ካብ", to: "ክሳብ", date: "ዕለት",
    time: "ሰዓት", status: "ኩነታት", payment: "ክፍሊት", total: "ድምር", phone: "ስልኪ",
    customer: "ዓሚል", service: "ኣገልግሎት", staff: "ሰራሕተኛ", placed: "ተኣዚዙ", shown: "ተራእዩ",
    name: "ስም", saveChanges: "ለውጢ ኣቐምጥ",
  },
  status: {
    pending: "ኣብ መጸበቒ", confirmed: "ጸዲቑ", completed: "ተዛዚሙ", cancelled: "ተሰሪዙ",
    "no-show": "ኣይመጸን", waitlisted: "ኣብ ዝርዝር ተጸበይቲ", processing: "ኣብ ምስራሕ", ready: "ድሉው",
    unpaid: "ዘይተኸፍለ", deposit: "ቅድመ ክፍሊት", paid: "ተኸፊሉ", failed: "ኣይተሳኸዐን", refunded: "ተመሊሱ",
    unknown: "ዘይፍለጥ",
  },
  dashboard: {
    greeting: "ደሓን ውዓልካ፣ {name}", subtitle: "ናይ ሎሚ ዕዮ ብሓጺሩ እነሆ።",
    todaysAppointments: "ናይ ሎሚ ቆጸራታት", pendingAppointments: "ኣብ መጸበቒ ዘለዉ ቆጸራታት",
    todaysOrders: "ናይ ሎሚ ትእዛዛት", noShowRate: "መጠን ዘይምምጻእ", last7Days: "ቆጸራታት · ዝሓለፉ 7 መዓልታት",
    nextUp: "ቀጺሉ ዘሎ", nothingLeftToday: "ንሎሚ ገለ ኣይተረፈን", enjoyQuiet: "ዕረፍቲ ውሰድ።",
    upcomingAppointments: "ዝመጹ ቆጸራታት", todaysOrdersSection: "ናይ ሎሚ ትእዛዛት",
    noAppointmentsYet: "ክሳብ ሕጂ ቆጸራ የለን", noOrdersToday: "ሎሚ ትእዛዝ የለን", tracked: "ተመዝጊቡ",
  },
  appointments: {
    title: "ቆጸራታት", subtitle: "ተራእዩ", addAppointment: "ቆጸራ ወስኽ",
    confirm: "ኣጽድቕ", complete: "ዛዝም", reschedule: "ግዜ ቀይር", cancel: "ስረዝ",
    selected: "ተመሪጹ", confirmAll: "ኩሉ ኣጽድቕ", completeAll: "ኩሉ ዛዝም",
    cancelAll: "ኩሉ ስረዝ", clear: "ኣጽሪ", searchPlaceholder: "ዓሚል፣ ሰራሕተኛ ወይ ኣገልግሎት ድለ…",
    noMatch: "ዝሰማማዕ ቆጸራ የለን", tryClearingFilters: "መጻረዪታት ኣጽሪ።",
    cancelConfirmTitle: "እዚ ቆጸራ ክስረዝ ድዩ?", rescheduleTitle: "ግዜ ቀይር",
    dateRange: "ናይ ዕለት ክሊ", newTime: "ሓድሽ ግዜ ኣቐምጥ", slotTaken: "እዚ ግዜ ተታሒዙ ኣሎ። ካልእ ግዜ ምረጽ።",
  },
  orders: {
    title: "ትእዛዛት", addOrder: "ትእዛዝ ወስኽ", allOrders: "ኩሎም ትእዛዛት",
    searchPlaceholder: "ዓሚል ወይ ስልኪ ድለ…", noMatch: "ዝሰማማዕ ትእዛዝ የለን",
    orderDetail: "ትእዛዝ", noItemsYet: "ኣብዚ ትእዛዝ ክሳብ ሕጂ ንጥረ ነገር የለን።",
  },
  customers: {
    title: "ዓማዊል", addCustomer: "ዓሚል ወስኽ", searchPlaceholder: "ስም ወይ ስልኪ ድለ…",
    noMatch: "ዝሰማማዕ ዓሚል የለን", visits: "በጻሕቲ", visit: "በጻሒ",
    repeatCustomer: "ተደጋጋሚ ዓሚል", visitHistory: "ታሪኽ ምብጻሕ", noVisitsYet: "ዝሰማማዕ ቆጸራ የለን።",
    tagsLabel: "መለለዪታት (ብኮማ ተፈላሊጡ — ንኣብነት VIP)", notesLabel: "ማስታወሻ",
  },
  schedule: {
    title: "መደብ ግዜ", subtitle: "ናይ ስራሕ ሰዓታትካን ዕረፍትኻን።", requestTimeOff: "ዕረፍቲ ሕተት",
    yourShifts: "ዝመጹ ናይ ስራሕ ሰዓታትካ", noShifts: "ናይ ስራሕ ሰዓት ኣይተታሕዘን",
    askManager: "ናብ መደብ ግዜ ንክውሰኸካ ንሓላፊኻ ሕተት።", appointmentSchedule: "መደብ ቆጸራ",
    nothingBooked: "ገለ ኣይተታሕዘን", timeOffRequests: "ናይ ዕረፍቲ ሕቶታትካ", noRequestsYet: "ክሳብ ሕጂ ሕቶ የለን",
    submitRequest: "ሕቶ ኣቕርብ", submitting: "የቕርብ ኣሎ…",
  },
  notifications: {
    title: "ማሳወቕታት", unread: "ዘይተነብበ", noneYet: "ክሳብ ሕጂ ማሳወቕታ የለን",
    preferences: "ምርጫታት", sms: "ኤስኤምኤስ", push: "ደፍእ (እዚ መሳርሒ)",
    pushUnsupported: "ደፍእ ኣብዚ መተሓላለፊ ኣይድገፍን።", caughtUp: "ኩሉ ርኢኻዮ ኣሎኻ።",
  },
  settings: {
    title: "ቅጥዕታት", subtitle: "መግለጺኻን ምርጫታትካን ኣመሓድር።", profile: "መግለጺ",
    fullName: "ምሉእ ስም", saveProfile: "መግለጺ ኣቐምጥ", appearance: "መልክዕ",
    light: "ብሩህ", dark: "ጸልማት", language: "ቋንቋ", changePassword: "መሕለፊ ቃል ቀይር",
    newPassword: "ሓድሽ መሕለፊ ቃል", confirmPassword: "ሓድሽ መሕለፊ ቃል ኣጽድቕ", updatePassword: "መሕለፊ ቃል ኣሐድስ",
  },
  scan: {
    title: "ናይ SEBA ፓስ ስካን ግበር", subtitle: "ካሜራ ናብ ናይ ዓሚል ቆጸራ ወይ ትእዛዝ ፓስ ኣመልክት።",
    startScanning: "ስካን ጀምር", startingCamera: "ካሜራ ይኸፍት ኣሎ…", stopCamera: "ካሜራ ኣቁም",
    lookUp: "ድለ", scannedNotFound: "ተስካን ኮይኑ፣ ግን ኣይተረኽበን",
    notFoundBody: "እዚ ኮድ ንዚ ትካል ቅኑዕ ናይ SEBA ፓስ ኣይኮነን። ናይ ካልእ ትካል ክኸውን ወይ ግዜኡ ኣኺሉ ክኸውን ይኽእል።",
    scanAgain: "ደጊምካ ስካን ግበር", appointmentFound: "ቆጸራ ተረኺቡ", orderFound: "ትእዛዝ ተረኺቡ",
    scanAnother: "ካልእ ስካን ግበር", lookingUp: "ኮድ ይድለ ኣሎ…",
    manualHint: "ካሜራ እዚ ኮድ ከንብቦ እንተዘይክኢሉ፣ ኣብ ትሕቲ QR ተጻሒፉ ዘሎ ኮድ ኣእቱ።",
    manualHintUnsupported: "እዚ መተሓላለፊ ካብ ቀጥታ ቪድዮ QR ኮድ ገና ኣይነብብን። ኣብ ትሕቲ QR ተጻሒፉ ዘሎ ኮድ ኣእቱ።",
  },
};

export const om: Dict = {
  nav: {
    dashboard: "Daashboordii", appointments: "Beellamawwan", orders: "Ajajawwan",
    customers: "Maamiltoota", schedule: "Sagantaa", scan: "Iskaanii",
    notifications: "Beeksisa", settings: "Qindaa'ina", signOut: "Ba'i",
  },
  common: {
    search: "Barbaadi", searchOrJump: "Barbaadi ykn gara…deemi", add: "Ida'i", save: "Olkaa'i",
    saving: "Olkaa'aa jira…", cancel: "Dhiisi", close: "Cufi", edit: "Sirreessi", delete: "Haqi",
    filters: "Calaltuu", allStatuses: "Haala hunda", allStaff: "Hojjettoota hunda", allServices: "Tajaajila hunda",
    loading: "Fe'aa jira…", today: "Har'a", upcoming: "Kan dhufu", past: "Kan darbe", all: "Hunda",
    table: "Gabatee", board: "Boordii", calendar: "Kaalendarii", list: "Tarreeffama",
    markAllRead: "Hunda dubbifame jedhii mallatteessi", refresh: "Haaromsi", noContactInfo: "Odeeffannoon quunnamtii hin jiru",
    notes: "Yaadannoo", reason: "Sababa (filannoo)", from: "Irraa", to: "Hanga", date: "Guyyaa",
    time: "Sa'aatii", status: "Haala", payment: "Kaffaltii", total: "Waliigala", phone: "Bilbila",
    customer: "Maamila", service: "Tajaajila", staff: "Hojjetaa", placed: "Kenname", shown: "Argisiisame",
    name: "Maqaa", saveChanges: "Jijjiirama olkaa'i",
  },
  status: {
    pending: "Eegamaa jira", confirmed: "Mirkanaa'e", completed: "Xumurame", cancelled: "Haqame",
    "no-show": "Hin dhufne", waitlisted: "Tarree eegumsaa", processing: "Adeemsa irra jira", ready: "Qophaa'e",
    unpaid: "Hin kaffalamne", deposit: "Kaffaltii duraa", paid: "Kaffalame", failed: "Milkoofne", refunded: "Deebifame",
    unknown: "Hin beekamne",
  },
  dashboard: {
    greeting: "Akkam bulte, {name}", subtitle: "Hojii har'aa gabaabatti.",
    todaysAppointments: "Beellamawwan har'aa", pendingAppointments: "Beellamawwan eegamaa jiran",
    todaysOrders: "Ajajawwan har'aa", noShowRate: "Sadarkaa hin dhufne", last7Days: "Beellamawwan · guyyoota 7 darban",
    nextUp: "Kan itti aanu", nothingLeftToday: "Har'aaf wanti hin hafne", enjoyQuiet: "Boqonnaa fudhadhu.",
    upcomingAppointments: "Beellamawwan dhufan", todaysOrdersSection: "Ajajawwan har'aa",
    noAppointmentsYet: "Hanga ammaatti beellamni hin jiru", noOrdersToday: "Har'a ajajni hin jiru", tracked: "galmeeffame",
  },
  appointments: {
    title: "Beellamawwan", subtitle: "argisiisame", addAppointment: "Beellama Ida'i",
    confirm: "Mirkaneessi", complete: "Xumuri", reschedule: "Sa'aatii jijjiiri", cancel: "Haqi",
    selected: "filatame", confirmAll: "Hunda mirkaneessi", completeAll: "Hunda xumuri",
    cancelAll: "Hunda haqi", clear: "Qulqulleessi", searchPlaceholder: "Maamila, hojjetaa ykn tajaajila barbaadi…",
    noMatch: "Beellamni hin argamne", tryClearingFilters: "Calaltuu qulqulleessi.",
    cancelConfirmTitle: "Beellama kana haquu?", rescheduleTitle: "Sa'aatii jijjiiri",
    dateRange: "Hangii guyyaa", newTime: "Sa'aatii haaraa olkaa'i", slotTaken: "Sa'aatiin kun qabameera. Sa'aatii biraa filadhu.",
  },
  orders: {
    title: "Ajajawwan", addOrder: "Ajaja Ida'i", allOrders: "Ajajawwan Hunda",
    searchPlaceholder: "Maamila ykn bilbila barbaadi…", noMatch: "Ajajni hin argamne",
    orderDetail: "Ajaja", noItemsYet: "Ajaja kana irratti amma illee meeshaan hin galmoofne.",
  },
  customers: {
    title: "Maamiltoota", addCustomer: "Maamila Ida'i", searchPlaceholder: "Maqaa ykn bilbila barbaadi…",
    noMatch: "Maamilli hin argamne", visits: "daawwannaa", visit: "daawwannaa",
    repeatCustomer: "maamila deddeebi'u", visitHistory: "Seenaa daawwannaa", noVisitsYet: "Beellamni walsimu hin jiru.",
    tagsLabel: "Mallattoolee (koomaan qoodi — fkn VIP)", notesLabel: "Yaadannoo",
  },
  schedule: {
    title: "Sagantaa", subtitle: "Sa'aatii hojii keetii fi boqonnaa keetii.", requestTimeOff: "Boqonnaa gaafadhu",
    yourShifts: "Sa'aatiiwwan hojii kee dhufan", noShifts: "Sa'aatiin hojii hin qindoofne",
    askManager: "Akka sagantaa irratti si dabalu ittigaafatamaa kee gaafadhu.", appointmentSchedule: "Sagantaa beellamaa",
    nothingBooked: "Wanti qabame hin jiru", timeOffRequests: "Gaaffii boqonnaa keetii", noRequestsYet: "Hanga ammaatti gaaffiin hin jiru",
    submitRequest: "Gaaffii ergi", submitting: "Ergaa jira…",
  },
  notifications: {
    title: "Beeksisa", unread: "hin dubbifamne", noneYet: "Hanga ammaatti beeksisni hin jiru",
    preferences: "Filannoo", sms: "SMS", push: "Push (meeshaa kana)",
    pushUnsupported: "Push browser kanaan hin deeggaramu.", caughtUp: "Hunda argiteetta.",
  },
  settings: {
    title: "Qindaa'ina", subtitle: "Piroofaayilii fi filannoo kee bulchi.", profile: "Piroofaayilii",
    fullName: "Maqaa guutuu", saveProfile: "Piroofaayilii olkaa'i", appearance: "Fakkaattii",
    light: "Ifaa", dark: "Dukkanaa'aa", language: "Afaan", changePassword: "Jecha iccitii jijjiiri",
    newPassword: "Jecha iccitii haaraa", confirmPassword: "Jecha iccitii haaraa mirkaneessi", updatePassword: "Jecha iccitii haaromsi",
  },
  scan: {
    title: "Paasii SEBA Iskaanii Godhi", subtitle: "Kaameraa gara paasii beellama ykn ajaja maamilaa qabi.",
    startScanning: "Iskaanii jalqabi", startingCamera: "Kaameraa banaa jira…", stopCamera: "Kaameraa dhaabi",
    lookUp: "Barbaadi", scannedNotFound: "Iskaanii ta'eera, garuu hin argamne",
    notFoundBody: "Kun paasii SEBA sirrii daldala kanaa miti. Daldala biraatiif ta'uu danda'a ykn yeroon isaa darbee ta'a.",
    scanAgain: "Irra deebi'ii iskaanii godhi", appointmentFound: "Beellamni argame", orderFound: "Ajajni argame",
    scanAnother: "Iskaanii biraa godhi", lookingUp: "Koodii barbaadaa jira…",
    manualHint: "Kaameraan koodii kana dubbisuu baannaan, koodii QR jala barreeffame galchi.",
    manualHintUnsupported: "Browserichi kun ammatti viidiyoo jiruu irraa QR dubbisuu hin danda'u. Koodii QR jala barreeffame galchi.",
  },
};

export const LANGUAGES: { code: "en" | "am" | "ti" | "om"; label: string; native: string }[] = [
  { code: "en", label: "English", native: "English" },
  { code: "am", label: "Amharic", native: "አማርኛ" },
  { code: "ti", label: "Tigrigna", native: "ትግርኛ" },
  { code: "om", label: "Afaan Oromo", native: "Afaan Oromoo" },
];

export const DICTS: Record<string, Dict> = { en, am, ti, om };
