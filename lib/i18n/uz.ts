/**
 * Uzbek UI strings. No inline literals in components — everything routes here.
 * Numbers/dates use uz-UZ formatting via the helpers at the bottom.
 */
export const uz = {
  brand: "Falaq Nashr",
  brandSuffix: "marketing",

  nav: {
    sectionMain: "Asosiy",
    sectionManagement: "Boshqaruv",
    dashboard: "Dashboard",
    creatives: "Kreativlar",
    books: "Kitoblar",
    tasks: "Vazifalar",
    results: "Natijalar",
    campaigns: "Barcha kampaniyalar",
    team: "Jamoa",
    budgets: "Byudjetlar",
    users: "Foydalanuvchilar",
    settings: "Sozlamalar",
    audit: "Audit",
  },

  roles: {
    ceo: "CEO",
    pr_manager: "PR menejer",
  },

  header: {
    search: "Qidirish",
  },

  userMenu: {
    profile: "Mening profilim",
    settings: "Sozlamalar",
    signout: "Chiqish",
  },

  metrics: {
    spend: "Sarflandi",
    budget: "Byudjet",
    remaining: "Qoldiq",
    reach: "Qamrov",
    impressions: "Ko'rsatishlar",
    clicks: "Bosishlar",
    frequency: "Chastota",
    leads: "Lidlar",
    lpViews: "LP ko'rishlar",
    cpl: "CPL",
    cpm: "CPM",
    ctr: "CTR",
    hookRate: "HOOK",
    holdRate: "HOLD",
    pacing: "Sur'at",
    directRoas: "To'g'ridan-to'g'ri ROAS",
    visitRate: "Tashrif darajasi",
    leadRate: "Lid darajasi",
    daily: "Kunlik",
    all: "Barchasi",
    blogger: "Bloger",
    production: "Ishlab chiqarish",
    ads: "Reklama",
  },

  common: {
    comingSoon: "Tez orada",
    underConstruction: "Bu bo'lim ishlab chiqilmoqda.",
    noAccessTitle: "Ruxsat yo'q",
    noAccessBody: "Sizda bu sahifaga kirish huquqi yo'q.",
    overdue: "Muddati o'tgan",
    backToDashboard: "Dashboardga qaytish",
    all: "Barchasi",
    dash: "—",
  },

  brands: {
    falaq_nashr: "Falaq Nashr",
    falaq_kids: "Falaq Kids",
  },

  users: {
    subtitle: "Tizim foydalanuvchilari va rollari",
    invite: "＋ Taklif qilish",
    colUser: "Foydalanuvchi",
    colRole: "Rol",
    colBooks: "Kitoblar",
    colStatus: "Holat",
    colLastLogin: "Oxirgi kirish",
    colActions: "Amallar",
    active: "Faol",
    inactive: "Nofaol",
    empty: "Foydalanuvchilar yo'q",
    emptyBody: "Hozircha hech qanday foydalanuvchi mavjud emas.",
    actionsLabel: "Amallar",
    deactivate: "Faolsizlantirish",
    activate: "Faollashtirish",
    changeRole: "Rolni o'zgartirish",
    changeRoleDesc: "Foydalanuvchi uchun yangi rol tanlang.",
    selfHint: "O'zingizga nisbatan amal bajarib bo'lmaydi",
    fRole: "Rol",
    inviteTitle: "Foydalanuvchi qo'shish",
    inviteDesc:
      "Yangi foydalanuvchi ma'lumotlarini kiriting. U shu parol bilan darhol kira oladi.",
    fName: "Ism",
    fEmail: "Email",
    fPassword: "Boshlang'ich parol",
    generate: "Yaratish",
    passwordHint:
      "Ushbu parolni foydalanuvchiga bering — u birinchi kirishdan so'ng o'zgartira oladi.",
    inviteSuccess: "Foydalanuvchi yaratildi. Parolni unga yetkazing.",
    save: "Saqlash",
    saving: "Saqlanmoqda…",
    sending: "Yuborilmoqda…",
    cancel: "Bekor qilish",
  },

  budgets: {
    subtitle: "Kitoblar bo'yicha byudjet va sarflar",
    kpiBudget: "Umumiy byudjet",
    kpiSpent: "Jami sarflandi",
    kpiRemaining: "Umumiy qoldiq",
    colBook: "Kitob",
    colOwner: "Egasi",
    colBudget: "Byudjet",
    colSpent: "Sarflandi",
    colRemaining: "Qoldiq",
    colBurn: "Burn %",
    editBudget: "Byudjetni o'zgartirish",
    editShort: "O'zgartirish",
    noOwner: "Egasiz",
    empty: "Kitoblar yo'q",
    emptyBody: "Hozircha hech qanday kitob mavjud emas.",
    newBook: "＋ Yangi kitob",
    createTitle: "Yangi kitob",
    createDesc: "Yangi kitob ma'lumotlarini to'ldiring.",
    fTitle: "Nomi",
    fBrand: "Brend",
    fOwner: "Egasi",
    fBudget: "Byudjet",
    fLaunch: "Ishga tushirilgan",
    ownerUnassigned: "Tayinlanmagan",
    save: "Saqlash",
    saving: "Saqlanmoqda…",
    create: "Yaratish",
    creating: "Yaratilmoqda…",
    cancel: "Bekor qilish",
  },

  audit: {
    subtitle: "Tizimdagi o'zgarishlar tarixi",
    colDate: "Sana",
    colUser: "Foydalanuvchi",
    colAction: "Amal",
    colEntity: "Obyekt",
    empty: "Audit yozuvlari yo'q",
    emptyBody:
      "O'zgarishlar kiritilgan sari yozuvlar shu yerda paydo bo'ladi.",
  },

  settings: {
    subtitle: "Tizim sozlamalari va chegaralari",
    thresholdsTitle: "Metrika chegaralari",
    thresholdsSubtitle:
      "Ko'rsatkichlar uchun ogohlantirish va xavf chegaralari",
    addThreshold: "＋ Chegara qo'shish",
    colMetric: "Metrika",
    colObjective: "Obyektiv",
    colBrand: "Brend",
    colWarn: "Ogohlantirish",
    colAlert: "Xavf",
    legendTitle: "Ranglar qoidasi",
    legendOk: "OK — chegara ichida",
    legendWarn: "Ogohlantirish — diqqat talab qiladi",
    legendAlert: "Xavf — zudlik bilan chora ko'ring",
    empty: "Chegaralar yo'q",
    emptyBody: "Hozircha hech qanday chegara belgilanmagan.",
    // Add / edit form
    formAddTitle: "Yangi chegara",
    formEditTitle: "Chegarani tahrirlash",
    fMetric: "Metrika",
    fMetricHint: "masalan: frequency, cpm, ctr, cpc, roas",
    fObjective: "Obyektiv",
    fObjectivePlaceholder: "Barchasi (bo'sh qoldiring)",
    fBrand: "Brend",
    fWarn: "Ogohlantirish chegarasi",
    fAlert: "Xavf chegarasi",
    fBelow: "dan past (<)",
    fAbove: "dan yuqori (>)",
    save: "Saqlash",
    cancel: "Bekor qilish",
    edit: "Tahrirlash",
    delete: "O'chirish",
    confirmDelete: "Bu chegara o'chirilsinmi?",
    colActions: "Amallar",
    allBrands: "Barcha brendlar",
    // Meta sync card
    metaTitle: "Meta reklama ma'lumotlari",
    metaSubtitle: "Facebook/Meta'dan jonli reklama ko'rsatkichlarini yangilash",
    metaSyncNow: "Hozir sinxronlash",
    metaSyncing: "Sinxronlanmoqda…",
    metaLastSync: "Oxirgi sinxronlash",
    metaNever: "Hali sinxronlanmagan",
    metaRows: "yozuv",
    metaRange: "davr",
    metaStatusSuccess: "Muvaffaqiyatli",
    metaStatusFailed: "Xatolik",
    metaStatusRunning: "Bajarilmoqda",
    metaDone: "Ma'lumotlar yangilandi",
  },

  tasks: {
    subtitle: "Marketing vazifalari taxtasi",
    viewKanban: "Kanban",
    viewTable: "Jadval",
    colTask: "Vazifa",
    colBook: "Kitob",
    colAssignee: "Mas'ul",
    colStatus: "Holat",
    colPriority: "Muhimlik",
    colDue: "Muddati",
    unassigned: "Tayinlanmagan",
    noBook: "Kitobsiz",
    noDue: "Muddatsiz",
    empty: "Vazifalar yo'q",
    emptyBody: "Hozircha hech qanday vazifa mavjud emas.",
    newTask: "＋ Yangi vazifa",
    formTitle: "Yangi vazifa",
    formSubtitle: "Vazifa ma'lumotlarini to'ldiring. * bilan belgilangan maydonlar shart.",
    fieldTitle: "Sarlavha",
    fieldDescription: "Tavsif",
    fieldBook: "Kitob",
    fieldPriority: "Muhimlik",
    fieldStatus: "Holat",
    fieldDue: "Muddati",
    fieldAssignee: "Mas'ul",
    changeStatus: "Holatni o'zgartirish",
    create: "Yaratish",
    creating: "Yaratilmoqda…",
    cancel: "Bekor qilish",
    // detail + comments
    detailTitle: "Vazifa tafsilotlari",
    descriptionLabel: "Tavsif",
    noDescription: "Tavsif yo'q",
    assigneeLabel: "Mas'ul",
    creatorLabel: "Yaratdi",
    dueLabel: "Muddati",
    comments: "Izohlar",
    noComments: "Hali izohlar yo'q",
    commentPlaceholder: "Izoh yozing…",
    send: "Yuborish",
    sending: "Yuborilmoqda…",
    you: "Siz",
    status: {
      todo: "Bajarilishi kerak",
      in_progress: "Jarayonda",
      review: "Ko'rib chiqish",
      done: "Bajarildi",
      blocked: "Bloklangan",
    },
    priority: {
      low: "Past",
      normal: "O'rta",
      high: "Yuqori",
    },
  },

  creatives: {
    subtitle: "Reklama darajasidagi natijalar",
    ranking: "Kreativlar reytingi",
    rankingSubtitle: "Xarajat bo'yicha eng yaxshi kreativlar",
    byBookSubtitle: "Kitoblar bo'yicha — har bir kitob uchun kreativlar soni",
    searchBook: "Kitob qidirish…",
    booksWord: "kitob",
    creativesWord: "kreativ",
    allCampaigns: "Barcha kampaniyalar",
    searchCampaign: "Kampaniya qidirish…",
    spend: "Xarajat",
    leads: "Lidlar",
    cpl: "CPL",
    ctr: "CTR",
    hookRate: "Hook rate",
    holdRate: "Hold rate",
    visitRate: "Visit rate",
    leadRate: "Lead rate",
    impressions: "Ko'rsatishlar",
    clicks: "Kliklar",
    lpViews: "LP ko'rishlar",
    colCreative: "Kreativ",
    fatigue: "Charchoq",
    empty: "Kreativlar yo'q",
    emptyBody: "Hozircha hech qanday kreativ mavjud emas.",
    syncHint:
      "Kreativ ma'lumotlari uchun Sozlamalar → Sinxronlash tugmasini bosing.",
    legendTitle: "Ko'rsatkichlar haqida",
    legendHook: "HOOK = 3s ko'rishlar ÷ ko'rsatishlar",
    legendHold: "HOLD = ThruPlay ÷ 3s ko'rishlar",
    legendPending:
      "Bu ko'rsatkichlar eski vosita (prosales.uz) bilan hali tekshirilmagan.",
  },

  team: {
    subtitle: "Menejerlarni yonma-yon solishtirish",
    colManager: "Menejer",
    colBooks: "Kitoblar",
    colBudget: "Boshqariladigan byudjet",
    colSpend: "Sarflandi",
    colBurn: "Burn %",
    colCpm: "CPM",
    colCtr: "CTR",
    colOpenTasks: "Ochiq vazifalar",
    colOverdue: "Muddati o'tgan",
    kpiManagers: "Menejerlar",
    kpiBudget: "Umumiy byudjet",
    kpiSpend: "Umumiy sarf",
    empty: "Menejerlar yo'q",
    emptyBody: "Hozircha hech qanday menejer mavjud emas.",
  },

  campaigns: {
    subtitle: "Barcha kampaniyalar bo'yicha ko'rsatkichlar",
    colCampaign: "Kampaniya",
    colBook: "Kitob",
    colObjective: "Obyektiv",
    colSpend: "Sarflandi",
    colReach: "Qamrov",
    colCtr: "CTR",
    colCpm: "CPM",
    colFrequency: "Chastota",
    colLeads: "Lidlar",
    colPacing: "Sur'at",
    paceSlow: "sekin",
    paceFast: "tez",
    kpiCampaigns: "Kampaniyalar",
    kpiSpend: "Umumiy sarf",
    kpiReach: "Umumiy qamrov",
    kpiLeads: "Umumiy lidlar",
    noBook: "Kitobsiz",
    empty: "Kampaniyalar yo'q",
    emptyBody: "Hozircha hech qanday kampaniya mavjud emas.",
  },

  results: {
    subtitle: "Kampaniya samaradorligi — voronka ko'rsatkichlari",
    colCampaign: "Kampaniya",
    colReach: "Qamrov",
    colImpressions: "Ko'rsatishlar",
    colCtr: "CTR",
    colHook: "HOOK",
    colHold: "HOLD",
    colLeads: "Lidlar",
    colCpl: "CPL",
    colVisitRate: "Tashrif darajasi",
    colLeadRate: "Lid darajasi",
    note: "Lidlar = boshlangan suhbatlar (messaging) yoki lid-forma lidlari. CPL = xarajat ÷ lidlar.",
    empty: "Natijalar yo'q",
    emptyBody: "Hozircha hech qanday kampaniya natijalari mavjud emas.",
  },

  dashboard: {
    subtitle: "Marketing ko'rsatkichlari umumiy ko'rinishi",
    reachApprox: "taxminiy",
    reachApproxNote:
      "Qamrov hisob darajasida deduplikatsiya qilinmagan, shuning uchun taxminiy.",
    roasNote:
      "B2B kitob do'koni savdosi bunda ko'rinmaydi — kampaniyalarni 1.0 ga emas, bir-biriga solishtiring.",
    pacingAvgNote: "kampaniyalar bo'yicha o'rtacha (sarfga vaznlangan)",
    burnTitle: "Byudjet sarfi",
    campaignsTitle: "Kampaniyalar",
  },

  books: {
    subtitle: "Kitoblar bo'yicha byudjet va haqiqiy xarajatlar",
    launch: "Ishga tushirilgan",
    tableTitle: "Kitoblar jadvali",
    colProgress: "Sarf darajasi",
    searchFor: "Qidiruv natijalari:",
    empty: "Sizda hali kitoblar yo'q",
    emptyBody: "Kitoblar qo'shilgach, ular shu yerda ko'rinadi.",
    // self-service create
    add: "＋ Kitob qo'shish",
    createTitle: "Yangi kitob qo'shish",
    createDesc: "Kitob ma'lumotlarini kiriting — jadval formatiga mos.",
    fTitle: "Kitob nomi",
    fBrand: "Brend",
    fCategory: "Kategoriya",
    fPrintRun: "Nashr soni",
    fSalesPrev: "O'tgan oy sotuvi",
    fSalesNow: "Shu oy sotuvi",
    fBudget: "Byudjet",
    fTargetBudget: "Target byudjeti",
    fTargetOther: "Target boshqa kitobga",
    fTargetSales: "Target (sotuv)",
    fLaunch: "Ishga tushirilgan sana",
    optional: "ixtiyoriy",
    create: "Qo'shish",
    creating: "Qo'shilmoqda…",
    cancel: "Bekor qilish",
  },

  bookDetail: {
    owner: "Egasi",
    noOwner: "Egasiz",
    launch: "Ishga tushirilgan",
    burn: "Sarf darajasi",
    breakdownTitle: "Sarf tarkibi",
    ledgerTitle: "Sarflar ro'yxati",
    addSpend: "＋ Sarf qo'shish",
    createTitle: "Yangi sarf qo'shish",
    createDesc: "Bloger yoki ishlab chiqarish xarajatini kiriting.",
    editTitle: "Sarfni tahrirlash",
    editDesc: "Sarf ma'lumotlarini yangilang.",
    fType: "Turi",
    fAmount: "Summa",
    fCurrency: "Valyuta",
    fFxRate: "Kurs",
    fVendor: "Vendor/bloger",
    fPromoCode: "Promo-kod",
    fSpentAt: "Sana",
    fNotes: "Izoh",
    save: "Saqlash",
    cancel: "Bekor qilish",
    edit: "Tahrirlash",
    delete: "O'chirish",
    confirmDelete: "Bu sarfni o'chirmoqchimisiz?",
    colType: "Turi",
    colAmount: "Summa",
    colVendor: "Vendor",
    colPromo: "Promo-kod",
    colDate: "Sana",
    colActions: "Amallar",
    empty: "Sarflar yo'q",
    emptyBody: "Bu kitob uchun hali sarf qo'shilmagan.",
    typeBlogger: "Bloger",
    typeProduction: "Ishlab chiqarish",
  },

  overview: {
    title: "Sarflar dinamikasi",
    last10: "so'nggi 10 kun",
  },
  spendSplit: {
    title: "Sarf taqsimoti",
    total: "Jami",
  },
  byBook: {
    title: "Kitoblar bo'yicha sarf",
    viewBudgets: "Byudjetlarda ko'rish",
  },

  notify: {
    taskAssignedTitle: "Yangi vazifa biriktirildi",
    taskAssignedBy: "Sizga vazifa berdi",
    commentTitle: "Vazifaga yangi izoh",
    syncTitle: "Ma'lumotlar yangilandi",
    syncBody: "Meta bilan sinxronizatsiya muvaffaqiyatli",
    fatigueTitle: "Kreativ charchoq",
    budgetTitle: "Byudjet tugayapti",
  },

  dailyMetrics: {
    title: "Kunlik ko'rsatkichlar",
    subtitle: "Kitob kampaniyalari — oxirgi 30 kun, har bir kun uchun",
    overall: "Umumiy",
    main: "Asosiy ko'rsatkichlar",
    extra: "Qo'shimcha ko'rsatkichlar",
    impressions: "Ko'rsatishlar",
    spend: "Sarflandi",
    reach: "Qamrov",
    frequency: "Chastota",
    cpm: "CPM (1000 ko'rsatish)",
    ctr: "CTR",
    hook: "HOOK rate",
    hold: "HOLD rate",
    delivery: "Yetkazish",
    noData: "Bu kitob uchun Meta ma'lumotlari hali yo'q. Kampaniyalar biriktirilib, sinxronlangandan so'ng ko'rinadi.",
    ok: "OK",
    warn: "Ogohlantirish",
    alert: "Xavf",
  },
  topCampaigns: {
    title: "Eng ko'p sarflagan kampaniyalar",
    subtitle: "Kampaniyalar bo'yicha statistika",
  },
  overviewTable: {
    name: "Kampaniya",
    detail: "Obyektiv",
    progress: "Sur'at",
    action: "Amal",
    viewCampaigns: "Kampaniyalarda ko'rish",
  },
  panel: {
    title: "Marketing paneli",
    subtitle: "Barcha ko'rsatkichlar",
    weeklySpend: "Haftalik sarf",
    activeCampaigns: "Faol kampaniyalar",
    seeReport: "Hisobotni ko'rish",
  },
  notifications: {
    title: "Bildirishnomalar",
    seeAll: "Barchasini ko'rish",
    markAllRead: "Hammasini o'qildi deb belgilash",
    empty: "Yangi bildirishnoma yo'q",
  },
  alerts: {
    overdueTitle: "Muddati o'tgan vazifalar",
    overdueDesc: "{n} ta vazifaning muddati o'tgan",
    fatigueTitle: "Kreativ charchoq",
    fatigueDesc: "{n} ta kampaniyada chastota 4 dan yuqori",
    burnTitle: "Byudjet tugayapti",
    burnDesc: "{n} ta kitob byudjetining 90% dan ortig'i sarflangan",
    syncFailTitle: "Sinxronizatsiya xatosi",
    syncFailDesc: "Meta ma'lumotlarini yangilashda xatolik",
    syncOkTitle: "Ma'lumotlar yangilangan",
    syncOkDesc: "Meta bilan sinxronizatsiya muvaffaqiyatli",
  },
  profile: {
    title: "Mening profilim",
    subtitle: "Hisob ma'lumotlaringiz",
    role: "Rol",
    status: "Holat",
    active: "Faol",
    inactive: "Nofaol",
    email: "Email",
    booksOwned: "Boshqaradigan kitoblar",
    photo: "Profil rasmi",
    changePhoto: "Rasm yuklash",
    removePhoto: "O'chirish",
    uploadingPhoto: "Yuklanmoqda…",
    photoHint: "JPEG, PNG yoki WebP. Rasm avtomatik kichraytiriladi.",
    photoError: "Rasmni yuklashda xatolik.",
    security: "Xavfsizlik",
    changePassword: "Parolni o'zgartirish",
    pwCurrent: "Joriy parol",
    pwNew: "Yangi parol",
    pwConfirm: "Yangi parolni tasdiqlang",
    pwSave: "Saqlash",
    pwCancel: "Bekor qilish",
    pwChanged: "Parol muvaffaqiyatli o'zgartirildi",
    pwTooShort: "Yangi parol kamida 8 ta belgidan iborat bo'lishi kerak",
    pwMismatch: "Yangi parollar mos kelmadi",
    pwWrongCurrent: "Joriy parol noto'g'ri",
    appSettings: "Tizim sozlamalari",
    goToSettings: "Sozlamalarga o'tish",
  },

  tracker: {
    title: "Ko'rsatkichlar",
    edit: "Tahrirlash",
    save: "Saqlash",
    cancel: "Bekor qilish",
    auto: "avto",
    category: "Kategoriya",
    categoryAuto: "Avto (sotuvga qarab)",
    catNew: "Yangi",
    printRun: "Nashr soni",
    stock: "Qoldiq (astatka)",
    sales: "Sotuv",
    salesPrev: "O'tgan oy sotuvi",
    salesNow: "Shu oy sotuvi",
    diff: "Farq",
    marketingBudget: "Byudjet",
    target: "Target (sotuv)",
    targetBudget: "Target byudjeti",
    targetOther: "Target boshqa kitobga",
    totalUsed: "Umumiy ishlatilgan byudjet",
    bloggers: "Blogerlar",
    percent: "Foiz",
  },

  bloggers: {
    title: "Bloggerlar",
    add: "＋ Blogger qo'shish",
    name: "Blogger",
    platform: "Platforma",
    budget: "Byudjet",
    spent: "Sarflandi",
    remaining: "Qoldiq",
    note: "Izoh",
    actions: "Amallar",
    save: "Saqlash",
    cancel: "Bekor qilish",
    edit: "Tahrirlash",
    delete: "O'chirish",
    confirmDelete: "Bu blogger o'chirilsinmi?",
    empty: "Hali bloggerlar qo'shilmagan",
    totalBudget: "Umumiy byudjet",
    totalSpent: "Jami sarflandi",
  },
} as const;

// Deterministic grouping (space every 3 digits). NOT locale `Intl` — that
// formats differently on server vs client and breaks React hydration.
function group(n: number): string {
  const neg = n < 0;
  const s = Math.round(Math.abs(n))
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return neg ? `-${s}` : s;
}

/** Format a number with thousands separators (uz-UZ style). */
export function fmtNumber(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  return group(n);
}

/** Format a UZS amount with thousands separators. */
export function fmtUZS(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  return `${group(n)} so'm`;
}

/** Format a date as dd.mm.yyyy (deterministic, hydration-safe). */
export function fmtDate(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return "—";
  const dd = String(date.getUTCDate()).padStart(2, "0");
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${dd}.${mm}.${date.getUTCFullYear()}`;
}

/**
 * Relative time in Uzbek ("5 daqiqa oldin"). CLIENT-ONLY — uses the current
 * clock, so never call it during server render (hydration). Falls back to an
 * absolute date for anything older than a week.
 */
export function relTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "—";
  const sec = Math.floor((Date.now() - then) / 1000);
  if (sec < 45) return "hozirgina";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} daqiqa oldin`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} soat oldin`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day} kun oldin`;
  return fmtDate(iso);
}
