import type { Translation } from '../translate.ts'
import type { en } from './en.ts'

/**
 * Bangla.
 *
 * Typed as `Translation<typeof en>` rather than as a second `MessageTree`, and
 * that one choice carries the whole safety story of this locale: every key is
 * **optional**, so a string nobody has translated yet is a legal omission that
 * falls back to English rather than a build error or a blank; no key that the
 * English tree does not have may be *added*, so a typo here is caught by `tsc`
 * instead of silently never being read; and a plural stays a plural, so it
 * cannot be flattened into a string that ignores its count.
 *
 * Three conventions run through the wording, and they are what make this read
 * as an office's Bangla rather than as a dictionary's:
 *
 *  1. **A code stays a code.** `OpEx`, `CSD`, `SL`, `Trip DO`, `LBTS` and a
 *     model number are identifiers the business says aloud in English, and
 *     translating one would make the screen disagree with the paper beside it.
 *  2. **A borrowed word that the office already uses is kept, in Bangla
 *     script.** চালান, গেট পাস, ডেলিভারি, ভেন্ডর and রেট are what people
 *     actually say; inventing a pure-Bangla equivalent for them would be a
 *     translation nobody could follow.
 *  3. **Digits are never written into a string.** They arrive through
 *     interpolation and are shaped by `numerals.ts`, so `{count}` is Bengali on
 *     this locale and Latin on English without either file knowing.
 */
export const bn: Translation<typeof en> = {
  app: {
    name: 'LBTS',
    fullName: 'লাইন বিজনেস ট্রান্সপোর্ট সার্ভিস',
    tagline: 'পরিবহন কার্যক্রম ব্যবস্থাপনা',
  },

  language: {
    label: 'ভাষা',
    switchTo: '{language}-এ পরিবর্তন করুন',
    current: 'বর্তমান ভাষা: {language}',
    english: 'ইংরেজি',
    bangla: 'বাংলা',
    changed: 'ভাষা {language}-এ পরিবর্তন করা হয়েছে',
  },

  common: {
    actions: {
      save: 'সংরক্ষণ করুন',
      saveChanges: 'পরিবর্তন সংরক্ষণ করুন',
      cancel: 'বাতিল',
      close: 'বন্ধ করুন',
      confirm: 'নিশ্চিত করুন',
      delete: 'মুছে ফেলুন',
      remove: 'সরিয়ে ফেলুন',
      edit: 'সম্পাদনা করুন',
      create: 'তৈরি করুন',
      add: 'যোগ করুন',
      update: 'হালনাগাদ করুন',
      submit: 'জমা দিন',
      search: 'খুঁজুন',
      filter: 'ফিল্টার',
      filters: 'ফিল্টার',
      moreFilters: 'আরও ফিল্টার',
      clear: 'সাফ করুন',
      undo: 'আগের অবস্থায় ফিরুন',
      clearAll: 'সব সাফ করুন',
      clearFilters: 'ফিল্টার সাফ করুন',
      apply: 'প্রয়োগ করুন',
      reset: 'রিসেট করুন',
      refresh: 'রিফ্রেশ করুন',
      retry: 'আবার চেষ্টা করুন',
      back: 'পেছনে',
      next: 'পরবর্তী',
      previous: 'পূর্ববর্তী',
      continue: 'চালিয়ে যান',
      done: 'সম্পন্ন',
      open: 'খুলুন',
      view: 'দেখুন',
      viewAll: 'সব দেখুন',
      download: 'ডাউনলোড করুন',
      print: 'প্রিন্ট করুন',
      export: 'এক্সপোর্ট করুন',
      upload: 'আপলোড করুন',
      attachFile: 'ফাইল সংযুক্ত করুন',
      scan: 'স্ক্যান করুন',
      replace: 'বদলে দিন',
      selectAll: 'সব নির্বাচন করুন',
      copy: 'কপি করুন',
      skip: 'এড়িয়ে যান',
      finish: 'শেষ করুন',
      showMore: 'আরও দেখুন',
      more: 'আরও',
      showLess: 'কম দেখুন',
      expand: 'প্রসারিত করুন',
      collapse: 'সংকুচিত করুন',
      goBack: 'ফিরে যান',
      goToDashboard: 'ড্যাশবোর্ডে যান',
      reload: 'পৃষ্ঠাটি আবার লোড করুন',
      dismiss: 'সরিয়ে দিন',
      markAllRead: 'সবগুলো পঠিত হিসেবে চিহ্নিত করুন',
    },

    labels: {
      name: 'নাম',
      email: 'ইমেইল',
      phone: 'ফোন',
      date: 'তারিখ',
      dateRange: 'তারিখের পরিসর',
      from: 'থেকে',
      to: 'পর্যন্ত',
      status: 'অবস্থা',
      role: 'ভূমিকা',
      type: 'ধরন',
      amount: 'টাকার পরিমাণ',
      total: 'মোট',
      quantity: 'সংখ্যা',
      qty: 'সংখ্যা',
      rate: 'রেট',
      notes: 'নোট',
      note: 'নোট',
      reason: 'কারণ',
      description: 'বিবরণ',
      details: 'বিস্তারিত',
      summary: 'সারসংক্ষেপ',
      actions: 'কার্যক্রম',
      createdBy: 'তৈরি করেছেন',
      createdAt: 'তৈরির সময়',
      updatedBy: 'হালনাগাদ করেছেন',
      updatedAt: 'হালনাগাদের সময়',
      completedAt: 'সম্পন্ন',
      customer: 'গ্রাহক',
      address: 'ঠিকানা',
      district: 'জেলা',
      thana: 'থানা',
      location: 'লোকেশন',
      vendor: 'ভেন্ডর',
      vehicle: 'গাড়ি',
      driver: 'চালক',
      product: 'পণ্য',
      model: 'মডেল',
      unit: 'ইউনিট',
      csd: 'CSD',
      month: 'মাস',
      year: 'বছর',
      all: 'সব',
      none: 'কোনোটিই নয়',
      other: 'অন্যান্য',
      optional: 'ঐচ্ছিক',
      optionalSuffix: '(ঐচ্ছিক)',
      required: 'আবশ্যক',
      requiredSr: '(আবশ্যক)',
      document: 'ডকুমেন্ট',
      file: 'ফাইল',
      photo: 'ছবি',
      monthYear: '{month} {year}',
    },

    states: {
      loading: 'লোড হচ্ছে…',
      saving: 'সংরক্ষণ হচ্ছে…',
      deleting: 'মুছে ফেলা হচ্ছে…',
      uploading: 'আপলোড হচ্ছে…',
      searching: 'খোঁজা হচ্ছে…',
      noResults: 'কোনো ফলাফল নেই',
      noData: 'দেখানোর মতো এখনও কিছু নেই',
      empty: 'এখানে এখনও কিছু নেই',
      notSet: 'নির্ধারণ করা হয়নি',
      notAvailable: 'পাওয়া যায়নি',
      never: 'কখনও নয়',
      unknown: 'অজানা',
      blanks: '(ফাঁকা)',
      yes: 'হ্যাঁ',
      no: 'না',
      enabled: 'চালু',
      disabled: 'বন্ধ',
      active: 'সক্রিয়',
      inactive: 'নিষ্ক্রিয়',
    },

    pagination: {
      showing: 'মোট {total}টির মধ্যে {from}–{to} দেখানো হচ্ছে',
      /** Bangla leads with the noun where English trails it — see the English tree. */
      showingNoun: 'মোট {total}টি {noun}-এর মধ্যে {from}–{to} দেখানো হচ্ছে',
      pagesAria: '{noun}-এর পৃষ্ঠা',
      page: '{pages}টি পৃষ্ঠার মধ্যে {page} নম্বর',
      rows: { one: '{count}টি সারি', other: '{count}টি সারি' },
      records: { zero: 'কোনো রেকর্ড নেই', one: '{count}টি রেকর্ড', other: '{count}টি রেকর্ড' },
      results: { zero: 'কোনো ফলাফল নেই', one: '{count}টি ফলাফল', other: '{count}টি ফলাফল' },
      selected: '{count}টি নির্বাচিত',
      counted: '{n}টি {noun}',
    },

    /**
     * A figure short enough for a chart axis, at the local scale. Shared,
     * because the Accounts trend chart and the vendor dashboard both draw one and
     * a second copy is how one of them comes to read "1.5L" beside Bangla digits.
     */
    compact: {
      thousand: '{value} হাজার',
      lakh: '{value} লক্ষ',
      crore: '{value} কোটি',
    },

    validation: {
      required: 'এই ঘরটি পূরণ করা আবশ্যক',
      invalidEmail: 'সঠিক ইমেইল ঠিকানা দিন',
      invalidPhone: 'সঠিক ফোন নম্বর দিন',
      invalidNumber: 'সঠিক সংখ্যা দিন',
      invalidDate: 'সঠিক তারিখ দিন',
      minLength: 'কমপক্ষে {min}টি অক্ষর হতে হবে',
      maxLength: 'সর্বোচ্চ {max}টি অক্ষর হতে পারে',
      minValue: 'কমপক্ষে {min} হতে হবে',
      maxValue: 'সর্বোচ্চ {max} হতে পারে',
      positiveNumber: 'ধনাত্মক সংখ্যা হতে হবে',
      wholeNumber: 'পূর্ণ সংখ্যা হতে হবে',
      passwordTooShort: 'পাসওয়ার্ড কমপক্ষে {min}টি অক্ষরের হতে হবে',
      passwordsDoNotMatch: 'পাসওয়ার্ড দুটি মিলছে না',
      selectOne: 'একটি বিকল্প বেছে নিন',
      fileTooLarge: 'ফাইলটি {max}-এর চেয়ে বড়',
      fileTypeNotAllowed: 'এই ধরনের ফাইল গ্রহণ করা হয় না',
    },

    confirm: {
      title: 'আপনি কি নিশ্চিত?',
      deleteTitle: 'এটি স্থায়ীভাবে মুছে ফেলবেন?',
      deleteBody: 'এটি আর ফেরানো যাবে না।',
      unsavedTitle: 'সংরক্ষণ না করেই চলে যাবেন?',
      unsavedBody: 'আপনার পরিবর্তনগুলো হারিয়ে যাবে।',
    },
  },

  time: {
    justNow: 'এইমাত্র',
    today: 'আজ',
    yesterday: 'গতকাল',
    tomorrow: 'আগামীকাল',
    todayAt: 'আজ, {time}',
    yesterdayAt: 'গতকাল, {time}',
    thisMonth: 'চলতি মাস',
    lastMonth: 'গত মাস',
    thisYear: 'চলতি বছর',
    anyDate: 'যেকোনো তারিখ',
    never: 'কখনও নয়',
    daysAgo: { one: '{count} দিন আগে', other: '{count} দিন আগে' },
    inDays: { one: '{count} দিনে', other: '{count} দিনে' },
    expiresIn: { one: '{count} দিনে মেয়াদ শেষ', other: '{count} দিনে মেয়াদ শেষ' },
    expiredAgo: {
      one: '{count} দিন আগে মেয়াদ শেষ হয়েছে',
      other: '{count} দিন আগে মেয়াদ শেষ হয়েছে',
    },
  },

  nav: {
    ariaLabel: 'প্রধান',
    sections: {
      Main: 'প্রধান',
      System: 'সিস্টেম',
      Account: 'অ্যাকাউন্ট',
      Accounts: 'হিসাব',
    },
    items: {
      dashboard: 'ড্যাশবোর্ড',
      gatePass: 'গেট পাস',
      challan: 'চালান',
      delivery: 'ডেলিভারি',
      tripDo: 'ট্রিপ DO',
      excelBill: 'এক্সেল বিল',
      labourBill: 'লেবার বিল',
      accounts: 'হিসাব',
      vendors: 'ভেন্ডর',
      myVendor: 'আমার ভেন্ডর',
      administration: 'প্রশাসন',
      activityLogs: 'কার্যক্রমের লগ',
      locations: 'লোকেশন',
      productRates: 'পণ্যের রেট',
    },
  },

  pages: {
    profile: 'প্রোফাইল',
    notifications: 'বিজ্ঞপ্তি',
    newGatePass: 'নতুন গেট পাস',
    challanEntry: 'চালান এন্ট্রি',
    sourcePdfs: 'সোর্স PDF',
    newDelivery: 'নতুন ডেলিভারি',
    myVendor: 'আমার ভেন্ডর',
    cash: 'নগদ',
    cashBook: 'ক্যাশ বুক',
    vendorTripBills: 'ভেন্ডর ট্রিপ বিল',
    advances: 'অগ্রিম',
    expenses: 'খরচ',
    waltonFinalBill: 'ওয়ালটন চূড়ান্ত বিল',
    waltonLabourBill: 'ওয়ালটন লেবার বিল',
    profitLoss: 'লাভ ও ক্ষতি',
    wallets: 'ওয়ালেট',
    notFound: 'খুঁজে পাওয়া যায়নি',
  },

  shell: {
    openNavigation: 'নেভিগেশন মেনু খুলুন',
    expandSidebar: 'সাইডবার প্রসারিত করুন',
    collapseSidebar: 'সাইডবার সংকুচিত করুন',
    navigationTitle: 'নেভিগেশন',
    loadingPage: 'পৃষ্ঠা লোড হচ্ছে',
    loadingApp: 'LBTS লোড হচ্ছে…',
    checkingSession: 'আপনার সেশন যাচাই করা হচ্ছে',
    sameAsLastWith: 'আগেরটির মতোই:',
    navigationDescription: 'অ্যাপ্লিকেশনের প্রতিটি মডিউলের লিংক।',
    openAccountMenu: 'অ্যাকাউন্ট মেনু খুলুন',
    switchToLight: 'লাইট থিমে যান',
    switchToDark: 'ডার্ক থিমে যান',
    signOut: 'সাইন আউট',
    signedOut: 'সাইন আউট করা হয়েছে',
    notSignedIn: 'সাইন ইন করা নেই',
    notAuthenticated: 'পরিচয় যাচাই করা হয়নি',
    member: 'সদস্য',
    account: 'অ্যাকাউন্ট',
    profile: 'প্রোফাইল',
  },

  roles: {
    Admin: { label: 'অ্যাডমিন', description: 'সম্পূর্ণ সিস্টেম প্রশাসন' },
    Manager: { label: 'ম্যানেজার', description: 'দৈনন্দিন কার্যক্রম ব্যবস্থাপনা' },
    CEO: { label: 'সিইও', description: 'নির্বাহী তদারকি' },
    /** A code the business says in English, so the label is left exactly as it is. */
    OpEx: { label: 'OpEx', description: 'অপারেশন এক্সিকিউটিভ' },
    Vendor: { label: 'ভেন্ডর', description: 'বাইরের সরবরাহকারী বা অংশীদার' },
    unknown: { label: 'অজানা', description: 'অপরিচিত ভূমিকা' },
  },

  accountStatuses: {
    Pending: { label: 'অপেক্ষমাণ', description: 'প্রশাসকের সিদ্ধান্তের অপেক্ষায়' },
    Active: { label: 'সক্রিয়', description: 'অনুমোদিত এবং সাইন ইন করতে সক্ষম' },
    Rejected: { label: 'প্রত্যাখ্যাত', description: 'প্রবেশাধিকারের অনুরোধ নাকচ করা হয়েছে' },
    Suspended: { label: 'স্থগিত', description: 'পুনরায় সক্রিয় না করা পর্যন্ত প্রবেশাধিকার প্রত্যাহার' },
    unknown: { label: 'অজানা', description: 'অপরিচিত অবস্থা' },
  },

  errors: {
    generic: 'কিছু একটা সমস্যা হয়েছে',
    genericBody:
      'পৃষ্ঠাটিতে একটি সমস্যা হয়েছে। আবার চেষ্টা করুন, এবং বারবার হতে থাকলে প্রশাসককে জানান।',
    network: 'সার্ভারে পৌঁছানো যায়নি',
    networkBody:
      'সংযোগ পরীক্ষা করে আবার চেষ্টা করুন। কিছুক্ষণ নিষ্ক্রিয় থাকার পর প্রথম অনুরোধটি এক মিনিট পর্যন্ত সময় নিতে পারে।',
    timeout: 'অনুরোধটি অনেক বেশি সময় নিয়েছে',
    notFoundTitle: 'পৃষ্ঠা খুঁজে পাওয়া যায়নি',
    notFoundBody: 'এই ঠিকানার সঙ্গে অ্যাপ্লিকেশনের কিছুই মেলেনি।',

    notFoundPageTitle: 'এই পৃষ্ঠাটি নেই',
    notFoundPageBody:
      'আপনি যে পৃষ্ঠাটি খুঁজছেন সেটি সরানো হয়ে থাকতে পারে, বা ঠিকানাটি ভুল লেখা হয়ে থাকতে পারে।',
    forbiddenTitle: 'এই পৃষ্ঠায় আপনার প্রবেশাধিকার নেই',
    forbiddenBody:
      'আপনার ভূমিকায় এই মডিউলটি নেই। ভুল মনে হলে প্রশাসকের সঙ্গে যোগাযোগ করুন।',
    unauthorized: 'অনুগ্রহ করে আবার সাইন ইন করুন',
    serverError: 'সার্ভারে একটি সমস্যা হয়েছে',
    loadFailed: 'এটি লোড করা যায়নি',
    saveFailed: 'সংরক্ষণ করা যায়নি',
    deleteFailed: 'মুছে ফেলা যায়নি',
    uploadFailed: 'ফাইলটি আপলোড করা যায়নি',
    downloadFailed: 'ফাইলটি ডাউনলোড করা যায়নি',
    boundaryTitle: 'এই পৃষ্ঠাটি কাজ করা বন্ধ করে দিয়েছে',
    boundaryBody:
      'অ্যাপ্লিকেশনের বাকি অংশ ঠিক আছে — ফিরে যান, অথবা আবার চেষ্টা করতে পৃষ্ঠাটি রিলোড করুন।',
    detailsHeading: 'ত্রুটির বিবরণ (শুধু ডেভেলপমেন্টে)',

    /** What axios says about a failure the API never got to answer. */
    slowServer: 'সার্ভার সাড়া দিতে অনেক সময় নিচ্ছে। হয়তো এটি জেগে উঠছে — আবার চেষ্টা করুন।',
    unreachable: 'সার্ভারে পৌঁছানো যায়নি। আপনার সংযোগ দেখে আবার চেষ্টা করুন।',
    /** The four the loopback scanner helper can produce. */
    scannerUnreachable: 'স্ক্যানার হেলপার এই কম্পিউটারে চলছে না।',
    scannerUnauthorized: 'এই কম্পিউটার স্ক্যানার হেলপারের সাথে জোড়া নেই।',
    scannerFailed: 'স্ক্যানার হেলপার সেই অনুরোধটি সম্পন্ন করতে পারেনি।',
    scannerBusy: 'স্ক্যানার আগের একটি কাজ নিয়েই ব্যস্ত।',
  },

  accountInactive: {
    Pending: {
      title: 'আপনার অ্যাকাউন্ট অনুমোদনের অপেক্ষায়',
      body: 'LBTS ব্যবহারের আগে একজন প্রশাসককে এই অ্যাকাউন্টটি অনুমোদন করতে হবে। অনুমোদন হওয়ামাত্রই আপনি সাইন ইন করতে পারবেন।',
    },
    Rejected: {
      title: 'আপনার অ্যাকাউন্টের অনুরোধ নাকচ হয়েছে',
      body: 'একজন প্রশাসক এই অ্যাকাউন্টের প্রবেশাধিকার নাকচ করেছেন। ভুল হয়েছে মনে হলে তাঁর সঙ্গে যোগাযোগ করুন।',
    },
    Suspended: {
      title: 'আপনার অ্যাকাউন্টটি স্থগিত করা হয়েছে',
      body: 'এই অ্যাকাউন্টের প্রবেশাধিকার প্রত্যাহার করা হয়েছে। একজন প্রশাসক এটি পুনরায় সক্রিয় করতে পারেন।',
    },
    Active: {
      title: 'আপনার অ্যাকাউন্টটি সক্রিয়',
      body: 'এই অ্যাকাউন্টটি ঠিকঠাক আছে।',
    },
  },

  auth: {
    brandHeadline: 'আপনার ব্যবসাকে এগিয়ে নিন।',
    brandBody: 'একটিই যুক্ত প্ল্যাটফর্ম থেকে আপনার লাইন-হল ও ব্যবসায়িক পরিবহন পরিচালনা করুন।',
    signIn: {
      googleButton: 'Google দিয়ে সাইন ইন করুন',
      divider: 'অথবা ইমেইল দিয়ে চালিয়ে যান',
      emailLabel: 'ইমেইল',
      emailPlaceholder: 'you@company.com',
      passwordLabel: 'পাসওয়ার্ড',
      passwordPlaceholder: 'আপনার পাসওয়ার্ড দিন',
      forgotPassword: 'পাসওয়ার্ড ভুলে গেছেন?',
      submit: 'সাইন ইন করুন',
      submitting: 'সাইন ইন হচ্ছে…',
      welcomeBack: 'আবার স্বাগতম!',
    },
    signUp: {
      googleButton: 'Google দিয়ে সাইন আপ করুন',
      divider: 'অথবা ইমেইল দিয়ে সাইন আপ করুন',
      nameLabel: 'পুরো নাম',
      namePlaceholder: 'আপনার পুরো নাম',
      emailLabel: 'অফিসিয়াল ইমেইল',
      passwordLabel: 'পাসওয়ার্ড',
      passwordPlaceholder: 'কমপক্ষে ৮টি অক্ষর',
      confirmLabel: 'পাসওয়ার্ড নিশ্চিত করুন',
      confirmPlaceholder: 'পাসওয়ার্ডটি আবার দিন',
      termsBefore: 'আমি সম্মত',
      termsOfService: 'সেবার শর্তাবলি',
      termsAnd: 'এবং',
      privacyPolicy: 'গোপনীয়তা নীতি',
      submit: 'অ্যাকাউন্ট তৈরি করুন',
      submitting: 'অ্যাকাউন্ট তৈরি হচ্ছে…',
      roleNoticeRole: 'User',
      /**
       * One sentence with the role drawn inside it, rather than a head, a span
       * and a tail: Bangla puts "role" before the name it qualifies, so three
       * fragments in that order could only ever read correctly in English.
       */
      roleNotice: 'নতুন অ্যাকাউন্ট {role} ভূমিকা নিয়ে তৈরি হয়। পরে একজন অ্যাডমিন এটি বদলে দিতে পারেন।',
      created: 'অ্যাকাউন্ট তৈরি হয়েছে। LBTS-এ স্বাগতম!',
      ready: 'অ্যাকাউন্ট প্রস্তুত। LBTS-এ স্বাগতম!',
    },
    forgotPassword: {
      emailLabel: 'ইমেইল',
      submit: 'রিসেট লিংক পাঠান',
      submitting: 'পাঠানো হচ্ছে…',
      sentTitle: 'আপনার ইনবক্স দেখুন',
      sentBody:
        '{email}-এর জন্য কোনো অ্যাকাউন্ট থাকলে রিসেট লিংক পাঠানো হয়েছে। স্প্যাম ফোল্ডারটিও দেখে নিন।',
      useDifferent: 'অন্য ইমেইল ব্যবহার করুন',
    },
    password: {
      show: 'পাসওয়ার্ড দেখান',
      hide: 'পাসওয়ার্ড লুকান',
      strength: 'পাসওয়ার্ডের শক্তি: {level}',
      tooShort: 'খুব ছোট',
      weak: 'দুর্বল',
      fair: 'মোটামুটি',
      good: 'ভালো',
      strong: 'শক্তিশালী',
    },
    brand: {
      connected: {
        title: 'সংযুক্ত কার্যক্রম',
        copy: 'প্রতিটি চলাচল, একটিই রেকর্ডের ব্যবস্থা।',
      },
      routes: {
        title: 'রুট ও সময়সূচির স্বচ্ছতা',
        copy: 'পুরো লাইন-হল এক নজরে দেখুন।',
      },
      access: {
        title: 'ভূমিকাভিত্তিক দলগত প্রবেশাধিকার',
        copy: 'যে যতটুকু দেখার কথা, ঠিক ততটুকুই দেখেন।',
      },
    },
    firebase: {
      invalidCredential: 'ইমেইল বা পাসওয়ার্ড ভুল।',
      invalidEmail: 'সঠিক ইমেইল ঠিকানা দিন।',
      userDisabled: 'এই অ্যাকাউন্টটি নিষ্ক্রিয় করা হয়েছে।',
      emailAlreadyInUse: 'এই ইমেইল দিয়ে একটি অ্যাকাউন্ট আগে থেকেই আছে।',
      weakPassword: 'পাসওয়ার্ডটি খুব দুর্বল। কমপক্ষে ৮টি অক্ষর ব্যবহার করুন।',
      tooManyRequests: 'অনেকবার চেষ্টা করা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।',
      requiresRecentLogin: 'নিরাপত্তার জন্য, এটি পরিবর্তনের আগে আবার সাইন ইন করুন।',
      networkRequestFailed: 'নেটওয়ার্কে সমস্যা। সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।',
      popupClosed: 'সাইন-ইন উইন্ডোটি শেষ হওয়ার আগেই বন্ধ হয়ে গেছে।',
      popupCancelled: 'সাইন ইন বাতিল করা হয়েছে।',
      popupBlocked: 'আপনার ব্রাউজার সাইন-ইন উইন্ডোটি আটকে দিয়েছে। পপ-আপ চালু করে আবার চেষ্টা করুন।',
      operationNotAllowed: 'এই সাইন-ইন পদ্ধতিটি Firebase-এ চালু করা নেই।',
      differentCredential: 'এই ইমেইলটি অন্য একটি সাইন-ইন পদ্ধতিতে নিবন্ধিত আছে।',
      generic: 'কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন।',
    },
    validation: {
      emailInvalid: 'সঠিক ইমেইল ঠিকানা দিন',
      passwordRequired: 'পাসওয়ার্ড দেওয়া আবশ্যক',
      nameTooShort: 'নাম কমপক্ষে ২টি অক্ষরের হতে হবে',
      nameTooLong: 'নামটি খুব বড়',
      passwordTooShort: 'পাসওয়ার্ড কমপক্ষে ৮টি অক্ষরের হতে হবে',
      needsLowercase: 'কমপক্ষে একটি ছোট হাতের অক্ষর রাখুন',
      needsUppercase: 'কমপক্ষে একটি বড় হাতের অক্ষর রাখুন',
      needsNumber: 'কমপক্ষে একটি সংখ্যা রাখুন',
      confirmRequired: 'পাসওয়ার্ডটি নিশ্চিত করুন',
      passwordsDoNotMatch: 'পাসওয়ার্ড দুটি মিলছে না',
      acceptTerms: 'চালিয়ে যেতে শর্তাবলিতে সম্মতি দিন',
    },
    pages: {
      signInTitle: 'আবার স্বাগতম',
      signInSubtitle: 'চালিয়ে যেতে আপনার LBTS অ্যাকাউন্টে সাইন ইন করুন।',
      noAccount: 'অ্যাকাউন্ট নেই?',
      createOne: 'একটি তৈরি করুন',
      signUpTitle: 'আপনার অ্যাকাউন্ট তৈরি করুন',
      signUpSubtitle: 'এক মিনিটেরও কম সময়ে LBTS শুরু করুন।',
      haveAccount: 'আগে থেকেই অ্যাকাউন্ট আছে?',
      signIn: 'সাইন ইন করুন',
      forgotTitle: 'পাসওয়ার্ড রিসেট করুন',
      forgotSubtitle: 'আপনার ইমেইল দিন, নতুন পাসওয়ার্ড দেওয়ার একটি লিংক আমরা পাঠিয়ে দেব।',
      backToSignIn: 'সাইন ইনে ফিরে যান',
    },
    signOutSuccess: 'সাইন আউট করা হয়েছে',
  },

  /**
   * Bangla nouns do not inflect for number, so both forms are the same word.
   * That is the correct translation rather than an unfinished one — the pair
   * exists for English's agreement, and collapsing it here would mean the
   * plural shape could not be shared.
   */
  nouns: {
    record: { one: 'রেকর্ড', other: 'রেকর্ড' },
    gatePass: { one: 'গেট পাস', other: 'গেট পাস' },
    challan: { one: 'চালান', other: 'চালান' },
    sourcePdf: { one: 'সোর্স PDF', other: 'সোর্স PDF' },
    trip: { one: 'ট্রিপ', other: 'ট্রিপ' },
    vendor: { one: 'ভেন্ডর', other: 'ভেন্ডর' },
    vehicle: { one: 'গাড়ি', other: 'গাড়ি' },
    driver: { one: 'চালক', other: 'চালক' },
    assignment: { one: 'অ্যাসাইনমেন্ট', other: 'অ্যাসাইনমেন্ট' },
    document: { one: 'ডকুমেন্ট', other: 'ডকুমেন্ট' },
    location: { one: 'লোকেশন', other: 'লোকেশন' },
    district: { one: 'জেলা', other: 'জেলা' },
    rate: { one: 'রেট', other: 'রেট' },
    row: { one: 'সারি', other: 'সারি' },
    unit: { one: 'ইউনিট', other: 'ইউনিট' },
    cashWallet: { one: 'ক্যাশ ওয়ালেট', other: 'ক্যাশ ওয়ালেট' },
    page: { one: 'পৃষ্ঠা', other: 'পৃষ্ঠা' },
    sheet: { one: 'শিট', other: 'শিট' },
    part: { one: 'ভাগ', other: 'ভাগ' },
    piece: { one: 'পিস', other: 'পিস' },
    pc: { one: 'পিস', other: 'পিস' },
    line: { one: 'লাইন', other: 'লাইন' },
    field: { one: 'ঘর', other: 'ঘর' },
    signedCopy: { one: 'স্বাক্ষরিত কপি', other: 'স্বাক্ষরিত কপি' },
    notification: { one: 'বিজ্ঞপ্তি', other: 'বিজ্ঞপ্তি' },
    event: { one: 'ঘটনা', other: 'ঘটনা' },
    bill: { one: 'বিল', other: 'বিল' },
    labourBill: { one: 'লেবার বিল', other: 'লেবার বিল' },
    finalBill: { one: 'চূড়ান্ত বিল', other: 'চূড়ান্ত বিল' },
    month: { one: 'মাস', other: 'মাস' },
    entry: { one: 'এন্ট্রি', other: 'এন্ট্রি' },
    expense: { one: 'খরচ', other: 'খরচ' },
    advance: { one: 'অগ্রিম', other: 'অগ্রিম' },
    payment: { one: 'পেমেন্ট', other: 'পেমেন্ট' },
    user: { one: 'ব্যবহারকারী', other: 'ব্যবহারকারী' },
    account: { one: 'অ্যাকাউন্ট', other: 'অ্যাকাউন্ট' },
  },

  shared: {
    accessDenied: {
      title: '{area}-এ আপনার প্রবেশাধিকার নেই',
      restricted: '{area} শুধু প্রশাসকদের জন্য সংরক্ষিত।',
      askAdmin: 'প্রবেশাধিকার পাওয়ার কথা মনে করলে একজন অ্যাডমিনকে জানান।',
      signedInAs: 'সাইন ইন করা আছে',
      backToDashboard: 'ড্যাশবোর্ডে ফিরে যান',

      /**
       * One sentence per route boundary, naming the module and the accounts it
       * is open to. They are keys here rather than constants beside the routes,
       * because a module name and a role list are both words.
       */
      reasons: {
        gatePassRead:
          'গেট পাস পরিবহনের কাজের রেকর্ড রাখে, আর এটি অ্যাডমিন, ম্যানেজার, সিইও ও অপারেশন এক্সিকিউটিভ অ্যাকাউন্টের জন্য খোলা।',
        gatePassWrite:
          'গেট পাস তৈরি করেন অ্যাডমিন, ম্যানেজার, সিইও ও অপারেশন এক্সিকিউটিভ অ্যাকাউন্টধারীরা।',
        challanRead:
          'চালান কর্পোরেট অফিসের ডেলিভারির রেকর্ড রাখে, আর এটি অ্যাডমিন, ম্যানেজার, সিইও ও অপারেশন এক্সিকিউটিভ অ্যাকাউন্টের জন্য খোলা।',
        challanWrite:
          'চালান তৈরি করেন অ্যাডমিন, ম্যানেজার, সিইও ও অপারেশন এক্সিকিউটিভ অ্যাকাউন্টধারীরা।',
        deliveryRead:
          'ডেলিভারি রেকর্ড রাখে কোন চালান কোন গাড়িতে গেছে, আর এটি অ্যাডমিন, ম্যানেজার, সিইও ও অপারেশন এক্সিকিউটিভ অ্যাকাউন্টের জন্য খোলা।',
        deliveryWrite:
          'ট্রিপ তৈরি ও সংশোধন করেন অ্যাডমিন, ম্যানেজার, সিইও ও অপারেশন এক্সিকিউটিভ অ্যাকাউন্টধারীরা।',
        tripDo:
          'ট্রিপ ডিও শিট চালানের পণ্যের সারিকে গেট পাসের সাথে মেলায়, আর এটি অ্যাডমিন, ম্যানেজার, সিইও ও অপারেশন এক্সিকিউটিভ অ্যাকাউন্টের জন্য খোলা। কেবল একজন অ্যাডমিন এটি বদলাতে পারেন।',
        accounts:
          'অ্যাকাউন্টসে অফিসের ব্যালেন্স, পেমেন্ট ও লাভ-ক্ষতি থাকে, আর এটি অ্যাডমিন, ম্যানেজার ও সিইও অ্যাকাউন্টের জন্য খোলা।',
        bill:
          'বিল একটি ইউনিটকে তার ট্রিপ ডিও-র জন্য চার্জ করে, আর এটি অ্যাডমিন, ম্যানেজার, সিইও ও অপারেশন এক্সিকিউটিভ অ্যাকাউন্টের জন্য খোলা। কেবল একজন অ্যাডমিন বিল তৈরি করেন।',
        labourBill:
          'ওয়ালটন লেবার বিল প্রতিটি ডেলিভারির হ্যান্ডলিং চার্জ করে, আর এটি অ্যাডমিন, ম্যানেজার, সিইও ও অপারেশন এক্সিকিউটিভ অ্যাকাউন্টের জন্য খোলা।',
        location:
          'লোকেশনের মূল তালিকা এমন তথ্য যার বিপরীতে পুরো কাজ শ্রেণিবদ্ধ হয়, আর কেবল একজন অ্যাডমিন অ্যাকাউন্ট এটি খুলতে পারেন।',
        productRate:
          'প্রোডাক্ট রেট কার্ড ঠিক করে প্রতিটি ডেলিভারিতে কত চার্জ হবে, আর কেবল একজন অ্যাডমিন অ্যাকাউন্ট এটি খুলতে পারেন।',
        vendor:
          'ভেন্ডর, তাদের গাড়ি, তাদের চালক এবং তাদের কাগজপত্র। স্টাফ অ্যাকাউন্ট সব ভেন্ডর দেখে; একটি ভেন্ডর অ্যাকাউন্ট কেবল নিজেরটি দেখে।',
        activity:
          'অ্যাক্টিভিটি লগ প্রতিটি মডিউলে কে কী করেছে তার রেকর্ড রাখে, আর এটি অ্যাডমিন, ম্যানেজার ও সিইও অ্যাকাউন্টের জন্য খোলা।',
      },
    },
    comingSoon: {
      badge: 'শীঘ্রই আসছে',
      title: '{module} এখনও পাওয়া যাচ্ছে না',
      description:
        'এই মডিউলটির জন্য নেভিগেশনে জায়গা রাখা হয়েছে, কিন্তু এর কোনো পর্দা এখনও তৈরি হয়নি।',
      footnote: 'এই মডিউলটি তৈরির কাজ চলছে',
    },

    errorFallback: {
      routeTitle: 'এই পৃষ্ঠায় একটি সমস্যা হয়েছে',
      routeBody: 'কিছুই হারায়নি। আবার চেষ্টা করুন, অথবা সাইডবার দিয়ে অন্য কোথাও যান।',
      appTitle: 'LBTS চালু করা যায়নি',
      appBody: 'অ্যাপ্লিকেশনটি লোড করার সময় কিছু একটা সমস্যা হয়েছে। সাধারণত রিলোড করলেই ঠিক হয়ে যায়।',
      reload: 'LBTS আবার লোড করুন',
    },

    zoom: {
      group: 'জুম',
      out: 'জুম কমান',
      in: 'জুম বাড়ান',
      fit: 'পুরো পৃষ্ঠাটি পর্দায় আঁটান',

      pdfFailed: 'পিডিএফটি খোলা যায়নি।',
      pageAria: 'পৃষ্ঠা {page}',
    },

    columnFilter: {
      selectAll: 'সব নির্বাচন করুন',
      loadingValues: 'মানগুলো লোড হচ্ছে…',
      noValues: 'অন্য ফিল্টারগুলোর অধীনে কোনো মান নেই।',
      truncated: 'প্রথম {count}টি মান দেখানো হয়েছে। আগে অন্য একটি কলাম সংকুচিত করুন।',
      apply: 'প্রয়োগ করুন',
      clearFilter: 'ফিল্টার সাফ করুন',

      filtered: '{label}: ফিল্টার করা',
      filterBy: '{label} ফিল্টার করুন',
    },

    documentScan: {
      flatbed: 'ফ্ল্যাটবেড কাচ',
      feeder: 'ডকুমেন্ট ফিডার',
      colour: 'রঙিন',
      greyscale: 'সাদা-কালো শেড',
      blackwhite: 'সাদা-কালো',
      sourceLabel: 'উৎস',
      colourLabel: 'রঙ',
      sheets: { one: '{n}টি পাতা', other: '{n}টি পাতা' },
      scanNow: 'এখনই স্ক্যান করুন',
      stop: 'থামান',
      hide: 'লুকান',

    },

    /** What a one-file attachment may be, wherever one is offered. */
    documentFile: {
      wrongType: 'ফাইলটি পিডিএফ, জেপিজি, পিএনজি বা ওয়েবপি নয়।',
      pdfTooLarge: 'পিডিএফটি {size}-এর চেয়ে বড়।',
      imageTooLarge:
        'ছবিটি {size}-এর চেয়ে বড়। এটি পিডিএফ হিসেবে, বা কম রেজোলিউশনে স্ক্যান করুন।',
      /** The formats line each one-file field prints under its buttons. */
      voucherHint:
        'পিডিএফ, জেপিজি, পিএনজি বা ওয়েবপি। কয়েক পাতার একটি বিল একটি পিডিএফ হিসেবেই রাখা হয়, আর এন্ট্রি এটি ছাড়াও সংরক্ষণ করা যায়।',
      copyHint: 'পিডিএফ, জেপিজি, পিএনজি বা ওয়েবপি। দুটি শিট একটি পিডিএফ হিসেবে রাখা হয়।',

    },

    carryOver: {
      /** The title behind a "Same as last" tick: what the last record held. */
      onTheLast: 'আগেরটিতে {label}: {value}',
    },
  },

  scanner: {
    pairing: {
      title: 'স্ক্যানার যুক্ত করুন',
      description:
        'এই কম্পিউটারে LBTS স্ক্যানার এজেন্ট চালু করুন। প্রথমবার চালু হলে এটি একটি পেয়ারিং কোড দেখায়; সেটি এখানে বসান।',
      codeLabel: 'পেয়ারিং কোড',
      codePlaceholder: 'হেল্পার উইন্ডো থেকে কোডটি এখানে বসান',
      codeNote: 'শুধু এই ব্রাউজারেই রাখা হয়। এটি LBTS সার্ভারে পাঠানো হয় না।',
      addressLabel: 'হেল্পারের ঠিকানা',
      addressNote: 'হেল্পারটি অন্য পোর্টে চালু করা হলে তবেই এটি বদলান।',
      connect: 'যুক্ত করুন',
    },
    retry: {
      checkScanner: 'স্ক্যানার দেখুন',
      checkAgain: 'আবার দেখুন',
      connectScanner: 'স্ক্যানার যুক্ত করুন',
      tryAgain: 'আবার চেষ্টা করুন',
    },
    states: {
      idle: {
        title: 'স্ক্যানার দেখা হয়নি',
        description: 'এই কম্পিউটারে কোনো স্ক্যানার আছে কি না দেখে নিন।',
      },
      checking: {
        title: 'স্ক্যানার খোঁজা হচ্ছে',
        description: 'এই কম্পিউটারে LBTS স্ক্যানার হেল্পার খোঁজা হচ্ছে।',
      },
      'agent-missing': {
        title: 'স্ক্যানার হেল্পার চালু নেই',
        description:
          'স্ক্যান করতে হলে এই কম্পিউটারে LBTS স্ক্যানার এজেন্ট চালু থাকতে হবে। এটি চালু করে আবার দেখুন। আপনি এখনও ফাইল থেকে স্ক্যান সংযুক্ত করতে পারেন।',
      },
      unpaired: {
        title: 'স্ক্যানার যুক্ত নয়',
        description:
          'স্ক্যানার হেল্পার চালু আছে, কিন্তু এই ব্রাউজারটি এখনও এর সঙ্গে যুক্ত হয়নি। হেল্পার যে পেয়ারিং কোডটি দেখিয়েছে তা দিয়ে যুক্ত করুন।',
      },
      unsupported: {
        title: 'এখানে স্ক্যান করা যাবে না',
        description:
          'স্ক্যানার হেল্পার সেই উইন্ডোজ কম্পিউটারে চলে যেটিতে স্ক্যানারটি লাগানো আছে। এর বদলে ফাইল থেকে একটি স্ক্যান সংযুক্ত করুন।',
      },
      ready: {
        title: 'স্ক্যানার প্রস্তুত',
        description: 'গেট পাসটি কাচের উপর বা ফিডারে রাখুন, তারপর স্ক্যান শুরু করুন।',
      },
      'no-device': {
        title: 'কোনো স্ক্যানার পাওয়া যায়নি',
        description:
          'হেল্পার চালু আছে কিন্তু কোনো স্ক্যানার পায়নি। স্ক্যানারটি চালু আছে এবং একই নেটওয়ার্কে আছে কি না দেখে আবার চেষ্টা করুন।',
      },
      scanning: {
        title: 'স্ক্যান হচ্ছে',
        description: 'পৃষ্ঠাটি তোলা হচ্ছে। ঢাকনা খুলবেন না বা কাগজ সরাবেন না।',
      },
      processing: {
        title: 'ডকুমেন্ট প্রস্তুত হচ্ছে',
        description: 'স্ক্যান করা পৃষ্ঠাগুলো জোড়া লাগানো হচ্ছে।',
      },
      completed: {
        title: 'স্ক্যান সম্পন্ন',
        description: 'জমা দেওয়ার আগে পুরো গেট পাসটি পড়া যাচ্ছে কি না দেখে নিন।',
      },
      busy: {
        title: 'স্ক্যানার ব্যস্ত',
        description: 'স্ক্যানারটি অন্য একটি কাজ করছে। শেষ হওয়া পর্যন্ত অপেক্ষা করে আবার চেষ্টা করুন।',
      },
      'no-paper': {
        title: 'কোনো কাগজ পাওয়া যায়নি',
        description: 'ডকুমেন্ট ফিডারটি খালি। গেট পাসটি রেখে আবার স্ক্যান শুরু করুন।',
      },
      'cover-open': {
        title: 'স্ক্যানারের ঢাকনা খোলা',
        description: 'স্ক্যানারের ঢাকনা বন্ধ করে আবার স্ক্যান শুরু করুন।',
      },
      'paper-jam': {
        title: 'কাগজ আটকে গেছে',
        description: 'স্ক্যানারে আটকে থাকা কাগজটি সরিয়ে আবার স্ক্যান শুরু করুন।',
      },
      'driver-error': {
        title: 'স্ক্যানার সাড়া দেয়নি',
        description:
          'স্ক্যানারের ড্রাইভার সাড়া দেওয়া বন্ধ করেছে। স্ক্যানারটি আবার চালু করলে সাধারণত ঠিক হয়ে যায়। আপনি ফাইল থেকেও একটি স্ক্যান সংযুক্ত করতে পারেন।',
      },
      'network-error': {
        title: 'স্ক্যানার হেল্পারের সঙ্গে যোগাযোগ বিচ্ছিন্ন',
        description: 'হেল্পারটি সাড়া দেওয়া বন্ধ করেছে। এটি এখনও এই কম্পিউটারে চালু আছে কি না দেখুন।',
      },
      failed: {
        title: 'স্ক্যানটি সম্পূর্ণ হয়নি',
        description: 'কিছুই তোলা হয়নি। আবার চেষ্টা করুন, অথবা ফাইল থেকে একটি স্ক্যান সংযুক্ত করুন।',
      },
    },
  },

  dashboard: {
    figuresFailed: 'এই সংখ্যাগুলো লোড করা যায়নি।',
    greeting: {
      lateNight: 'এখনও জেগে আছেন',
      morning: 'শুভ সকাল',
      afternoon: 'শুভ অপরাহ্ন',
      evening: 'শুভ সন্ধ্যা',
      withName: '{greeting}, {name}',
    },

    hero: {
      piecesOutToday: 'আজ বেরিয়েছে',
      gatePassesToday: 'আজকের গেট পাস',
      challansFiledToday: 'আজ দাখিল করা চালান',
      counting: 'কত বেরিয়েছে গোনা হচ্ছে।',
      nothingOutYet: 'আজ এখনও কিছু গেট পেরোয়নি।',
      carriedOn: {
        one: 'আজ এ পর্যন্ত একটি ট্রিপে গেছে।',
        other: 'আজ এ পর্যন্ত {n}টি ট্রিপে গেছে।',
      },
      filedToday: 'আজ দাখিল করা হয়েছে।',
      tripsOut: 'ট্রিপ বেরিয়েছে',
      noLorryYet: 'এখনও কোনো গাড়ি বের হয়নি',
      onTheRoadToday: 'আজ রাস্তায়',
      gatePasses: 'গেট পাস',
      datedToday: 'আজকের তারিখে',
      challansFiled: 'দাখিল করা চালান',
      outOfOfficePdfs: 'অফিসের PDF থেকে',
      fileGatePass: 'গেট পাস দাখিল করুন',
      openSourcePdf: 'একটি সোর্স PDF খুলুন',
      startTrip: 'ট্রিপ শুরু করুন',
    },

    modules: {
      heading: 'আপনার মডিউল',
      subtitle: 'প্রতিটিতে কী আছে, এবং ভেতরে যাওয়ার পথ।',
      otherModules: 'অন্যান্য মডিউল',
      onRecord: 'রেকর্ডে',
      gatePass: {
        description: 'স্ক্যান করা কাগজের সঙ্গে রেকর্ড করা ট্রিপ।',
        verified: 'যাচাই হয়েছে',
        awaitingCheck: 'যাচাইয়ের অপেক্ষায়',
        drafts: 'খসড়া',
      },
      challan: {
        description: 'অফিসের PDF থেকে দাখিল করা ডেলিভারি।',
        pieces: 'পিস',
        charged: 'চার্জ করা',
        sourcePdfsOpen: 'অসমাপ্ত সোর্স PDF',
      },
      delivery: {
        description: 'ট্রিপ, এবং সেগুলোতে যাওয়া চালান।',
        tripsRun: 'চালানো ট্রিপ',
        signedFor: 'স্বাক্ষরিত',
        awaitingCopies: 'কপির অপেক্ষায়',
        piecesToday: 'আজকের পিস',
      },
      vendor: {
        description: 'ট্রিপের পেছনের বহর, এবং তার কাগজপত্র।',
        activeVendors: 'সক্রিয় ভেন্ডর',
        vehicles: 'গাড়ি',
        drivers: 'চালক',
        papersLapsing: 'মেয়াদ ফুরাচ্ছে',
        papers: 'কাগজপত্র',
        inDate: 'মেয়াদ ঠিক আছে',
      },
    },

    money: {
      heading: 'টাকাপয়সা',
      subtitle: 'হাতে থাকা নগদ, দুই দিকের পাওনা, এবং মাসগুলো কেমন চলছে।',
      loadFailed: 'টাকার সারসংক্ষেপ লোড করা যায়নি।',
      cashBalance: 'নগদ ব্যালেন্স',
      cashWalletsOnly: 'শুধু নগদ ওয়ালেট।',
      acrossWallets: {
        one: 'একটি নগদ ওয়ালেট জুড়ে — ব্যাংক ও মোবাইল এর মধ্যে ধরা হয়নি।',
        other: '{n}টি নগদ ওয়ালেট জুড়ে — ব্যাংক ও মোবাইল এর মধ্যে ধরা হয়নি।',
      },
      in: 'আসা · {period}',
      out: 'যাওয়া · {period}',
      profit: 'লাভ · {period}',
      thisMonth: 'চলতি মাস',
      noIncomeYet: 'এই মাসে এখনও কোনো আয় ধরা হয়নি',
      margin: 'বিল করা অঙ্কের উপর {margin}% মার্জিন',
      owedToVendors: 'ভেন্ডরদের পাওনা',
      everyVendorSettled: 'প্রতিটি ভেন্ডরের মাস মিটে গেছে',
      acrossVendors: { one: 'একজন ভেন্ডর জুড়ে', other: '{n} জন ভেন্ডর জুড়ে' },
      toComeIn: 'ওয়ালটন থেকে আসবে',
      receivableNote: '{bills} · {csds}',
      finalBills: { one: '{n}টি চূড়ান্ত বিল', other: '{n}টি চূড়ান্ত বিল' },
      labourCsds: { one: '{n}টি লেবার CSD', other: '{n}টি লেবার CSD' },
      incomeAgainstCost: 'আয়ের বিপরীতে খরচ',
      incomeAgainstCostNote:
        'খরচ ধরা হয় ট্রিপের মাস অনুযায়ী, ভেন্ডরকে কবে টাকা দেওয়া হয়েছে তা দিয়ে নয়। যে মাসের চূড়ান্ত বিল অডিট হয়নি, সেটি গোনা হয় না।',
    },

    noModules: {
      title: 'এই অ্যাকাউন্টের জন্য এখনও কোনো মডিউল খোলা নেই',
      description:
        'আপনার ভূমিকা এমন কোনো মডিউলে পৌঁছায় না যেটি হিসাব দেখায়। এই অ্যাকাউন্টটি কী কাজের জন্য, তা একজন প্রশাসক আপনাকে বলতে পারবেন।',
      footnote: 'কিছুই হারায়নি — এই ভূমিকার জন্য সারসংক্ষেপ করার মতো কিছুই নেই।',
    },

    attention: {
      heading: 'মনোযোগ প্রয়োজন',
      urgent: '{n}টি জরুরি',
      toWorkThrough: '{n}টি করতে হবে',
      showMore: 'আরও {n}টি দেখুন',
      rowAria: '{title}। {action}।',
      partialFailure: 'কিছু হিসাব লোড করা যায়নি, তাই এই তালিকাটি অসম্পূর্ণ হতে পারে।',
      nothingLoaded: 'কিছুই লোড করা যায়নি, তাই কী বাকি আছে তা বলার উপায় নেই।',
      settledTitle: 'কিছুই বাকি নেই',
      settledBody:
        'প্রতিটি গেট পাস যাচাই হয়েছে, প্রতিটি চালানের লোকেশন ও চার্জ বসেছে, প্রতিটি স্বাক্ষরিত কপি এসেছে এবং ফাইলে থাকা প্রতিটি ডকুমেন্টের মেয়াদ ঠিক আছে।',
      unaskedTitle: 'এখানে দেখানোর কিছু নেই',
      unaskedBody:
        'এই অ্যাকাউন্টটি এমন কোনো মডিউল পড়ে না যেটি বকেয়ার হিসাব দেয়। যে মডিউলগুলোতে এটি পৌঁছাতে পারে, সেগুলো নিচে দেওয়া আছে।',

      actions: {
        gatePass: 'গেট পাস খুলুন',
        challan: 'চালান খুলুন',
        sourcePdfs: 'সোর্স PDF খুলুন',
        delivery: 'ডেলিভারি খুলুন',
        vendors: 'ভেন্ডর খুলুন',
        administration: 'প্রশাসন খুলুন',
        vendorBills: 'ভেন্ডর বিল খুলুন',
        finalBills: 'চূড়ান্ত বিল খুলুন',
        advances: 'অগ্রিম খুলুন',
      },

      rows: {
        'gate-pass-rejected': {
          title: { one: '{n}টি গেট পাস ফেরত পাঠানো হয়েছে', other: '{n}টি গেট পাস ফেরত পাঠানো হয়েছে' },
          detail:
            'যাচাইকারী কিছু ভুল পেয়ে এগুলো ফেরত দিয়েছেন। প্রতিটি সংশোধন করে আবার পাঠাতে হবে — ততক্ষণ পর্যন্ত এতে এমন একটি মন্তব্য থাকে যার জবাব কেউ দেয়নি।',
        },
        'gate-pass-submitted': {
          title: { one: '{n}টি গেট পাস যাচাইয়ের অপেক্ষায়', other: '{n}টি গেট পাস যাচাইয়ের অপেক্ষায়' },
          detail:
            'স্ক্যানসহ দাখিল হয়েছে এবং তার সঙ্গে মিলিয়ে যাচাইয়ের অপেক্ষায় আছে। যাচাই মানে — এই তথ্যগুলো এই কাগজের সঙ্গে মেলে।',
        },
        'gate-pass-draft': {
          title: { one: '{n}টি গেট পাস এখনও খসড়া', other: '{n}টি গেট পাস এখনও খসড়া' },
          detail:
            'শুরু হয়েছে কিন্তু কখনও জমা দেওয়া হয়নি। খসড়া কোনো রিপোর্টে বা হিসাবে আসে না, তাই এটি এমন কাজ যা এখনও কোথাও পৌঁছায়নি।',
        },
        'challan-partial-amount': {
          title: { one: '{n}টি চালানে আংশিক চার্জ বসেছে', other: '{n}টি চালানে আংশিক চার্জ বসেছে' },
          detail:
            'কিছু লাইনে রেট আছে, কিছুতে নেই — তাই অঙ্কটি সম্পূর্ণ দেখালেও আসলে নয়। সাধারণত রেট কার্ডে এখনও নেই এমন কোনো পণ্যের কারণে হয়।',
        },
        'challan-blank-amount': {
          title: { one: '{n}টি চালানে কোনো অঙ্ক নেই', other: '{n}টি চালানে কোনো অঙ্ক নেই' },
          detail:
            'রেট কার্ডের কিছুই এই লাইনগুলোর সঙ্গে মেলেনি, অথবা চালানটির এখনও লোকেশন নেই বলে কার্ডের কোন কলাম দেখতে হবে তা জানা যায়নি।',
        },
        'challan-batches': {
          title: { one: '{n}টি সোর্স PDF অসমাপ্ত', other: '{n}টি সোর্স PDF অসমাপ্ত' },
          detail:
            'এই ফাইলগুলোর কিছু পৃষ্ঠা কোনো চালানের নয় এবং ফাঁকা হিসেবেও চিহ্নিত নয়। প্রতিটি পৃষ্ঠার হিসাব না মেলা পর্যন্ত ব্যাচটি ডাউনলোড বা প্রিন্ট করা যায় না।',
        },
        'challan-location-pending': {
          title: { one: '{n}টি চালানের লোকেশন নেই', other: '{n}টি চালানের লোকেশন নেই' },
          detail:
            'থানা, জেলা বা ঠিকানা — কোনোটি থেকেই নির্ধারণ করা যায়নি। ভুলের চেয়ে ফাঁকা ভালো — এগুলো হাতে বসাতে হয়, প্রতিটিতে দুটি ক্লিক।',
        },
        'challan-location-review': {
          title: { one: '{n}টি লোকেশন কেউ নিশ্চিত করেনি', other: '{n}টি লোকেশন কেউ নিশ্চিত করেনি' },
          detail:
            'কোনো বানান ঠিক করা হয়েছে, কাছাকাছি একটি সারি বেছে নেওয়া হয়েছে, বা একটি সংক্ষিপ্ত তালিকা থেকে বাছাই হয়েছে। দাখিল করা চালানে ভুল জেলা পরের কোনো ধাপেই ধরা পড়ে না।',
        },
        'challan-returned': {
          title: { one: '{n}টি চালান ডিপোতে ফেরত', other: '{n}টি চালান ডিপোতে ফেরত' },
          detail:
            'মাল গিয়েছিল, ট্রিপ থেকে ফেরত এসেছে এবং আবার যায়নি। এগুলো এখনও অপেক্ষমাণ দেখায়, কারণ এগুলো এখনও গাড়ির অপেক্ষায়।',
        },
        'delivery-open': {
          title: { one: '{n}টি ট্রিপ স্বাক্ষরিত কপির অপেক্ষায়', other: '{n}টি ট্রিপ স্বাক্ষরিত কপির অপেক্ষায়' },
          detail:
            'প্রত্যেক গ্রাহকের স্বাক্ষরিত চালান স্ক্যান করে ফেরত এলে, অথবা কপিটি হারিয়েছে বলে জানালে ট্রিপ শেষ হয়। একটি স্ক্যান মানে একটিই বারকোড পড়া।',
        },
        'vendor-expired': {
          title: { one: '{n}টি ভেন্ডর ডকুমেন্টের মেয়াদ শেষ', other: '{n}টি ভেন্ডর ডকুমেন্টের মেয়াদ শেষ' },
          detail:
            'যে গাড়ি বা চালকের কাগজের মেয়াদ শেষ, তার বের হওয়া উচিত নয়। নবায়ন করা সনদটি গাড়ি বা চালকের নামে জমা দিন।',
        },
        'vendor-expiring': {
          title: { one: '{n}টি ভেন্ডর ডকুমেন্টের মেয়াদ শেষ হচ্ছে', other: '{n}টি ভেন্ডর ডকুমেন্টের মেয়াদ শেষ হচ্ছে' },
          detail:
            'মেয়াদ শেষের ত্রিশ দিনের মধ্যে। মেয়াদ পেরোনোর আগেই নবায়ন করুন, নাহলে গাড়ি বা চালককে আর কাজে দেওয়া যাবে না।',
        },
        'users-pending': {
          title: { one: '{n}টি অ্যাকাউন্ট অনুমোদনের অপেক্ষায়', other: '{n}টি অ্যাকাউন্ট অনুমোদনের অপেক্ষায়' },
          detail:
            'নতুন অ্যাকাউন্ট সবচেয়ে কম ক্ষমতা নিয়ে তৈরি হয় এবং অনুমোদনের আগে কোনো প্রবেশাধিকারই থাকে না। যিনি সাইন আপ করেছেন, তিনি এখনও কিছুই করতে পারছেন না।',
        },
        'accounts-blank-bills': {
          title: { one: '{n}টি ট্রিপের পূর্ণ বিল নেই', other: '{n}টি ট্রিপের পূর্ণ বিল নেই' },
          detail:
            'ভাড়া বা মজুরি বসানো হয়নি, তাই ভেন্ডরের মাসটি প্রকৃত পাওনার চেয়ে কম দেখাচ্ছে। এভাবেই একটি মাস না মিটেও মিটে যাওয়ার মতো দেখায়।',
        },
        'accounts-vendor-due': {
          title: 'ভেন্ডরদের পাওনা {amount}',
          detail:
            'ট্রিপের ভাড়া ও মজুরি বাবদ বিল, তা থেকে অগ্রিম ও পরিশোধ বাদ। প্রতিটি মাস আলাদাভাবে মেটে — ভেন্ডর বিল পৃষ্ঠায় সেগুলো আলাদা করে দেখা যায়।',
        },
        'accounts-receivable': {
          title: 'ওয়ালটন থেকে আসবে {amount}',
          detail: 'চূড়ান্ত বিল ও লেবার বিলের CSD মিলিয়ে, তা থেকে এ পর্যন্ত যা পাওয়া গেছে তা বাদ।',
        },
        'accounts-pending-final': {
          title: { one: '{n}টি বিল অডিটের অপেক্ষায়', other: '{n}টি বিল অডিটের অপেক্ষায়' },
          detail:
            'ওয়ালটনে জমা দেওয়া হয়েছে, কিন্তু অনুমোদিত অঙ্কটি এখনও বসানো হয়নি। যে মাসে সেটি নেই, তা অপেক্ষমাণ হিসেবে দেখায় এবং আয় হিসেবে গোনা হয় না।',
        },
        'accounts-advances': {
          title: 'অগ্রিম বাবদ বাইরে {amount}',
          detail:
            'যে টাকা দেওয়া হয়েছে কিন্তু নগদে ফেরত আসেনি। অগ্রিম কেবল নগদ ফেরত এলেই মেটে, অন্য কিছুতে নয়।',
        },
      },
    },
  },

  profile: {
    loading: 'আপনার প্রোফাইল লোড হচ্ছে',
    changePasswordTitle: 'পাসওয়ার্ড বদলান',
    changePasswordHint:
      'আগে আপনার বর্তমান পাসওয়ার্ডটি নিশ্চিত করুন, তারপর নতুন একটি বেছে নিন। এই ডিভাইসে আপনি সাইন ইন করাই থাকবেন।',
    passwordsNotStored:
      'পাসওয়ার্ড রাখে অথেনটিকেশন প্রোভাইডার। LBTS সেগুলো কখনও সংরক্ষণ করে না, পায়ও না।',
    pageDescription: 'আপনার ব্যক্তিগত তথ্য, অ্যাকাউন্টের বিবরণ ও নিরাপত্তা পরিচালনা করুন।',
    loadFailed: 'আপনার প্রোফাইল লোড করা যায়নি',
    serverSilent: 'সার্ভার সাড়া দেয়নি। এটি হয়তো এখনও জেগে উঠছে।',
    coldStartNote: 'কিছুক্ষণ নিষ্ক্রিয় থাকার পর প্রথম অনুরোধটি এক মিনিট পর্যন্ত সময় নিতে পারে।',
    editProfile: 'প্রোফাইল সম্পাদনা করুন',
    memberSince: 'সদস্য {date} থেকে',

    personal: {
      title: 'ব্যক্তিগত তথ্য',
      description: 'যে তথ্য আপনি নিজেই রাখেন',
      footnote:
        'নাম ও ফোন নম্বর আপনি নিজেই বদলাতে পারেন। ইমেইলটি সাইন-ইন প্রোভাইডার পরিচালনা করে।',
      fullName: 'পুরো নাম',
      emailAddress: 'ইমেইল ঠিকানা',
      emailManagedBy: 'সাইন-ইন প্রোভাইডার পরিচালনা করে',
      verified: 'যাচাই হয়েছে',
      notVerifiedYet: 'এখনও যাচাই হয়নি',
      phoneNumber: 'ফোন নম্বর',
      phoneHint: 'একটি নম্বর দিন যাতে সহকর্মীরা আপনার সঙ্গে যোগাযোগ করতে পারেন।',
      profilePhoto: 'প্রোফাইল ছবি',
      photoHint: 'এই পৃষ্ঠার উপরের ছবির অংশ থেকে এটি বদলান।',
      photoUploaded: 'আপলোড করা হয়েছে',
      photoInitials: 'আপনার নামের আদ্যক্ষর ব্যবহার হচ্ছে — কোনো ছবি আপলোড করা নেই',
    },

    account: {
      title: 'অ্যাকাউন্টের তথ্য',
      description: 'সিস্টেম পরিচালনা করে',
      footnote:
        'আপনার ভূমিকা ও অ্যাকাউন্টের অবস্থা একজন প্রশাসক ঠিক করেন, এই পৃষ্ঠা থেকে সেগুলো বদলানো যায় না।',
      userId: 'ইউজার আইডি',
      userIdHint: 'প্রশাসকের সঙ্গে যোগাযোগের সময় এটি উল্লেখ করুন।',
      userIdLabel: 'ইউজার আইডি',
      assignedByAdmin: 'একজন প্রশাসক নির্ধারণ করেছেন',
      setByAdmin: 'একজন প্রশাসক ঠিক করেছেন',
      emailVerification: 'ইমেইল যাচাই',
      confirmedByProvider: 'সাইন-ইন প্রোভাইডার নিশ্চিত করেছে',
      verified: 'যাচাই হয়েছে',
      notVerified: 'যাচাই হয়নি',
      memberSince: 'সদস্য হয়েছেন',
      lastSignIn: 'সর্বশেষ সাইন ইন',
    },

    security: {
      title: 'নিরাপত্তা',
      description: 'আপনি কীভাবে LBTS-এ সাইন ইন করেন',
      footnoteWithProviders:
        'সাইন-ইন পদ্ধতি: {providers}। পাসওয়ার্ড রাখে অথেনটিকেশন প্রোভাইডার, LBTS কখনও নয়।',
      footnote: 'পাসওয়ার্ড রাখে অথেনটিকেশন প্রোভাইডার, LBTS কখনও নয়।',
      password: 'পাসওয়ার্ড',
      passwordHidden: 'আপনার পাসওয়ার্ড লুকানো আছে।',
      passwordConfirmNote: 'পরিবর্তনটি নিশ্চিত করতে আপনার বর্তমান পাসওয়ার্ড চাওয়া হবে।',
      credentialElsewhere:
        'আপনার লগইন তথ্য {providers}-এর কাছে আছে। সেখানে বদলালে এখানেও বদলে যাবে।',
      yourProvider: 'আপনার সাইন-ইন প্রোভাইডার',
      changePassword: 'পাসওয়ার্ড বদলান',
      managedExternally: 'বাইরে থেকে পরিচালিত',
      emailVerified: 'ইমেইল যাচাই হয়েছে',
      emailNotVerified: 'ইমেইল যাচাই হয়নি',
      emailConfirmed: '{email} নিশ্চিত করা হয়েছে। পাসওয়ার্ড রিসেট ও অ্যাকাউন্টের বার্তা আপনার কাছে পৌঁছাবে।',
      emailUnconfirmed:
        '{email} এখনও নিশ্চিত করা যায়নি। যাচাই করুন যাতে পাসওয়ার্ড রিসেট আপনার কাছে পৌঁছায়।',
      verified: 'যাচাই হয়েছে',
      resendIn: '{seconds} সেকেন্ড পর আবার পাঠান',
      sendVerification: 'যাচাইয়ের ইমেইল পাঠান',
    },

    infoRow: {
      editable: 'এটি আপনি বদলাতে পারেন',
      readOnly: 'শুধু পড়ার জন্য',
      notProvided: 'দেওয়া হয়নি',
    },

    copy: {
      copied: '{label} কপি হয়েছে',
      copy: '{label} কপি করুন',
    },

    edit: {
      title: 'প্রোফাইল সম্পাদনা করুন',
      description:
        'LBTS জুড়ে আপনি কেমন দেখাবেন তা হালনাগাদ করুন। আপনার ভূমিকা ও অ্যাকাউন্টের অবস্থায় এর কোনো প্রভাব পড়বে না।',
      namePlaceholder: 'আপনার পুরো নাম',
      phoneHint: 'ঐচ্ছিক। নম্বরটি মুছতে ঘরটি ফাঁকা রাখুন।',
      phonePlaceholder: '+880 1712 345678',
      lockedNoticeBefore:
        'সাইন-ইন প্রোভাইডার পরিচালনা করে, আর আপনার ভূমিকা একজন প্রশাসক ঠিক করেন। এখান থেকে কোনোটিই বদলানো যায় না।',
      saving: 'সংরক্ষণ হচ্ছে…',
      updated: 'প্রোফাইল হালনাগাদ হয়েছে',
      failed: 'আপনার পরিবর্তনগুলো সংরক্ষণ হয়নি। তথ্যগুলো দেখে আবার চেষ্টা করুন।',
    },

    photo: {
      change: 'ছবি বদলান',
      upload: 'ছবি আপলোড করুন',
      changeAria: 'প্রোফাইল ছবি বদলান',
      uploadAria: 'একটি প্রোফাইল ছবি আপলোড করুন',
      preview: 'প্রিভিউ।',
      previewNote: 'এখনও সংরক্ষণ করা হয়নি — {size}',
      savePhoto: 'ছবি সংরক্ষণ করুন',

      /** Shown beside the form after a save the API refused. */
      notSaved: 'আপনার পরিবর্তনগুলো সংরক্ষিত হয়নি। তথ্য দেখে আবার চেষ্টা করুন।',
      saving: 'সংরক্ষণ হচ্ছে…',
      remove: 'সরান',
      removeTitle: 'প্রোফাইল ছবি সরাবেন?',
      removeBody:
        'সংরক্ষিত ছবিটি স্থায়ীভাবে মুছে যাবে। আপনার অ্যাভাটার আবার নামের আদ্যক্ষরে ফিরে যাবে, এবং আপনি যেকোনো সময় নতুন ছবি আপলোড করতে পারবেন।',
      removing: 'সরানো হচ্ছে…',
      removeConfirm: 'ছবি সরান',
      updated: 'প্রোফাইল ছবি হালনাগাদ হয়েছে',
      removed: 'প্রোফাইল ছবি সরানো হয়েছে',
      rulesHint: 'JPG, PNG বা WEBP · সর্বোচ্চ ৫ MB',
      cannotUse: 'এই ছবিটি ব্যবহার করা যাবে না',
      badType: 'এই ধরনের ফাইল সমর্থিত নয়। একটি JPG, PNG বা WEBP ছবি বেছে নিন।',
      tooLarge: 'এই ছবিটি {size}। সীমা ৫ MB।',
      empty: 'ফাইলটি খালি। অন্য একটি ছবি বেছে নিন।',
    },

    changePassword: {
      currentLabel: 'বর্তমান পাসওয়ার্ড',
      currentPlaceholder: 'আপনার বর্তমান পাসওয়ার্ড',
      newLabel: 'নতুন পাসওয়ার্ড',
      newPlaceholder: 'কমপক্ষে ৮টি অক্ষর',
      confirmLabel: 'নতুন পাসওয়ার্ড নিশ্চিত করুন',
      confirmPlaceholder: 'নতুন পাসওয়ার্ডটি আবার দিন',
      updating: 'হালনাগাদ হচ্ছে…',
      submit: 'পাসওয়ার্ড হালনাগাদ করুন',
      changed: 'পাসওয়ার্ড বদলানো হয়েছে',
      changedNote: 'পরেরবার সাইন ইনের সময় নতুন পাসওয়ার্ডটি ব্যবহার করুন।',
      failed: 'আপনার পাসওয়ার্ড বদলানো যায়নি।',
      sessionExpired: 'আপনার সেশনের মেয়াদ শেষ হয়েছে। পাসওয়ার্ড বদলাতে আবার সাইন ইন করুন।',
      sessionExpiredShort: 'আপনার সেশনের মেয়াদ শেষ হয়েছে। আবার সাইন ইন করুন।',
      wrongCurrent: 'আপনার বর্তমান পাসওয়ার্ডটি ভুল।',
      missingCurrent: 'আপনার বর্তমান পাসওয়ার্ড দিন।',
    },

    verification: {
      sent: 'যাচাইয়ের ইমেইল পাঠানো হয়েছে',
      confirmed: 'আপনার ইমেইল যাচাই হয়েছে',
      confirmedNote: 'নিশ্চিত করার জন্য ধন্যবাদ — আপনার অ্যাকাউন্টের তথ্য হালনাগাদ আছে।',

      sentNote: '{email}-এ পাঠানো লিংকটি খুলুন।',
    },

    providers: {
      password: 'ইমেইল ও পাসওয়ার্ড',
      google: 'Google',
    },

    validation: {
      nameTooShort: 'নাম কমপক্ষে ২টি অক্ষরের হতে হবে',
      nameTooLong: 'নাম সর্বোচ্চ ৮০টি অক্ষরের হতে পারে',
      phoneTooLong: 'ফোন নম্বর সর্বোচ্চ ২৪টি অক্ষরের হতে পারে',
      phoneInvalid: 'সঠিক ফোন নম্বর দিন, যেমন +880 1712 345678',
      currentRequired: 'আপনার বর্তমান পাসওয়ার্ড দিন',
      confirmRequired: 'নতুন পাসওয়ার্ডটি নিশ্চিত করুন',
      sameAsOld: 'এখানে আগে ব্যবহার করেননি এমন একটি পাসওয়ার্ড বেছে নিন',
    },
  },

  productRate: {
    title: 'পণ্যের রেট',
    description:
      'প্রতিটি পণ্যের ডেলিভারির জন্য তিনটি এলাকার প্রতিটিতে কত চার্জ হয়। চালানের কোনো লাইনের পণ্য ও লোকেশন — দুটোই জানা থাকলে এই কার্ড থেকে দাম বসে এবং অঙ্কটি রেকর্ডে কপি হয়ে যায় — তাই এখানে রেট ঠিক করলে পরবর্তী চার্জ বদলায়, আগে যা চার্জ হয়েছে তা কখনও বদলায় না।',
    cardAria: 'পণ্যের রেট কার্ড',
    addProduct: 'পণ্য যোগ করুন',
    addFirst: 'একটি পণ্য যোগ করুন',
    inactive: 'নিষ্ক্রিয়',
    osdMetro: 'OSD-Metro',
    osdThana: 'OSD-Thana',
    anyModel: 'যেকোনো মডেল',
    fromCard: 'রেট কার্ড থেকে',
    pricedAnyModel: 'যে মডেলই হোক, দাম একই',
    modelsOnCard: { one: 'কার্ডে {n}টি মডেল', other: 'কার্ডে {n}টি মডেল' },
    tieredRate: 'ধাপভিত্তিক রেট',
    deactivate: 'নিষ্ক্রিয় করুন',
    reactivate: 'পুনরায় সক্রিয় করুন',

    stats: {
      inUse: 'ব্যবহৃত রেট',
      inUseHint: { one: '{n}টি পণ্য', other: '{n}টি পণ্য' },
      byModel: 'মডেল অনুযায়ী দাম',
      byModelHint: '{n}টির দাম মডেল নির্বিশেষে',
      tiered: 'ধাপভিত্তিক রেট',
      tieredHint: 'প্রথম কয়েক পিস এক দামে, বাকিগুলো অন্য দামে',
      deactivated: 'নিষ্ক্রিয় করা',
      deactivatedHint: 'রেখে দেওয়া হয়েছে, যাতে আগের চার্জের হিসাব মেলানো যায়',
    },

    filters: {
      searchPlaceholder: 'পণ্য, মডেল বা ধারণক্ষমতা',
      searchAria: 'রেট কার্ডে খুঁজুন',
      modelAria: 'মডেল উল্লেখ আছে কি না অনুযায়ী ফিল্টার',
      activeAria: 'ব্যবহারে আছে কি না অনুযায়ী ফিল্টার',
      modelAll: 'মডেলসহ ও মডেল ছাড়া',
      modelYes: 'মডেল আছে',
      modelNo: 'যেকোনো মডেল',
      activeAll: 'সক্রিয় ও নিষ্ক্রিয়',
      activeOnly: 'শুধু সক্রিয়',
      inactiveOnly: 'শুধু নিষ্ক্রিয়',
    },

    directory: {
      loading: 'পণ্যের রেট লোড হচ্ছে',
      summaryFiltered: '{rates} এই ফিল্টারে মিলেছে',
      summaryTotal: 'কার্ডে {rates}',
      noneFound: 'কোনো পণ্য পাওয়া যায়নি',
      empty: 'রেট কার্ডটি খালি',
      filteredHint: 'আপনার বর্তমান ফিল্টারের সঙ্গে কোনো পণ্য, মডেল বা ধারণক্ষমতা মেলেনি।',
      emptyHint:
        'API ডেটাবেসে যুক্ত হলে সরবরাহ করা রেট কার্ডটি নিজে থেকেই বসে যায়। তারপরও খালি থাকলে যে পণ্যগুলো দরকার সেগুলো যোগ করুন — চালান দুই অবস্থাতেই দাখিল করা যায়, তাদের লাইনগুলো কেবল চার্জ ছাড়াই থেকে যায়।',
      loadFailed: 'রেট কার্ড লোড করা যায়নি',
      retrying: 'আবার চেষ্টা করা হচ্ছে…',
    },

    table: {
      product: 'পণ্য',
      model: 'মডেল',
      capacity: 'ধারণক্ষমতা',
      actions: 'কার্যক্রম',

      actionsFor: '{label}-এর জন্য কাজ',
    },

    form: {
      addTitle: 'পণ্যের রেট যোগ করুন',
      editTitle: 'রেট সম্পাদনা করুন',
      addDescription:
        'একটি পণ্য, ইচ্ছে করলে একটি মডেল, এবং তিনটি ডেলিভারি এলাকার প্রতিটিতে কত চার্জ হবে।',
      editDescription:
        'এখন থেকে দাখিল করা চালানে এই অঙ্কগুলোই চার্জ হবে। এই সারি থেকে আগে যেগুলো চার্জ হয়েছে, সেগুলো তাদের নিজেদের অঙ্কই ধরে রাখবে।',
      isdHint: 'মেট্রোপলিটন ডেলিভারি এলাকার ভেতরে।',
      osdMetroHint: 'এর বাইরে, কোনো মেট্রোপলিটন বা সদর থানায়।',
      osdThanaHint: 'এর বাইরে, কোনো উপজেলা থানায়।',
      inUse: 'ব্যবহারে আছে',
      inUseHint: 'এটি নিষ্ক্রিয়, তাই এটি কোনো দাম বসায় না এবং কোথাও দেখানো হয় না।',

      modelHint:
        'পণ্যের কোনো মডেল না থাকলে ফাঁকা রাখুন। ফাঁকা একটি সারি এই পণ্যের নাম আছে এমন প্রতিটি চালান সারির দাম ধরে, মডেল যা-ই হোক।',
      capacityHint:
        'রেটের পাশে কার্ডে যা লেখা থাকে — “২১ থেকে ৪০ কেজি”, “গ্রস ১৫১-২৮৫ লিটার”। এই সারি যে চালান সারির দাম ধরে তার প্রতিটিতে এটি তুলে দেওয়া হয়, যাতে রেকর্ড পড়লে বোঝা যায় কোন রেট বসেছে।',
      inactiveHint:
        'নিষ্ক্রিয় একটি সারি কিছুর দাম ধরে না এবং কোথাও দেখানো হয় না। এটি থেকে আগেই চার্জ হওয়া চালানগুলো নিজেদের হিসাব রেখে দেয়।',
      rateTypeAria: '{label} রেটের ধরন',
      submitAdd: 'রেট কার্ডে যোগ করুন',
      flat: 'একক',
      tiered: 'ধাপভিত্তিক',
      firstPieces: 'প্রথম কত পিস',
      atEach: 'প্রতিটি',
      thenEach: 'এরপর প্রতিটি',
      perPiece: 'প্রতি পিস',
    },

    remove: {
      title: '{label} সরাবেন?',
      body: 'এই সারি থেকে কখনও কোনো চালান চার্জ না হয়ে থাকলে এটি একেবারে মুছে যাবে। কিছু চার্জ হয়ে থাকলে এটি নিষ্ক্রিয় করে রেখে দেওয়া হবে: দুই ক্ষেত্রেই তাদের অঙ্ক বদলাবে না, কিন্তু ওই অঙ্কগুলো কোথা থেকে এসেছে তা এই সারিই বলে। দুই ক্ষেত্রেই এটি নতুন চালানে দাম বসানো বন্ধ করবে এবং পণ্যের পরামর্শ হিসেবেও আর দেখানো হবে না।',
      keep: 'থাক',
      removing: 'সরানো হচ্ছে…',
      confirm: 'সরান',
      deleted: 'এটি থেকে কখনও কিছু চার্জ হয়নি, তাই এটি মুছে ফেলা হয়েছে।',
      deactivated: 'এটি নিষ্ক্রিয়, তাই এটি কোনো দাম বসায় না এবং কোথাও দেখানো হয় না।',

      added: '{label} রেট কার্ডে যোগ করা হয়েছে',
      addedNote: 'আইএসডি {isd} · মেট্রো {metro} · থানা {thana}',
      updated: '{label} হালনাগাদ করা হয়েছে',
      updatedNote:
        'এখন থেকে তৈরি হওয়া চালানে নতুন হিসাব বসবে। আগেই চার্জ হওয়াগুলো নিজেদের হিসাব রেখে দেবে।',
      wasDeactivated: '{label} নিষ্ক্রিয় করা হয়েছে',
      wasRemoved: '{label} সরিয়ে দেওয়া হয়েছে',
      wasCharged: {
        one: '{count}টি চালান এটি থেকে চার্জ হয়েছে, তাই মুছে না ফেলে ব্যবহারের বাইরে রাখা হয়েছে।',
        other: '{count}টি চালান এটি থেকে চার্জ হয়েছে, তাই মুছে না ফেলে ব্যবহারের বাইরে রাখা হয়েছে।',
      },
    },

    rate: {
      none: 'কোনো রেট বসানো নেই।',
      perPiece: 'প্রতি পিস {amount}।',
      tiered: {
        one: 'এক চালানে প্রথম {n} পিস প্রতিটি {first}, এরপর প্রতিটি {rest}।',
        other: 'এক চালানে প্রথম {n} পিস প্রতিটি {first}, এরপর প্রতিটি {rest}।',
      },
    },

    validation: {
      productTooShort: 'পণ্যের নাম কমপক্ষে ২টি অক্ষরের হতে হবে',
      productTooLong: 'পণ্যের নাম সর্বোচ্চ ২০০টি অক্ষরের হতে পারে',
      modelTooLong: 'মডেল সর্বোচ্চ ১২০টি অক্ষরের হতে পারে',
      capacityTooLong: 'ধারণক্ষমতা সর্বোচ্চ ১২০টি অক্ষরের হতে পারে',
      rateRequired: 'একটি রেট দিন।',
      notANumber: 'এটি কোনো সংখ্যা নয়।',
      negative: 'রেট ঋণাত্মক হতে পারে না।',
      tooLarge: 'এটি অনেক বড় মনে হচ্ছে। কার্ডটি দেখে নিন।',
      firstQty: 'পিসের একটি পূর্ণ সংখ্যা দিন, কমপক্ষে এক।',
    },
  },

  location: {
    addFirst: 'একটি লোকেশন যোগ করুন',
    district: 'জেলা',
    thana: 'থানা',
    inactive: 'নিষ্ক্রিয়',
    lookupFailed: 'লোকেশনের তালিকা লোড করা যায়নি। এটি ছাড়াও চালানটি সংরক্ষণ করা যাবে।',
    title: 'লোকেশন',
    description:
      'যে জেলা ও থানার তালিকার বিপরীতে চালান শ্রেণিবদ্ধ করা হয়। চালানের লোকেশন টাইপ এই তালিকা থেকেই পড়া হয়, পাশে কখনও টাইপ করা হয় না — তাই এখানে একটি সারি ঠিক করলে সেটিকে নির্দেশ করা প্রতিটি চালানই ঠিক হয়ে যায়।',
    listAria: 'লোকেশনের মাস্টার তালিকা',
    addLocation: 'লোকেশন যোগ করুন',
    anyType: 'যেকোনো লোকেশন টাইপ',
    deactivate: 'নিষ্ক্রিয় করুন',
    reactivate: 'পুনরায় সক্রিয় করুন',

    /** The labels are codes the office says in English — see the English tree. */
    types: {
      ISD: { label: 'ISD', description: 'মেট্রোপলিটন ডেলিভারি এলাকার ভেতরে।' },
      'OSD-Metro': {
        label: 'OSD-Metro',
        description: 'ডেলিভারি এলাকার বাইরে, কোনো মেট্রোপলিটন বা সদর থানায়।',
      },
      'OSD-Thana': {
        label: 'OSD-Thana',
        description: 'ডেলিভারি এলাকার বাইরে, কোনো উপজেলা থানায়।',
      },
      unknown: { label: 'অজানা', description: 'স্বীকৃত লোকেশন টাইপগুলোর কোনোটি নয়।' },
    },

    statuses: {
      Verified: { label: 'লোকেশন বসানো', description: 'লোকেশনের মাস্টার তালিকার সঙ্গে মিলেছে।' },
      Pending: {
        label: 'লোকেশন অপেক্ষমাণ',
        description: 'এখনও নির্ধারণ করা হয়নি। একজন প্রশাসক যেকোনো সময় এটি বসাতে পারেন।',
      },
    },
    review: 'অনিশ্চিত',
    reviewTitle: '{source}। এখনও কেউ এটি নিশ্চিত করেনি।',
    unconfirmedLocation: 'অনিশ্চিত লোকেশন',

    sources: {
      master_exact: 'মাস্টার তালিকার সঙ্গে হুবহু মিলেছে',
      master_normalized: 'বানান স্বাভাবিক করার পর মাস্টার তালিকার সঙ্গে মিলেছে',
      master_fuzzy: 'মাস্টার তালিকার সবচেয়ে কাছের এন্ট্রির সঙ্গে মিলেছে',
      gemini_assisted: 'সহায়তা নিয়ে মাস্টার এন্ট্রি থেকে বেছে নেওয়া হয়েছে',
      admin_manual: 'হাতে বসানো হয়েছে',
      unknown: 'মাস্টার তালিকা থেকে বসানো',
    },

    stats: {
      inUse: 'ব্যবহৃত লোকেশন',

      inUseHint: '{districts}',
      deactivated: 'নিষ্ক্রিয় করা',
      deactivatedHint: 'যে চালানগুলো এগুলোকে নির্দেশ করে, তাদের জন্য রেখে দেওয়া হয়েছে',
      byType: 'লোকেশন টাইপ অনুযায়ী',
      byTypeHint: '{isd} ISD · {metro} Metro · {thana} Thana',
      assisted: 'সহায়ক নির্ধারণ',
      assistedOff: 'কনফিগার করা নেই। মাস্টার তালিকাই নিজে থেকে উত্তর দেয়।',
      assistedPaused: 'বারবার ব্যর্থ হওয়ায় থামানো হয়েছে। লোকেশনগুলো প্রশাসকের জন্য রাখা আছে।',
      paused: 'থামানো',
    },

    filters: {
      searchPlaceholder: 'জেলা বা থানা',
      searchAria: 'লোকেশন খুঁজুন',
      typeAria: 'লোকেশন টাইপ অনুযায়ী ফিল্টার',
      activeAria: 'ব্যবহারে আছে কি না অনুযায়ী ফিল্টার',
      activeAll: 'সক্রিয় ও নিষ্ক্রিয়',
      activeOnly: 'শুধু সক্রিয়',
      inactiveOnly: 'শুধু নিষ্ক্রিয়',
    },

    directory: {
      loading: 'লোকেশন লোড হচ্ছে',
      summaryFiltered: '{locations} এই ফিল্টারে মিলেছে',
      summaryTotal: 'মূল তালিকায় {locations}',
      noneFound: 'কোনো লোকেশন পাওয়া যায়নি',
      empty: 'লোকেশনের মাস্টার তালিকাটি খালি',
      filteredHint: 'আপনার বর্তমান ফিল্টারের সঙ্গে কোনো জেলা বা থানা মেলেনি।',
      emptyHint:
        'API ডেটাবেসে যুক্ত হলে সরবরাহ করা জেলা ও থানার তালিকাটি নিজে থেকেই বসে যায়। তারপরও খালি থাকলে যে লোকেশনগুলো দরকার সেগুলো যোগ করুন — চালান দুই অবস্থাতেই দাখিল করা যায়, তাদের লোকেশন কেবল পরের জন্য রেখে দেওয়া হয়।',
      loadFailed: 'লোকেশন লোড করা যায়নি',
      retrying: 'আবার চেষ্টা করা হচ্ছে…',
    },

    table: {
      district: 'জেলা',
      thana: 'থানা',
      location: 'লোকেশন',
      source: 'উৎস',
      updated: 'হালনাগাদ',
      actions: 'কার্যক্রম',

      actionsFor: '{district} / {thana}-এর জন্য কাজ',
      suppliedList: 'সরবরাহ করা তালিকা',
      addedByHand: 'হাতে যোগ করা',
    },

    form: {
      addTitle: 'লোকেশন যোগ করুন',
      editTitle: 'লোকেশন সম্পাদনা করুন',
      addDescription:
        'একটি জেলা ও থানার জোড়, এবং জায়গাটি কী ধরনের। চালান এই তালিকার সঙ্গে মেলানো হয়।',
      editDescription:
        'যে চালানগুলো আগে থেকেই এই সারিটিকে নির্দেশ করে, তারা নিজেদের জেলা, থানা ও লোকেশন টাইপ এর মধ্য দিয়েই পড়ে — তাই এখানে ঠিক করলে সেগুলো সবই ঠিক হয়ে যায়।',
      inUse: 'ব্যবহারে আছে',

      inUseHint:
        'নিষ্ক্রিয় একটি লোকেশন কোথাও দেখানো হয় না এবং কিছুর সাথে মেলানো হয় না। যে চালানগুলো আগে থেকেই এটিকে ধরে আছে, তারা এর দেওয়া জেলা, থানা ও ধরন রেখে দেয়।',
    },

    select: {
      chooseDistrict: 'একটি জেলা বেছে নিন',
      searchDistricts: 'জেলা খুঁজুন…',
      noDistrict: 'এর সঙ্গে কোনো জেলা মেলেনি।',
      chooseThana: 'একটি থানা বেছে নিন',
      chooseDistrictFirst: 'আগে একটি জেলা বেছে নিন',
      searchThanas: 'থানা খুঁজুন…',
      noThana: 'এর সঙ্গে কোনো থানা মেলেনি।',
      setAutomatically: 'থানা বেছে নিলেই এটি নিজে থেকে বসে যাবে।',
    },

    remove: {
      keep: 'থাক',
      removing: 'সরানো হচ্ছে…',
      confirm: 'সরান',

      added: '{district} / {thana} যোগ করা হয়েছে',
      addedNote: 'এর সাথে মেলে যাওয়া চালানগুলো {type} হিসেবে শ্রেণিবদ্ধ হবে।',
      updated: '{district} / {thana} হালনাগাদ করা হয়েছে',
      corrected: 'যে চালানগুলো এটিকে নির্দেশ করে, তারা এখন সংশোধিত তথ্যই পড়বে।',
      deactivated: 'এটি নিষ্ক্রিয়, তাই এটি আর বেছে নেওয়া বা মেলানো যাবে না।',
      deleted: 'কিছুই এটিকে নির্দেশ করেনি, তাই এটি মুছে ফেলা হয়েছে।',

      title: '{district} / {thana} সরিয়ে দেবেন?',
      description:
        'কোনো চালান এই লোকেশনটিকে না ধরলে এটি একেবারে মুছে যায়। কোনোটি ধরলে বদলে এটি নিষ্ক্রিয় করে রেখে দেওয়া হয়: সেই রেকর্ডগুলো নিজেদের জেলা, থানা ও লোকেশনের ধরন এটির মধ্য দিয়েই পড়ে, আর মুছে দিলে তারা আর বলতে পারবে না কোথায় গিয়েছিল। যেভাবেই হোক, এটি আর কোনো তালিকায় দেখানো হবে না এবং নতুন চালানের সাথে মেলানো হবে না।',
      /** The two outcomes the removal toast has to tell apart. */
      wasDeactivated: '{label} নিষ্ক্রিয় করা হয়েছে',
      wasDeleted: '{label} মুছে ফেলা হয়েছে',
      stillReferenced: {
        one: '{count}টি চালান এখনও এটিকে ধরে আছে, তাই মুছে না ফেলে ব্যবহারের বাইরে রাখা হয়েছে।',
        other: '{count}টি চালান এখনও এটিকে ধরে আছে, তাই মুছে না ফেলে ব্যবহারের বাইরে রাখা হয়েছে।',
      },
    },

    validation: {
      districtTooShort: 'জেলার নাম কমপক্ষে ২টি অক্ষরের হতে হবে',
      districtTooLong: 'জেলার নাম সর্বোচ্চ ১২০টি অক্ষরের হতে পারে',
      thanaTooShort: 'থানার নাম কমপক্ষে ২টি অক্ষরের হতে হবে',
      thanaTooLong: 'থানার নাম সর্বোচ্চ ১২০টি অক্ষরের হতে পারে',
      typeRequired: 'একটি লোকেশন টাইপ বেছে নিন।',
    },
  },

  notification: {
    title: 'বিজ্ঞপ্তি',
    description:
      'সিস্টেম আপনাকে যা জানাতে চায়: অনুমোদনের অপেক্ষায় থাকা অ্যাকাউন্ট, গেট পাসের সিদ্ধান্ত, মেয়াদ ফুরানোর পথে থাকা সনদ, ডিপোতে ফেরত আসা মাল এবং টাকার লেনদেন। প্রতিটিই আপনার উদ্দেশে — এখানে আপনি যা দেখছেন, অন্য কেউ তা দেখছে না।',
    listAria: 'আপনার বিজ্ঞপ্তি',
    bellNothing: 'বিজ্ঞপ্তি, কিছুই অপঠিত নেই',
    bellUnread: { one: 'বিজ্ঞপ্তি, {n}টি অপঠিত', other: 'বিজ্ঞপ্তি, {n}টি অপঠিত' },

    modules: {
      Account: 'অ্যাকাউন্ট',
      'Gate Pass': 'গেট পাস',
      Delivery: 'ডেলিভারি',
      Vendor: 'ভেন্ডর',
      Billing: 'বিলিং',
      Accounts: 'হিসাব',
      unknown: 'সিস্টেম',
    },

    categories: {
      approvals: {
        label: 'অনুমোদন',
        description: 'যে অ্যাকাউন্টগুলো অনুমোদন ও ভূমিকা পাওয়ার অপেক্ষায় আছে।',
      },
      review: {
        label: 'যাচাই',
        description: 'যাচাইয়ের জন্য জমা দেওয়া, যাচাই হওয়া বা ফেরত পাঠানো গেট পাস।',
      },
      compliance: {
        label: 'কমপ্লায়েন্স',
        description: 'মেয়াদ ফুরানোর পথে থাকা সনদ, এবং স্বাক্ষরিত কপি ছাড়াই শেষ হওয়া ডেলিভারি।',
      },
      operations: {
        label: 'পরিচালনা',
        description: 'ডিপোতে ফেরত আসা মাল, এবং দিনের ট্রিপ সম্পর্কে অন্যান্য তথ্য।',
      },
      money: {
        label: 'টাকাপয়সা',
        description: 'অনুমোদিত বিল, এবং ভেন্ডরের নামে রেকর্ড করা পরিশোধ।',
      },
      account: {
        label: 'আপনার অ্যাকাউন্ট',
        description:
          'আপনার নিজের ভূমিকা ও অ্যাকাউন্টের অবস্থা। এটি বন্ধ করা যায় না — কোনো অ্যাকাউন্ট কিছু না জানিয়েই কাজ করা বন্ধ করে দেওয়া একটি বিজ্ঞপ্তির চেয়েও খারাপ।',
      },
    },

    priorities: {
      info: 'জানার জন্য',
      attention: 'মনোযোগ প্রয়োজন',
      urgent: 'জরুরি',
    },

    links: {
      gatePass: 'গেট পাস খুলুন',
      challan: 'চালান খুলুন',
      trip: 'ট্রিপ খুলুন',
      vendor: 'ভেন্ডর খুলুন',
      bill: 'বিল খুলুন',
      administration: 'প্রশাসন খুলুন',
      cashBook: 'ক্যাশ বুক খুলুন',
      generic: 'খুলুন',
    },

    panel: {
      checking: 'দেখা হচ্ছে…',
      nothingWaiting: 'অপেক্ষায় কিছু নেই',
      unread: { one: '{n}টি অপঠিত', other: '{n}টি অপঠিত' },
      settings: 'বিজ্ঞপ্তির সেটিংস',
      markAll: 'সব চিহ্নিত করুন',
      markAllRead: 'সব পড়া হিসেবে চিহ্নিত করুন',
      clearRead: 'পড়াগুলো সরান',
      settingsShort: 'সেটিংস',
      seeUnread: 'অপঠিতগুলো দেখুন',
      seeAll: 'সব নোটিফিকেশন',
      alwaysOn: 'সবসময় চালু',
      outsideFilters: 'এগুলোর বাইরেও নোটিফিকেশন থাকতে পারে।',
      loadFailed: 'বিজ্ঞপ্তি লোড করা যায়নি',

      nothingWaitingHint:
        'অনুমোদন, পর্যালোচনার সিদ্ধান্ত, মেয়াদ শেষের পথে থাকা কাগজ আর টাকার লেনদেন — সবই ঘটার সাথে সাথে এখানে আসে।',
      upToDate: 'আপনি হালনাগাদ আছেন',
    },

    item: {
      markRead: 'পঠিত চিহ্নিত করুন',
      markUnread: 'অপঠিত',
      dismiss: 'সরিয়ে দিন: {title}',
      foundByCheck: 'কমপ্লায়েন্স পরীক্ষায় পাওয়া গেছে',
      actorWithRole: '{name} ({role})',
    },

    list: {
      loadFailed: 'আপনার বিজ্ঞপ্তি লোড করা যায়নি',
      summaryFiltered: '{notifications} এই ফিল্টারে মিলেছে',
      unreadSuffix: 'মোট {count}টি অপঠিত',
      noMatches: 'এই ফিল্টারগুলোর সঙ্গে কিছুই মিলছে না',
      upToDate: 'আপনি হালনাগাদ আছেন',

      upToDateHint:
        'অনুমোদনের অপেক্ষায় থাকা অ্যাকাউন্ট, গেট পাসের সিদ্ধান্ত, মেয়াদ শেষের পথে থাকা কাগজ, ডিপোতে ফিরে আসা মাল আর টাকার লেনদেন — সবই ঘটার সাথে সাথে এখানে আসে। এই মুহূর্তে আপনার জন্য কিছু অপেক্ষা করছে না।',
    },

    overview: {
      unread: 'অপঠিত',
      unreadHintEmpty: 'আপনি হালনাগাদ আছেন',
      unreadHint: 'যা যা আপনি খোলেননি',
      urgent: 'জরুরি',
      urgentHint: 'আগে থেকেই ভুল, অথবা ফেরানো কঠিন',
      attention: 'মনোযোগ প্রয়োজন',
      attentionHint: 'কারও কিছু করার অপেক্ষায়',
      busiestHint: 'এই মুহূর্তে সবচেয়ে বেশি',
    },

    toolbar: {
      searchPlaceholder: 'কী লেখা আছে, বা কোন রেকর্ড',
      searchAria: 'বিজ্ঞপ্তি খুঁজুন',
      stateAria: 'পঠিত অবস্থা অনুযায়ী ফিল্টার',
      moduleAria: 'মডিউল অনুযায়ী ফিল্টার',
      kindAria: 'ধরন অনুযায়ী ফিল্টার',
      priorityAria: 'অগ্রাধিকার অনুযায়ী ফিল্টার',
      eventAria: 'নির্দিষ্ট বিজ্ঞপ্তি অনুযায়ী ফিল্টার',
      everything: 'সবকিছু',
      unread: 'অপঠিত',
      read: 'পঠিত',
      everyModule: 'সব মডিউল',
      everyKind: 'সব ধরন',
      anyPriority: 'যেকোনো অগ্রাধিকার',
      anyNotification: 'যেকোনো বিজ্ঞপ্তি',
    },

    preferences: {
      title: 'বিজ্ঞপ্তির সেটিংস',
      loadFailed: 'আপনার সেটিংস লোড করা যায়নি',
      saving: 'সংরক্ষণ হচ্ছে…',
      save: 'সেটিংস সংরক্ষণ করুন',

      description:
        'ঘণ্টায় কী পৌঁছাবে তা বেছে নিন। এটি এখন থেকে যা আসবে তা বদলায় — আপনার তালিকায় আগে থেকে যা আছে তা যেমন আছে তেমনই থাকে।',
      receiveAria: '{kind} বিজ্ঞপ্তি পান',
    },

    toasts: {
      markedRead: {
        one: '{n}টি বিজ্ঞপ্তি পঠিত চিহ্নিত করা হয়েছে',
        other: '{n}টি বিজ্ঞপ্তি পঠিত চিহ্নিত করা হয়েছে',
      },
      nothingToClear: 'সাফ করার মতো কোনো পঠিত বিজ্ঞপ্তি ছিল না',
      cleared: {
        one: '{n}টি পঠিত বিজ্ঞপ্তি সাফ করা হয়েছে',
        other: '{n}টি পঠিত বিজ্ঞপ্তি সাফ করা হয়েছে',
      },
      hearEverything: 'আপনি সবকিছু সম্পর্কেই জানতে পারবেন',
      switchedOff: { one: '{n}টি ধরন বন্ধ করা হয়েছে', other: '{n}টি ধরন বন্ধ করা হয়েছে' },
      appliesToNew: 'এটি নতুন বিজ্ঞপ্তির ক্ষেত্রে প্রযোজ্য। যা আগে থেকেই আছে, তা থেকে যাবে।',
    },
  },

  bill: {
    title: 'এক্সেল বিল',
    pageDescription:
      'একটি মাস ও ইউনিটের জন্য বিলের স্লট খুলুন, তার ট্রিপ DO যোগ করুন, এবং অফিসের নিজস্ব এক্সেল বিন্যাসে বিলটি ডাউনলোড করুন — প্রতি ট্রিপ DO-তে একটি SL। আপনি যে সারিই যোগ করবেন, সেটি ট্রিপ DO শিট, চালান ও গেট পাসে বিল করা হিসেবে চিহ্নিত হবে।',
    listDescription:
      'একটি বিল মানে এক ইউনিটের এক মাসের ট্রিপ DO, অফিস যে এক্সেল শিট পাঠায় ঠিক সেই বিন্যাসে। একটি স্লট খুলুন, তার ট্রিপ DO খুঁজুন, এবং আপনি যে সারিই যোগ করবেন তা ট্রিপ DO শিট, চালান ও গেট পাসে বিল করা হিসেবে চিহ্নিত হবে।',
    billsAria: 'বিল',
    sheetAria: 'বিল শিট',
    sheetHeading: 'বিল শিট',
    sheetHint:
      'এক্সেল ফাইলে ঠিক যা থাকে — প্রতিটি ট্রিপ ডিও-র জন্য একটি এসএল, আর রিমার্কসে ফেরত ও পুনঃপ্রেরণ।',
    addTripDo: 'ট্রিপ ডিও যোগ করুন',
    newBill: 'নতুন বিল',
    billAmount: 'বিলের অঙ্ক',
    noCsd: 'কোনো CSD নেই',
    noUnit: 'কোনো ইউনিট নেই',
    noLocation: 'কোনো লোকেশন নেই',
    pending: 'অপেক্ষমাণ',
    notBilled: 'বিল করা হয়নি',
    onThisBill: 'এই বিলে আছে',
    allBills: 'সব বিল',
    blankUnit: '(ফাঁকা)',

    statuses: {
      Draft: {
        label: 'খসড়া',
        description: 'এখনও তৈরি হচ্ছে: সারি যোগ করা ও সরানো যায়।',
      },
      Finalized: {
        label: 'চূড়ান্ত',
        description:
          'অনুমোদিত। কোনো অ্যাডমিন বা ম্যানেজার আবার না খোলা পর্যন্ত এটি যা বহন করছে তা স্থির।',
      },
    },

    billingStatuses: {
      Unbilled: {
        label: 'বিল করা হয়নি',
        description: 'এর কোনো ট্রিপ DO সারিই এখনও কোনো বিলে নেই।',
      },
      Partial: {
        label: 'আংশিক বিল',
        description: 'এর কিছু ট্রিপ DO সারি বিলে আছে, কিছু নেই।',
      },
      Billed: {
        label: 'বিল করা হয়েছে',
        description: 'এর প্রতিটি ট্রিপ DO সারিই কোনো না কোনো বিলে আছে।',
      },
    },

    billingFilters: {
      all: 'যেকোনো বিলিং',
      unbilled: 'বিল করা হয়নি',
      partial: 'আংশিক বিল',
      billed: 'বিল করা হয়েছে',
    },

    badges: {
      onBill: '{bill}-এ আছে',
      more: '+{n}',
      tooltip: '{description}\n{bills}',
      sameSlot: {
        one: '{period}-এর জন্য {unit}-এর আগে থেকেই একটি বিল আছে',
        other: '{period}-এর জন্য {unit}-এর আগে থেকেই {n}টি বিল আছে',
      },
      sameSlotHint: 'চাইলে আরেকটি খুলতে পারেন — যেমন আংশিক বিল।',
    },

    columns: {
      sl: 'SL',
      customer: 'গ্রাহক',
      csd: 'CSD',
      receiver: 'গ্রাহকের নম্বর',
      address: 'ঠিকানা',
      district: 'জেলা',
      thana: 'থানা',
      location: 'লোকেশন',
      unit: 'ইউনিট',
      model: 'পণ্যের মডেল',
      qty: 'সংখ্যা',
      rate: 'রেট',
      amount: 'টাকার পরিমাণ',
      products: 'পণ্য',
      tripDo: 'ট্রিপ DO',
      capacity: 'ধারণক্ষমতা',
      remarks: 'মন্তব্য',
    },

    stats: {
      bills: 'বিল',
      drafts: 'খসড়া',
      finalized: 'চূড়ান্ত',
      billedAmount: 'বিল করা অঙ্ক',
      pcsAcross: 'এই বিলগুলোতে মোট {n} পিস',
      tripDoCount: { one: '{n}টি ট্রিপ DO', other: '{n}টি ট্রিপ DO' },
      piecesCount: { one: '{n} পিস', other: '{n} পিস' },
      challans: 'চালান',
      pieces: 'পিস',
      rows: 'সারি',
      tripDo: 'ট্রিপ DO',

      matchingFilters: 'ফিল্টারের সাথে মিলেছে',
      stillPreparing: 'এখনও তৈরি হচ্ছে',
      signedOffSent: 'সই হয়ে পাঠানো হয়েছে',
      pcs: 'পিস',
    },

    toolbar: {
      statusAria: 'বিলের অবস্থা',
      monthAria: 'বিলিং মাস',
      yearAria: 'বিলিং বছর',
      anyMonth: 'যেকোনো মাস',
      anyYear: 'যেকোনো বছর',
      drafts: 'খসড়া',
      finalized: 'চূড়ান্ত',
      unitsAria: 'রেকর্ডে থাকা ইউনিট',
      all: 'সব',
      searchAria: 'নম্বর, ইউনিট বা নোট দিয়ে বিল খুঁজুন',
      unitAria: 'ইউনিট',
      yearOnly: 'বছর',
      tripDoAria: 'ট্রিপ DO বা গেট পাস নম্বর',
    },

    confirm: {
      finalizeTitle: '{bill} চূড়ান্ত করবেন?',
      reopenTitle: '{bill} আবার খুলবেন?',
      deleteTitle: '{bill} মুছে ফেলবেন?',
      removeTitle: '{label} বিল থেকে সরাবেন?',
      theseRows: 'এই সারিগুলো',
      finalizeBody:
        '{period}, ইউনিট {unit}, {tripDos} ({rows}, {pcs}) — সব মিলিয়ে {amount}। চূড়ান্ত হয়ে গেলে কোনো অ্যাডমিন বা ম্যানেজার আবার না খোলা পর্যন্ত সারি যোগ করা বা সরানো যাবে না।',
      unpricedNote: {
        one: '{n}টি সারির কোনো রেট নেই, তাই সেটি মোটে কিছুই যোগ করছে না।',
        other: '{n}টি সারির কোনো রেট নেই, তাই সেগুলো মোটে কিছুই যোগ করছে না।',
      },
      deleteDescription: {
        one: 'এর {n}টি সারি বিল ছাড়া অবস্থায় ট্রিপ DO শিটে ফিরে যাবে, এবং এর পিছনের চালান ও গেট পাসে সেই অনুযায়ী চিহ্ন বসবে। বিলের নম্বরটি আর ব্যবহার করা হবে না।',
        other:
          'এর {n}টি সারি বিল ছাড়া অবস্থায় ট্রিপ DO শিটে ফিরে যাবে, এবং এগুলোর পিছনের চালান ও গেট পাসে সেই অনুযায়ী চিহ্ন বসবে। বিলের নম্বরটি আর ব্যবহার করা হবে না।',
      },
      removeDescription: {
        one: '{n}টি সারি বিল ছাড়া অবস্থায় ট্রিপ DO শিটে ফিরে যাবে, এই বিলে বা অন্য কোনো বিলে আবার যোগ করা যাবে।',
        other:
          '{n}টি সারি বিল ছাড়া অবস্থায় ট্রিপ DO শিটে ফিরে যাবে, এই বিলে বা অন্য কোনো বিলে আবার যোগ করা যাবে।',
      },
      finalize: 'বিল চূড়ান্ত করুন',
      reopen: 'খসড়া হিসেবে আবার খুলুন',
      deleteBill: 'বিল মুছে ফেলুন',
      takeRowOff: 'সারিটি সরান',
      takeRowsOff: '{count}টি সারি সরান',
    },

    list: {
      loading: 'বিল লোড হচ্ছে',
      summaryFiltered: '{bills} · {amount} এই ফিল্টারে মিলেছে',
      summaryTotal: 'মোট {bills} · {amount}',
      loadFailed: 'বিল লোড করা যায়নি',
      retrying: 'আবার চেষ্টা করা হচ্ছে…',
      noMatches: 'কোনো বিল মেলেনি',
      empty: 'এখনও কোনো বিল নেই',
      noMatchesHint: 'বর্তমান খোঁজ, অবস্থা, মাস, বছর বা ইউনিটের সঙ্গে কোনো বিল মেলেনি।',
      openFirst: 'প্রথম বিলটি খুলুন',
      emptyHint:
        'বিলিং মাস ও ইউনিট বেছে নিন, তারপর তার ট্রিপ DO যোগ করুন — এগোনোর সঙ্গে সঙ্গে এক্সেল বিলটি নিজেই তৈরি হতে থাকবে।',
    },

    details: {
      loading: 'বিলটি লোড হচ্ছে',
      openFailed: 'এই বিলটি খোলা যায়নি',
      noRows: 'এই বিলে এখনও কোনো ট্রিপ DO নেই',
      noRowsHint: 'এই বিলে এখনও কেউ কোনো ট্রিপ DO যোগ করেননি।',
      addHint:
        'একটি ট্রিপ DO খুঁজে যোগ করুন। সেটি যে সারিগুলো বহন করে সবই এখানে একটি SL-এর নিচে এক্সেল বিন্যাসে আসবে — ফেরত ও পুনঃপ্রেরণ মন্তব্যে চিহ্নিত থাকবে।',
      finalizedHint:
        'এই বিলটি চূড়ান্ত, তাই এটি যা চার্জ করেছে তাই ধরে রাখে। হালনাগাদ করতে হলে আবার খুলুন।',
      driftTitle: 'এই সারিগুলো যোগ করার পর ট্রিপ DO শিট বদলে গেছে',
      driftHint:
        'শিটটি আবার কপি করতে রিফ্রেশ করুন — যে সারিগুলো আর নেই সেগুলো সরিয়ে দেওয়া হবে। না মেলা পর্যন্ত বিলটি চূড়ান্ত করা যাবে না।',
      refreshing: 'রিফ্রেশ হচ্ছে…',
      refresh: 'ট্রিপ DO থেকে রিফ্রেশ করুন',
      building: 'তৈরি হচ্ছে…',
      downloadExcel: 'এক্সেল ডাউনলোড করুন',
      removeRow: 'সরান',
      none: 'কিছুই নয়',
      sheetTotal: 'মোট',
      tripDoAria: 'ট্রিপ DO {tripDo}',
      removeTripDo: 'ট্রিপ DO {tripDo} বিল থেকে সরান',
      removeLine: '{challan} {model} বিল থেকে সরান',
      lineLabel: '{challan} · {model}',
      driftChanged: { one: '{n}টি সারি বদলে গেছে', other: '{n}টি সারি বদলে গেছে' },
      driftMissing: {
        one: '{n}টি সারি আর শিটে নেই',
        other: '{n}টি সারি আর শিটে নেই',
      },
      driftBoth: '{changed} এবং {missing}',
      driftSentence: '{summary}। {hint}',
      opened: '{when} খোলা হয়েছে',
      openedBy: '{when} {name} খুলেছেন',
      finalizedOn: '{when} চূড়ান্ত হয়েছে',
      finalizedOnBy: '{when} {name} চূড়ান্ত করেছেন',
      reopenedOn: '{when} আবার খোলা হয়েছে',
      reopenedOnBy: '{when} {name} আবার খুলেছেন',
    },

    search: {
      searching: 'ট্রিপ DO শিটে খোঁজা হচ্ছে',
      enterHint: 'খোঁজায় একটিমাত্র ফল এলে পুরো ট্রিপ DO যোগ করতে Enter চাপুন।',
      noMatch: '“{query}”-এর সঙ্গে কোনো ট্রিপ DO মেলেনি',
      nothingLeft: 'এই মাসে বিল করার মতো আর কিছু নেই',
      onlyWithTripDo:
        'ট্রিপ DO শিটে যেসব সারিতে ট্রিপ DO বসানো আছে, কেবল সেগুলোই বিল করা যায়। নম্বরটি দেখে নিন, অথবা সেখানে আগে তার ট্রিপ DO বসান।',
      onlyThisUnit: 'যেসব ট্রিপ DO-এর গেট পাসে এই ইউনিট আছে, কেবল সেগুলোই যোগ করা যায়।',
      switchUnit: 'এটি যোগ করতে বিলটিকে এই ইউনিটে বদলান।',
      otherUnit: 'এটিকে তার নিজের ইউনিটের বিলে যোগ করুন, অথবা তার গেট পাসে ইউনিটটি ঠিক করুন।',
      alreadyOn: 'এই বিলে আগে থেকেই আছে',
      onBill: '{bill}-এ আছে',
      otherUnitAria: 'অন্য ইউনিটের ট্রিপ DO',
      goneAria: 'ট্রিপ DO শিটে আর নেই',

      addToBill: 'বিলে যোগ করুন',
      tickEveryRow: 'ট্রিপ ডিও {tripDo}-এর সব সারি টিক দিন',
      billIsForUnit: 'এই বিলটি {unit} ইউনিটের জন্য',
      nothingLeftHint:
        '{period} তারিখের প্রতিটি {unit} ট্রিপ ডিও আগেই কোনো বিলে আছে। অন্য মাস থেকে যোগ করতে ট্রিপ ডিও দিয়ে খুঁজুন।',
      lineTitle: '{gatePass} · {date} · {challan}',
      changedAria: 'যোগ করার পর ট্রিপ DO শিটে বদলে গেছে',
      addTripDo: 'ট্রিপ DO যোগ করুন',
      addRows: '{count}টি সারি যোগ করুন',
      noRate: 'কার্ডে এই লাইনের কোনো রেট নেই, তাই এটি কিছুই যোগ করে না',
      unitMismatch: 'এই ট্রিপ DO-র গেট পাস {theirs} ইউনিটের, আর এই বিলটি {ours} ইউনিটের জন্য।',
      moreRows: 'এক খোঁজে যতগুলো দেখা যায় তার চেয়ে বেশি সারি মিলেছে। ট্রিপ DO-র আরও অংশ লিখে খোঁজটি সংকুচিত করুন।',
      hint:
        'একটি ট্রিপ DO বা গেট পাস নম্বর লিখুন। ততক্ষণ পর্যন্ত: {period}-এর {unit} ইউনিটের যে ট্রিপ DO কোনো বিলে নেই।',
      addRowAria: '{challan} {model} যোগ করুন',
    },

    form: {
      openTitle: 'একটি বিলের স্লট খুলুন',
      editTitle: '{bill} সম্পাদনা করুন',
      openDescription:
        'বিলিং মাস ও ইউনিট বেছে নিন, তারপর তার ট্রিপ DO যোগ করুন — এগোনোর সঙ্গে সঙ্গে এক্সেল বিলটি নিজেই তৈরি হতে থাকবে।',
      editDescription: 'বিলিং মাস, ইউনিট বা নোট ঠিক করুন। বিলের নম্বর একই থাকবে।',
      billingMonth: 'বিলিং মাস',
      unit: 'ইউনিট',
      unitFixed: 'বিলে সারি থাকা অবস্থায় ইউনিট বদলানো যায় না।',
      unitRequired: 'এই বিলটি যে ইউনিটের, সেটি লিখুন।',
      openBill: 'বিল খুলুন',
    },

    menu: {
      edit: 'মাস, ইউনিট বা নোট সম্পাদনা',
      refresh: 'ট্রিপ DO শিট থেকে রিফ্রেশ করুন',
      finalize: 'বিল চূড়ান্ত করুন',
      reopen: 'খসড়া হিসেবে আবার খুলুন',
      delete: 'বিল মুছে ফেলুন',

      moreActionsFor: '{bill}-এর আরও কাজ',
    },

    actions: {
      opened: '{bill} খোলা হয়েছে',
      openedNote: 'ইউনিট {unit} · {period}',
      updated: '{bill} হালনাগাদ হয়েছে',
      deleted: '{bill} মুছে ফেলা হয়েছে',
      releasedNote: {
        one: '{n}টি ট্রিপ DO সারি আবার বিল করার জন্য মুক্ত।',
        other: '{n}টি ট্রিপ DO সারি আবার বিল করার জন্য মুক্ত।',
      },
      alreadyOn: '{bill}-এ আগে থেকেই আছে',
      added: { one: '{bill}-এ {n}টি সারি যোগ হয়েছে', other: '{bill}-এ {n}টি সারি যোগ হয়েছে' },
      skippedNote: '· {n}টি আগে থেকেই বিলে আছে',
      takenOff: {
        one: '{bill} থেকে {n}টি সারি সরানো হয়েছে',
        other: '{bill} থেকে {n}টি সারি সরানো হয়েছে',
      },
      refreshed: '{bill} ট্রিপ DO শিট থেকে রিফ্রেশ হয়েছে',

      freeToBillAgain: 'এগুলো আবার বিল করা যাবে।',
      draftAgain: 'এটি আবার একটি খসড়া।',
      refreshedNote: '{updated}টি হালনাগাদ · {removed}টি সরানো হয়েছে',
      finalized: '{bill} চূড়ান্ত হয়েছে',
      deleting: 'মুছে ফেলা হচ্ছে…',
      finalizing: 'চূড়ান্ত করা হচ্ছে…',
      reopening: 'আবার খোলা হচ্ছে…',
      takingOff: 'সরানো হচ্ছে…',
      reopened: '{bill} আবার খোলা হয়েছে',
      reopenedNote: 'এটি আবার খসড়া হয়ে গেছে।',
      reopenDescription:
        'এটি আবার খসড়া হয়ে যাবে, তাই সারি যোগ করা, সরানো এবং ট্রিপ DO শিট থেকে রিফ্রেশ করা যাবে। চূড়ান্ত ফাইলটি আগেই পাঠানো হয়ে থাকলে, যিনি পেয়েছেন তাঁর সংশোধিত কপিটি লাগবে।',
      freeToBill: 'এগুলো আবার বিল করার জন্য মুক্ত।',
      buildingToast: 'এক্সেল বিল তৈরি হচ্ছে…',
      downloaded: 'এক্সেল বিল ডাউনলোড হয়েছে',
    },
  },

  labourBill: {
    title: 'ওয়ালটন লেবার বিল',
    pageDescription:
      'প্রতি CSD-র প্রতি মাসে একটি করে বিল। একটি স্লট খুলুন, চালানগুলো স্ক্যান করে ঢোকান, এবং প্রতিটি মডেলের বিপরীতে হ্যান্ডলিংয়ে কত খরচ হয়েছে তা লিখুন — একদিকে ভ্যান, টানা ও মজুরি, অন্যদিকে কত তলা পর্যন্ত উঠেছে। এক্সেল বিল যা চার্জ করে তার কিছুই এটি চার্জ করে না, এবং ট্রিপ DO শিটে কিছুই চিহ্নিত করে না।',
    listDescription:
      'একটি লেবার বিল মানে এক CSD-র এক মাসের হ্যান্ডলিং খরচ: একটি স্লট খুলুন, চালানগুলো স্ক্যান করে ঢোকান, এবং প্রতিটি মডেলের বিপরীতে ভ্যান, টানা ও সিঁড়িতে কত খরচ হয়েছে তা লিখুন। এক মাসের ডেলিভারিতে যতগুলো CSD ছিল, ততগুলো বিল হয়। এক্সেল বিল যা চার্জ করে তার কিছুই এটি চার্জ করে না — ওটি রেট কার্ডের পরিবহন বহন করে, এটি তার পাশের মজুরি।',
    listAria: 'লেবার বিল',
    sheetAria: 'লেবার বিল শিট',
    sheetHeading: 'লেবার বিল শিট',
    allBills: 'সব লেবার বিল',
    newBill: 'নতুন লেবার বিল',
    signedCopies: 'স্বাক্ষরিত কপি',
    noCustomer: 'কোনো গ্রাহক নেই',
    tripDoPending: 'ট্রিপ DO অপেক্ষমাণ',
    noTripDoChip: 'ট্রিপ DO নেই',
    notSet: 'বসানো নেই',
    cardTotal: 'লেবার বিলের মোট',

    statuses: {
      Draft: {
        label: 'খসড়া',
        description: 'এখনও তৈরি হচ্ছে: চালান স্ক্যান করা ও অঙ্ক লেখা যায়।',
      },
      Finalized: {
        label: 'চূড়ান্ত',
        description:
          'অনুমোদিত। কোনো অ্যাডমিন বা ম্যানেজার আবার না খোলা পর্যন্ত এটি যা চার্জ করছে তা স্থির।',
      },
    },

    columns: {
      sl: 'SL',
      customer: 'গ্রাহক',
      csd: 'CSD',
      receiver: 'গ্রাহকের নম্বর',
      address: 'ঠিকানা',
      unit: 'ইউনিট',
      model: 'মডেল',
      tripDo: 'ট্রিপ DO',
      qty: 'সংখ্যা',
      labour: 'ভ্যান/টানা/মজুরি',
      floor: 'তলা',
      floorNo: 'কত তলা',
      floorAmount: 'টাকা',
      total: 'মোট টাকা',
      sectionTotal: '{section} মোট',
    },

    fields: {
      unitCompany: 'ইউনিট / কোম্পানি',
      labour: 'ভ্যান / টানা / মজুরি',
      floorNo: 'কত তলা',
      floorAmount: 'তলার টাকা',
      total: 'মোট',
      untypedRow: 'দুটি ঘরের কোনোটিই এখনও লেখা হয়নি, তাই এই সারি বিলে কিছুই যোগ করে না',
      noTripDo:
        'এই চালানের লাইনটির এখনও কোনো ট্রিপ DO নেই। ট্রিপ DO শিটে এর গেট পাস যুক্ত করুন, তারপর রিফ্রেশ করুন।',
    },

    cells: {
      company: '{challan} {model}-এর কোম্পানি',
      labour: '{challan} {model}-এর ভ্যান, টানা ও মজুরি',
      floorNo: '{challan} {model}-এর তলার সংখ্যা',
      floorAmount: '{challan} {model}-এর তলার টাকা',
      removeChallan: 'চালান {challan} লেবার বিল থেকে সরান',
      removeLine: '{challan} {model} লেবার বিল থেকে সরান',
      removeModel: '{model} লেবার বিল থেকে সরান',
      challanLabel: 'চালান {challan}',
      lineLabel: '{challan} · {model}',
      theseRows: 'এই সারিগুলো',
    },

    stats: {
      bills: 'লেবার বিল',
      drafts: 'খসড়া',
      finalized: 'চূড়ান্ত',
      charged: 'মজুরি বাবদ চার্জ',
      unpriced: 'অঙ্ক ছাড়া সারি',
      challans: 'চালান',
      rows: 'সারি',
      pcs: 'পিস',
      labour: 'ভ্যান/টানা/মজুরি',
      floor: 'তলা',
      rowsAndChallans: '{rows} · {challans}',
      rowCount: { one: '{n}টি সারি', other: '{n}টি সারি' },
      challanCount: { one: '{n}টি চালান', other: '{n}টি চালান' },
      pcsCount: { one: '{n} পিস', other: '{n} পিস' },
      sectionCount: { one: '{n}টি অংশ', other: '{n}টি অংশ' },
      billCount: { one: '{n}টি লেবার বিল', other: '{n}টি লেবার বিল' },
      acrossCsds: {
        one: '{period}-এ {n}টি CSD জুড়ে',
        other: '{period}-এ {n}টি CSD জুড়ে',
      },
      sections: { one: '{n}টি CSD', other: '{n}টি CSD' },
      sectionSummary: '{rows} · {challans} · {pcs}',
      sectionSummaryLong: '{rows} · {challans} · {pcs} · {labour} মজুরি · {floor} তলা',
      sheetSummary: '{rows} · {challans} · {sections}',
      labourAndFloor: '{labour} মজুরি · {floor} তলা',
      blank: '{n}টি ফাঁকা',
      updated: 'হালনাগাদ {when}',
      updatedBy: '{name} · হালনাগাদ {when}',
      summaryFiltered: '{bills} · {amount} এই ফিল্টারে মিলেছে',
      summaryTotal: '{bills} · {amount} সব মিলিয়ে',
      pcsHandled: '{n} পিস হ্যান্ডল হয়েছে',
      stillPreparing: 'এখনও তৈরি হচ্ছে',
      nothingTyped: 'কিছু লেখা হয়নি, তাই কিছু চার্জও হয়নি',
      signedOff: 'অনুমোদিত ও পাঠানো হয়েছে',
      unpricedNote: {
        one: '{n}টি সারিতে এখনও কোনো অঙ্ক নেই, তাই সেটি কিছুই যোগ করছে না',
        other: '{n}টি সারিতে এখনও কোনো অঙ্ক নেই, তাই সেগুলো কিছুই যোগ করছে না',
      },
    },

    toolbar: {
      searchAria: 'নম্বর, কোম্পানি বা নোট দিয়ে লেবার বিল খুঁজুন',
      statusAria: 'লেবার বিলের অবস্থা',
      monthAria: 'বিলিং মাস',
      yearAria: 'বিলিং বছর',
      yearGroupAria: 'বছর',
      anyMonth: 'যেকোনো মাস',
      anyYear: 'যেকোনো বছর',
      all: 'সব',
      drafts: 'খসড়া',
      finalized: 'চূড়ান্ত',
      companiesAria: 'রেকর্ডে থাকা কোম্পানি',
      scanAria: 'চালান নম্বর বা SL',
      scanPlaceholder: 'LBTS-CH-2026-000067',
    },

    list: {
      loading: 'লেবার বিল লোড হচ্ছে',
      loadFailed: 'লেবার বিল লোড করা যায়নি',
      retrying: 'আবার চেষ্টা করা হচ্ছে…',
      noMatches: 'কোনো লেবার বিল মেলেনি',
      empty: 'এখনও কোনো লেবার বিল নেই',
      noMatchesHint: 'বর্তমান খোঁজ, অবস্থা, CSD, মাস বা বছরের সঙ্গে কোনো লেবার বিল মেলেনি।',
      openFirst: 'প্রথম লেবার বিলটি খুলুন',
      emptyHint:
        'মাসটি বেছে নিন, তারপর চালানগুলো স্ক্যান করে ঢোকান। প্রতিটি মডেল নিজের সারি পায়, এবং শিট নিজেই প্রতিটিকে তার নিজের CSD-র নিচে সাজিয়ে দেয়।',
    },

    details: {
      loading: 'লেবার বিলটি লোড হচ্ছে',
      openFailed: 'এই লেবার বিলটি খোলা যায়নি',
      noRows: 'এই লেবার বিলে এখনও কিছু নেই',
      noRowsHint: 'এই লেবার বিলে এখনও কেউ কোনো চালান স্ক্যান করে ঢোকাননি।',
      scanHint:
        'একটি চালানের বারকোড স্ক্যান করুন — এই পৃষ্ঠার যেকোনো জায়গায়, আগে ক্লিক করার দরকার নেই। এর প্রতিটি মডেল নিজের সারি পায়, এবং শিট নিজেই প্রতিটিকে তার নিজের CSD-র নিচে সাজিয়ে দেয়।',
      scanAnywhere:
        'এই পৃষ্ঠার যেকোনো জায়গায় স্ক্যান করুন — আগে ক্লিক করার দরকার নেই। চালানের প্রতিটি মডেল নিজের সারি পায়, এবং প্রতিটি নিজের CSD-র নিচে নিজেই বসে যায়।',
      sheetHint:
        'এক্সেল ফাইল যা বহন করে ঠিক তাই — প্রতি CSD-তে একটি অংশ, প্রতি চালানে একটি SL, প্রতি মডেলে একটি সারি। রঙিন ঘরগুলো আপনার লেখার জন্য; Enter সংরক্ষণ করে, Escape আগের অবস্থায় ফিরিয়ে দেয়।',
      sheetHintReadOnly:
        'এক্সেল ফাইল যা বহন করে ঠিক তাই — প্রতি CSD-তে একটি অংশ, প্রতি চালানে একটি SL, প্রতি মডেলে একটি সারি।',
      driftTitle: 'এই সারিগুলো স্ক্যান করার পর ট্রিপ DO শিট বদলে গেছে',
      driftChanged: { one: '{n}টি সারি বদলে গেছে', other: '{n}টি সারি বদলে গেছে' },
      driftMissing: {
        one: '{n}টি সারি আর শিটে নেই',
        other: '{n}টি সারি আর শিটে নেই',
      },
      driftBoth: '{changed} এবং {missing}',
      driftSentence: '{summary}। {hint}',
      scanTitle: 'মডেলগুলো যোগ করতে একটি চালান স্ক্যান করুন',
      driftHint:
        'শিটটি আবার পড়তে রিফ্রেশ করুন — আপনার লেখা প্রতিটি অঙ্ক থেকে যাবে, যে সারিগুলো আর নেই সেগুলো সরে যাবে, এবং যে সারি সবে তার CSD জেনেছে সেটি ওই অংশে চলে যাবে। না মেলা পর্যন্ত লেবার বিল চূড়ান্ত করা যাবে না।',
      finalizedHint:
        'এই বিলটি চূড়ান্ত, তাই এটি যা চার্জ করেছে তাই ধরে রাখে। হালনাগাদ করতে হলে আবার খুলুন।',
      refreshing: 'রিফ্রেশ হচ্ছে…',
      refresh: 'ট্রিপ DO থেকে রিফ্রেশ করুন',
      building: 'তৈরি হচ্ছে…',
      downloadExcel: 'এক্সেল ডাউনলোড করুন',
      removeRow: 'সরান',
      readingChallan: 'ওই চালানটি পড়া হচ্ছে…',
      readingBack: 'কী ফিরে এসেছে তা পড়া হচ্ছে…',
      goneAria: 'ট্রিপ DO শিটে আর নেই — রিফ্রেশ করলে এটি সরে যাবে',
      changedAria: 'স্ক্যান করার পর ট্রিপ DO শিটে বদলে গেছে — আবার পড়তে রিফ্রেশ করুন',
      pendingHint:
        'এই সারিগুলোর এখনও কোনো ট্রিপ DO নেই, তাই কোন CSD-র অধীনে এগুলো পড়ে তা কিছুই বলছে না। ট্রিপ DO শিটে সেটি বসিয়ে দিন, প্রতিটি নিজে থেকেই নিজের অংশে চলে যাবে — এখানে লেখা অঙ্কগুলো সঙ্গে নিয়ে।',
      pendingHintShort:
        'এখনও কোনো ট্রিপ DO নেই, তাই কোন CSD-র অধীনে এগুলো পড়ে তা কিছুই বলছে না। ট্রিপ DO শিটে সেটি বসিয়ে দিন, প্রতিটি নিজে থেকেই নিজের অংশে চলে যাবে — এখানে লেখা অঙ্কগুলো সঙ্গে নিয়ে।',
      opened: '{when} খোলা হয়েছে',
      openedBy: '{when} {name} খুলেছেন',
      finalizedOn: '{when} চূড়ান্ত হয়েছে',
      finalizedOnBy: '{when} {name} চূড়ান্ত করেছেন',
      reopenedOn: '{when} আবার খোলা হয়েছে',
      reopenedOnBy: '{when} {name} আবার খুলেছেন',
    },

    menu: {
      moreAria: '{bill}-এর আরও কাজ',
      edit: 'মাস, কোম্পানি বা নোট সম্পাদনা',
      refresh: 'ট্রিপ DO শিট থেকে রিফ্রেশ করুন',
      finalize: 'লেবার বিল চূড়ান্ত করুন',
      reopen: 'খসড়া হিসেবে আবার খুলুন',
      delete: 'লেবার বিল মুছে ফেলুন',
    },

    copies: {
      title: '{bill}-এর স্বাক্ষরিত কপি',
      count: { one: '{n}টি স্বাক্ষরিত কপি', other: '{n}টি স্বাক্ষরিত কপি' },
      summary: '{period}-এ {challans}-এর মধ্যে {withCopy}টির জন্য {copies}।',
      summaryWaiting:
        '{period}-এ {challans}-এর মধ্যে {withCopy}টির জন্য {copies} — {waiting}টি এখনও অপেক্ষমাণ, এবং ফাইলটি সেগুলো বাদ দিয়েই তৈরি হয়।',
      overMax:
        'একটি ফাইলে সর্বোচ্চ {max}টি রাখা যায়, {copies} তার বেশি — প্রতিটি কপি মেমোরিতে জোড়া হয়। বরং এক CSD-র অংশ ধরে ধরে প্রিন্ট করুন, বিলগুলো তো ওভাবেই যায়।',
      nothingToPrint: 'এই বিলে এখনও কিছু স্ক্যান করা হয়নি, তাই প্রিন্ট করার মতো কোনো কাগজ নেই।',
      collecting: 'সংগ্রহ করা হচ্ছে…',
      print: 'প্রিন্ট',
      printAll: 'সব প্রিন্ট করুন',
      downloadAll: 'সব ডাউনলোড করুন',
      noneYet: {
        one: 'এর {n}টি চালানের জন্য এখনও কোনো স্বাক্ষরিত কপি নেই',
        other: 'এর {n}টি চালানের কোনোটিরই এখনও স্বাক্ষরিত কপি নেই',
      },
      sectionSummary: '{copies} · {challans}-এর মধ্যে {withCopy}টি',
      sectionSummaryWaiting: '{copies} · {challans}-এর মধ্যে {withCopy}টি · {waiting}টি অপেক্ষমাণ',
      downloadAria: '{section}-এর স্বাক্ষরিত কপিগুলো ডাউনলোড করুন',
      printAria: '{section}-এর স্বাক্ষরিত কপিগুলো প্রিন্ট করুন',
      rowAria: 'চালান {challan}-এর স্বাক্ষরিত কপি',
      rowNoneAria: '{label}: এখনও নেই',
      rowOneTitle: '{label} · {trip}',
      rowTripsAria: '{label}: {n}টি ট্রিপ',
      rowTripsTitle: '{n}টি স্বাক্ষরিত কপি — এই চালানটি একাধিক ট্রিপে গিয়েছিল',
      wentOutOn: '{challan} {n}টি ট্রিপে গিয়েছিল',
      collectingToast: 'স্বাক্ষরিত কপিগুলো সংগ্রহ করা হচ্ছে…',
      printed: 'স্বাক্ষরিত কপিগুলো প্রিন্টারে পাঠানো হয়েছে',
      downloaded: 'স্বাক্ষরিত কপিগুলো ডাউনলোড হয়েছে',
      notBack: 'এই ডেলিভারির স্বাক্ষরিত কপি এখনও ফেরত আসেনি।',
      declaredLost: 'এই ডেলিভারির স্বাক্ষরিত কপি হারিয়ে গেছে বলে জানানো হয়েছে।',
      allReturned: 'এই চালানের সবকিছুই ফেরত এসেছে, তাই কেউ কিছুর জন্য স্বাক্ষর করেননি।',
      noTrip: 'এই চালানটি এখনও কোনো ট্রিপে নেই, তাই প্রিন্ট করার মতো কোনো স্বাক্ষরিত কপি নেই।',
    },

    form: {
      openTitle: 'একটি লেবার বিল খুলুন',
      editTitle: '{bill} সম্পাদনা করুন',
      editDescription: 'বিলিং মাস, কোম্পানি বা নোট ঠিক করুন। বিলের নম্বর একই থাকবে।',
      billingMonth: 'বিলিং মাস',
      company: 'কোম্পানি',
      companyHint:
        'শিটের ইউনিট কলামে যা বসবে। স্ক্যান করার সঙ্গে সঙ্গে এটি প্রতিটি সারিতে বসে যায় এবং সেখানে সম্পাদনাযোগ্যই থাকে; ফাঁকা রাখলে সারিটি তার নিজের গেট পাস থেকে ইউনিট নিয়ে নেয়।',
      openBill: 'লেবার বিল খুলুন',
    },

    confirm: {
      finalizeTitle: '{bill} চূড়ান্ত করবেন?',
      finalize: 'লেবার বিল চূড়ান্ত করুন',
      finalizeBody:
        '{sections} {rows}-এর জন্য {amount} — {labour} ভ্যান/টানা/মজুরি এবং {floor} তলা। চূড়ান্ত হয়ে গেলে কোনো অ্যাডমিন বা ম্যানেজার আবার না খোলা পর্যন্ত চালান স্ক্যান করা বা অঙ্ক লেখা যাবে না।',
      finalizeUnpriced: {
        one: '{n}টি সারিতে কোনো অঙ্কই নেই, তাই প্রতিটির খরচ না লেখা পর্যন্ত এটি গ্রহণ করা হবে না — যে ডেলিভারিতে কোনো সাহায্য লাগেনি সেখানে ০ লিখুন।',
        other:
          '{n}টি সারিতে কোনো অঙ্কই নেই, তাই প্রতিটির খরচ না লেখা পর্যন্ত এটি গ্রহণ করা হবে না — যে ডেলিভারিতে কোনো সাহায্য লাগেনি সেখানে ০ লিখুন।',
      },
      finalizePending: {
        one: '{n}টি সারি এখনও ট্রিপ DO-র অপেক্ষায়, তাই সেটি কোনো CSD-র অধীনে পড়ে না এবং কারও নামেই চার্জ হবে না — মিলিয়ে দেওয়া বা সরিয়ে দেওয়া না হওয়া পর্যন্ত এটি গ্রহণ করা হবে না।',
        other:
          '{n}টি সারি এখনও ট্রিপ DO-র অপেক্ষায়, তাই সেগুলো কোনো CSD-র অধীনে পড়ে না এবং কারও নামেই চার্জ হবে না — মিলিয়ে দেওয়া বা সরিয়ে দেওয়া না হওয়া পর্যন্ত এটি গ্রহণ করা হবে না।',
      },
      reopenTitle: '{bill} আবার খুলবেন?',
      reopen: 'খসড়া হিসেবে আবার খুলুন',
      reopenDescription:
        'এটি আবার খসড়া হয়ে যাবে, তাই চালান স্ক্যান করা ও অঙ্ক সংশোধন করা যাবে। চূড়ান্ত ফাইলটি আগেই পাঠানো হয়ে থাকলে, যিনি পেয়েছেন তাঁর সংশোধিত কপিটি লাগবে।',
      deleteTitle: '{bill} মুছে ফেলবেন?',
      deleteBill: 'লেবার বিল মুছে ফেলুন',
      deleteDescription: {
        one: 'এর {n}টি সারি এবং তাতে লেখা অঙ্ক চিরতরে চলে যাবে। ট্রিপ DO শিট, চালান বা গেট পাসের কিছুই বদলায় না — লেবার বিল ওগুলোর কোনোটিই দাবি করে না। বিলের নম্বরটি আর ব্যবহার করা হবে না।',
        other:
          'এর {n}টি সারি এবং তাতে লেখা অঙ্কগুলো চিরতরে চলে যাবে। ট্রিপ DO শিট, চালান বা গেট পাসের কিছুই বদলায় না — লেবার বিল ওগুলোর কোনোটিই দাবি করে না। বিলের নম্বরটি আর ব্যবহার করা হবে না।',
      },
      removeTitle: '{label} লেবার বিল থেকে সরাবেন?',
      takeRowOff: 'সারিটি সরান',
      takeRowsOff: '{count}টি সারি সরান',
      removeDescription: {
        one: '{n}টি সারি চলে যাবে, এবং তাতে লেখা যেকোনো অঙ্কও সঙ্গে যাবে। চালানটি আবার স্ক্যান করলে সারিটি ফাঁকা অবস্থায় ফিরে আসবে।',
        other:
          '{n}টি সারি চলে যাবে, এবং তাতে লেখা যেকোনো অঙ্কও সঙ্গে যাবে। চালানটি আবার স্ক্যান করলে সারিগুলো ফাঁকা অবস্থায় ফিরে আসবে।',
      },
      nothingChanges: 'ট্রিপ DO শিটে কিছুই বদলায় না।',
    },

    actions: {
      deleting: 'মুছে ফেলা হচ্ছে…',
      finalizing: 'চূড়ান্ত করা হচ্ছে…',
      reopening: 'আবার খোলা হচ্ছে…',
      takingOff: 'সরানো হচ্ছে…',
      opened: '{bill} খোলা হয়েছে',
      updated: '{bill} হালনাগাদ হয়েছে',
      deleted: '{bill} মুছে ফেলা হয়েছে',
      deletedNote: {
        one: '{n}টি সারি চলে গেছে। ট্রিপ DO শিটে কিছুই বদলায় না।',
        other: '{n}টি সারি চলে গেছে। ট্রিপ DO শিটে কিছুই বদলায় না।',
      },
      finalized: '{bill} চূড়ান্ত হয়েছে',
      reopened: '{bill} আবার খোলা হয়েছে',
      reopenedNote: 'এটি আবার খসড়া হয়ে গেছে।',
      takenOff: {
        one: '{bill} থেকে {n}টি সারি সরানো হয়েছে',
        other: '{bill} থেকে {n}টি সারি সরানো হয়েছে',
      },
      alreadyMatches: '{bill} ট্রিপ DO শিটের সঙ্গে আগে থেকেই মিলে আছে',
      refreshed: '{bill} ট্রিপ DO শিট থেকে রিফ্রেশ হয়েছে',
      refreshedNote: '{updated}টি আবার পড়া হয়েছে · {removed}টি সরানো হয়েছে · প্রতিটি অঙ্ক রাখা হয়েছে',
      buildingToast: 'লেবার বিল তৈরি হচ্ছে…',
      downloaded: 'লেবার বিল ডাউনলোড হয়েছে',
    },

    scan: {
      alreadyOn: '{challan} আগে থেকেই {bill}-এ আছে',
      added: { one: '{challan}: {n}টি সারি যোগ হয়েছে', other: '{challan}: {n}টি সারি যোগ হয়েছে' },
      skipped: { one: '{n}টি আগে থেকেই শিটে আছে', other: '{n}টি আগে থেকেই শিটে আছে' },
      filedUnder: '{csds}-এর অধীনে রাখা হয়েছে',
      waiting: '{models} ট্রিপ DO-র অপেক্ষায়',
    },
  },

  challan: {
    title: 'চালান',
    listAria: 'চালানের রেকর্ড',
    recordsHeading: 'চালানের রেকর্ড',
    listSubtitle:
      'কর্পোরেট PDF থেকে ফাইল করা প্রতিটি চালান — সিরিয়াল, বারকোডওয়ালা পিঠপাতা এবং ডকুমেন্ট।',
    locationRunPosition: '{total}-এর মধ্যে {position}',
    locationSubtitle:
      '{challan} · SL {sl} · চালানের কিছুই বা সংরক্ষিত ডকুমেন্টের কিছুই বদলায় না, তাই আবার প্রিন্ট করার মতো কিছুই কখনও থাকে না।',
    sourcePdfs: 'সোর্স PDF',
    sourcePdfsDescription:
      'যে কর্পোরেট PDF থেকে চালান জমা দেওয়া হয়েছে তার প্রতিটি, এবং প্রতিটিতে কাজ কতদূর এগিয়েছে। ফাইলগুলো নিজে কখনও সংরক্ষণ করা হয় না — একটি ফাইল থেকে প্রথম চালান জমা দিলেই ব্যাচটি তৈরি হয়, এবং এটিই তার একমাত্র টিকে থাকা চিহ্ন।',
    batchesAria: 'সোর্স PDF ব্যাচ',
    openChallanPdf: 'একটি চালান PDF খুলুন',
    allChallans: 'সব চালান',
    backToList: 'চালানে ফিরুন',
    backToChallan: 'চালানে ফিরুন',
    notFound: 'চালান পাওয়া যায়নি',
    notFoundHint: 'এটি মুছে ফেলা হয়ে থাকতে পারে, অথবা আপনার এতে প্রবেশাধিকার নাও থাকতে পারে।',
    somethingWrong: 'কিছু একটা ভুল হয়েছে।',
    loading: 'চালান লোড হচ্ছে',
    unknown: 'অজানা',

    statuses: {
      Submitted: {
        label: 'জমা দেওয়া',
        description: 'জমা হয়েছে, নম্বর পেয়েছে এবং বারকোড পিঠপাতাসহ সংরক্ষিত।',
      },
      Amended: {
        label: 'সংশোধিত',
        description: 'জমা দেওয়ার পর সংশোধন হয়েছে — হাতে, অথবা যে ট্রিপ এটি বহন করেছিল তার মাধ্যমে।',
      },
      unknown: { label: 'অজানা', description: 'অচেনা অবস্থা' },
    },

    dispatchStatuses: {
      Pending: { label: 'পাঠানো হয়নি', description: 'জমা হয়েছে, এখনও কোনো ট্রিপে নেই।' },
      Partial: {
        label: 'আংশিক পাঠানো',
        description: 'কয়েকটি ট্রিপে ভাগ হয়েছে, কিছু এখনও যাওয়ার বাকি।',
      },
      Dispatched: {
        label: 'পাঠানো হয়েছে',
        description: 'এর সবকিছুই গেট পেরিয়ে গেছে; স্বাক্ষরিত কপি এখনও ফেরেনি।',
      },
      Delivered: {
        label: 'ডেলিভারি হয়েছে',
        description: 'এটি বহন করা প্রতিটি ট্রিপেরই স্বাক্ষরিত কপি জমা হয়েছে।',
      },
      Returned: {
        label: 'ফেরত',
        description: 'গিয়ে আবার ফিরে এসেছে; অন্য ট্রিপের অপেক্ষায় ডিপোতে আছে।',
      },
    },

    dispatch: {
      ofTotal: '{total}-এর মধ্যে {sent}',
      sentSlash: '{sent}/{total}',
      progressTitle: '{total}-এর মধ্যে {sent} পাঠানো হয়েছে। {description}',
      backAtDepot: '{n} ডিপোতে ফেরত আছে',
      resent: '{n} আবার পাঠানো হয়েছে',
      returnTitle: 'ট্রিপ থেকে {returned} ফেরত এসেছে; {resent} আবার বেরিয়েছে।',
    },

    batchStatuses: {
      Processing: {
        label: 'চলছে',
        description: 'এই সোর্স PDF-এর কিছু পৃষ্ঠা এখনও চালান হিসেবে জমা হয়নি।',
      },
      Completed: {
        label: 'সম্পন্ন',
        description: 'সোর্স PDF-এর প্রতিটি পৃষ্ঠাই কোনো জমা দেওয়া চালানের অংশ।',
      },
    },

    pages: {
      range: { one: 'পৃষ্ঠা {range}', other: 'পৃষ্ঠা {range}' },
      none: 'কোনোটিই নয়',
      listJoin: '{head} এবং {last}',
      slWith: 'SL {sl}',
      pageN: 'পৃষ্ঠা {n}',
    },

    backlog: {
      heading: 'নজর দেওয়া দরকার',
      blankAmount: 'অঙ্ক ফাঁকা',
      blankAmountHint:
        'যে চালানে কিছুই চার্জ হয়নি। হয় লোকেশন বসানো নেই, নয়তো পণ্যগুলো রেট কার্ডে নেই।',
      partlyCharged: 'আংশিক চার্জ',
      partlyChargedHint:
        'যে চালানের কিছু পণ্যের লাইনে চার্জ হয়েছে, সবগুলোতে নয় — দেখানো অঙ্কটি পুরো চার্জের চেয়ে কম।',
      locationPending: 'লোকেশন অপেক্ষমাণ',
      locationPendingHint:
        'যে চালানের জেলা ও থানা এখনও নির্ধারিত হয়নি। একটি বসালেই এর লাইনগুলোর দামও বসে যায়।',
      unconfirmedMatch: 'অনিশ্চিত মিল',
      unconfirmedMatchHint:
        'সিস্টেম যে লোকেশনগুলো অনুমান করেছে কিন্তু কেউ নিশ্চিত করেনি। একটি খুলে সম্মতি দিলেই সেটি এই তালিকা থেকে চলে যায়।',
      notDispatched: 'পাঠানো হয়নি',
      notDispatchedHint: 'যে চালান জমা হয়েছে কিন্তু এখনও কোনো ট্রিপে নেই — পণ্য গেট পেরোয়নি।',
      partlySent: 'আংশিক পাঠানো',
      partlySentHint:
        'যে চালান কয়েকটি ট্রিপে ভাগ হয়েছে এবং কিছু এখনও যাওয়ার বাকি। একনজরে এগুলো পাঠানো মনে হয়, তাই আলাদা করে গোনা হয়।',
      returnedAtDepot: 'ডিপোতে ফেরত',
      returnedAtDepotHint:
        'যে পণ্য লরি থেকে ফিরে এসেছে এবং আর বেরোয়নি — সেগুলো তাকে আছে, অন্য ট্রিপের অপেক্ষায়।',
    },

    filters: {
      searchPlaceholder: 'চালান নম্বর, SL, গ্রাহক, ঠিকানা, পণ্য খুঁজুন',
      searchAria: 'চালান খুঁজুন',
      statusAria: 'অবস্থা অনুযায়ী ফিল্টার',
      anyStatus: 'যেকোনো অবস্থা',
      locationAria: 'লোকেশন অনুযায়ী ফিল্টার',
      anyLocation: 'যেকোনো লোকেশন',
      locationSet: 'লোকেশন বসানো',
      locationPending: 'লোকেশন অপেক্ষমাণ',
      unconfirmedMatch: 'অনিশ্চিত মিল',
      dateAria: 'জমা দেওয়ার তারিখ',
      amount: 'অঙ্ক',
      anyAmount: 'যেকোনো অঙ্ক',
      blankAmount: 'অঙ্ক ফাঁকা',
      partlyCharged: 'আংশিক চার্জ',
      dispatch: 'পাঠানো',
      anyDispatch: 'যেকোনো অবস্থা',
      notDispatched: 'পাঠানো হয়নি',
      partlySent: 'আংশিক পাঠানো',
      sent: 'পাঠানো হয়েছে',
      delivered: 'ডেলিভারি হয়েছে',
      returnedAtDepot: 'ডিপোতে ফেরত',
      bill: 'বিল',
      filedFrom: 'যে তারিখ থেকে',
      filedTo: 'যে তারিখ পর্যন্ত',
      customer: 'গ্রাহক',
      district: 'জেলা',
      product: 'পণ্য',
      model: 'মডেল',
      zonePo: 'জোন / PO',
      filedBy: 'যিনি জমা দিয়েছেন',
      onlyMine: 'শুধু আমার',
      everyone: 'সবার',
      sourceFilePlaceholder: 'সোর্স ফাইলের নাম',
      sourceSearchAria: 'সোর্স PDF খুঁজুন',
    },

    list: {
      loading: 'চালান লোড হচ্ছে',
      summaryFiltered: '{challans} এই ফিল্টারে মিলেছে',
      summaryTotal: 'রেকর্ডে {challans}',
      loadFailed: 'চালান লোড করা যায়নি',
      retrying: 'আবার চেষ্টা করা হচ্ছে…',
      noneFound: 'কোনো চালান পাওয়া যায়নি',
      noneYet: 'এখনও কোনো চালান নেই',
      filteredHint: 'আপনার বর্তমান ফিল্টারের সঙ্গে কোনো চালান রেকর্ড মেলেনি।',
      emptyHint:
        'কর্পোরেট অফিস থেকে আসা চালান PDF-টি খুলুন, প্রতিটি চালান চিহ্নিত করুন, এবং একটি একটি করে জমা দিন।',
      challanAria: 'চালান {challan}',
      thanaDistrict: 'থানা: {thana} · জেলা: {district}',
      unpricedNote:
        'এর মধ্যে {n}টি চালানে এমন একটি লাইন আছে যা রেট কার্ডে নেই, তাই এই মোট অঙ্কে সেগুলো ধরা হয়নি।',
    },

    stats: {
      today: 'আজ জমা হয়েছে',
      todayHint: 'মধ্যরাত থেকে জমা',
      total: 'রেকর্ডে থাকা চালান',
      totalHint: 'এখন পর্যন্ত জমা হওয়া প্রতিটি চালান',
      batches: 'চলমান ব্যাচ',
      batchesHint: 'যে সোর্স PDF-এ পৃষ্ঠা এখনও জমা হয়নি',
      quantity: 'মোট সংখ্যা',
      quantityHint: 'প্রতিটি চালান মিলিয়ে ইউনিট',
      loadFailed: 'চালানের সারসংক্ষেপ লোড করা যায়নি।',
      needsAttention: 'নজর দেওয়া দরকার',
      todayLabel: 'আজকের চালান',
    },

    goods: {
      product: 'পণ্য',
      model: 'মডেল',
      capacity: 'ক্যাপাসিটি',
      qty: 'সংখ্যা',
      rate: 'রেট',
      amount: 'টাকা',
      unpricedTitle: '{total}টি সারির মধ্যে {unpriced}টি এই লোকেশনের রেট কার্ডে নেই।',
      fromRateCard: 'রেট কার্ড থেকে',
      loadingDocument: 'চালানের ডকুমেন্ট লোড হচ্ছে…',
      noLocationYet:
        'এখনও কিছু চার্জ হয়নি: রেট নির্ভর করে এটি কোথায় গেছে তার উপর, আর লোকেশন এখনও বসানো হয়নি। সেটি বসালেই প্রতিটি লাইনের দাম নিজে থেকে বসে যাবে।',
      notOnCard:
        'কিছুই চার্জ হয়নি: এই লোকেশনের জন্য রেট কার্ডে এর কোনো পণ্যই নেই। পণ্যের রেটে সেগুলো যোগ করে চালানটি সংশোধন করলেই দাম বসে যাবে।',
      partialTotal: 'এই মোটে {total}টি লাইনের মধ্যে {priced}টি ধরা হয়েছে। {unpriced} রেট কার্ডে নেই।',
      total: 'মোট',
      unpricedProducts: { one: '{n}টি পণ্য', other: '{n}টি পণ্য' },
    },

    details: {
      identifiers: 'পরিচিতি নম্বর',
      identifiersHint: 'এই চালান জমা দেওয়ার সময় LBTS যেগুলো বরাদ্দ করেছে।',
      slNumber: 'SL নম্বর',
      challanNumber: 'চালান নম্বর',
      barcodeNote:
        'পিঠপাতার বারকোডে চালান নম্বরটিই এনকোড করা থাকে, তাই স্ক্যানার আর কাগজ পড়া মানুষ কখনও দুটি আলাদা উত্তর পেতে পারে না।',
      customerAndDelivery: 'গ্রাহক ও ডেলিভারি',
      asTranscribed: 'চালান থেকে যেমন লেখা হয়েছে।',
      customer: 'গ্রাহক',
      deliveryAddress: 'ডেলিভারির ঠিকানা',
      thana: 'থানা',
      district: 'জেলা',
      location: 'লোকেশন',
      locationHint: 'লোকেশন মাস্টার তালিকার সঙ্গে মিলিয়ে দেখা। ঐচ্ছিক — এটি ছাড়াও চালান জমা হয়।',
      noLocation:
        'যা লেখা হয়েছে তা থেকে কোনো জেলা বা থানা নির্ধারণ করা যায়নি, তাই কিছুই রাখা হয়নি — অনুমানের বদলে ফাঁকাই রাখা হয়েছে। এখানে এটি বসালে চালানের লেখা বা তার প্রিন্ট করা ডকুমেন্ট বদলায় না।',
      setLocation: 'লোকেশন বসান',
      changeLocation: 'লোকেশন বদলান',
      checkLocation: 'লোকেশন দেখে নিন',
      contactAndReference: 'যোগাযোগ ও রেফারেন্স',
      contactHint: 'কাকে ফোন করতে হবে, এবং এটি কার বিপরীতে রাখা।',
      receiverMobile: 'গ্রহীতার মোবাইল',
      senderMobile: 'প্রেরকের মোবাইল',
      zonePo: 'জোন / PO',
      goods: 'পণ্য',
      goodsHint: 'এই চালান যা বহন করছে।',
      sourceAndDocument: 'সোর্স ও ডকুমেন্ট',
      sourceHint: 'এই পৃষ্ঠাগুলো কোথা থেকে এসেছে, এবং কী সংরক্ষিত আছে।',
      sourceFile: 'সোর্স ফাইল',
      pagesTaken: 'যে পৃষ্ঠাগুলো নেওয়া হয়েছে',
      storedDocument: 'সংরক্ষিত ডকুমেন্ট',
      generated: 'তৈরি',
      productLines: 'এই চালানে {n}টি পণ্যের লাইন আছে।',
      documentSize: '{pages} · {size}',
      resolvedAt: '{source} · {when}',
      resolvedByAt: '{source}, {name}-এর হাতে · {when}',
      editSubtitle: '{challan} · SL {sl} · পাশের পৃষ্ঠাগুলোর সঙ্গে প্রতিটি ঘর মিলিয়ে নিন।',
      saveAndRegenerate: 'সেভ করে আবার তৈরি করুন',

      notFound: 'চালান পাওয়া যায়নি',
      notFoundHint: 'এটি মুছে ফেলা হয়ে থাকতে পারে, বা আপনার এতে প্রবেশাধিকার না-ও থাকতে পারে।',
      backToChallans: 'চালান তালিকায় ফিরুন',
      backToChallan: 'চালানে ফিরুন',
      correctTitle: 'চালান সংশোধন',
      detailsAria: 'চালানের বিবরণ',
      storedDocumentAria: 'সংরক্ষিত চালান নথি',
      storedDocumentHeading: 'সংরক্ষিত নথি',
      storedDocumentHint: 'চালানের মূল পাতাগুলো। এগুলোর সাথে মিলিয়ে মানগুলো দেখে নিন।',
      storedNote:
        'সংরক্ষিত PDF-টিতে মূল চালানের পৃষ্ঠাগুলো ঠিক যেমন এসেছিল তেমনই আছে, তার পিছনে LBTS-এর তৈরি করা পিঠপাতা। সোর্স ফাইলটি নিজে কখনও আপলোড হয়নি।',
      openSourceBatch: 'সোর্স ব্যাচটি খুলুন',
      filing: 'জমা দেওয়া',
      filingHint: 'কে জমা দিয়েছেন, কে প্রিন্ট করেছেন, এবং কখন।',
      filedBy: 'যিনি জমা দিয়েছেন',
      filedAt: 'জমার সময়',
      printed: 'প্রিন্ট',
      notYet: 'এখনও নয়',
      correctedAt: 'সংশোধনের সময়',
      correctedBy: 'যিনি সংশোধন করেছেন',
      amendedNote:
        'জমা দেওয়ার পর এই চালানটি সংশোধন হয়েছে, এবং সেই অনুযায়ী এর ডকুমেন্ট আবার তৈরি হয়েছে। কারও কাছে ছাপা কপি থাকলে তাঁর নতুনটি লাগবে।',
      documentAria: 'চালানের ডকুমেন্ট',
      generatedDocument: 'তৈরি হওয়া চালান ডকুমেন্ট',
      generatedDocumentHint: 'মূল চালানের পৃষ্ঠা, তারপর বারকোডসহ LBTS-এর পিঠপাতা।',
      waitingForDocument: 'ডকুমেন্টের অপেক্ষায়',
      correct: 'সংশোধন',
      regenerates: 'সংরক্ষণ করলে ডকুমেন্টটি আবার তৈরি হবে।',
      regeneratesNote:
        'আপনি যা সেভ করবেন তা থেকে পিঠপাতাটি আবার আঁকা হয় এবং সংরক্ষিত PDF বদলে দেওয়া হয় — SL নম্বর, চালান নম্বর ও বারকোড একই থাকে। এর আগে ছাপা যেকোনো কপিতে পুরোনো তথ্যই থাকবে, তাই সেটি ছড়িয়ে গিয়ে থাকলে আবার প্রিন্ট করুন। পৃষ্ঠার সীমা ({file}-এর {range}) এখান থেকে বদলানো যায় না — সোর্স PDF কখনও সংরক্ষণ করা হয়নি।',
      filedLine: 'SL {sl} · {customer} · ফাইল {when}',
      filedLineBy: 'SL {sl} · {customer} · ফাইল {when}, {name}-এর হাতে',
      batchButton: 'ব্যাচ',
      loadFailed: 'ডকুমেন্টটি লোড করা যায়নি',
      printFailed: 'চালানের ডকুমেন্ট লোড করা যায়নি, তাই প্রিন্ট করার মতো কিছু নেই।',
    },

    entry: {
      customerAndDelivery: 'গ্রাহক ও ডেলিভারি',
      customerHint: 'পণ্য কার কাছে যাচ্ছে, এবং কোথায়।',
      contactAndReference: 'যোগাযোগ ও রেফারেন্স',
      contactHint: 'তাঁদের কীভাবে পাওয়া যাবে, এবং এই চালানটি কার বিপরীতে রাখা।',
      goods: 'পণ্য',
      goodsHint: 'এই চালানে কী আছে। এতে থাকা প্রতিটি পণ্যের জন্য একটি সারি যোগ করুন।',
      customerName: 'গ্রাহকের নাম',
      deliveryAddress: 'ডেলিভারির ঠিকানা',
      addressHint: 'বাড়ি, রাস্তা ও এলাকা ছাপা অবস্থায় ঠিক যেমন আছে। থানা ও জেলা নিচে।',
      thana: 'থানা',
      thanaHint: 'চালানে থাকলে ছাপা অবস্থায় ঠিক যেমন আছে।',
      district: 'জেলা',
      districtHint: 'চালানে না থাকলে ফাঁকা রাখুন।',
      receiverMobile: 'গ্রহীতার মোবাইল',
      senderMobile: 'প্রেরকের মোবাইল',
      zonePo: 'জোন / PO',
      zonePoHint: 'চালান যেভাবে ছাপে ঠিক সেভাবেই একটিই মান হিসেবে তুলুন।',
      receiverHint: '01712345678, বা +880 দিয়ে। স্থানীয় এগারো-অঙ্কের রূপে সংরক্ষিত হয়।',
      optional: 'ঐচ্ছিক',
      productIndex: 'পণ্য {n}',
      removeProduct: 'পণ্য {n} সরান',
      addProduct: 'আরেকটি পণ্য যোগ করুন',
      maxProducts: 'একটি চালানে এর বেশি পণ্য রাখা যায় না।',
      rowsTotal: '{rows} · মোট {total}',
      productLabel: 'পণ্য',
      modelLabel: 'মডেল',
      qtyLabel: 'সংখ্যা',
      carryFields: 'গ্রাহকের নাম এবং জোন / PO',
      sameAsLast: 'আগেরটির মতোই',
      carryBanner:
        '{source} থেকে {fields} তাদের ঘরের উপরে দেখানো হচ্ছে। এই চালানের সঙ্গে যেটি মেলে তার “{tick}” টিক দিন; টাইপ না করা পর্যন্ত দুটিই ফাঁকা থাকবে।',
      shortcutCtrl: 'Ctrl',
      shortcutEnter: 'Enter',
      shortcutHint: 'এই চালানটি জমা দেয়',
    },

    location: {
      heading: 'লোকেশন',
      optional: 'ঐচ্ছিক',
      autoFilled: 'উপরের থানা, জেলা বা ঠিকানা থেকে নিজে থেকেই বসে গেছে।',
      lookupFailed:
        'খোঁজটি চালানো যায়নি। চালানটি তবুও জমা দেওয়া যাবে; লোকেশন পরে বসানো যাবে।',
      notDetermined: 'এখনও নির্ধারিত হয়নি। এই চালানটি তবুও জমা দেওয়া যাবে।',
      checkAgain: 'আবার দেখুন',
      clear: 'মুছুন',
      close: 'বন্ধ করুন',
      choose: 'বাছুন',
      filesWithout:
        'এটি বসানো থাকুক বা না থাকুক, চালান জমা হয়। আপনি যে থানা ও জেলা লিখেছেন তা যেভাবেই হোক ঠিক তেমনই সংরক্ষিত থাকে।',
      transcribedAria: 'চালান যা বলছে',
      transcribedHeading: 'যেমন লেখা হয়েছে',
      transcribedHint:
        'চালান থেকে ঠিক যা লেখা হয়েছিল। কোনো লোকেশন এটি কখনও বদলায় না, এবং মিল যাচাই করা হয় এটির সঙ্গেই।',
      decidedAria: 'সিস্টেম যা ঠিক করেছে',
      unconfirmed:
        'এটি কেউ নিশ্চিত করেননি। লেখা থানা, জেলা ও ঠিকানার সঙ্গে মিলিয়ে দেখুন, তারপর নিশ্চিত করুন বা সংশোধন করুন।',
      chooseAria: 'লোকেশনটি বাছুন',
      changeOrConfirm: 'বদলান, অথবা যা আছে তা নিশ্চিত করুন',
      chooseHeading: 'লোকেশনটি বাছুন',
      masterHint:
        'জেলা ও থানা আসে মাস্টার তালিকা থেকে, এবং লোকেশনের ধরন সেই সারি থেকেই আসে — চালানের পাশে এটি কখনও লেখা হয় না।',
      clearLocation: 'লোকেশন মুছুন',
      confirmLocation: 'লোকেশন নিশ্চিত করুন',
      setTitle: 'লোকেশন বসান',
      checkTitle: 'লোকেশন দেখে নিন',
      districtThana: '{district} / {thana}',
      chosen: '— বেছে নেওয়া',
      fromMaster: '— মাস্টার লিস্ট থেকে',
      checking: 'লোকেশন মাস্টার লিস্ট দেখা হচ্ছে…',
      decidedBy: '{source}, {name}-এর হাতে · {when}',
      decidedConfidence: '{source} · {confidence} নিশ্চিত · {when}',
      decidedPlain: '{source} · {when}',
    },

    queue: {
      ariaLabel: 'এই PDF-এর চালান',
      heading: 'চালানের তালিকা',
      addChallan: 'চালান যোগ করুন',
      everyPageTaken: 'এই PDF-এর প্রতিটি পৃষ্ঠাই আগে থেকেই কোনো চালানের অংশ',
      inProgress: 'চলছে',
      notStarted: 'শুরু হয়নি',
      removeFromQueue: 'তালিকা থেকে চালান {n} সরান',
      challanN: 'চালান {n}',
      challan: 'চালান',
      filedWith: 'SL {sl} · {challan}',
      nextChallan: 'পরের চালান',
      addNext: 'পরের চালানটি যোগ করুন',
      fileThis: '{label} জমা দিন',
      everyPageFiled: 'এই PDF-এর প্রতিটি পৃষ্ঠাই জমা হয়ে গেছে। চালিয়ে যেতে একটি চালান যোগ করুন।',
      openDifferent: 'অন্য একটি PDF খুলুন',
      complete: 'সম্পন্ন',
      filedAria: 'চালান হিসেবে জমা হওয়া পৃষ্ঠা',
      pagesOf: '{assigned}/{total} পৃষ্ঠা',
      notFiled: '{n}টি ফাইল হয়নি',
      pendingWarning: {
        one: '{n}টি চালান এখনও কেবল এই ব্রাউজারেই আছে। প্রতিটি ফাইল না করা পর্যন্ত কিছুই সেভ হয় না, আর এই পাতা বন্ধ করলে যা ফাইল হয়নি তা হারিয়ে যাবে।',
        other: '{n}টি চালান এখনও কেবল এই ব্রাউজারেই আছে। প্রতিটি ফাইল না করা পর্যন্ত কিছুই সেভ হয় না, আর এই পাতা বন্ধ করলে যা ফাইল হয়নি তা হারিয়ে যাবে।',
      },
    },

    batch: {
      actionsAria: 'ব্যাচের কাজ',
      summaryFiltered: '{pdfs} এই ফিল্টারে মিলেছে',
      summaryTotal: '{pdfs} প্রক্রিয়া করা হয়েছে',
      summaryAria: 'ব্যাচের সারসংক্ষেপ',
      notFound: 'ব্যাচ পাওয়া যায়নি',
      notFoundHint:
        'এর শেষ চালানটি মুছে ফেলার সময় এটি সরে গিয়ে থাকতে পারে, অথবা আপনার এতে প্রবেশাধিকার নাও থাকতে পারে।',
      loading: 'ব্যাচ লোড হচ্ছে',
      loadingWorkspace: 'ব্যাচটি লোড হচ্ছে',
      challansAria: 'এই ব্যাচের চালান',
      challansHeading: 'এই PDF-এর চালান',
      challansHint: 'সোর্স ফাইলে যে ক্রমে ছিল সেই ক্রমে, জমা দেওয়ার ক্রমে নয়।',
      allFiled: 'এই PDF-এর {challans}ই জমা হয়ে গেছে',
      notFinished: 'এই PDF-টি এখনও শেষ হয়নি',
      openBatch: 'ব্যাচটি খুলুন',
      assembling: 'জোড়া দেওয়া হচ্ছে…',
      printAll: 'সব চালান প্রিন্ট করুন',
      downloadBatch: 'ব্যাচ PDF ডাউনলোড করুন',
      continueEntering: 'লেখা চালিয়ে যান',
      startedAt: '{when} শুরু',
      startedBy: 'শুরু {when}, {name}-এর হাতে',
      accountedOf: '{total} পৃষ্ঠার মধ্যে {assigned}টির হিসাব হয়েছে',
      filedAndAccounted: '{challans} ফাইল করা · {total} পৃষ্ঠার মধ্যে {assigned}টির হিসাব হয়েছে',
      notAccounted: {
        one: '{n}টি পৃষ্ঠার হিসাব হয়নি — {ranges}।',
        other: '{n}টি পৃষ্ঠার হিসাব হয়নি — {ranges}।',
      },
      notAccountedNote:
        'প্রতিটি পৃষ্ঠা চালান হিসেবে ফাইল না হওয়া বা ফাঁকা হিসেবে চিহ্নিত না হওয়া পর্যন্ত ব্যাচটি এক ডকুমেন্ট হিসেবে প্রিন্ট বা ডাউনলোড করা যাবে না, কারণ তাহলে ফাইলটিতে সেগুলো না থেকেও কিছুই তা বলবে না। সোর্স PDF কখনও রাখা হয়নি, তাই সেগুলো ফাইল করতে ফাইলটি আবার খুলতে হবে: “{action}” সেই ফাইলটিই চায় এবং এই ব্যাচেই কাজ চালিয়ে যায়।',
      markedBlankNote: '{ranges} — চালান হিসেবে ফাইল হয়নি, ব্যাচ ডকুমেন্টেও নেই।',
      openSameAgainNote:
        'এটি কখনও সংরক্ষণ করা হয়নি, তাই ফিরে যাওয়ার এটাই একমাত্র পথ — আর এখান থেকে যে চালানগুলো ফাইল করবেন সেগুলো নতুন ব্যাচ না বানিয়ে এই ব্যাচেই যোগ হবে।',
      stillToFileLine:
        'এখনও ফাইল করা বাকি: {ranges}। যে পৃষ্ঠাগুলো ফাইল হয়ে গেছে সেগুলো কিউতে চিহ্নিত থাকে এবং দুবার নেওয়া যায় না।',
      accounted:
        'এই PDF-এর প্রতিটি পৃষ্ঠারই হিসাব আছে। ব্যাচ ডকুমেন্টটি হলো সোর্সের ক্রমে প্রতিটি চালানের পৃষ্ঠা, তার পিছনে তার পিঠপাতা।',
      continueHint: 'ওই একই ফাইলটি আবার চায় — পৃষ্ঠার সংখ্যা মিলতে হবে।',
      notChallans: 'চালানই নয়?',
      markBlank: '{range} ফাঁকা হিসেবে চিহ্নিত করুন',
      markedBlank: 'ফাঁকা চিহ্নিত:',
      notPrintedYet: 'এখনও প্রিন্ট হয়নি।',
      printingMarksNote:
        'ব্যাচ প্রিন্ট করলে প্রতিটি চালান এক ডকুমেন্ট হিসেবে প্রিন্টারে যায় এবং এখানে চিহ্নিত হয়ে যায়।',
      allMarkedPrinted: {
        one: '{n}টি চালানই প্রিন্ট হিসেবে চিহ্নিত।',
        other: '{n}টি চালানই প্রিন্ট হিসেবে চিহ্নিত।',
      },
      reprintNote: 'আবার প্রিন্ট করতে কখনও বাধা নেই — কপি দরকার হলে আবার প্রিন্ট করুন।',
      printedOf: '{total}-এর মধ্যে {printed}টি প্রিন্ট হয়েছে।',
      printedOfShort: '{printed}/{total} প্রিন্ট',
      filedCount: '{n}টি ফাইল করা',
      pagesOf: '{assigned}/{total} পৃষ্ঠা',
      unaccounted: {
        one: '{n}টি পৃষ্ঠার এখনও হিসাব হয়নি',
        other: '{n}টি পৃষ্ঠার এখনও হিসাব হয়নি',
      },
      printingMarks: 'ব্যাচটি প্রিন্ট করলে এর প্রতিটি চালানেই চিহ্ন বসে।',
      restOnFile: 'বাকিগুলো এখনও কেবল ফাইলেই আছে।',
      notPrinted: 'প্রিন্ট হয়নি',
      continuingHeading: 'একটি ব্যাচ চালিয়ে নেওয়া হচ্ছে',
      backToBatch: 'ব্যাচে ফিরুন',
      openDifferentInstead: 'বরং অন্য একটি PDF খুলুন',
      openSameAgain: 'চালিয়ে যেতে ওই একই PDF আবার খুলুন।',
      stillToFile: 'এখনও জমা দেওয়ার বাকি:',
      notThisFile: 'এই ফাইলটি নয়? নতুন একটি ব্যাচ শুরু করুন',
      resumeFailed: 'ওই ব্যাচটি খোলা যায়নি',
      continuedAria: 'যে ব্যাচটি চালিয়ে নেওয়া হচ্ছে',
      openPdf: 'একটি PDF খুলুন',
      loadingList: 'সোর্স PDF লোড হচ্ছে',
      loadFailed: 'সোর্স PDF লোড করা যায়নি',
      noneFound: 'কোনো সোর্স PDF পাওয়া যায়নি',
      noneYet: 'এখনও কোনো সোর্স PDF নেই',
      filteredHint: 'আপনার বর্তমান ফিল্টারের সঙ্গে কোনো সোর্স ফাইল মেলেনি।',
      emptyHint:
        'কোনো ফাইল থেকে প্রথম চালানটি ফাইল করামাত্রই সেই সোর্স PDF এখানে দেখা যায়। ফাইল খোলায় নিজে থেকে কিছুই রেকর্ড হয় না — ফাইলটি কখনও সংরক্ষণ করা হয় না।',
      pagesChallansLine: '{pages} · {challans} ফাইল করা',
      completedAlso: '{started} · সম্পন্ন {when}',
      printableNote:
        'এগুলো এক ডকুমেন্ট হিসেবে প্রিন্ট করা যায় — প্রতিটি চালানের পৃষ্ঠা, তার পিছনে তার LBTS পিঠপাতা, সোর্স ফাইলের ক্রম অনুযায়ী।',
      notPrintableYet: {
        one: '{n}টি পৃষ্ঠা ফাইলও হয়নি, ফাঁকা হিসেবেও চিহ্নিত হয়নি, তাই সেটটি এখনও এক ডকুমেন্ট হিসেবে প্রিন্ট করা যাবে না।',
        other: '{n}টি পৃষ্ঠা ফাইলও হয়নি, ফাঁকা হিসেবেও চিহ্নিত হয়নি, তাই সেটটি এখনও এক ডকুমেন্ট হিসেবে প্রিন্ট করা যাবে না।',
      },
    },

    pdf: {
      sourceAria: 'সোর্স PDF',
      closeAria: 'এই PDF বন্ধ করুন',
      heldHere: '{pages} · {size} · কেবল এই ব্রাউজারেই আছে',
      scanNoText: 'এই পৃষ্ঠাটি একটি স্ক্যান — বেছে নেওয়ার মতো কোনো টেক্সট নেই, তাই মানগুলো টাইপ করুন',
      selectTextHint: 'পৃষ্ঠার লেখা বেছে নিয়ে সরাসরি কোনো ঘরে কপি করুন',
      notAChallan: 'চালান নয় — ফাঁকা পাতা, কভার পেজ, নাকি নকল?',
      markedBlankWith: 'ফাঁকা চিহ্নিত: {pages}',
      skipAsBlank: '{range} ফাঁকা হিসেবে বাদ দিন',
      pagesAria: 'সোর্স PDF-এর পৃষ্ঠা',
      firstPage: 'প্রথম পৃষ্ঠা',
      lastPage: 'শেষ পৃষ্ঠা',
      filedAs: '{challan} হিসেবে জমা হয়েছে',
      startedAt: 'পৃষ্ঠা {page} থেকে শুরু — এই চালানের শেষ পৃষ্ঠায় ক্লিক করুন',
      thisChallanIs: 'এই চালানটি {range}',
      alreadyFiled: 'আগেই চালান হিসেবে জমা হয়েছে',
      belongsToAnother: 'এই তালিকার অন্য একটি চালানের অংশ',
      legendThis: 'এই চালান',
      legendQueued: 'তালিকায়',
      legendFiled: 'জমা হয়েছে',
      legendUnassigned: 'বরাদ্দ হয়নি',
      previousPage: 'আগের পৃষ্ঠা',
      nextPage: 'পরের পৃষ্ঠা',
      pageNumber: 'পৃষ্ঠা নম্বর',
      ofPages: '{pages}-এর মধ্যে',
      fitLabel: 'মাপসই',
      fitPageLabel: 'পৃষ্ঠা',
      fitWidthLabel: 'চওড়া',
      zoomIn: 'বড় করুন',
      zoomOut: 'ছোট করুন',
      fitPage: 'পুরো পৃষ্ঠা মাপমতো',
      rotate: 'ঘোরান',
      fullscreen: 'পূর্ণ পর্দা',
      leaveFullscreen: 'পূর্ণ পর্দা থেকে বেরোন',
      pageDrawFailed: 'এই পৃষ্ঠাটি আঁকা যায়নি।',
      openingPdf: 'PDF খোলা হচ্ছে…',
      openSameAgain: 'ওই একই PDF আবার খুলুন',
      openChallanPdf: 'চালান PDF খুলুন',
      dropzoneHint:
        'ওয়ালটন হোয়াটসঅ্যাপে যে ফাইলটি পাঠিয়েছে, তাতে যত চালানই থাকুক। এখানে ছেড়ে দিন, অথবা এই কম্পিউটার থেকে বেছে নিন।',
      choosePdf: 'একটি PDF বাছুন',
      expectingFile:
        '{file} — {pages}-এর এই ফাইলটি থেকেই ব্যাচটি শুরু হয়েছিল। এটি এখানে ছাড়ুন বা এই কম্পিউটার থেকে বেছে নিন।',
      limits: 'PDF সর্বোচ্চ {mb} MB, সর্বোচ্চ {pages} পৃষ্ঠা',
      neverUploaded: 'এই PDF কখনও আপলোড হয় না।',
      neverUploadedNote:
        'এটি এই ব্রাউজারেই পড়া হয় এবং ট্যাব বন্ধ হলে মুছে যায়। আপনি যে চালানগুলো জমা দেন কেবল তাদের পৃষ্ঠাগুলোই কেটে পাঠানো ও সংরক্ষণ করা হয়।',
      workspaceTabsAria: 'চালান ওয়ার্কস্পেস',
      tabEntry: 'লেখা',
      tabPdf: 'PDF',
    },

    extracted: {
      read: 'এই পৃষ্ঠাগুলোর লেখা পড়ুন',
      readAgain: 'আবার পড়ুন',
      copyAll: 'সব কপি করুন',
      copied: 'কপি হয়েছে',
      textAria: 'এই পৃষ্ঠাগুলোতে পাওয়া লেখা',
      noText:
        'এই পৃষ্ঠাগুলোতে বেছে নেওয়ার মতো কোনো লেখা নেই — এই চালানটি একটি স্ক্যান করা ছবি। উপরের পৃষ্ঠা থেকে পড়ে মানগুলো টাইপ করুন।',
    },

    paste: {
      prompt: 'PDF থেকে একটি অংশ পেস্ট করুন',
      heading: 'পেস্ট করে বসিয়ে দিন',
      hint: 'PDF-এ চালানের লেখাটি বেছে নিয়ে এখানে পেস্ট করুন; যেগুলোর লেবেল আছে সেগুলো ফাঁকা ঘরের জন্য প্রস্তাব করা হবে।',
      textAria: 'চালান PDF থেকে পেস্ট করা লেখা',
      seeWhatItFound: 'কী পাওয়া গেছে দেখুন',
      fillFields: '{fields} বসিয়ে দিন',
      nothingNewLong:
        'নতুন করে বসানোর কিছু নেই। হয় ঘরগুলো আগেই ভরা, নয়তো এই লেখায় চেনা কোনো লেবেল নেই — মানগুলো হাতে টাইপ করুন।',
      hintLong:
        'PDF-এ চালানের লেখা বেছে নিয়ে এখানে পেস্ট করুন; লেবেল দেওয়া যা কিছু আছে তা এখনও না-ভরা ঘরগুলোর জন্য দেওয়া হবে।',
      nothingNew:
        'নতুন করে বসানোর কিছু নেই। হয় ঘরগুলো আগেই ভরা, নয়তো এই লেখায় পার্সার চেনে এমন কোনো লেবেল নেই।',
      fields: {
        customerName: 'গ্রাহকের নাম',
        deliveryAddress: 'ডেলিভারির ঠিকানা',
        thana: 'থানা',
        district: 'জেলা',
        receiverMobile: 'গ্রহীতার মোবাইল',
        senderMobile: 'প্রেরকের মোবাইল',
        zonePo: 'জোন / PO',
        product: 'পণ্য',
        model: 'মডেল',
        qty: 'সংখ্যা',
      },
    },

    bangla: {
      looksLegacy: 'এটি বিজয়ের লেখা মনে হচ্ছে — রূপান্তর করুন',
      convert: 'ইউনিকোডে রূপান্তর করুন',
      previewAria: '{label}-এর ইউনিকোড প্রিভিউ',
      previewHeading: 'ইউনিকোড প্রিভিউ',
      useThis: 'এটিই নিন',
      keepMine: 'আমি যা লিখেছি তাই থাকুক',
      hint: 'প্রিভিউ ভুল হলে আপনার লেখাটিই রাখুন এবং হাতে ঠিক করে নিন।',
    },

    filed: {
      ariaLabel: 'চালান জমা হয়েছে',
      filed: 'ফাইল হয়েছে',
      sl: 'SL',
      heading: 'চালান',
    },

    duplicate: {
      batch: 'একই গ্রাহক, ঠিকানা, নম্বর ও মডেল — এই একই PDF থেকে',
      recent: 'গত তিন মাসে একই গ্রাহক, ঠিকানা, নম্বর ও মডেল',
      description:
        'জমা দেওয়ার আগে দেখে নিন এটি একই ডেলিভারি কি না। এখনও কিছুই সংরক্ষণ হয়নি, তাই যেভাবেই হোক কিছু হারাবে না।',
      goBack: 'ফিরে গিয়ে দেখুন',
      title: {
        one: 'এর মতো একটি চালান আগেই ফাইল করা হয়েছে',
        other: 'এর মতো {n}টি চালান আগেই ফাইল করা হয়েছে',
      },
      goodsLine: '{product} ({model}) × {qty}',
      moreItems: 'আরও {n}টি',
      filing: 'জমা হচ্ছে…',
      fileAnyway: 'অন্য ডেলিভারি — জমা দিন',
    },

    remove: {
      title: '{challan} মুছে ফেলবেন?',
      body:
        'এই চালান ও তার তৈরি করা PDF স্থায়ীভাবে মুছে যাবে, আর SL {sl} আর কখনও দেওয়া হবে না। {file}-এর {range} আবার খালি হয়ে যাবে, ফলে যে ব্যাচ থেকে এগুলো এসেছিল সেটি আবার খুলে যাবে এবং একটি সম্পূর্ণ সেট হিসেবে আর ডাউনলোড করা যাবে না। এটি ফেরানো যাবে না।',
      keepIt: 'থাক',
      deleting: 'মুছে ফেলা হচ্ছে…',
      confirm: 'চালান মুছুন',
    },

    menu: {
      aria: '{challan}-এর কাজ',
      view: 'বিবরণ দেখুন',
      correct: 'সংশোধন',
      setLocation: 'লোকেশন বসান',
      checkLocation: 'লোকেশন দেখে নিন',
      changeLocation: 'লোকেশন বদলান',
      downloadPdf: 'PDF ডাউনলোড করুন',
      printChallan: 'চালান প্রিন্ট করুন',
      markPrinted: 'প্রিন্ট হয়েছে বলে চিহ্নিত করুন',
      markNotPrinted: 'প্রিন্ট হয়নি বলে চিহ্নিত করুন',
      openSourceBatch: 'সোর্স ব্যাচ খুলুন',
      deleteChallan: 'চালান মুছুন',
    },

    printMark: {
      printed: 'প্রিন্ট হয়েছে',
      notPrinted: 'প্রিন্ট হয়নি',
      printedAt: '{when} প্রিন্ট হয়েছে',
      printedAtBy: '{when} {name} প্রিন্ট করেছেন',
    },

    stages: {
      extracting: 'PDF থেকে চালানের পৃষ্ঠাগুলো কাটা হচ্ছে',
      filing: 'এই চালানটি ফাইল করা হচ্ছে…',
      uploading: 'চালানের পৃষ্ঠাগুলো আপলোড হচ্ছে',
      finalizing: 'যাচাই, নম্বর দেওয়া ও চালান জমা দেওয়া হচ্ছে',
      coldStart:
        'সার্ভারটি জেগে উঠতে একটু সময় নিতে পারে। দেরি হলেও কিছু হারাবে না, এবং বোতামটি আবার চাপলেও এটি দুবার জমা হবে না।',
    },

    toasts: {
      preparing: 'চালানটি প্রস্তুত করা হচ্ছে…',
      downloaded: 'চালান ডাউনলোড হয়েছে',
      preparingPrint: 'প্রিন্টের জন্য প্রস্তুত করা হচ্ছে…',
      assemblingBatch: 'ব্যাচ PDF জোড়া দেওয়া হচ্ছে…',
      batchDownloaded: 'ব্যাচ ডাউনলোড হয়েছে',
      assemblingBatchPrint: 'প্রিন্টের জন্য ব্যাচ PDF জোড়া দেওয়া হচ্ছে…',
      corrected: 'চালান সংশোধিত হয়েছে',
      correctedNote:
        '{challan} সংরক্ষিত হয়েছে এবং এর ডকুমেন্ট আবার তৈরি হয়েছে। পুরোনো কপি ছড়িয়ে গিয়ে থাকলে আবার প্রিন্ট করুন।',
      locationSetNote: '{challan} এখন {district} / {thana} · {type}।',
      locationClearedNote: '{challan}-এর আবার কোনো লোকেশন নেই। যেকোনো সময় বসানো যাবে।',
      batchComplete: 'ব্যাচ সম্পন্ন',
      blankCleared: 'ফাঁকা পৃষ্ঠার চিহ্ন মুছে গেছে',
      stillToAccount: {
        one: 'আর {n}টি পৃষ্ঠার হিসাব বাকি।',
        other: 'আর {n}টি পৃষ্ঠার হিসাব বাকি।',
      },
      markedBlank: 'ফাঁকা হিসেবে চিহ্নিত',
      batchAccounted: 'এই PDF-এর প্রতিটি পৃষ্ঠারই হিসাব আছে। ব্যাচটি এখন একটিই ডকুমেন্ট হিসেবে ডাউনলোড করা যাবে।',
      batchPrinted: 'ব্যাচ প্রিন্ট হয়েছে বলে চিহ্নিত',
      printMarksCleared: 'প্রিন্টের চিহ্ন মুছে গেছে',
      batchPrintedNote: '{file}-এর {challans} প্রিন্ট হয়েছে বলে চিহ্নিত।',
      batchNotPrintedNote: 'এই ব্যাচের কিছুই আর প্রিন্ট হয়েছে বলে চিহ্নিত নেই।',
      locationSet: 'লোকেশন বসানো হয়েছে',
      locationCleared: 'লোকেশন মুছে ফেলা হয়েছে',
      deleted: '{challan} মুছে ফেলা হয়েছে',
      deletedNote: 'এটি যে ব্যাচ থেকে এসেছিল সেখানে এর পৃষ্ঠাগুলো আবার বরাদ্দহীন।',
      documentLoadFailed: 'ডকুমেন্টটি লোড করা যায়নি।',
    },

    resume: {
      allAccounted:
        'এই PDF-এর প্রতিটি পৃষ্ঠারই আগে থেকেই হিসাব আছে, তাই এটি থেকে জমা দেওয়ার মতো কিছু বাকি নেই।',
      notYours:
        'এই ব্যাচটি অন্য কেউ শুরু করেছেন। কেবল তিনি, অথবা কোনো ম্যানেজার, এর বাকি চালানগুলো জমা দিতে পারবেন।',
      openFailed:
        'ওই ব্যাচটি খোলা যায়নি। এর শেষ চালানটি মুছে ফেলার সময় এটি সরে গিয়ে থাকতে পারে।',
    },

    source: {
      wrongPageCount:
        'ওই ফাইলে {pages} আছে, আর এই ব্যাচটি শুরু হয়েছিল {expected} পৃষ্ঠার একটি PDF থেকে, তাই এটি একই ডকুমেন্ট নয়। এই ব্যাচটি যে ফাইল থেকে এসেছে সেটিই খুলুন — “{file}”।',
      openFailed: 'ওই PDF-টি খোলা যায়নি। ফাইলটি আবার চেষ্টা করুন।',
      empty: 'ফাইলটি ফাঁকা। PDF-টি আবার বাছুন।',
      tooLarge: 'ওই PDF-টি {size}। এই ওয়ার্কস্পেস সর্বোচ্চ {limit} MB-র ফাইল খোলে।',
      notPdf: 'ওই ফাইলটি PDF নয়। হোয়াটসঅ্যাপ থেকে আসা চালান PDF-টি বাছুন।',
      passwordProtected: 'ওই PDF-এ পাসওয়ার্ড দেওয়া আছে। সেটি তুলে দিয়ে আবার খুলুন।',
      damaged: 'ওই PDF-টি খোলা যায়নি। এটি নষ্ট হয়ে থাকতে পারে।',
      tooManyPages: 'ওই PDF-এ {pages} পৃষ্ঠা আছে। এই ওয়ার্কস্পেস সর্বোচ্চ {max} পর্যন্ত সামলায়।',
      rangeOutside: 'পৃষ্ঠা {from}–{to} এই PDF-এর ভেতরে নেই, এতে আছে {total}।',
    },

    pageRange: {
      notAWholeNumber: 'পৃষ্ঠার নম্বর একটি পূর্ণসংখ্যা হতে হবে।',
      overlap: {
        one: '{range} আগেই {challans}-এর অধীনে আছে।',
        other: '{range} আগেই {challans}-এর অধীনে আছে।',
      },
      firstPageAtLeastOne: 'একটি চালানের প্রথম পৃষ্ঠা ১ বা তার পরে।',
      reversed: 'শেষ পৃষ্ঠাটি প্রথম পৃষ্ঠার আগে পড়ছে।',
      noPages: 'সোর্স PDF-এ বেছে নেওয়ার মতো কোনো পৃষ্ঠা নেই।',
      sourceTooLong: 'ওই PDF-এ {pages} পৃষ্ঠা আছে। এই ওয়ার্কস্পেস সর্বোচ্চ {max} পর্যন্ত সামলায়।',
      endsAt: 'সোর্স PDF শেষ হয়েছে পৃষ্ঠা {last}-এ।',
      tooManyForOne: 'একটি চালানের জন্য ওটি {pages} পৃষ্ঠা। সীমা {max}।',
    },

    validation: {
      customerNameTooShort: 'গ্রাহকের নাম অন্তত ২ অক্ষরের হতে হবে',
      customerNameTooLong: 'গ্রাহকের নাম সর্বোচ্চ ২০০ অক্ষরের হতে পারে',
      addressTooShort: 'ডেলিভারির ঠিকানা অন্তত ৩ অক্ষরের হতে হবে',
      addressTooLong: 'ডেলিভারির ঠিকানা সর্বোচ্চ ৫০০ অক্ষরের হতে পারে',
      productTooShort: 'পণ্যের নাম অন্তত ২ অক্ষরের হতে হবে',
      productTooLong: 'পণ্যের নাম সর্বোচ্চ ২০০ অক্ষরের হতে পারে',
      modelRequired: 'মডেল লিখতে হবে',
      modelTooLong: 'মডেল সর্বোচ্চ ১২০ অক্ষরের হতে পারে',
      receiverMobileInvalid: 'গ্রহীতার সঠিক মোবাইল নম্বর লিখুন, যেমন 01712345678।',
      senderMobileInvalid: 'প্রেরকের সঠিক মোবাইল নম্বর লিখুন, নয়তো ফাঁকা রাখুন।',
      senderMobileTooLong: 'প্রেরকের মোবাইল সর্বোচ্চ ৪০ অক্ষরের হতে পারে',
      thanaTooLong: 'থানা সর্বোচ্চ ১২০ অক্ষরের হতে পারে',
      districtTooLong: 'জেলা সর্বোচ্চ ১২০ অক্ষরের হতে পারে',
      zonePoTooLong: 'জোন / PO সর্বোচ্চ ১২০ অক্ষরের হতে পারে',
      qtyRequired: 'সংখ্যা লিখতে হবে',
      qtyWhole: 'সংখ্যাটি পূর্ণসংখ্যা হতে হবে',
      qtyAtLeastOne: 'সংখ্যা অন্তত ১ হতে হবে',
      qtyTooLarge: 'সংখ্যাটি খুব বড় মনে হচ্ছে। চালানটি দেখে নিন।',
      itemsAtLeastOne: 'অন্তত একটি পণ্য যোগ করুন',
      itemsTooMany: 'একটি চালানে সর্বোচ্চ ৩০টি পণ্য রাখা যায়',
    },
  },
  delivery: {
    title: 'ডেলিভারি',
    pageDescription:
      'প্রতিটি ট্রিপ: কোন গাড়ি ও চালক, কোন ভেন্ডরের নামে দেওয়া হয়েছিল, এবং ঠিক কোন কোন চালান — আর তার কতটুকু — এতে গিয়েছিল।',
    tripsAria: 'ট্রিপ',
    newDelivery: 'নতুন ডেলিভারি',
    backToList: 'ডেলিভারিতে ফিরুন',
    allDeliveries: 'সব ডেলিভারি',
    deliveries: 'ডেলিভারি',
    somethingWrong: 'কিছু একটা ভুল হয়েছে।',
    manifestAria: 'ম্যানিফেস্ট',

    tripStatuses: {
      Open: {
        label: 'কপির অপেক্ষায়',
        description: 'এই ট্রিপের একটি চালান এখনও তার স্বাক্ষরিত কপির অপেক্ষায়।',
      },
      Completed: {
        label: 'সম্পন্ন',
        description: 'ট্রিপের প্রতিটি চালানের জন্যই স্বাক্ষর নেওয়া হয়েছে।',
      },
    },

    outcomes: {
      Pending: {
        label: 'কপির অপেক্ষায়',
        description: 'স্বাক্ষরিত চালানের কপি এখনও স্ক্যান করা হয়নি।',
      },
      Complete: {
        label: 'সম্পন্ন',
        description: 'গ্রাহক এর জন্য স্বাক্ষর করেছেন এবং কপিটি রেকর্ডে আছে।',
      },
    },

    completionMethods: {
      Returned: {
        label: 'ফেরত',
        description: 'সবকিছুই ফেরত এসেছে। কিছুই ডেলিভারি হয়নি, তাই স্বাক্ষরিত কপির দরকার নেই।',
      },
      CopyMissing: {
        label: 'কপি নেই',
        description: 'অপারেটরের কথার ভিত্তিতে স্বাক্ষরিত কপি ছাড়াই সম্পন্ন করা হয়েছে।',
      },
    },

    lineChanges: {
      'as-ordered': {
        label: 'অর্ডার অনুযায়ী',
        description: 'চালান যে পণ্য, যে মডেল ও যে সংখ্যা অর্ডার করেছে ঠিক তাই।',
      },
      split: {
        label: 'ভাগ',
        description: 'এই লাইনের একটি অংশ পরের ট্রিপে যাবে। বাকিটা চালানেই থাকবে।',
      },
      reduced: {
        label: 'কমানো',
        description:
          'চালানের অর্ডারের চেয়ে কম, কিছুই আটকে রাখা হয়নি — যা গেছে সেই অনুযায়ী চালানটি কমিয়ে সংশোধন করা হয়।',
      },
      increased: {
        label: 'বেশি',
        description: 'চালানের অর্ডারের চেয়ে বেশি — যা গেছে সেই অনুযায়ী চালানটি বাড়িয়ে সংশোধন করা হয়।',
      },
      substituted: {
        label: 'বদলানো',
        description:
          'চালানে থাকা পণ্যের জায়গায় অন্য একটি পণ্য বা মডেল, যা চালানেও সেটিকে প্রতিস্থাপন করে।',
      },
      added: {
        label: 'যোগ করা',
        description: 'চালানে কখনও ছিল না এমন একটি পণ্য। এটি চালানেও যুক্ত হয়ে যায়।',
      },
    },

    lineDetail: {
      split: '{ordered}-এর মধ্যে {qty} · বাকিটা অন্য ট্রিপে',
      corrected: 'চালানে ছিল {ordered}',
      substituted: '{model}-এর বদলে',
    },

    changes: {
      removed: '{product} সরানো হয়েছে (ছিল {from})',
      /** What a trip did to a line, as one sentence per case. */
      sentInPlace: '{replaced}-এর বদলে {model} পাঠানো হয়েছে ({to})',
      addedLine: '{product} {model} যোগ করা হয়েছে ({to})',
      carriedLine: '{product} {model} {from}-এর মধ্যে {to} নেওয়া হয়েছে',
      added: '{product} যোগ হয়েছে ({to})',
      cutTo: '{product} কমিয়ে {to} করা হয়েছে (ছিল {from})',
      raisedTo: '{product} বাড়িয়ে {to} করা হয়েছে (ছিল {from})',
    },

    carryingKinds: {
      Vehicle: {
        label: 'গাড়ি',
        hint: 'রিকশা ভ্যান, সিএনজি — শেষ অংশটুকু যা দিয়েই নেওয়া হোক।',
      },
      /** The two column labels on a carrying-charge row. */
      what: 'কী',
      taka: 'টাকা',
      Labour: {
        label: 'মজুর',
        hint: 'ভেতরে বা উপরে তোলার জন্য যাঁদের ভাড়া করা হয়েছে।',
      },
    },

    partyLabels: {
      customerName: 'গ্রাহক',
      deliveryAddress: 'ডেলিভারির ঠিকানা',
      thana: 'থানা',
      district: 'জেলা',
      receiverMobile: 'গ্রহীতা',
    },

    returned: 'ফেরত',
    cameBack: 'ফেরত এসেছে',
    slWith: 'SL {sl}',
    addedWith: '{challan} যোগ হয়েছে',
    driverWith: 'চালক {name}',
    noChallanMatches: '{query}-এর সঙ্গে কোনো চালান মেলেনি।',
    tripRentWith: 'গাড়ি ভাড়া {amount}',
    labourBillWith: 'লেবার বিল {amount}',
    totalWith: 'মোট {amount}',

    floorNotRecorded: 'লেখা হয়নি',
    groundFloor: 'নিচতলা',
    floorSt: '{n} তলা',
    floorNd: '{n} তলা',
    floorRd: '{n} তলা',
    floorTh: '{n} তলা',

    workspace: {
      stepVehicle: 'গাড়ি ও চালক',
      stepVehicleHint:
        'নম্বরপ্লেট দিয়ে লরিটি খুঁজুন। এর ভেন্ডর ও নির্ধারিত চালক নিজেই বসে যাবে; শুধু এই ট্রিপের জন্য চালক বদলানো যায়।',
      stepChallans: 'চালান',
      stepChallansHint:
        'এই লরিতে যে চালানগুলো যাচ্ছে সেগুলো যোগ করুন। সংখ্যা কমানো, মডেল বদলানো, পণ্য যোগ করা বা একটি চালান কয়েকটি ট্রিপে ভাগ করা — সবই এখানে।',
      newTitle: 'নতুন ডেলিভারি',
      newDescription:
        'গাড়িটি বেছে নিন, কে চালাবেন তা নিশ্চিত করুন, তারপর চালানগুলো লরিতে তুলুন। নিশ্চিত করলেই গাড়ির ভেন্ডরের অধীনে ট্রিপটির নম্বর হয়ে যায়।',
      editTitle: '{trip} সম্পাদনা',
      cannotEdit: '{trip} সম্পাদনা করা যাবে না',
      completionDescription: '{trip} · {plate} · {driver} · {date}',
      vendorAndDate: '{vendor} · {date}',
      editDescription:
        'মাল, ডেলিভারির তথ্য বা কে চালাবেন তা সংশোধন করুন। ট্রিপের নম্বর ও ভেন্ডর একই থাকবে।',
      backToTrip: 'ট্রিপে ফিরুন',
      notYours: 'যিনি এই ট্রিপটি তৈরি করেছেন, অথবা কোনো অ্যাডমিন বা ম্যানেজার — কেবল তাঁরাই এটি বদলাতে পারেন।',
      leftTheGate:
        'এটি {status}: মাল গেট পেরিয়ে গেছে এবং ম্যানিফেস্ট স্থির হয়ে গেছে। সংশোধন করতে হলে এটিকে আবার Assigned-এ ফেরান।',
    },

    vehicle: {
      registrationNumber: 'রেজিস্ট্রেশন নম্বর',
      noBrandOrModel: ' · কোনো ব্র্যান্ড বা মডেল লেখা নেই',
      secondTripFine:
        'একটি লরি দিনে দুটি চালান দিলে দ্বিতীয় ট্রিপ ঠিকই আছে — কেবল দেখে নিন এটি সেই একই গাড়ি।',
      openTripsCount: '{trips} খোলা',
      licenceExpiredNote:
        'লাইসেন্সের মেয়াদ শেষ। ট্রিপটি তবুও নিশ্চিত করা যাবে — পাঠানোর আগে দেখে নিন।',
      licenceSuffix: ' · লাইসেন্স {number}',
      licenceExpires: ' (মেয়াদ শেষ {when})',
      tripSerial: '{code} · ট্রিপ #{serial}',
      searchHint:
        'নম্বরপ্লেটের শেষ অঙ্কগুলো লিখুন — {digits} লিখলে {plate} পাওয়া যায়। যে গাড়িগুলো ট্রিপ নিতে পারে কেবল সেগুলোই দেখানো হয়।',
      fillsIn: 'গাড়িটি বেছে নেওয়ামাত্রই এর ভেন্ডর ও নির্ধারিত চালক বসে যাবে।',
      searchFailed: 'গাড়ি খোঁজা যায়নি।',
      matchesAria: 'মিলে যাওয়া গাড়ি',
      noMatch: '{query}-এর সঙ্গে ট্রিপ নিতে পারে এমন কোনো গাড়ি মেলেনি।',
      unavailable: {
        one: 'মিলে যাওয়া {n}টি গাড়ি ট্রিপ নিতে পারবে না',
        other: 'মিলে যাওয়া {n}টি গাড়ি ট্রিপ নিতে পারবে না',
      },
      noDriverAssigned: 'কোনো চালক নির্ধারিত নেই',
      onTrip: '{trip}-এ আছে',
      heading: 'গাড়ি',
      change: 'গাড়ি বদলান',
      keep: '{plate} রাখুন',
      alreadyOn: 'আগে থেকেই আছে',
      cannotTakeTrip:
        'এই গাড়িটি এখন ট্রিপ নিতে পারবে না। {reason} একই ভেন্ডরের অন্য একটি গাড়ি বেছে নিন।',
    },

    driver: {
      heading: 'চালক',
      forThisTrip: 'এই ট্রিপের চালক',
      assignedToVehicle: 'এই গাড়ির জন্য নির্ধারিত',
      mobile: 'মোবাইল',
      licence: 'লাইসেন্স',
      notRecorded: 'লেখা হয়নি',
      change: 'চালক বদলান',
      choose: 'চালক বাছুন',
      addNew: 'নতুন চালক যোগ করুন',
      useAssigned: '{name}-কে দিন',
      chooseAnother: 'এই ট্রিপের জন্য অন্য একজন চালক বাছুন।',
      assignedButBlocked:
        '{name} এই গাড়ির জন্য নির্ধারিত, কিন্তু চালাতে পারবেন না — {reason} {advice}',
      noneAssigned:
        'এই গাড়ির জন্য কোনো চালক নির্ধারিত নেই। এই ট্রিপ কে চালাবেন তা বাছুন, অথবা নতুন একজন চালক যোগ করুন।',
      filterAria: 'চালক ছাঁকুন',
      filterPlaceholder: 'নাম, কোড, মোবাইল বা লাইসেন্স',
      noMatch: 'ওই লেখার সঙ্গে সক্রিয় কোনো চালক মেলেনি।',
      vendorHasNone: '{vendor}-এর কোনো সক্রিয় চালক নেই।',
      activeAria: 'সক্রিয় চালক',
      assigned: 'নির্ধারিত',
      normallyOn: 'সাধারণত {plate}-এ থাকেন',
      selected: 'বাছাই করা',
      photo: 'ছবি',
      photoAria: 'চালকের ছবি',

      photoFormats: 'ঐচ্ছিক। জেপিজি, পিএনজি বা ওয়েবপি, সর্বোচ্চ {size}।',
      choosePhoto: 'একটি ছবি বাছুন',
      chooseAnotherPhoto: 'অন্য একটি বাছুন',
      addedFor:
        'এই চালক {vendor}-এর হয়ে কাজ করবেন এবং এই ট্রিপ চালাবেন। চালকের কোড নিজে থেকেই বরাদ্দ হয়।',
      added: '{name} {code} হিসেবে যোগ হয়েছেন',
      addedNote: 'তিনি এই ট্রিপ চালাচ্ছেন। গাড়ির নির্ধারিত চালক অপরিবর্তিত আছে।',
      photoFailed: '{name} যোগ হয়েছেন, কিন্তু ছবিটি আপলোড হয়নি',
      droveInPlace: 'গাড়ির নির্ধারিত চালক {name}-এর জায়গায় চালিয়েছেন।',
    },

    vendor: {
      heading: 'ভেন্ডর',
      mobile: 'মোবাইল',
      tripNumber: 'ট্রিপ নম্বর',
    },

    finder: {
      label: 'একটি চালান খুঁজুন বা স্ক্যান করুন',
      hint: 'চালান নম্বর, SL, গ্রাহক বা গ্রহীতার নম্বর। ছাপা চালানের বারকোড স্ক্যান করলেই সেটি সঙ্গে সঙ্গে যোগ হয়ে যায়।',
      matchesAria: 'মিলে যাওয়া চালান',
      noMatch: 'কোনো চালান মেলেনি',
      sentInFull: 'পুরোটাই পাঠানো হয়েছে',
      add: 'যোগ করুন',
      addAnyway: 'তবুও যোগ করুন',
      added: 'যোগ হয়েছে',
      alreadyOnTrip: '{challan} এই ট্রিপে আছে',
      addChallan: '{challan} যোগ করুন',
      scannerReady: 'বারকোড স্ক্যানার প্রস্তুত',
      scannerPaused: 'কোনো ডায়ালগ খোলা থাকায় স্ক্যানার থেমে আছে',
      alreadyOn: '{challan} আগে থেকেই এই ট্রিপে আছে',
      goneOutInFull: '{challan} আগেই পুরোটা বেরিয়ে গেছে',
      onTrips: '{trips}-এ আছে।',
      addedNote: '{customer} · {pieces}',
      alsoWentOut: 'এটি {trips}-এও গিয়েছিল।',
      tripOpenedNote: '{plate} · {driver}',
      addedToast: '{challan} যোগ হয়েছে',
    },

    cart: {
      empty: 'এই ট্রিপে এখনও কোনো চালান নেই',
      emptyHint: 'আগে কোথাও ক্লিক করার দরকার নেই',
      onThisTrip: 'এই ট্রিপে {pieces}',
      emptyLong:
        'উপরে খুঁজুন, বা ছাপা চালানগুলো হাতে নিয়ে একটার পর একটা বারকোড স্ক্যান করুন — প্রতিটি এখানে এসে বসবে, যা এখনও যাওয়ার বাকি তা নিয়ে।',
      alreadyOnTrip: '{challan} আগেই এই ট্রিপে আছে',
      challanAria: 'চালান {challan}',
      actionsAria: '{challan}-এর কাজ',
      detailsEdited: 'তথ্য সম্পাদিত',
      editedFor: 'এই ট্রিপের জন্য বদলানো হয়েছে: {fields}',
      changedForThisTrip: 'এই ট্রিপের জন্য বদলানো হয়েছে:',
      addProduct: 'পণ্য যোগ করুন',
      addBack: '{product} আবার যোগ করুন',
      moreFor: '{label}-এর আরও',
      editProduct: 'পণ্য সম্পাদনা',
      changeModel: 'মডেল বা পণ্য বদলান',
      removeProduct: 'এই পণ্যটি সরান',
      removeFromBoth: 'ট্রিপ ও চালান দুটো থেকেই সরান',
      editDetails: 'ডেলিভারির তথ্য সম্পাদনা',
      splitAcross: 'কয়েকটি ট্রিপে ভাগ করুন',
      openChallan: 'চালানটি খুলুন',
      correctChallan: 'জমা দেওয়া চালানটি সংশোধন করুন',
      removeFromTrip: 'এই ট্রিপ থেকে সরান',
      thanaWith: 'থানা:',
      editedField: '{label} (চালানে: {was})',
      blankValue: 'ফাঁকা',
      where: 'থানা: {thana} · জেলা: {district}',
    },

    party: {
      forThisTripOnly:
        'এখানকার পরিবর্তন শুধু এই ট্রিপের জন্য। জমা দেওয়া চালান যা ছাপা হয়েছিল তাই রাখে।',
      noteForDriver: 'চালকের জন্য নোট',
      useChallanDetails: 'চালানের তথ্যই ব্যবহার করুন',
      saveForTrip: 'এই ট্রিপের জন্য সংরক্ষণ করুন',
      customerRequired: 'গ্রাহকের নাম লিখতে হবে',
      addressRequired: 'ডেলিভারির ঠিকানা লিখতে হবে',
      mobileInvalid: 'গ্রহীতার সঠিক একটি মোবাইল নম্বর লিখুন, যেমন 01712345678।',
    },

    line: {
      addTitle: 'একটি পণ্য যোগ করুন',
      addDescriptionPlain:
        'লরিতে থাকা একটি পণ্য যা {challan}-এ লেখা নেই। এটি “যোগ করা” হিসেবে লেখা হয়।',
      alreadyOnOtherTrips: ' · আগেই অন্য ট্রিপে {qty}',
      onThisTripCount: 'এই ট্রিপে {qty}',
      changeTitle: 'এই লাইনটি বদলান',
      addDescription: 'এই ট্রিপে যোগ করা একটি লাইন।',
      replaceDescription:
        'চালানে অর্ডার আছে {product} {model} × {ordered}। এখানে অন্য কোনো পণ্য বা মডেল দিলে সেটি ওটির বদলি হিসেবে রেকর্ড হবে।',
      model: 'মডেল',
      productName: 'পণ্যের নাম',
      qtyOnTrip: 'এই ট্রিপে কত',
      addButton: 'পণ্য যোগ করুন',
      saveButton: 'লাইন সংরক্ষণ করুন',
      productRequired: 'পণ্যের নাম লিখতে হবে',
      modelRequired: 'মডেল লিখতে হবে',
      qtyNotNumber: 'সংখ্যাটি একটি সংখ্যা হতে হবে',
      qtyWhole: 'সংখ্যাটি পূর্ণসংখ্যা হতে হবে',
      qtyAtLeastOne: 'সংখ্যা অন্তত ১ হতে হবে',
      qtyTooLarge: 'সংখ্যাটি অনেক বড়',
      oneFewer: '{label} একটি কম',
      oneMore: '{label} একটি বেশি',
      qtyOf: '{label}-এর সংখ্যা',
      ordered: 'অর্ডার {n}',
    },

    split: {
      description:
        'প্রতিটি লাইনের কতটুকু এই ট্রিপ নেবে তা বেছে নিন। বাকিটা পরের ট্রিপের জন্য চালানেই থেকে যাবে — এখানেই এটি কার্ডে সংখ্যা কমিয়ে দেওয়ার থেকে আলাদা, কারণ ওটি যা গেছে সেই অনুযায়ী চালানটিকেই কমিয়ে সংশোধন করে।',
      everythingLeft: 'যা বাকি আছে সবটুকু',
      half: 'অর্ধেক',
      none: 'কিছুই না',
      onOtherTrips: ' · অন্য ট্রিপে {qty}',
      laterCount: 'পরে {qty}',
      nothingHeld: 'কিছু ধরে রাখা হয়নি',
      title: '{challan} ভাগ করুন',
      mustCarrySomething:
        'এই ট্রিপকে চালান থেকে অন্তত কিছু নিতেই হবে। পুরোটা পরে পাঠাতে চাইলে বরং চালানটিকেই এই ট্রিপ থেকে সরিয়ে দিন।',
      apply: 'ভাগ প্রয়োগ করুন',
    },

    summary: {
      panelAria: 'ডেলিভারির সারসংক্ষেপ',
      forThisTripOnly: ' · কেবল এই ট্রিপের জন্য',
      challansDone: '{total}টি চালানের মধ্যে {done}টি হয়ে গেছে। {description}',
      heading: 'ডেলিভারির সারসংক্ষেপ',
      noVehicle: 'এখনও কোনো গাড়ি বাছা হয়নি',
      tripDate: 'ট্রিপের তারিখ',
      tripNote: 'ট্রিপের নোট',
      create: 'ডেলিভারি তৈরি করুন',
      save: 'ট্রিপ সংরক্ষণ করুন',
      createShort: 'তৈরি করুন',
      saveShort: 'সংরক্ষণ',
      readyToConfirm: 'নিশ্চিত করার জন্য প্রস্তুত',
      numberedOn: 'নিশ্চিত করলে নম্বর হবে',
      split: 'ভাগ',
      challansUpdated: 'হালনাগাদ হওয়া চালান',
      detailsEdited: 'তথ্য সম্পাদিত',
      linesChanged: 'বদলানো লাইন',
      overTheOrder: 'অর্ডারের বেশি',
      chooseVehicle: 'একটি গাড়ি বাছুন।',
      chooseDriver: 'এই ট্রিপের চালক বাছুন।',
      addChallan: 'অন্তত একটি চালান যোগ করুন।',
      chooseDate: 'ট্রিপের তারিখ বাছুন।',
      vehicleBlocked: '{plate} ট্রিপ নিতে পারবে না। {reason}',
      driverBlocked: '{name} {status}, তাই চালাতে পারবেন না।',
      wrongVendor: '{trip} {vendor}-এর ট্রিপ',
      wrongVendorHint:
        'তাঁদেরই কোনো একটি গাড়ি বাছুন, অথবা এই ট্রিপটি মুছে {vendor}-এর অধীনে নতুন একটি নিশ্চিত করুন।',
    },

    confirm: {
      createTitle: 'এই ডেলিভারিটি তৈরি করবেন?',
      saveTitle: '{trip} সংরক্ষণ করবেন?',
      createDescription:
        'ট্রিপটি {vendor}-এর নামে যাচ্ছে এবং তাঁদের নিজের সিরিয়াল থেকেই নম্বর পাচ্ছে। একবার দেওয়া নম্বর আর কখনও ব্যবহার করা হয় না।',
      saveDescription:
        'ট্রিপের নম্বর একই থাকবে। এর প্রতিটি চালান বর্তমান কাগজের সঙ্গে মিলিয়ে আবার পড়া হবে।',
      backToCart: 'কার্টে ফিরুন',
      confirmDelivery: 'ডেলিভারি নিশ্চিত করুন',
      saveTrip: 'ট্রিপ সংরক্ষণ করুন',
    },

    overage: {
      title: 'চালানের অর্ডারের চেয়ে বেশি',
      bodyRaises:
        'এই সারিগুলো মালের সাথে মিলিয়ে দেখুন। তবুও পাঠানো যায় — ট্রিপ আসলে যা গেছে তাই লেখে — কিন্তু এটি মিলিয়ে নিতে {raises}, তাই ভুল করে লেখা একটি সংখ্যা অফিসের রেকর্ড বদলে দেবে।',
      raisesTheChallan: 'চালানও বাড়ায়',
      goBack: 'ফিরে গিয়ে ঠিক করুন',
      sendAnyway: 'তবুও পাঠান',
    },

    created: {
      assignedTo: 'ট্রিপটি {vendor}-এর নামে দেওয়া হয়েছে',
      barcodeNote:
        'ম্যানিফেস্টে এই ট্রিপের বারকোড থাকে — ডেলিভারি পৃষ্ঠায় সেটি স্ক্যান করলে ট্রিপটি আবার খোলে।',
      saved: 'ট্রিপ সংরক্ষিত হয়েছে',
      startAnother: 'আরেকটি ডেলিভারি শুরু করুন',
      printManifest: 'ম্যানিফেস্ট প্রিন্ট করুন',
      openTrip: 'ট্রিপটি খুলুন',
    },

    dispatch: {
      panelAria: 'পাঠানো',
      piecesSent: '{ordered} পিসের মধ্যে {sent} পাঠানো হয়েছে',
      cameBackCount: '{returned} ফিরে এসেছে',
      stillToGo: '{remaining} এখনও যাওয়ার বাকি',
      cameBackOffLorry: 'লরি থেকে {qty} ফিরে এসেছে',
      heading: 'পাঠানো',
      nothingDelivered: 'এই চালানের কিছুই এখনও ডেলিভারি হয়নি',
      cameBack: 'ফেরত এসেছে',
      returnedStay: 'ফেরত আসা পণ্য এই চালানেই থাকে এবং অন্য কোনো ট্রিপে যেতে পারে।',
      correctedByDelivery: 'একটি ডেলিভারির মাধ্যমে সংশোধিত',
      pdfShowsOriginal: 'সংযুক্ত PDF-টি অফিস যা পাঠিয়েছিল তাই, এবং তাতে এখনও আগের সংখ্যাগুলোই আছে।',
      confirmingUpdates: 'নিশ্চিত করলে {challan} স্থায়ীভাবে হালনাগাদ হবে',
      cannotBeAdded:
        'যা কেটে বা সরিয়ে দেওয়া হয়েছে তা আর কোনো পরের ট্রিপে যোগ করা যাবে না। বাকিটা পরে পাঠাতে চাইলে বরং চালানটিকে ভাগ করুন।',
      productSummary: 'পণ্যের সারসংক্ষেপ',
      totalProduct: 'মোট পণ্য',
      challanQuantityAria: 'চালানের সংখ্যা',
      challanPdf: 'চালানের PDF',
      signedCopy: 'স্বাক্ষরিত কপি',
      noSignedCopyYet: 'এখনও কোনো স্বাক্ষরিত কপি জমা হয়নি',
      pdfLoadFailed: 'চালানের PDF লোড করা যায়নি।',
    },

    completion: {
      heading: 'পণ্যের কী হলো?',
      returnedLabel: '{product} {model} ফেরত',
      ofTotal: '{total}-এর মধ্যে',
      someCameBack: '{total}-এর মধ্যে {back} ফিরে এসেছে · {delivered} ডেলিভারি হয়েছে।',
      radioAria: 'পণ্যের কী হলো',
      allDelivered: 'সব ডেলিভারি হয়েছে',
      allDeliveredHint: 'কিছুই ফেরত আসেনি',
      someCameBackHint: 'কী ফেরত এসেছে বাছুন',
      fullReturn: 'পুরো চালান ফেরত',
      fullReturnHint: 'এক ক্লিক · কোনো কপি লাগবে না',
      setReturned: 'উপরের লাইনগুলোতে প্রতিটি পণ্যের কতটি ফেরত এসেছে তা বসান।',
      returnedStay: 'ফেরত আসা পণ্য অন্য ট্রিপের জন্য চালানেই থাকে।',
      saveReturns: 'ফেরত সংরক্ষণ করুন',
      returnedInFull: 'পুরোটাই ফেরত — ডেলিভারি বন্ধ',
      saved: 'সংরক্ষিত',
      title: 'ডেলিভারি সম্পন্ন করুন',
      notOnTrip: 'ওই চালানটি এই ট্রিপে নেই',
      notOnTripHint:
        'ট্রিপটি সংশোধনের সময় এটি সরিয়ে দেওয়া হয়ে থাকতে পারে। এখন এটি কী বহন করছে দেখতে ট্রিপটি খুলুন।',
      openDelivery: 'ডেলিভারিটি খুলুন',
      completeDelivery: 'এই ডেলিভারিটি সম্পন্ন করুন',
      leftOnChallan: 'পরের ট্রিপের জন্য চালানে রয়ে গেছে:',
    },

    extras: {
      heading: 'তলা, বহন ও নোট',
      optional: 'ঐচ্ছিক',
      floorLabel: 'কত তলা পর্যন্ত তোলা হয়েছে',
      floorBlank: 'উপরে না উঠলে ফাঁকা রাখুন।',
      noteLabel: 'ডেলিভারির নোট',
      carrying: 'বহন',
      carryingTotal: 'বহনের মোট',
      carryingWith: 'বহন {amount}',
      saveDetails: 'তথ্য সংরক্ষণ করুন',
      floorOutOfRange: 'তলা ০ থেকে {max}-এর মধ্যে হতে হবে, অথবা ফাঁকা রাখতে হবে।',
      detailsHeading: 'বিবরণ',
      total: 'মোট',
      removeCharge: 'এই খরচটি সরান',
      firstCharge: 'গাড়ি বা মজুর লেগেছিল',
      addAnother: 'আরেকটি যোগ করুন',
      chargeHint:
        'পণ্য ভেতরে নিতে কিছু ভাড়া করা হয়ে থাকলেই কেবল। শূন্য টাকার খরচও লিখে রাখার মতো — এতে বোঝা যায় ঠিকানাটিতে সাহায্য লেগেছিল।',
    },

    copy: {
      heading: 'স্বাক্ষরিত কপি',
      pagesSuffix: ' · {pages}',
      filedBy: ' · {name} জমা দিয়েছেন',
      viewerTitle: 'সই করা কপি · {challan}',
      filedOn: ' · জমা {when}',
      fallbackName: 'স্বাক্ষরিত কপি',
      replace: 'বদলান',
      removeAria: 'স্বাক্ষরিত কপিটি সরান',
      scanNew: 'নতুন কপিটি স্ক্যান করুন',
      everythingCameBack:
        'সবকিছুই ফেরত এসেছে, তাই কোনো স্বাক্ষরিত কপির দরকার নেই। এই ডেলিভারিটি বন্ধ।',
      completedWithout: 'স্বাক্ষরিত কপি ছাড়াই সম্পন্ন',
      noReason: 'কোনো কারণ জানানো হয়নি।',
      quotedReason: '“{reason}”',
      foundIt: 'খুঁজে পেয়েছেন? কপিটি স্ক্যান করুন',
      waiting: 'স্বাক্ষরিত কপির অপেক্ষায়।',
      scan: 'স্বাক্ষরিত কপি স্ক্যান করুন',
      missingPrompt: 'কপি নেই? এটি ছাড়াই সম্পন্ন করুন',
      missingTitle: 'স্বাক্ষরিত কপি ছাড়াই সম্পন্ন করবেন?',
      missingHint:
        'কেবল কপিটি হারিয়ে গেলেই। ডেলিভারিতে “{badge}” দেখাবে, এবং পরে কপিটি স্ক্যান করলে ওই চিহ্নটি বদলে যাবে।',
      missingBadge: 'কপি নেই',
      whatHappened: 'কী হয়েছিল?',
      completeWithout: 'কপি ছাড়াই সম্পন্ন করুন',
      viewerAlt: '{challan}-এর স্বাক্ষরিত কপি',
      loadFailed: 'স্বাক্ষরিত কপিটি লোড করা যায়নি।',
      downloadFailed: 'ওই স্বাক্ষরিত কপিটি ডাউনলোড করা যায়নি।',
      filed: 'স্বাক্ষরিত কপি জমা হয়েছে',
      filedNote: 'এই ডেলিভারিটি সম্পন্ন।',
      filedTripComplete: '{trip}-এর প্রতিটি চালানের জন্যই এখন স্বাক্ষর নেওয়া হয়েছে।',
      removed: 'স্বাক্ষরিত কপি সরানো হয়েছে',
      removedNote: 'ডেলিভারিটি আবার খোলা।',
      completedNote: 'স্বাক্ষরিত কপি ছাড়াই রেকর্ড করা হয়েছে। পাওয়া গেলে স্ক্যান করে দিন।',
      completed: 'ডেলিভারি সম্পন্ন হয়েছে',
      reopened: 'ডেলিভারিটি আবার খোলা',
      filingCopy: 'কপিটি জমা হচ্ছে…',
      stopScanning: 'স্ক্যান বন্ধ করুন',
      connectScanner: 'স্ক্যানার যুক্ত করুন',
      scanFromAria: 'কোথা থেকে স্ক্যান',
      glass: 'কাচ',
      feeder: 'ফিডার',
    },

    receipt: {
      prompt: 'স্বাক্ষরিত কপি ফিরে এসেছে, নাকি হাতে একটি ম্যানিফেস্ট?',
      listening:
        'এই পৃষ্ঠার যেকোনো জায়গায় স্ক্যান করুন: চালান স্ক্যান করলে সেটি যে ডেলিভারির তা খোলে, ম্যানিফেস্ট স্ক্যান করলে তার ট্রিপ খোলে।',
      paused: 'স্ক্যান করতে হলে যা খোলা আছে তা বন্ধ করুন, অথবা চালান নম্বরটি লিখুন।',
      placeholder: 'LBTS-CH-2026-000067',
      alreadyOpen: '{challan} আগে থেকেই খোলা',
      openedOn: '{trip}-এ {challan}',
      tripAlreadyOpen: '{trip} আগে থেকেই খোলা',
      tripOpened: '{trip} · {vendor}',
    },

    bill: {
      heading: 'ট্রিপের বিল',
      notEntered: 'লেখা হয়নি',
      tripRent: 'গাড়ি ভাড়া',
      labourBill: 'লেবার বিল',
      tripRentShort: 'গাড়ি ভাড়া',
      labourBillShort: 'লেবার বিল',
      rent: 'ভাড়া',
      labour: 'মজুরি',
      save: 'বিল সংরক্ষণ করুন',
      saved: 'ট্রিপের বিল সংরক্ষিত হয়েছে',
    },

    trip: {
      printManifest: 'ম্যানিফেস্ট প্রিন্ট করুন',
      lastSaved: 'সর্বশেষ সংরক্ষণ {when}',
      lastSavedBy: '{name} সর্বশেষ সংরক্ষণ করেছেন {when}',
      deleteTrip: 'ট্রিপ মুছুন',
      deleting: 'মুছে ফেলা হচ্ছে…',
      keepIt: 'রেখে দিন',
      deleteTitle: '{trip} মুছে ফেলবেন?',
      deleteTitleGeneric: 'ট্রিপ মুছে ফেলবেন?',
      deleteDescription:
        'যে ট্রিপ এখনও বের হয়নি কেবল সেটিই মোছা যায়। এর প্রতিটি চালান অন্য ট্রিপের জন্য মুক্ত হয়ে যায়। ট্রিপের নম্বরটি আর ব্যবহার করা হয় না — ভেন্ডরের সিরিয়াল সেটি এড়িয়ে যায়।',
      deleted: 'ট্রিপ মুছে ফেলা হয়েছে',
      deletedNote: 'এটি যত চালানের সংখ্যা ধরে রেখেছিল সব এখন অন্য ট্রিপের জন্য মুক্ত।',
      actionsAria: '{trip}-এর কাজ',
      fileSignedCopy: 'একটি স্বাক্ষরিত কপি জমা দিন',
      editTrip: 'ট্রিপ সম্পাদনা',
      notFound: 'ট্রিপ পাওয়া যায়নি',
      loadFailed: 'এই ট্রিপটি লোড করা যায়নি',
      deletedHint:
        'গেট পেরোনোর আগেই এটি মুছে ফেলা হয়ে থাকতে পারে, যাতে এটি যত চালান বহন করছিল সবই মুক্ত হয়ে যায়।',
      assignedTo: '{vendor}-এর নামে · {date} · {plate}, চালক {driver}',
      history: 'ইতিহাস',
      notYet: 'এখনও নয়',
      note: 'নোট',
      byAt: '{when} · {name}',
      forThisTripOnly: 'শুধু এই ট্রিপের জন্য',
    },

    list: {
      loadFailed: 'ট্রিপগুলো লোড করা যায়নি',
      noMatches: 'এই ফিল্টারে কোনো ট্রিপ মেলেনি',
      empty: 'এখনও কোনো ডেলিভারি নেই',
      filteredHint: 'কোনো একটি ফিল্টার মুছুন, অথবা অন্য কিছু খুঁজুন।',
      emptyHint: 'একটি গাড়ি, তার চালক এবং তাতে থাকা চালানগুলো নিশ্চিত করলেই একটি ট্রিপ তৈরি হয়।',
      createFirst: 'প্রথম ডেলিভারিটি তৈরি করুন',
      figuresFailed: 'ডেলিভারির সংখ্যাগুলো লোড করা যায়নি।',
      tripsToday: 'আজকের ট্রিপ',
      summaryFiltered: '{trips} এই ফিল্টারে মিলেছে · {challans} · {pieces}',
      summaryTotal: '{trips} · {challans} · {pieces}',
    },

    filters: {
      searchPlaceholder: 'ট্রিপ, নম্বরপ্লেট, চালক, ভেন্ডর বা চালান',
      searchAria: 'ট্রিপ খুঁজুন',
      statusAria: 'অবস্থা অনুযায়ী ফিল্টার',
      anyStatus: 'যেকোনো অবস্থা',
      vendorAria: 'ভেন্ডর অনুযায়ী ফিল্টার',
      everyVendor: 'সব ভেন্ডর',
      fromAria: 'যে তারিখ থেকে',
      untilAria: 'যে তারিখ পর্যন্ত',
      noRent: 'গাড়ি ভাড়া নেই',
      noLabour: 'লেবার বিল নেই',
    },

    table: {
      trip: 'ট্রিপ',
      date: 'তারিখ',
      vehicle: 'গাড়ি',
      driver: 'চালক',
      challans: 'চালান',
      tripRent: 'গাড়ি ভাড়া',
      labourBill: 'লেবার বিল',
      status: 'অবস্থা',
      actions: 'কাজ',
      total: 'মোট',
    },

    manifest: {
      onTheLorry: 'লরিতে যা আছে',
      forModel: ' {model}-এর জন্য',
      ofQty: ' {qty}-এর মধ্যে',
      where: 'থানা: {thana} · জেলা: {district}',
      date: 'তারিখ:',
      status: 'অবস্থা:',
      vehicle: 'গাড়ি',
      vendor: 'ভেন্ডর',
      driver: 'চালক',
      sl: 'SL',
      customerAndDelivery: 'গ্রাহক ও ডেলিভারি',
      products: 'পণ্য',
      qty: 'সংখ্যা',
      note: 'নোট',
      tripNote: 'ট্রিপের নোট:',
      preparedBy: 'প্রস্তুতকারী',
      documentTitle: '{trip} — ট্রিপ ম্যানিফেস্ট',
      brandLine: 'LBTS · ট্রিপ ম্যানিফেস্ট',
      wholeTrip: 'পুরো ট্রিপ · {challans}',
      endOfManifest: 'ম্যানিফেস্ট শেষ · {challans} · {pieces}',
      tripRent: 'গাড়ি ভাড়া',
      labourBill: 'লেবার বিল',
    },
  },

  gatePass: {
    title: 'গেট পাস',
    pageDescription: 'প্রতিটি ট্রিপের বিপরীতে রাখা গেট পাস, সঙ্গে স্ক্যান করা হার্ড কপি।',
    listAria: 'গেট পাসের রেকর্ড',
    newGatePass: 'নতুন গেট পাস',
    correctGatePass: 'গেট পাস সংশোধন',
    allGatePasses: 'সব গেট পাস',
    backToList: 'গেট পাসে ফিরুন',
    notFound: 'গেট পাস পাওয়া যায়নি',
    notFoundHint: 'এটি মুছে ফেলা হয়ে থাকতে পারে, অথবা আপনার এতে প্রবেশাধিকার নাও থাকতে পারে।',
    somethingWrong: 'কিছু একটা ভুল হয়েছে।',
    hasDocument: 'স্ক্যান করা ডকুমেন্ট আছে',

    statuses: {
      Draft: { label: 'খসড়া', description: 'তৈরি হচ্ছে। এখনও রেকর্ডের অংশ নয়।' },
      Submitted: {
        label: 'জমা দেওয়া',
        description: 'মূল কাগজের সঙ্গে মিলিয়ে যাচাইয়ের অপেক্ষায়।',
      },
      Verified: {
        label: 'যাচাইকৃত',
        description: 'স্ক্যান করা গেট পাসের সঙ্গে মিলিয়ে দেখে গ্রহণ করা হয়েছে।',
      },
      Rejected: {
        label: 'ফেরত পাঠানো',
        description: 'সংশোধনের জন্য ফেরত পাঠানো হয়েছে। ঠিক করে আবার জমা দিন।',
      },
      unknown: { label: 'অজানা', description: 'অচেনা অবস্থা' },
    },

    referenceTypes: {
      None: 'কোনো রেফারেন্স নেই',
      Zone: 'জোন',
      PO: 'PO',
    },
    zoneWith: 'জোন {value}',
    poWith: 'PO {value}',

    columns: {
      tripDate: 'ট্রিপের তারিখ',
      delivery: 'ডেলিভারির অবস্থা',
      csd: 'CSD',
      unit: 'ইউনিট',
      vehicle: 'গাড়ি',
      customer: 'গ্রাহক',
      product: 'পণ্য',
      model: 'মডেল',
      qty: 'সংখ্যা',
      status: 'অবস্থা',
      tripDo: 'ট্রিপ DO',
      actions: 'কাজ',
    },

    itemSummary: '{product} ({model})',
    itemSummaryMore: '{product} ({model}) +আরও {count}টি',

    stats: {
      today: 'আজকের গেট পাস',
      todayHint: 'আজকের তারিখের ট্রিপ',
      submitted: 'যাচাইয়ের অপেক্ষায়',
      submittedHint: 'জমা হয়েছে, এখনও দেখা হয়নি',
      verified: 'যাচাইকৃত',
      verifiedHint: 'স্ক্যানের সঙ্গে মিলিয়ে দেখা হয়েছে',
      rejected: 'ফেরত পাঠানো',
      rejectedHint: 'সংশোধনের অপেক্ষায়',
      loadFailed: 'গেট পাসের সারসংক্ষেপ লোড করা যায়নি।',

      delivered: 'ডেলিভারি হওয়া সংখ্যা',
      notDelivered: 'ডেলিভারি না হওয়া সংখ্যা',
      pcs: 'পিস',
      deliveredHint: '{scope} মোট {total} পিসের {percent}',
      notDeliveredHint: '{percent} এখনও ডেলিভারি বাকি, অথবা এখনও কোনো চালানে নেই',
      scopeFiltered: 'এই ফিল্টারে মেলা গেট পাসগুলোতে',
      scopeAll: 'প্রতিটি গেট পাসে',

      recordCount: { one: '{n}টি গেট পাস', other: '{n}টি গেট পাস' },
      summaryFiltered: '{records} এই ফিল্টারে মিলেছে',
      summaryTotal: '{records} রেকর্ডে আছে',
      deliveredOf: '{total}-এর মধ্যে {delivered} ডেলিভারি হয়েছে',
    },

    list: {
      loading: 'গেট পাস লোড হচ্ছে',
      loadFailed: 'গেট পাস লোড করা যায়নি',
      retrying: 'আবার চেষ্টা করা হচ্ছে…',
      noneFound: 'কোনো গেট পাস পাওয়া যায়নি',
      noneYet: 'এখনও কোনো গেট পাস নেই',
      filteredHint: 'আপনার বর্তমান ফিল্টারের সঙ্গে কোনো গেট পাস রেকর্ড মেলেনি।',
      emptyHint: 'একটি হার্ড কপি স্ক্যান করে তার তথ্য লিখুন, তাহলেই এখানে দেখা যাবে।',
    },

    filters: {
      searchPlaceholder: 'গেট পাস, DO, গ্রাহক, গাড়ি, মডেল',
      searchAria: 'গেট পাস খুঁজুন',
      dateFrom: 'ট্রিপের তারিখ থেকে',
      dateTo: 'ট্রিপের তারিখ পর্যন্ত',
      bill: 'বিল',
      referenceType: 'রেফারেন্সের ধরন',
      any: 'যেকোনো',
      reference: 'জোন বা PO',
      referencePlaceholder: 'CSD-07 বা 627143140',
      createdBy: 'যিনি তৈরি করেছেন',
      onlyMine: 'শুধু আমার',
      everyone: 'সবার',
      customRange: '{from} থেকে {to}',
      unset: '…',
    },

    sections: {
      trip: 'ট্রিপ',
      tripHint: 'ডেলিভারি অর্ডার এবং কোথা থেকে বেরিয়েছে।',
      delivery: 'ডেলিভারি',
      deliveryHint: 'পণ্য কার কাছে যাচ্ছে, এবং কী বহন করছে।',
      reference: 'রেফারেন্স',
      referenceHint: 'ঐচ্ছিক। কোনো জোন বা পারচেজ অর্ডারের বিপরীতে রাখা।',
      goods: 'পণ্য',
      goodsHint: 'গাড়িতে কী আছে। চালানের প্রতিটি পণ্যের জন্য একটি সারি যোগ করুন।',
    },

    fields: {
      tripDo: 'ট্রিপ DO',
      tripDoHint: 'ছাপা অবস্থায় ঠিক যেমন আছে। যতিচিহ্ন ও ফাঁকা জায়গা একই রাখা হয়।',
      tripDate: 'ট্রিপের তারিখ',
      csd: 'CSD',
      unit: 'ইউনিট',
      customerName: 'গ্রাহকের নাম',
      vehicleNo: 'গাড়ির নম্বর',
      vehicleHint: 'বড় হাতের অক্ষরে লেখা হয়। ছাপা অবস্থার ফাঁকা জায়গা ও যতিচিহ্ন একই রাখা হয়।',
      referenceType: 'রেফারেন্সের ধরন',
      zone: 'জোন',
      po: 'PO নম্বর',
      noReference: 'এই গেট পাসটি কোনো জোন বা PO-র বিপরীতে রাখা নেই।',
      productName: 'পণ্যের নাম',
      model: 'মডেল',
      qty: 'সংখ্যা',
      productIndex: 'পণ্য {n}',
      removeProduct: 'পণ্য {n} সরান',
      addProduct: 'আরেকটি পণ্য যোগ করুন',
      maxProducts: 'একটি গেট পাসে এর বেশি পণ্য রাখা যায় না।',
      rowTotal: '{rows} · মোট {total}',
    },

    carry: {
      fields: 'ট্রিপের তারিখ, CSD, ইউনিট, গ্রাহকের নাম এবং গাড়ির নম্বর',
      sameAsLast: 'আগেরটির মতোই',
      banner:
        '{source} থেকে {fields} ঘরগুলোর উপরে দেখানো হয়েছে। এই কাগজের সঙ্গে যেগুলো মেলে, সেগুলোতে “{tick}” টিক দিন; বাকিগুলো আপনি না লেখা পর্যন্ত ফাঁকাই থাকবে।',
    },

    footer: {
      documentAttached: 'ডকুমেন্ট যুক্ত হয়েছে',
      documentRequired: 'জমা দিতে হলে একটি স্ক্যান করা ডকুমেন্ট লাগবে।',
      attachedSr: 'একটি স্ক্যান করা ডকুমেন্ট যুক্ত আছে।',
      noDocumentSr: 'এখনও কোনো স্ক্যান করা ডকুমেন্ট নেই।',
      saveDraft: 'খসড়া সংরক্ষণ',
      blocked:
        'আগে স্ক্যান করা {n}টি কাগজ জোড়া দিয়ে একটি ডকুমেন্ট বানান, অথবা যেগুলো এখানকার নয় সেগুলো সরান।',
    },

    submit: {
      gatePass: 'গেট পাস জমা দিন',
      sheetOf: '{total}-এর মধ্যে {position} নম্বর কাগজ জমা দিন',
      saveReverify: 'সংরক্ষণ করে আবার যাচাই করান',
      saveChanges: 'পরিবর্তন সংরক্ষণ',
      resubmit: 'আবার জমা দিন',
    },

    workspace: {
      newHint: 'পুরো স্তূপটি একবারে স্ক্যান করুন, তারপর পাশের ছবির সঙ্গে মিলিয়ে প্রতিটি কাগজ লিখুন।',
      correctHint: '{gatePass} · স্ক্যানের সঙ্গে মিলিয়ে প্রতিটি ঘর দেখে নিন, তারপর {verb}।',
      verbSave: 'সংশোধনটি সংরক্ষণ করুন',
      verbSubmit: 'জমা দিন',
      verifiedTitle: 'এই গেট পাসটি যাচাই হয়ে গেছে।',
      verifiedBody:
        'এটি এখন যা বলছে তার বিপরীতেই যাচাই হয়েছিল, তাই কোনো সংশোধন সংরক্ষণ করলে — মান হোক বা স্ক্যান — এটি আবার যাচাইয়ের জন্য ফিরে যাবে।',
      savedAt: '{time}-এ সংরক্ষিত',
      detailsAria: 'গেট পাসের বিবরণ',
      backToDetails: 'বিবরণে ফিরুন',
      tabsAria: 'গেট পাস ওয়ার্কস্পেস',
      tabDetails: 'বিবরণ',
      tabScan: 'স্ক্যান',
    },

    scanner: {
      panelAria: 'স্ক্যানার ও ডকুমেন্ট',
      source: 'উৎস',
      flatbed: 'ফ্ল্যাটবেড কাচ',
      feeder: 'ডকুমেন্ট ফিডার',
      resolution: 'রেজোলিউশন',
      dpi: '{n} dpi',
      colour: 'রং',
      colorModes: {
        color: 'রঙিন',
        grayscale: 'সাদাকালো শেড',
        blackwhite: 'সাদা ও কালো',
      },
      stop: 'স্ক্যান বন্ধ করুন',
      scan: 'গেট পাস স্ক্যান করুন',
      fileRejected: 'এই ফাইলটি ব্যবহার করা যাবে না',
      bothSources: 'ফ্ল্যাটবেড ও ফিডার',
      page: 'পৃষ্ঠা {n}',
      emptyDealt: 'স্ক্যান করা প্রতিটি কাগজের কাজ শেষ। পরের স্তূপটি স্ক্যান করুন, বা একটি ফাইল যুক্ত করুন।',
      emptyNone:
        'এখনও কোনো গেট পাস ডকুমেন্ট নেই। ফিডারে স্তূপটি রেখে স্ক্যান করুন, বা একটি ফাইল যুক্ত করুন।',
      readyToFile: 'জমা দেওয়ার জন্য প্রস্তুত',
      pageCount: { one: '{n} পৃষ্ঠা', other: '{n} পৃষ্ঠা' },
      sheetsJoined: { one: '{n}টি কাগজ জোড়া দেওয়া', other: '{n}টি কাগজ জোড়া দেওয়া' },
    },

    tray: {
      ariaLabel: 'স্ক্যান করা কাগজ',
      sheetsScanned: { one: '{n}টি কাগজ স্ক্যান হয়েছে', other: '{n}টি কাগজ স্ক্যান হয়েছে' },
      savedAsOne: 'একটি ডকুমেন্ট হিসেবে সংরক্ষিত',
      filedOf: '{total}-এর মধ্যে {filed}টি জমা হয়েছে',
      filedOfToGo: '{total}-এর মধ্যে {filed}টি জমা হয়েছে · আরও {remaining}টি বাকি',
      selectSheets: 'কাগজ বাছুন',
      theseAreOne: 'এগুলো একটিই গেট পাস',
      clearAll: 'সব সাফ করুন',
      pickHint:
        'যে কাগজগুলো মিলে একটিই গেট পাস, সেগুলোতে টিক দিন। স্ক্যান হওয়ার ক্রমেই সেগুলো জোড়া দিয়ে একটি ডকুমেন্ট বানান — অথবা যেগুলো এখানকার নয় সেগুলো সরান।',
      remove: 'সরান',
      removeCount: '{n}টি সরান',
      joinSheets: 'কাগজ জোড়া দিন',
      joinCount: '{n}টি কাগজ জোড়া দিন',
      joining: 'জোড়া দেওয়া হচ্ছে…',
      oneDocument:
        'এই গেট পাসে একটিই ডকুমেন্ট থাকে। এই {n}টি কাগজ জোড়া দিয়ে একটি বানান, অথবা যেগুলো এখানকার নয় সেগুলো সরান।',
      joinAll: '{n}টিই জোড়া দিন',
      showingSheet: '{total}-এর মধ্যে {position} নম্বর কাগজ দেখানো হচ্ছে',
      enteringSheet: '{total}-এর মধ্যে {position} নম্বর কাগজ লেখা হচ্ছে',
      separate: 'আবার আলাদা করুন',
      skip: 'এই কাগজটি বাদ দিন',
      discard: 'ফেলে দিন',
      sheetStatuses: {
        pending: 'এখনও লেখা হয়নি',
        submitted: 'জমা দেওয়া',
        draft: 'খসড়া হিসেবে সংরক্ষিত',
        skipped: 'বাদ দেওয়া',
      },
      tileSheet: 'কাগজ {n}',
      tileJoined: '{sheets} মিলে একটি গেট পাস · {status}',
      tileDescription: 'কাগজ {n} · {status}',
      tileAlreadyFiled: ' · আগেই জমা হয়েছে, জোড়া দেওয়া যাবে না',
    },

    batch: {
      ariaLabel: 'স্তূপ শেষ',
      filedOf: '{total}টি কাগজের মধ্যে {filed}টি জমা হয়েছে',
      allFiled: 'স্ক্যান করা প্রতিটি কাগজই এখন একটি করে গেট পাস।',
      skippedNote: {
        one: '{n}টি কাগজ বাদ দেওয়া হয়েছে এবং রেকর্ডে রাখা হয়নি।',
        other: '{n}টি কাগজ বাদ দেওয়া হয়েছে এবং রেকর্ডে রাখা হয়নি।',
      },
      sheetN: 'কাগজ {n}',
      skipped: 'বাদ দেওয়া',
      notEntered: 'লেখা হয়নি',
      draft: 'খসড়া',
      open: 'খুলুন',
      viewAll: 'সব গেট পাস দেখুন',
      scanNext: 'পরের স্তূপ স্ক্যান করুন',
    },

    viewer: {
      loading: 'স্ক্যান করা ডকুমেন্ট লোড হচ্ছে…',
      loadFailed: 'ডকুমেন্টটি লোড করা যায়নি',
      empty: 'এখনও কোনো গেট পাস ডকুমেন্ট স্ক্যান করা হয়নি।',
      scannedTitle: 'স্ক্যান করা গেট পাস',
      scannedAria: 'স্ক্যান করা ডকুমেন্ট',
      scannedHint: 'মূল হার্ড কপি, যেমনটি স্ক্যান করা হয়েছিল।',
      noDocument: 'এই গেট পাসে কোনো স্ক্যান করা ডকুমেন্ট নেই।',
      scanItNow: 'এখনই স্ক্যান করুন',
      pdfDocument: 'PDF ডকুমেন্ট',
      pdfHint: ' · পৃষ্ঠা বদলাতে ও জুম করতে ভিউয়ারের বোতামগুলো ব্যবহার করুন',
      fit: 'মাপমতো',
      zoomIn: 'বড় করুন',
      zoomOut: 'ছোট করুন',
      rotateLeft: 'বাঁদিকে ঘোরান',
      rotateRight: 'ডানদিকে ঘোরান',
      fullscreen: 'পূর্ণ পর্দা',
      exitFullscreen: 'পূর্ণ পর্দা থেকে বেরোন',
      rescan: 'আবার স্ক্যান',
      removeDocument: 'ডকুমেন্ট সরান',
      loadingRecord: 'গেট পাসটি লোড হচ্ছে',

      loadFailedSentence: 'ডকুমেন্টটি লোড করা যায়নি।',
    },

    duplicate: {
      titleOne: 'এই ট্রিপ DO আগে থেকেই একটি গেট পাসে আছে',
      titleMany: 'এই ট্রিপ DO আগে থেকেই {n}টি গেট পাসে আছে',
      description:
        'জমা দেওয়ার আগে দেখে নিন এটি একই ট্রিপ কি না। যেভাবেই হোক আপনার কাজ খসড়া হিসেবে সংরক্ষিত থাকবে।',
      matchedTripDo: 'একই ট্রিপ DO',
      moreItems: '+আরও {n}টি',
      view: 'দেখুন',
      goBack: 'ফিরে গিয়ে দেখুন',
      submitting: 'জমা দেওয়া হচ্ছে…',
      submitAnyway: 'এটি অন্য ট্রিপ — জমা দিন',
    },

    review: {
      verifyTitle: 'এই গেট পাসটি যাচাই করুন',
      verifyDescription:
        'নিশ্চিত করুন যে {gatePass} স্ক্যান করা ডকুমেন্টের সঙ্গে প্রতিটি বিষয়ে মিলছে।',
      verifyConfirm: 'যাচাই করুন',
      verifyNoteLabel: 'নোট (ঐচ্ছিক)',
      verifyNotePlaceholder: 'এই যাচাই নিয়ে লিখে রাখার মতো কিছু থাকলে',
      rejectTitle: 'সংশোধনের জন্য ফেরত পাঠান',
      rejectDescription:
        '{gatePass} যিনি তৈরি করেছেন তাঁর কাছে ফিরে যাবে, তিনি ঠিক করে আবার জমা দিতে পারবেন।',
      rejectConfirm: 'ফেরত পাঠান',
      rejectNoteLabel: 'কী সংশোধন করতে হবে',
      rejectNotePlaceholder: 'গাড়ির নম্বর চালানের সঙ্গে মিলছে না',
      noteHint: 'যিনি তৈরি করেছেন তিনি এটি দেখবেন, তাই কী বদলাতে হবে তা লিখুন।',
      working: 'কাজ চলছে…',
      reviewerNote: 'যিনি যাচাই করেছেন তাঁর নোট:',
    },

    remove: {
      title: '{gatePass} মুছে ফেলবেন?',
      draftBody:
        'এই খসড়া এবং এর স্ক্যান করা ডকুমেন্ট চিরতরে মুছে যাবে। জমা দেওয়া কোনো কিছুতে এর প্রভাব পড়বে না।',
      filedBody:
        'এই {status} গেট পাস এবং এর স্ক্যান করা ডকুমেন্ট চিরতরে মুছে যাবে, এবং এটি যেসব তালিকা ও গণনায় ছিল সব থেকেই চলে যাবে। এটি আর ফেরানো যাবে না।',
      keepIt: 'থাক',
      deleteDraft: 'খসড়া মুছুন',
      deleteGatePass: 'গেট পাস মুছুন',
      deleting: 'মুছে ফেলা হচ্ছে…',
    },

    exportDialog: {
      title: '{records} এক্সপোর্ট করবেন?',
      filteredBody:
        'এই ফিল্টারে মেলা {records} একটি এক্সেল ফাইল হিসেবে ডাউনলোড হবে — এগুলোতে মোট {qty} সংখ্যা।',
      allBody:
        'রেকর্ডের প্রতিটি গেট পাস একটি এক্সেল ফাইল হিসেবে ডাউনলোড হবে — {records}, এগুলোতে মোট {qty} সংখ্যা।',
      lineNote:
        'প্রতিটি পণ্যের লাইন নিজের একটি সারি পায়, তাই একাধিক পণ্য বহন করা গেট পাস একাধিকবার আসে।',
      building: 'তৈরি হচ্ছে…',
      confirm: 'এক্সপোর্ট',
      trigger: 'এক্সপোর্ট',
    },

    menu: {
      aria: '{gatePass}-এর কাজ',
      view: 'বিবরণ দেখুন',
      download: 'ডকুমেন্ট ডাউনলোড করুন',
      print: 'গেট পাস প্রিন্ট করুন',
      verify: 'যাচাই করুন',
      sendBack: 'ফেরত পাঠান',
    },

    detail: {
      created: '{customer} · {when} তৈরি',
      createdBy: '{customer} · {when} {name} তৈরি করেছেন',
      printWaiting: 'স্ক্যানের অপেক্ষায়',
      trip: 'ট্রিপ',
      delivery: 'ডেলিভারি',
      goods: 'পণ্য',
      reference: 'রেফারেন্স',
      document: 'ডকুমেন্ট',
      history: 'ইতিহাস',
      customer: 'গ্রাহক',
      vehicle: 'গাড়ি',
      product: 'পণ্য',
      model: 'মডেল',
      total: 'মোট',
      type: 'ধরন',
      value: 'মান',
      file: 'ফাইল',
      size: 'আকার',
      pages: 'পৃষ্ঠা',
      scanned: 'স্ক্যান',
      pdf: 'PDF',
      image: 'ছবি',
      noneAttached: 'কোনো স্ক্যান করা ডকুমেন্ট যুক্ত নেই',
      created_: 'তৈরি',
      submitted: 'জমা',
      lastChange: 'সর্বশেষ পরিবর্তন',
      lastEdited: 'সর্বশেষ সম্পাদনা',
      byPerson: '{when} · {name}',
    },

    stages: {
      saving: 'গেট পাস সংরক্ষণ হচ্ছে…',
      uploading: 'ডকুমেন্ট আপলোড হচ্ছে…',
      finalizing: 'শেষ করা হচ্ছে…',
      coldStart: 'সার্ভারটি জেগে উঠতে একটু সময় নিতে পারে। দেরি হলেও কিছু হারাবে না।',
    },

    toasts: {
      preparing: 'ডকুমেন্টটি প্রস্তুত করা হচ্ছে…',
      documentDownloaded: 'ডকুমেন্ট ডাউনলোড হয়েছে',
      buildingSpreadsheet: 'স্প্রেডশিট তৈরি হচ্ছে…',
      spreadsheetDownloaded: 'স্প্রেডশিট ডাউনলোড হয়েছে',
      verified: 'গেট পাস যাচাই হয়েছে',
      sentBack: 'গেট পাস সংশোধনের জন্য ফেরত পাঠানো হয়েছে',
      deleted: '{gatePass} মুছে ফেলা হয়েছে',
      draftSaved: 'খসড়া সংরক্ষিত হয়েছে',
      draftSavedNote: '{gatePass} সংরক্ষিত হয়েছে। পরে শেষ করতে পারবেন।',
      sentBackForVerification: 'যাচাইয়ের জন্য ফেরত পাঠানো হয়েছে',
      reverifyNote:
        'যা যাচাই হয়েছিল তা বদলে গেছে, তাই {gatePass} আবার যাচাইকারীর কাছে ফিরে যাচ্ছে।',
      changesSaved: 'পরিবর্তন সংরক্ষিত হয়েছে',
      upToDate: '{gatePass} হালনাগাদ আছে।',
      scanFirst: 'আগে গেট পাসটি স্ক্যান করুন',
      scanFirstNote: 'জমা দেওয়া গেট পাসে তার স্ক্যান করা ডকুমেন্ট থাকতেই হবে।',
      nothingToPrint: 'এই গেট পাসে প্রিন্ট করার মতো কোনো স্ক্যান করা ডকুমেন্ট নেই।',
      scanLoadFailed: 'স্ক্যানটি লোড করা যায়নি, তাই প্রিন্ট করার মতো কিছু নেই।',
      sheetsJoined: { one: '{n}টি কাগজ জোড়া দেওয়া হয়েছে', other: '{n}টি কাগজ জোড়া দেওয়া হয়েছে' },
      sheetsJoinedNote: {
        one: 'এটি এখন একটি {pages} পৃষ্ঠার ডকুমেন্ট, একটি গেট পাস হিসেবেই জমা হবে।',
        other: 'এগুলো এখন একটি {pages} পৃষ্ঠার ডকুমেন্ট, একটি গেট পাস হিসেবেই জমা হবে।',
      },
      joinFailed:
        'ওই কাগজগুলো জোড়া দেওয়া যায়নি। একটি সরান, অথবা চালানটি একটিই PDF হিসেবে স্ক্যান করুন।',
      errorDetail: '{path}: {message}',
    },

    documentRules: {
      hint: 'PDF সর্বোচ্চ ২৫ MB, অথবা JPG, PNG, WEBP সর্বোচ্চ ১০ MB',
      wrongType: 'এই ধরনের ফাইল চলবে না। PDF, JPG, PNG বা WEBP ব্যবহার করুন।',
      emptyFile: 'ফাইলটি ফাঁকা। অন্য একটি ফাইল বাছুন।',
      tooLarge: 'ফাইলটি {size}। সর্বোচ্চ সীমা {limit}।',
      imageUnreadable: '{file} ছবি হিসেবে পড়া যায়নি।',
      pdfUnreadable: '{file} পড়ার মতো PDF নয়।',
      unopenable: '{file} খোলা যায়নি। এটি নষ্ট হয়ে থাকতে পারে।',
      needTwoSheets: 'জোড়া দিতে অন্তত দুটি কাগজ বাছুন।',
      imageConvertFailed: 'এই ব্রাউজার ওই ছবিটি রূপান্তর করতে পারেনি। এটি PDF হিসেবে স্ক্যান করুন।',
      mergedTooLarge:
        'ওই {sheets} মিলে {size} হয়, যা {limit} সীমার বেশি। কম শিট জোড়া দিন, বা স্ট্যাকটি কম রেজোলিউশনে স্ক্যান করুন।',
    },

    validation: {
      tripDoRequired: 'ট্রিপ DO লিখতে হবে',
      tripDoTooLong: 'ট্রিপ DO সর্বোচ্চ ৬০ অক্ষরের হতে পারে',
      csdRequired: 'CSD লিখতে হবে',
      csdTooLong: 'CSD সর্বোচ্চ ২৪ অক্ষরের হতে পারে',
      unitRequired: 'ইউনিট লিখতে হবে',
      unitTooLong: 'ইউনিট সর্বোচ্চ ২৪ অক্ষরের হতে পারে',
      modelRequired: 'মডেল লিখতে হবে',
      modelTooLong: 'মডেল সর্বোচ্চ ৮০ অক্ষরের হতে পারে',
      vehicleRequired: 'গাড়ির নম্বর লিখতে হবে',
      vehicleTooLong: 'গাড়ির নম্বর সর্বোচ্চ ৬০ অক্ষরের হতে পারে',
      productTooShort: 'পণ্যের নাম অন্তত ২ অক্ষরের হতে হবে',
      productTooLong: 'পণ্যের নাম সর্বোচ্চ ১৬০ অক্ষরের হতে পারে',
      qtyRequired: 'সংখ্যা লিখতে হবে',
      qtyWhole: 'সংখ্যাটি পূর্ণসংখ্যা হতে হবে',
      qtyAtLeastOne: 'সংখ্যা অন্তত ১ হতে হবে',
      qtyTooLarge: 'সংখ্যাটি খুব বড় মনে হচ্ছে। চালানটি দেখে নিন।',
      tripDateRequired: 'ট্রিপের তারিখ লিখতে হবে',
      tripDateInvalid: 'সঠিক একটি তারিখ লিখুন',
      tripDateOutOfRange: 'এই তারিখটি এই সিস্টেম যে সময়সীমা রাখে তার বাইরে',
      customerTooShort: 'গ্রাহকের নাম অন্তত ২ অক্ষরের হতে হবে',
      customerTooLong: 'গ্রাহকের নাম সর্বোচ্চ ১৬০ অক্ষরের হতে পারে',
      vehicleTooShort: 'গাড়ির নম্বর অন্তত ৩ অক্ষরের হতে হবে',
      itemsAtLeastOne: 'অন্তত একটি পণ্য যোগ করুন',
      itemsTooMany: 'একটি গেট পাসে সর্বোচ্চ ৫০টি পণ্য রাখা যায়',
      zoneTooLong: 'জোন সর্বোচ্চ ৬০ অক্ষরের হতে পারে',
      poTooLong: 'PO সর্বোচ্চ ৬০ অক্ষরের হতে পারে',
      zoneRequired: 'জোনটি লিখুন।',
      poRequired: 'PO নম্বরটি লিখুন।',
      noteTooLong: 'নোট সর্বোচ্চ ৪০০ অক্ষরের হতে পারে',
    },
  },

  tripDo: {
    title: 'ট্রিপ DO',
    description:
      'প্রতিটি চালানের প্রতিটি পণ্যের লাইন আলাদা সারিতে, নিচে তার ফেরত ও পুনঃপ্রেরণসহ। কোন ট্রিপ DO-তে সারিটি বেরিয়েছে তা বসান — একটি লাইন একাধিক ট্রিপ DO-তে গেলে সংখ্যাটি ভাগ করুন — আর গেট পাস নিজেই তার CSD ও ইউনিট জোগায় এবং তার মাল কোথায় আছে তা দেখায়।',
    sheetAria: 'ট্রিপ DO শিট',
    setTripDo: 'ট্রিপ DO বসান',
    openSheet: 'শিট খুলুন',
    unitWith: 'ইউনিট {unit}',
    changeTripDo: 'ট্রিপ DO বদলান',
    notSet: 'বসানো নেই',
    noModel: 'কোনো মডেল নেই',
    pending: 'অপেক্ষমাণ',

    columns: {
      date: 'তারিখ',
      trip: 'ট্রিপ নম্বর',
      status: 'ডেলিভারির অবস্থা',
      customer: 'গ্রাহক',
      address: 'ঠিকানা',
      district: 'জেলা',
      thana: 'থানা',
      location: 'লোকেশন',
      receiver: 'গ্রাহকের নম্বর',
      zone: 'জোন',
      product: 'পণ্যের নাম',
      model: 'মডেল',
      qty: 'সংখ্যা',
      rate: 'রেট',
      amount: 'টাকার পরিমাণ',
      capacity: 'ধারণক্ষমতা',
      csd: 'CSD',
      unit: 'ইউনিট',
      bill: 'বিল',
      tripDo: 'ট্রিপ DO',
    },

    rowStatuses: {
      Pending: { label: 'পাঠানো হয়নি', description: 'দাখিল হয়েছে, এখনও কোনো ট্রিপে যায়নি।' },
      Partial: { label: 'আংশিক পাঠানো', description: 'কয়েকটি ট্রিপে ভাগ হয়েছে, কিছু এখনও যাওয়ার বাকি।' },
      Dispatched: { label: 'পাঠানো হয়েছে', description: 'গেট পেরিয়েছে; স্বাক্ষরিত কপি এখনও ফেরেনি।' },
      Delivered: { label: 'পৌঁছে দেওয়া হয়েছে', description: 'এটি বহনকারী প্রতিটি ট্রিপের স্বাক্ষরিত কপি এসে গেছে।' },
      Returned: { label: 'ফেরত এসেছে', description: 'গিয়েছিল এবং ফেরত এসেছে; ডিপোতে অপেক্ষা করছে।' },
    },

    gatePassStatuses: {
      Unlinked: {
        label: 'এখনও কোনো চালান নেই',
        description: 'কোনো চালানের সারি এই গেট পাসকে নিজের ট্রিপ DO হিসেবে দেখায়নি।',
      },
      Returned: {
        description: 'যুক্ত একটি ফেরত ডিপোতে আছে, এবং যুক্ত কিছুই সেটি আবার বের করেনি।',
      },
      Resent: {
        label: 'পুনরায় পাঠানো',
        description: 'ফেরত আসা পিসগুলো পরের কোনো ট্রিপে আবার গেছে; সবগুলোর স্বাক্ষর এখনও আসেনি।',
      },
    },

    kinds: {
      Order: { label: 'অর্ডার', description: 'চালান যেভাবে অর্ডার করেছে, সেই পণ্যের লাইন।' },
      Return: { label: 'ফেরত', description: 'যে পিসগুলো এই ট্রিপে গিয়ে ফেরত এসেছে।' },
      Resent: { label: 'পুনরায় পাঠানো', description: 'যে পিসগুলো ফেরত এসেছিল এবং এই ট্রিপ আবার নিয়ে গেছে।' },
    },

    filters: {
      kindAll: 'সব সারি',
      kindOrder: 'অর্ডারের সারি',
      kindReturn: 'ফেরত',
      kindResent: 'পুনঃপ্রেরণ',
      linkAll: 'যেকোনো ট্রিপ DO',
      linkLinked: 'ট্রিপ DO বসানো',
      linkUnlinked: 'ট্রিপ DO-এর অপেক্ষায়',
      statusAll: 'যেকোনো ডেলিভারি অবস্থা',
      tripDoAria: 'ট্রিপ DO অনুযায়ী ফিল্টার',
      kindAria: 'সারির ধরন অনুযায়ী ফিল্টার',
      searchPlaceholder: 'SL, চালান, গ্রাহক, ফোন, মডেল, ট্রিপ DO বা ট্রিপ',
      searchAria: 'ট্রিপ DO শিটে খুঁজুন',
    },

    overview: {
      rows: 'শিটে থাকা সারি',
      linked: 'ট্রিপ DO বসানো',
      waiting: 'ট্রিপ DO-এর অপেক্ষায়',
      returns: 'ফেরত ও পুনঃপ্রেরণ',

      rowsHint: '{pieces} · {amount}',
      linkedHint: '{total} পিসের মধ্যে {linked} · {rows}',
      waitingHint: '{pieces} কোনো গেট পাসের সাথে মেলানো হয়নি',
      returnsHint: '{returned} ফিরে এসেছে · {resent} আবার গেছে',
    },

    directory: {
      loading: 'ট্রিপ DO শিট লোড হচ্ছে',
      summaryFiltered: '{rows} · {pieces} · {amount} এই ফিল্টারে মিলেছে',
      summaryTotal: 'শিটে {rows} · {pieces} · {amount}',
      loadFailed: 'শিটটি লোড করা যায়নি',
      retrying: 'আবার চেষ্টা করা হচ্ছে…',
      noRows: 'কোনো সারি মেলেনি',
      empty: 'শিটটি খালি',
      filteredHint: 'বর্তমান ফিল্টারের সঙ্গে চালানের কোনো পণ্যের লাইন, ফেরত বা পুনঃপ্রেরণ মেলেনি।',
      emptyHint:
        'দাখিল করা প্রতিটি চালানের প্রতিটি পণ্যের লাইন এখানে আলাদাভাবে দেখা যায়। একটি চালান দাখিল করুন, তার লাইনগুলো ট্রিপ DO-এর জন্য প্রস্তুত হয়ে শিটে চলে আসবে।',
    },

    assign: {
      chooseGatePass: 'এই মাল যে গেট পাসে বেরিয়েছে সেটি বেছে নিন।',
      linkAtLeastOne: 'কমপক্ষে একটি পিস যুক্ত করুন।',
      alreadySet: 'এটি আগে থেকেই ট্রিপ DO হিসেবে বসানো আছে।',
      searchPlaceholder: 'ট্রিপ DO, গেট পাস নম্বর বা গাড়ি',
      searchAria: 'একটি গেট পাস খুঁজুন',
      saving: 'সংরক্ষণ হচ্ছে…',
      setWith: 'ট্রিপ DO {tripDo} বসান',
      noOffer: 'দেওয়ার মতো কোনো গেট পাস নেই',
      gatePassesAria: 'গেট পাস',
      returnsNote: 'ফেরত ও পুনরায় পাঠানো পিস গেট পাসের সংখ্যা কমায় না',
      howMany: 'এই ট্রিপ DO-তে কতগুলো বেরিয়েছে?',
      oneFewer: 'একটি কম',
      oneMore: 'একটি বেশি',
      piecesAria: 'এই ট্রিপ DO-তে পিসের সংখ্যা',
      tickedRows: 'টিক দেওয়া সারি',
      current: 'বর্তমান',
      sameAsOrder: 'অর্ডার সারির মতোই',
      chooseGatePassLong:
        'এই পণ্যগুলো যে গেট পাসে বেরিয়েছিল সেটি বেছে নিন। এর CSD ও ইউনিট সারিটির সঙ্গেই বসে যাবে।',
      tickRows: 'যে সারিগুলো একটি গেট পাসে বেরিয়েছে সেগুলোতে টিক দিন।',
      differentModels:
        'টিক দেওয়া সারিগুলোতে আলাদা মডেল আছে। একবারে একটি গেট পাস লাইনেই ট্রিপ DO বসানো যায়।',

      thisProduct: 'এই পণ্য',
      matchingSearch:
        '“{query}”-এর সাথে মেলে যাওয়া দাখিল হওয়া গেট পাস, মডেল বা কাস্টমারের নাম অন্যভাবে লেখা থাকলেও।',
      recentWith:
        '{model} আছে এমন সাম্প্রতিক দাখিল হওয়া গেট পাস, বা কাছাকাছি মডেল বা কাস্টমার, যেগুলো এখনও যুক্ত করা বাকি।',
      noOfferHint:
        'সাম্প্রতিক কোনোটিতে {model} বা এর কাছাকাছি কিছু নেই যাতে পিস এখনও যুক্ত না হয়ে আছে। তবুও খুঁজতে ট্রিপ ডিও, গেট পাস নম্বর বা গাড়ির নম্বর লিখুন।',
      maxPieces: 'সর্বোচ্চ {max}',
      /** The two clauses under the quantity stepper, each a whole sentence. */
      onTripDo: 'ট্রিপ ডিও {tripDo}-তে {linked}',
      remainderStays: '{remainder} একটি নতুন সারিতে থেকে যাবে, ট্রিপ ডিও-র অপেক্ষায়',
      rowsLabel: '{rows}',
      notOnChallan: '{qty} কোনো চালানে নেই',
      lineLinked: '{total} পিসের মধ্যে {linked} চালানে যুক্ত',
    },

    split: {
      title: 'সংখ্যা ভাগ করুন',
      description: 'এরপর প্রতিটি অংশে আলাদা ট্রিপ DO বসানো যাবে।',
      evenlyInto: 'সমানভাবে ভাগ করুন',
      splitting: 'ভাগ করা হচ্ছে…',
      splitInto: '{parts} ভাগে ভাগ করুন',
      addPart: 'অংশ যোগ করুন',
      atLeastTwo: 'ভাগ করতে অন্তত দুটি অংশ লাগবে।',
      everyPart: 'প্রতিটি অংশে অন্তত একটি পিস থাকতে হবে।',
      tooManyParts: 'সর্বোচ্চ {max} ভাগে ভাগ করুন।',
      stillToPlace: 'আরও {short}টি বসানো বাকি — অংশগুলো মিলে {total}-এর মধ্যে {sum} হচ্ছে।',
      tooMany: '{over}টি বেশি হয়ে গেছে — অংশগুলো মিলে {total}-এর মধ্যে {sum} হচ্ছে।',

      part: 'ভাগ {n}',
      piecesInPart: 'ভাগ {n}-এর পিস',
      removePart: 'ভাগ {n} সরান',
    },

    gatePassPanel: {
      heading: 'এই ট্রিপ DO-এর চালান',
      description: 'এই গেট পাসের মাল কোথায় গেছে, চালান যা বলে।',
      loadFailed: 'যুক্ত চালানগুলো লোড করা যায়নি।',
      noneYet: 'এখনও কোনো চালানের সারির ট্রিপ DO হিসেবে এই লাইনটি বসানো হয়নি।',
    },

    sheet: {
      tickAll: 'এই পৃষ্ঠার প্রতিটি সারিতে টিক দিন',
      sl: 'SL',

      tickRow: '{challan} {model} টিক দিন',
      openChallanTitle: '{challan} খুলুন',
      actionsFor: '{challan} {model}-এর জন্য কাজ',
      /** The Trip DO cell's hover title, then how to change it. */
      linkTitle: 'ট্রিপ ডিও {tripDo} · {gatePass} · সিএসডি {csd} · ইউনিট {unit}',
      linkTitleModel: ' · গেট পাসের মডেল {model}',
      linkTitleBy: ' · বসিয়েছেন {name}',
      pressToChange: 'বদলাতে চাপ দিন',
    },

    rowMenu: {
      openBill: '{bill} খুলুন',
      splitQuantity: 'সংখ্যা ভাগ করুন',
      mergeParts: 'অংশগুলো আবার মেলান',
      removeTripDo: 'ট্রিপ DO সরান',
      openChallan: 'চালান খুলুন',
      openGatePass: 'গেট পাস খুলুন',
    },

    option: {
      leftOf: '{total}-এর মধ্যে বাকি',
      onGatePass: 'গেট পাসে',
      onlyLeft: 'এই গেট পাসে {model}-এর মাত্র {qty}টি বাকি আছে।',
    },

    remove: {
      keep: 'থাক',
      removing: 'সরানো হচ্ছে…',
      confirm: 'ট্রিপ DO সরান',
      removed: 'ট্রিপ DO সরানো হয়েছে',
      removedNote:
        'সারিটি আবার ট্রিপ DO-এর অপেক্ষায় আছে, এবং লাইনের অপেক্ষমাণ অন্য যেকোনো অংশের সঙ্গে মিলিয়ে দেওয়া হয়েছে।',

      /** What a link, a bulk link and a split report when they land. */
      linkedOne: '{pieces}-এ ট্রিপ ডিও {tripDo} বসানো হয়েছে',
      linkedMany: '{rows}-এ ট্রিপ ডিও {tripDo} বসানো হয়েছে',
      linkedManyNote: '{pieces} · {detail}',
      linkDetail: 'সিএসডি {csd} · ইউনিট {unit} · {gatePass}',
      linkRemainder: '{remainder} নিজের একটি সারিতে রয়ে গেছে',
      splitDone: 'সারিটি {parts}-এ ভাগ করা হয়েছে',
      rateTiered: '{rest} / {first} (প্রথম {count})',
      mergedBack: 'অংশগুলো মিলে আবার {qty} হয়েছে',
      nothingToMerge: 'মেলানোর মতো কিছু নেই',
      partsApart: 'এই লাইনের অন্য অংশগুলোতে আলাদা ট্রিপ DO আছে, তাই সেগুলো আলাদাই থাকবে।',
    },

    export: {
      building: 'তৈরি হচ্ছে…',
      download: '.xlsx ডাউনলোড করুন',
      exporting: 'এক্সপোর্ট হচ্ছে…',
      exportExcel: 'এক্সেল এক্সপোর্ট',
      buildingToast: 'স্প্রেডশিট তৈরি হচ্ছে…',
      downloaded: 'স্প্রেডশিট ডাউনলোড হয়েছে',

      confirmTitle: '{rows} এক্সপোর্ট করবেন?',
      confirmWorth: '{pieces}, মূল্য {amount}, ',
      confirmBody:
        'প্রতিটি চালান পণ্যের সারির জন্য একটি সারি, তার ফেরত ও পুনঃপ্রেরণসহ, শিটের নিজের কলামের ক্রমে — চলতি ফিল্টার যে সারিগুলো দেখাচ্ছে ঠিক সেগুলোই, প্রতিটি পাতার।',
    },
  },

  activity: {
    title: 'কার্যক্রমের লগ',
    description:
      'সিস্টেম যত পরিবর্তন রেকর্ড করে, সবই এক জায়গায়: কী ঘটেছে, কোন রেকর্ডে ঘটেছে, এবং কে করেছে। মানুষ কাজ করার সঙ্গে সঙ্গে সিস্টেম নিজেই সারিগুলো লেখে, এবং এখান থেকে সেগুলো কখনও সম্পাদনা বা মুছে ফেলা যায় না — এ কারণেই এটি পড়ার যোগ্য।',
    noActor: 'কোনো কার্যকর্তা রেকর্ড করা হয়নি',

    modules: {
      Administration: 'প্রশাসন',
      Vendor: 'ভেন্ডর',
      Delivery: 'ডেলিভারি',
      'Gate Pass': 'গেট পাস',
      Challan: 'চালান',
      Location: 'লোকেশন',
      'Product Rate': 'পণ্যের রেট',
      'Excel Bill': 'এক্সেল বিল',
      'Labour Bill': 'লেবার বিল',
      Accounts: 'হিসাব',
      unknown: 'কার্যক্রম',
    },

    categories: {
      create: 'তৈরি',
      update: 'সংশোধন',
      status: 'অবস্থা',
      delete: 'মুছে ফেলা',
      access: 'প্রবেশাধিকার',
      money: 'টাকাপয়সা',
      document: 'ডকুমেন্ট',
      unknown: 'পরিবর্তন',
    },

    severities: {
      info: 'সাধারণ',
      notice: 'লক্ষণীয়',
      critical: 'গুরুতর',
    },

    entities: {
      User: 'অ্যাকাউন্ট',
      Vendor: 'ভেন্ডর',
      Vehicle: 'গাড়ি',
      Driver: 'চালক',
      Assignment: 'অ্যাসাইনমেন্ট',
      Document: 'ডকুমেন্ট',
      Trip: 'ট্রিপ',
      GatePass: 'গেট পাস',
      Challan: 'চালান',
      Location: 'লোকেশন',
      ProductRate: 'পণ্যের রেট',
      Bill: 'এক্সেল বিল',
      LabourBill: 'লেবার বিল',
      AccountsEntry: 'হিসাবের এন্ট্রি',
    },

    overview: {
      recorded: 'রেকর্ড হওয়া ঘটনা',
      mostIn: 'সবচেয়ে বেশি {module}-এ · {count}',
      noMatches: 'এই ফিল্টারগুলোর সঙ্গে কিছুই মিলছে না',
      today: 'আজ',
      lastSevenDays: 'গত সাত দিনে {n}টি',
      critical: 'গুরুতর',
      criticalHint: 'মুছে ফেলা, প্রবেশাধিকার এবং টাকার সংশোধন',
      people: 'ব্যক্তি',
      busiest: 'সবচেয়ে সক্রিয়: {name} · {count}',
      nobody: 'এই সময়সীমায় কেউ নেই',
    },

    timeline: {
      loadFailed: 'জার্নালটি পড়া যায়নি',
      noMatchesTitle: 'এই ফিল্টারগুলোর সঙ্গে কিছুই মিলছে না',
      noMatchesBody:
        'জার্নালের কোনো ঘটনা এই সংমিশ্রণের সঙ্গে মেলে না। তারিখের পরিসর বাড়ান, অথবা ফিল্টার সাফ করে আবার শুরু করুন।',
      emptyTitle: 'এখনও কিছু রেকর্ড হয়নি',
      emptyBody:
        'মানুষ কাজ করার সঙ্গে সঙ্গে জার্নালটি নিজেই ভরে ওঠে — একটি গেট পাস দাখিল, একটি রেট সংশোধন, একটি অ্যাকাউন্ট অনুমোদন। এখনও এতে কিছুই লেখা হয়নি।',
      emptyFootnote: 'সারিগুলো সিস্টেম নিজেই যোগ করে। এখানে হাতে কিছুই যোগ করা যায় না।',
      feedEmptyTitle: 'এখনও কিছু রেকর্ড হয়নি',
      feedEmptyBody: 'মানুষ পরিবর্তন করার সঙ্গে সঙ্গে সেগুলো এখানে দেখা যাবে।',
    },

    trend: {
      heading: 'গত ১৪ দিন',
      caption: 'গত চৌদ্দ দিনে প্রতিদিনের ঘটনা',
    },

    detail: {
      touched: 'কীসে প্রভাব পড়েছে',
      doneBy: 'করেছেন',
      when: 'কখন',
      changed: 'কী বদলেছে',

      noChanges:
        'এই ঘটনার জন্য মাঠ-ধরে কোনো বিবরণ লেখা হয়নি — উপরের সারসংক্ষেপটিই এর পুরোটা।',
      reference: 'তথ্যসূত্র',
      action: 'কার্যক্রম',
      eventId: 'ঘটনার আইডি',
      recordId: 'রেকর্ডের আইডি',
    },

    toolbar: {
      searchPlaceholder: 'কী ঘটেছে, কোন রেকর্ড, বা কে',
      summaryFiltered: '{events} এই ফিল্টারে মিলেছে',
      summaryTotal: 'জার্নালে {events}',
      journalAria: 'কার্যক্রমের জার্নাল',
      searchAria: 'জার্নালে খুঁজুন',
      moduleAria: 'মডিউল অনুযায়ী ফিল্টার',
      everyModule: 'সব মডিউল',
      fromDate: 'যে তারিখ থেকে',
      toDate: 'যে তারিখ পর্যন্ত',
      categoryAria: 'পরিবর্তনের ধরন অনুযায়ী ফিল্টার',
      anyCategory: 'যেকোনো ধরনের পরিবর্তন',
      severityAria: 'গুরুত্ব অনুযায়ী ফিল্টার',
      anySeverity: 'যেকোনো গুরুত্ব',
      actionAria: 'নির্দিষ্ট কার্যক্রম অনুযায়ী ফিল্টার',
      anyAction: 'যেকোনো কার্যক্রম',
      entityAria: 'রেকর্ডের ধরন অনুযায়ী ফিল্টার',
      anyEntity: 'যেকোনো রেকর্ড',
      actorAria: 'কে করেছে সেই অনুযায়ী ফিল্টার',
      anyone: 'যে কেউ',
    },

    export: {
      title: 'কার্যক্রমের জার্নাল এক্সপোর্ট করবেন?',
      bodyFiltered:
        'প্রয়োগ করা ফিল্টারের সঙ্গে {events} মিলছে। প্রতি ঘটনায় একটি সারি, এবং কী বদলেছে তা একটিই কলামে।',
      bodyAll:
        '{events} — পুরো জার্নাল, কোনো ফিল্টার ছাড়াই। প্রতি ঘটনায় একটি সারি, এবং কী বদলেছে তা একটিই কলামে।',
      events: { one: '{n}টি ঘটনা', other: '{n}টি ঘটনা' },
      covering: { one: '{n} জনকে নিয়ে', other: '{n} জনকে নিয়ে' },
      criticalNote: {
        one: 'এর মধ্যে {n}টি গুরুতর — মুছে ফেলা, প্রবেশাধিকারের পরিবর্তন এবং টাকার সংশোধন।',
        other: 'এর মধ্যে {n}টি গুরুতর — মুছে ফেলা, প্রবেশাধিকারের পরিবর্তন এবং টাকার সংশোধন।',
      },
      warning: 'ফাইলটি অডিট ট্রেইলের একটি অনুলিপি, তাই সেভাবেই এটি সামলান।',
      building: 'তৈরি হচ্ছে…',
      download: 'স্প্রেডশিট ডাউনলোড করুন',
      buildingToast: 'স্প্রেডশিট তৈরি হচ্ছে…',
      exported: 'কার্যক্রম এক্সপোর্ট করা হয়েছে',
    },
  },

  administration: {
    title: 'প্রশাসন',
    subtitle: 'ব্যবহারকারী, ভূমিকা এবং অ্যাকাউন্টের প্রবেশাধিকার পরিচালনা করুন।',
    adminOnly: 'শুধু অ্যাডমিন',
    you: 'আপনি',
    joined: 'যোগ দিয়েছেন {date}',
    viewDetails: 'বিস্তারিত দেখুন',
    changeRole: 'ভূমিকা পরিবর্তন করুন',
    actionsFor: '{name}-এর জন্য কার্যক্রম',
    cannotChangeSelf:
      'আপনি নিজের ভূমিকা বা অ্যাকাউন্টের অবস্থা পরিবর্তন করতে পারবেন না। অন্য একজন অ্যাডমিনকে বলুন।',

    stats: {
      overviewFailed: 'অ্যাকাউন্টের সারসংক্ষেপ লোড করা যায়নি।',
      total: { label: 'মোট ব্যবহারকারী', hint: 'রেকর্ডে থাকা সব অ্যাকাউন্ট' },
      pending: { label: 'অনুমোদনের অপেক্ষায়', hint: 'সিদ্ধান্তের অপেক্ষায়' },
      active: { label: 'সক্রিয় ব্যবহারকারী', hint: 'অনুমোদিত এবং সাইন ইন করতে সক্ষম' },
      suspended: { label: 'স্থগিত', hint: 'প্রবেশাধিকার প্রত্যাহার' },
    },

    filters: {
      searchPlaceholder: 'নাম বা ইমেইল দিয়ে খুঁজুন',
      searchAria: 'ব্যবহারকারী খুঁজুন',
      roleAria: 'ভূমিকা অনুযায়ী ফিল্টার',
      statusAria: 'অ্যাকাউন্টের অবস্থা অনুযায়ী ফিল্টার',
      allRoles: 'সব ভূমিকা',
      allStatus: 'সব অবস্থা',
    },

    directory: {
      loading: 'ব্যবহারকারী লোড হচ্ছে',
      summaryFiltered: '{accounts} এই ফিল্টারে মিলেছে',
      summaryTotal: 'রেকর্ডে {accounts}',
      managementAria: 'ব্যবহারকারী ব্যবস্থাপনা',
      noneFound: 'কোনো ব্যবহারকারী পাওয়া যায়নি',
      noneYet: 'এখনও কোনো অ্যাকাউন্ট নেই',
      filteredHint: 'আপনার খোঁজা শব্দ বা ফিল্টার বদলে দেখুন।',
      emptyHint:
        'কেউ সাইন আপ করামাত্রই অ্যাকাউন্ট এখানে দেখা যাবে। প্রতিটি নতুন অ্যাকাউন্ট আপনার অনুমোদনের অপেক্ষায় আসে।',
      clearFilters: 'ফিল্টার সাফ করুন',
      loadFailed: 'ব্যবহারকারী লোড করা যায়নি',
      retrying: 'আবার চেষ্টা করা হচ্ছে…',
      pagesAria: 'ব্যবহারকারীর তালিকার পৃষ্ঠা',
    },

    table: {
      user: 'ব্যবহারকারী',
      email: 'ইমেইল',
      role: 'ভূমিকা',
      accountStatus: 'অ্যাকাউন্টের অবস্থা',
      created: 'তৈরি',
      actions: 'কার্যক্রম',
    },

    details: {
      srTitle: 'অ্যাকাউন্টের বিবরণ',
      srDescription: '{name}-এর ভূমিকা, অ্যাকাউন্টের অবস্থা এবং ইতিহাস।',
      email: 'ইমেইল',
      emailVerified: 'ইমেইল যাচাই করা হয়েছে',
      emailNotVerified: 'ইমেইল যাচাই করা হয়নি',
      accountCreated: 'অ্যাকাউন্ট তৈরি',
      lastSignIn: 'সর্বশেষ সাইন ইন',
      neverSignedIn: 'কখনও সাইন ইন করেননি',
      lastChange: 'সর্বশেষ প্রশাসনিক পরিবর্তন',
      noChanges: 'কোনো প্রশাসনিক পরিবর্তন রেকর্ড করা হয়নি',
      roleSetTo: '{when} ভূমিকা {role} করা হয়েছে',
      roleSetToBy: '{when} {actor} ভূমিকা {role} করেছেন',
      markedStatus: '{when} {status} চিহ্নিত করা হয়েছে',
      markedStatusBy: '{when} {actor} {status} চিহ্নিত করেছেন',
      ownAccount:
        'এটি আপনার নিজের অ্যাকাউন্ট। আপনার ভূমিকা বা অবস্থা অন্য একজন অ্যাডমিনকে পরিবর্তন করতে হবে।',
    },

    role: {
      title: 'ভূমিকা পরিবর্তন করুন',
      description:
        'ভূমিকা ঠিক করে কেউ ব্যবসার কাছে কী। কোনো মডিউলের ভেতরে কোন ভূমিকা কী করতে পারবে, সেটি ওই মডিউলই ঠিক করে।',
      selectAria: 'একটি ভূমিকা বেছে নিন',
      current: 'বর্তমান',
      linkedVendor: 'যুক্ত ভেন্ডর',
      chooseVendor: 'একটি ভেন্ডর বেছে নিন',
      vendorScopeNote:
        'এই অ্যাকাউন্টটি ওই ভেন্ডরের গাড়ি, চালক, অ্যাসাইনমেন্ট ও ডকুমেন্ট দেখতে পাবে — শুধু পড়ার জন্য, এবং অন্য কোনো ভেন্ডরের কিছুই নয়।',

      changed: '{name} এখন {role}',
      changedLinked:
        '{vendor} ({code})-এর সাথে সংযুক্ত। তাঁরা সেই ভেন্ডরের বহর দেখবেন, কেবল পড়ার জন্য।',
      noVendors:
        'এখনও কোনো ভেন্ডর নেই। অ্যাকাউন্ট যুক্ত করার আগে ভেন্ডর পৃষ্ঠা থেকে একটি যোগ করুন।',
      summary: 'আপনি এই ব্যবহারকারীর ভূমিকা {from} থেকে {to} করছেন।',
      adminWarning:
        'অ্যাডমিন প্রশাসন মডিউলে সম্পূর্ণ প্রবেশাধিকার দেয়, অন্য সব অ্যাকাউন্ট পরিবর্তনের ক্ষমতাসহ।',
      vendorUnlinkWarning:
        '{vendor}-এর সঙ্গে সংযোগ মুছে যাবে, তাই এই অ্যাকাউন্টটি আর কোনো ভেন্ডরের রেকর্ড দেখতে পাবে না।',
      theirVendor: 'তাদের ভেন্ডর',
      confirm: 'পরিবর্তন নিশ্চিত করুন',
    },

    confirm: {
      reasonLabel: 'কারণ (ঐচ্ছিক)',
      reasonPlaceholder: 'অ্যাকাউন্টে রেকর্ড করা হবে, প্রশাসকরা দেখতে পাবেন।',
      working: 'কাজ চলছে…',
    },

    actions: {
      approve: {
        label: 'অনুমোদন',
        confirmLabel: 'অ্যাকাউন্ট অনুমোদন করুন',
        title: 'এই অ্যাকাউন্টটি অনুমোদন করবেন?',
        body: '{name} সাইন ইন করে নিজের নির্ধারিত ভূমিকা নিয়ে LBTS ব্যবহার করতে পারবেন।',
        success: '{name}-এর অ্যাকাউন্ট অনুমোদন করা হয়েছে',
      },
      reject: {
        label: 'নাকচ',
        confirmLabel: 'অ্যাকাউন্ট নাকচ করুন',
        title: 'এই অ্যাকাউন্টটি নাকচ করবেন?',
        body: '{name}-কে প্রবেশাধিকার দেওয়া হবে না। অ্যাকাউন্টটি রেকর্ডে থাকবে, এবং একজন অ্যাডমিন পরে এটি অনুমোদন করতে পারবেন।',
        success: '{name}-এর অ্যাকাউন্ট নাকচ করা হয়েছে',
      },
      suspend: {
        label: 'স্থগিত',
        confirmLabel: 'অ্যাকাউন্ট স্থগিত করুন',
        title: 'এই অ্যাকাউন্টটি স্থগিত করবেন?',
        body: '{name} সঙ্গে সঙ্গেই প্রবেশাধিকার হারাবেন এবং অ্যাকাউন্টটি পুনরায় সক্রিয় না করা পর্যন্ত সাইন ইন করতে পারবেন না।',
        success: '{name}-এর অ্যাকাউন্ট স্থগিত করা হয়েছে',
      },
      reactivate: {
        label: 'পুনরায় সক্রিয়',
        confirmLabel: 'অ্যাকাউন্ট পুনরায় সক্রিয় করুন',
        title: 'এই অ্যাকাউন্টটি পুনরায় সক্রিয় করবেন?',
        body: '{name} নিজের বর্তমান ভূমিকা নিয়ে আবার LBTS-এ প্রবেশাধিকার পাবেন।',
        success: '{name}-এর অ্যাকাউন্ট পুনরায় সক্রিয় করা হয়েছে',
      },
      delete: {
        label: 'মুছে ফেলুন',
        confirmLabel: 'ব্যবহারকারী মুছে ফেলুন',
        title: 'এই ব্যবহারকারীকে মুছে ফেলবেন?',
        body: 'এটি {name}-এর অ্যাকাউন্ট LBTS এবং সাইন-ইন প্রোভাইডার — দুই জায়গা থেকেই স্থায়ীভাবে মুছে ফেলবে। এটি আর ফেরানো যাবে না।',
        success: '{name}-এর অ্যাকাউন্ট মুছে ফেলা হয়েছে',
      },
    },
  },
  accounts: {
    title: 'অ্যাকাউন্টস',
    sectionsAria: 'অ্যাকাউন্টসের বিভাগ',
    filters: {
      searchAria: 'নম্বর, ব্যক্তি, ভেন্ডর, ট্রিপ, রেফারেন্স বা নোট দিয়ে খুঁজুন',
      directionAria: 'দিক',
      anyDirection: 'সবকিছু',
      moneyIn: 'টাকা এসেছে',
      moneyOut: 'টাকা গেছে',
      kindAria: 'এন্ট্রির ধরন',
      anyKind: 'যেকোনো ধরন',
      walletAria: 'ওয়ালেট',
      everyWallet: 'সব ওয়ালেট',
      wallet: 'ওয়ালেট',
      fromDate: 'শুরুর তারিখ',
      toDate: 'শেষের তারিখ',
    },

    list: {
      date: 'তারিখ',
      entry: 'এন্ট্রি',
      wallet: 'ওয়ালেট',
      amount: 'অঙ্ক',
      actions: 'কাজ',
      noCashMoved: 'কোনো নগদ সরেনি',
      noCash: 'নগদ নয়',
      kindAndDetail: '{kind} · {detail}',
      reference: 'রেফ {reference}',
      rowLine: '{day} · {wallet} · {entry}',
      emptyTitle: 'এখনও কোনো এন্ট্রি নেই',
      emptyDescription: 'জমা, খরচ, অগ্রিম বা পরিশোধ করা টাকা এখানে দেখা যাবে।',
      voucherAttached: 'ভাউচার সংযুক্ত',
      openVoucher: '{entry}-এর ভাউচার খুলুন',
      actionsFor: '{entry}-এর জন্য কাজ',
      opening: 'প্রারম্ভিক',
      closing: 'সমাপনী',
    },

    form: {
      editTitle: '{entry} সম্পাদনা',
      amount: 'অঙ্ক',
      date: 'তারিখ',
      paidFromCash: 'ক্যাশ থেকে পরিশোধ',
      depositInto: 'ক্যাশে জমা',
      returnedInto: 'ক্যাশে ফেরত',
      fromCashWallet: 'যে ক্যাশ ওয়ালেট থেকে',
      receivedInto: 'যেখানে পাওয়া গেছে',
      toCashWallet: 'যে ক্যাশ ওয়ালেটে',
      reference: 'রেফারেন্স',
      note: 'নোট',
      uploadingVoucher: 'ভাউচার আপলোড হচ্ছে…',
      saveKind: '{kind} সেভ করুন',
    },

    report: {
      thisMonth: 'এই মাস',
      lastMonth: 'গত মাস',
      lastMonths: 'গত {n} মাস',
      last3: 'গত ৩ মাস',
      last6: 'গত ৬ মাস',
      thisFiscalYear: 'এই অর্থবছর',
      lastFiscalYear: 'গত অর্থবছর',
      thisYear: 'এই বছর',
      periodAria: 'রিপোর্টের সময়কাল',
      fromMonth: 'শুরুর মাস',
      toMonth: 'শেষের মাস',
    },

    nav: {
      overview: 'সারসংক্ষেপ',
      cash: 'ক্যাশ',
      cashBook: 'ক্যাশ বই',
      vendorBills: 'ভেন্ডর বিল',
      advances: 'অগ্রিম',
      expenses: 'খরচ',
      finalBills: 'ওয়ালটন ফাইনাল বিল',
      labourBills: 'ওয়ালটন লেবার বিল',
      profitLoss: 'লাভ ও ক্ষতি',
      wallets: 'ওয়ালেট',
    },

    kinds: {
      Deposit: {
        label: 'জমা',
        action: 'টাকা জমা দিন',
        description: 'ক্যাশে জমা হিসেবে যোগ হওয়া টাকা। প্রতিটি লেনদেনই ক্যাশের মধ্য দিয়ে যায়।',
      },
      Transfer: {
        label: 'স্থানান্তর',
        action: 'স্থানান্তর',
        description: 'দুটি ক্যাশ ওয়ালেটের মধ্যে টাকা সরান — ক্যাশ বক্স আর পেটি ক্যাশ।',
      },
      Expense: {
        label: 'খরচ',
        action: 'খরচ যোগ করুন',
        description: 'অফিসের যেকোনো খরচ — ভাড়া, বিল, বেতন, যাতায়াত এবং বাকি সব।',
      },
      Advance: {
        label: 'অগ্রিম',
        action: 'অগ্রিম দিন',
        description: 'কাউকে দেওয়া টাকা, যা পরে নগদে ফেরত আসবে।',
      },
      AdvanceReturn: {
        label: 'অগ্রিম ফেরত',
        action: 'ফেরত লিখুন',
        description:
          'অগ্রিমের বিপরীতে ফেরত আসা নগদ। এটি ক্যাশ আউট থেকে অগ্রিমের অঙ্ক কমায়, ক্যাশ ইন-এ যোগ হয় না।',
      },
      AdvanceAdjust: {
        label: 'অগ্রিম সমন্বয়',
        action: 'অগ্রিম সমন্বয়',
        description:
          'অগ্রিমের একটি পুরোনো সমন্বয়, যখন অগ্রিম কেবল নগদেই নিষ্পত্তি হতো তার আগে লেখা।',
      },
      TripAdvance: {
        label: 'ট্রিপ অগ্রিম',
        action: 'ট্রিপ অগ্রিম',
        description: 'একটি ট্রিপের ভাড়া ও লেবার বিলের বিপরীতে ভেন্ডরকে দেওয়া অগ্রিম।',
      },
      VendorPayment: {
        label: 'ভেন্ডর পেমেন্ট',
        action: 'ভেন্ডরকে পরিশোধ',
        description: 'অগ্রিম বাদ দেওয়ার পর একটি ভেন্ডরের মাসিক ট্রিপ বিল।',
      },
    },

    walletKinds: {
      Cash: 'ক্যাশ',
      Bank: 'ব্যাংক অ্যাকাউন্ট',
      'Mobile Banking': 'মোবাইল ব্যাংকিং',
    },

    vendorStatuses: {
      'No Bill': 'এখনও বিল নেই',
      Unpaid: 'পরিশোধ হয়নি',
      Partial: 'আংশিক পরিশোধ',
      Paid: 'পরিশোধিত',
      Overpaid: 'বেশি পরিশোধ',
    },

    settlement: {
      Open: { label: 'বাকি', received: 'পাওয়া যায়নি' },
      Partial: { label: 'আংশিক নিষ্পত্তি', received: 'আংশিক পাওয়া গেছে' },
      Settled: { label: 'নিষ্পত্তি', received: 'পাওয়া গেছে' },
    },

    describe: {
      labourPayment: 'ওয়ালটন লেবার বিলের পেমেন্ট',
      finalPayment: 'ওয়ালটন ফাইনাল বিলের পেমেন্ট',
      cashDeposit: 'নগদ জমা',
      betweenWallets: 'ওয়ালেটের মধ্যে',
      walletToWallet: '{from} → {to}',
      expense: 'খরচ',
      paidTo: '{name}-কে পরিশোধ',
      returnedAgainst: '{entry}-এর বিপরীতে ফেরত',
      anAdvance: 'একটি অগ্রিম',
      adjustedFrom: '{expense} · {entry} থেকে',
      tripAdvance: 'ট্রিপ অগ্রিম',
      vendorPayment: 'ভেন্ডর পেমেন্ট',
      toParty: '{name}-কে',
      tripBillPeriod: 'ট্রিপ বিল · {period}',
      tripBillPeriodTo: 'ট্রিপ বিল · {period} · {name}-কে',
    },

    fiscalYear: 'অর্থবছর {from}–{to}',
    pages: {
      advances: {
        title: 'অগ্রিম',
        description:
          'কাউকে দেওয়া টাকা — কর্মী, ড্রাইভার, ঠিকাদার — যা নগদে ফেরত আসা পর্যন্ত থাকে। ভেন্ডরদের ট্রিপ অগ্রিম আছে ভেন্ডর বিল পাতায়।',
        outstanding: 'বাকি',
        notSettled: '{advances} নিষ্পত্তি হয়নি',
        given: 'দেওয়া হয়েছে',
        inThisView: 'এই তালিকায় {advances}',
        settled: 'নিষ্পত্তি',
        cashReturned: 'নগদ ফেরত',
        searchAria: 'ব্যক্তি, কারণ, ফোন বা নম্বর দিয়ে খুঁজুন',
        statusAria: 'অবস্থা',
        untouched: 'অস্পর্শিত',
        partlySettled: 'আংশিক নিষ্পত্তি',
        noneOutstanding: 'কোনো অগ্রিম বাকি নেই',
        noneHere: 'এখানে কোনো অগ্রিম নেই',
        staysListed: 'নগদ ফেরত আসা পর্যন্ত একটি অগ্রিম তালিকায় থাকে।',
      },

      cashBook: {
        title: 'ক্যাশ বই',
        entriesAria: 'এন্ট্রি',
        nothingMatches: 'এই ফিল্টারের সঙ্গে কিছুই মেলেনি',
      },

      cash: {
        title: 'ক্যাশ',
        description:
          'আপনার ক্যাশ ব্যালেন্স, আজ পর্যন্ত কত নগদ এসেছে ও গেছে, এবং সেটাই মাসে মাসে বা বছরে বছরে। অ্যাকাউন্টসের প্রতিটি লেনদেনই ক্যাশের মধ্য দিয়ে যায়।',
        balance: 'ক্যাশ ব্যালেন্স',
        walletCount: '{wallets}',
        inUntilToday: 'আজ পর্যন্ত মোট ক্যাশ ইন',
        depositsHint: 'জমা {amount}',
        outUntilToday: 'আজ পর্যন্ত মোট ক্যাশ আউট',
        outHint: 'ভেন্ডর {vendors} · খরচ {expenses}',
        inThisRange: 'এই সময়সীমায় ক্যাশ ইন',
        rangeHint: '{from} – {to}',
        groupByAria: 'যেভাবে সাজানো',
        monthByMonth: 'মাসে মাসে',
        yearByYear: 'বছরে বছরে',
        yearRangeAria: 'বছরের সীমা',
        thisYear: 'এই বছর',
        lastYears: 'গত {n} বছর',
        byMonthTitle: 'মাস অনুযায়ী ক্যাশ ইন ও আউট',
        byYearTitle: 'বছর অনুযায়ী ক্যাশ ইন ও আউট',
        byRangeDescription:
          'ক্যাশ ইন মানে জমা, এর মধ্যে ক্যাশে পাওয়া ওয়ালটনের পেমেন্টও আছে। ক্যাশ আউট মানে প্রতিটি ভেন্ডর পেমেন্ট, ট্রিপ অগ্রিম ও খরচ, এবং অগ্রিম থেকে তার বিপরীতে ফেরত আসা নগদ বাদ দিয়ে।',
        rangeBackwards: 'সময়সীমা যে মাসে শুরু, শেষ হতে হবে সেই মাসে বা তার পরে।',
      },

      expenses: {
        title: 'খরচ',

        emptyTitle: 'এখানে কোনো খরচ নেই',
        emptyHint:
          'অফিস ভাড়া, বিল, বেতন, যাতায়াত — অফিস যা কিছু খরচ করে তার সবই একটি খরচ।',
        description:
          'প্রতিটি অফিস খরচ, মাসে মাসে, যে নামে লেখা হয়েছে সেই নাম অনুযায়ী সাজানো। খরচ যোগ করার সময় নামটি টাইপ করুন — আগে ব্যবহার করা নামগুলো দেখানো হয়।',
        officeExpenses: 'অফিস খরচ',
        officeHint: 'এই মাসের প্রতিটি অফিস খরচ',
        namesUsed: 'ব্যবহার করা খরচের নাম',
        thisMonth: 'এই মাস',
        rentAndLabour: 'ট্রিপ ভাড়া + লেবার',
        rentAndLabourHint: 'তুলনার জন্য — ভেন্ডরের ট্রিপ বিল থেকে',
        byName: 'খরচের নাম অনুযায়ী',
        byNameHint: 'শুধু সেটির খরচ দেখতে একটিতে চাপ দিন।',
        listAria: 'খরচ',
      },

      finalBills: {
        title: 'ওয়ালটন ফাইনাল বিল',
        description:
          'জমা দেওয়া এক্সেল বিল ওয়ালটন নিরীক্ষা করার পর চূড়ান্ত অনুমোদিত অঙ্কটি এখানে লিখুন। লাভ-ক্ষতি এই আয়ের উপরেই গড়া, আর এক্সেল বিলে যা চাওয়া হয়েছিল তার সঙ্গে এটি মেলানো হয়।',
        enter: 'ফাইনাল বিল লিখুন',
        finalBills: 'ফাইনাল বিল',
        unitMonths: '{n} ইউনিট-মাস',
        excelAsked: 'এক্সেল বিলে চাওয়া',
        excelAskedHint: 'একই ইউনিট ও মাসের জন্য',
        auditDifference: 'নিরীক্ষার পার্থক্য',
        auditDifferenceHint: 'ফাইনাল থেকে জমা দেওয়া বাদ',
        stillToReceive: 'এখনও পাওয়া বাকি',
        receivedHint: '{amount} পাওয়া গেছে',
        yearAria: 'বছর',
        allYears: 'সব বছর',
        paymentAria: 'পেমেন্ট',
        unitAria: 'ইউনিট',
        noneEntered: 'কোনো ফাইনাল বিল লেখা হয়নি',
        noneHint:
          'ওয়ালটন কোনো ইউনিটের মাসের নিরীক্ষিত অঙ্ক ফেরত পাঠালে সেটি এখানে লিখুন। তার আগে ওই মাসের লাভ-ক্ষতিতে কোনো আয় থাকে না।',
        deleteTitle: '{unit} · {period}-এর ফাইনাল বিল মুছে ফেলবেন?',
        deleteTitleGeneric: 'ফাইনাল বিল মুছে ফেলবেন?',
        deleteDescription:
          'এর আয় লাভ-ক্ষতি থেকে সরে যাবে। যে ফাইনাল বিলের বিপরীতে পেমেন্ট লেখা আছে, সেই জমাগুলো না মুছলে বিলটি মুছে ফেলা যাবে না।',
        deleteConfirm: 'ফাইনাল বিল মুছে ফেলুন',
      },

      labourBill: {
        title: 'ওয়ালটন লেবার বিল',

        monthHint: '{bill} · {status}',
        receiptsEmptyTitle: 'এখনও কোনো পেমেন্ট লেখা হয়নি',
        receiptsEmptyHint: 'যে সিএসডি এটি মেটায় সেখান থেকে লিখুন, তাহলে এখানে দেখাবে।',
        monthDescription:
          'এই মাসের প্রতিটি CSD আলাদাভাবে নিষ্পত্তি হয়, তাই প্রত্যেকটির নিজের কার্ড আছে। কোনটি কত পাবে তা আসে লেবার বিল শিট থেকে; কত এসেছে তা এখানে লেখা পেমেন্টগুলো।',
        allMonths: 'সব মাস',
        received: 'পাওয়া গেছে',
        stillToReceive: 'এখনও পাওয়া বাকি',
        openSheet: 'শিট খুলুন',
        openSheetHint: 'এই অঙ্কগুলোর পিছনের সারিগুলো দেখুন',
        csdsAria: 'CSD',
        nothingYet: 'এই মাসের লেবার বিলে এখনও কিছুই নেই',
        scanOnto:
          '{link}-এ চালানগুলো স্ক্যান করুন, তাহলে প্রতিটি CSD কত পাবে তা নিয়ে এখানে দেখা যাবে।',
        paymentsReceived: 'পাওয়া পেমেন্ট',
        paymentsHint: 'এই মাসের কোনো CSD-র বিপরীতে লেখা প্রতিটি ওয়ালটন পেমেন্ট।',
        labourBilled: 'লেবার বিল হয়েছে',
        receivedHint: 'CSD-র বিপরীতে ওয়ালটনের পেমেন্ট',
        stillHint: 'প্রতিটি মাসের প্রতিটি CSD মিলিয়ে',
        months: 'মাস',
        monthsHint: 'এই ফিল্টারের সঙ্গে মেলে',
        noneToReceive: 'পাওয়ার মতো কোনো লেবার বিল নেই',
        noneHint:
          'কোনো মাসের জন্য লেবার বিল খোলা হলে এবং তাতে চালান স্ক্যান করা হলেই মাসটি এখানে দেখা যায়। প্রতিটি CSD কত পাবে তা ওই শিট থেকেই পড়া হয়, তাই আলাদা করে কিছু লেখার নেই।',
      },

      profitLoss: {
        title: 'লাভ ও ক্ষতি',
        rangeBackwards: 'রিপোর্ট যে মাসে শুরু, শেষ হতে হবে সেই মাসে বা তার পরে।',
        incomeAgainstCost: 'খরচের বিপরীতে আয়',
        incomeAgainstCostHint: 'মাসে মাসে — কোনো মাসের লাভ দেখতে তার উপরে রাখুন।',
        statementByMonth: 'মাস অনুযায়ী বিবরণী',
      },

      vendorBill: {
        title: '{vendor} · ট্রিপ বিল',
        titleGeneric: 'ভেন্ডরের ট্রিপ বিল',

        advancesEmptyTitle: 'কোনো অগ্রিম নেই',
        advancesEmptyHint: 'বিলের আগেই ভেন্ডরকে দিতে হলে ট্রিপে “অগ্রিম” ব্যবহার করুন।',
        paymentsEmptyTitle: 'এখনও কিছু দেওয়া হয়নি',
        paymentsEmptyHint: 'অগ্রিমের পর যা বাকি থাকে, মাসিক পেমেন্ট সেটিই মেটায়।',
        description:
          'মাসের প্রতিটি ট্রিপ, তার ভাড়া ও লেবার বিল, সেগুলোর বিপরীতে দেওয়া অগ্রিম, এবং মাসিক পেমেন্টগুলো।',
        allVendors: 'সব ভেন্ডর',
        tripsTitle: 'ট্রিপ · {period}',
        tripsHint: 'বিল লেখা হয় প্রতিটি ট্রিপের নিজের পাতায়; অগ্রিম দেওয়া হয় এখান থেকে।',
        advancesTitle: 'ট্রিপ অগ্রিম',
        advancesHint: 'এই মাসের ট্রিপগুলোর বিপরীতে {amount}',
        paymentsTitle: 'পেমেন্ট',
        paymentsHint: '{period}-এর জন্য {amount} পরিশোধ',
      },

      vendorBills: {
        title: 'ভেন্ডরের ট্রিপ বিল',
        billThisMonth: 'এই মাসের ট্রিপ বিল',
        billHint: '{trips} · {vendors}',
        advanced: 'ট্রিপে অগ্রিম',
        advancedHint: 'বিল থেকে সমন্বয় করা',
        paid: 'পরিশোধিত',
        paidHint: 'মাসিক পেমেন্ট',
        stillDue: 'এখনও বাকি',
        overpaidElsewhere: 'অন্যত্র {amount} বেশি পরিশোধ',
        blankBills: '{n}টি ট্রিপের এখনও কোনো বিল নেই',
        afterEverything: 'অগ্রিম ও পেমেন্টের পর',
        listAria: 'ভেন্ডরের ট্রিপ বিল',
        searchAria: 'ভেন্ডর খুঁজুন',
        statusAria: 'অবস্থা',
      },

      wallets: {
        title: 'ওয়ালেট',
        description: 'যে ওয়ালেটগুলোতে টাকা রাখা হয়।',
      },

      overview: {
        vendorDue: 'ভেন্ডর বিল বাকি',

        vendorDueHint: '{vendors}, অগ্রিম বাদ দিয়ে',
        openAdvancesHint: '{count}টি এখনও নিষ্পত্তি হয়নি',
        profitHint: 'আয় {income} · খরচ {cost}',
        entriesEmpty: 'প্রতিটি ওয়ালেটের শুরুর ব্যালেন্স লিখতে “টাকা যোগ করুন” দিয়ে শুরু করুন।',
        openAdvances: 'খোলা অগ্রিম',
        receivable: 'ওয়ালটনের কাছে পাওনা',
        profitPeriod: 'লাভ · {period}',
        thisMonth: 'এই মাস',
        lastSixMonths: 'গত ছয় মাস',
        lastSixHint: 'ট্রিপ ও অফিস খরচের বিপরীতে ওয়ালটন ফাইনাল বিল।',
        recentEntries: 'সাম্প্রতিক এন্ট্রি',
        cashBook: 'ক্যাশ বই',
      },
    },
    hero: {
      cashBalance: 'ক্যাশ ব্যালেন্স',
      yearLabel: '{year} · বছর',
      noCashWallet: 'এখনও কোনো ক্যাশ ওয়ালেট নেই',
      byMonthAndYear: 'মাস ও বছর ধরে ক্যাশ ইন ও আউট',
      paidFromHand: 'আগে থেকেই হাতে যা ছিল তা থেকেই পরিশোধ',
      nothingMoved: 'এখনও কিছুই সরেনি',
      net: 'নিট {amount}',
    },

    attention: {
      heading: 'নজর দেওয়া দরকার',
      owedToVendors: 'ভেন্ডরদের পাওনা {amount}',
      owedToVendorsDetail: 'সব মাস মিলিয়ে {vendors}',
      tripsNoBill: {
        one: '{count}টি ট্রিপের বিল লেখা হয়নি',
        other: '{count}টি ট্রিপের বিল লেখা হয়নি',
      },
      awaitingFinal: {
        one: '{count}টি এক্সেল বিল চূড়ান্ত বিলের অপেক্ষায়',
        other: '{count}টি এক্সেল বিল চূড়ান্ত বিলের অপেক্ষায়',
      },
      toReceive: 'ওয়ালটনের কাছ থেকে পাওনা {amount}',
      toReceiveDetail: {
        one: '{count}টি চূড়ান্ত বিল পুরোপুরি পরিশোধ হয়নি',
        other: '{count}টি চূড়ান্ত বিল পুরোপুরি পরিশোধ হয়নি',
      },
      openAdvancesTitle: 'খোলা অগ্রিমে {amount}',
      openAdvancesDetail: {
        one: '{count}টি অগ্রিম এখনও নিষ্পত্তি হয়নি',
        other: '{count}টি অগ্রিম এখনও নিষ্পত্তি হয়নি',
      },
      description: 'কী কী এখনও বাকি, ফাঁকা বা অনিষ্পন্ন।',
      allCaughtUp: 'সব গোছানো',
      nothingWaiting: 'কিছুই বাকি, ফাঁকা বা অপেক্ষায় নেই।',
      blankBillDetail: 'ট্রিপে ভাড়া বা লেবার বিল ফাঁকা, তাই এটি শূন্য হিসেবে ধরা হচ্ছে',
      pendingFinalDetail: 'গত ছয় মাস — চূড়ান্ত অঙ্ক না লেখা পর্যন্ত কোনো আয় ধরা হয় না',
    },

    cash: {
      deposits: 'জমা',
      period: 'সময়কাল',
      transfersIn: 'স্থানান্তর এসেছে',
      vendorPayments: 'ভেন্ডর পেমেন্ট',
      tripAdvances: 'ট্রিপ অগ্রিম',
      advancesNet: 'অগ্রিম (ফেরতের পর)',
      expenses: 'খরচ',
      transfersOut: 'স্থানান্তর গেছে',
      chooseRange: 'ক্যাশ ইন ও আউট দেখতে একটি সময়সীমা বাছুন।',
      cashIn: 'ক্যাশ ইন',
      cashOut: 'ক্যাশ আউট',
      totalIn: 'মোট এসেছে',
      totalOut: 'মোট গেছে',
      rangeTotal: 'সময়সীমার মোট',
      shareGoneOut: 'ক্যাশ ইন-এর {share} বেরিয়ে গেছে',
      in: 'এসেছে',
      out: 'গেছে',
    },

    advance: {
      noPurpose: 'কোনো কারণ লেখা হয়নি',
      settledEmptyTitle: 'এখনও কিছু নিষ্পত্তি হয়নি',
      settledEmptyHint: 'এই অগ্রিমের বিপরীতে ফেরত আসা নগদ এখানে দেখা যাবে।',
      settled: 'নিষ্পত্তি',
      cashReturned: 'নগদ ফেরত',
      history: 'ইতিহাস',
      settleAll: 'পুরোটাই নিষ্পত্তি করুন',
      label: 'অগ্রিম',
      given: '{day} দেওয়া হয়েছে',
      givenFor: '{day} দেওয়া হয়েছে, {purpose} বাবদ',
      choose: 'একটি অগ্রিম বাছুন',
      noneOutstanding: 'কোনো অগ্রিম বাকি নেই।',
    },

    deposit: {
      fillIt: 'বসিয়ে দিন',
      labourCsdValue: '{csd} · {period}',
      labourCsdDetail: '{bill} · বিল {billed} · প্রাপ্ত {received}',
      againstFinalBill: 'ফাইনাল বিলের বিপরীতে ওয়ালটনের পেমেন্ট',
      finalBill: 'ফাইনাল বিল',
      unitAndPeriod: '{unit} · {period}',
      finalBillDetail: 'ফাইনাল বিল {amount} · {received} পাওয়া গেছে',
      againstLabourBill: 'লেবার বিলের বিপরীতে ওয়ালটনের পেমেন্ট',
      labourCsd: 'লেবার বিলের CSD',
    },

    voucher: {
      removeTitle: '{entry} থেকে ভাউচারটি সরিয়ে ফেলবেন?',
      sheetsSuffix: ' · {sheets}',
      replacesOnRecord: ' · রেকর্ডে থাকা ফাইলটির বদলে বসবে',
      attachedBy: ' · {name} জুড়েছেন',
      removeDescription:
        'এন্ট্রিটি নিজে অপরিবর্তিত থাকবে — অঙ্ক, ওয়ালেট আর দিন ঠিক যেমন আছে তেমনই থাকবে। কেবল এর পিছনের ফাইলটি মুছে যাবে, আর তা ফেরানো যাবে না।',
      remove: 'ভাউচার সরান',
      removing: 'সরানো হচ্ছে…',
      attach: 'একটি ভাউচার সংযুক্ত করুন',
      deleteTitle: '{entry} মুছে ফেলবেন?',
      deleteDescription:
        '{amount}-এর এই {kind} হিসাব থেকে সরে যাবে, আর এটি যে যে ব্যালেন্স ও মোটে ধরা ছিল সবই এটি ছাড়া আবার হিসাব হবে।',
      deleteConfirm: 'এন্ট্রি মুছে ফেলুন',
      deleting: 'মুছে ফেলা হচ্ছে…',
      removeChosen: 'বেছে নেওয়া ভাউচারটি সরান',
      replaceFile: 'ফাইলটি বদলান',
      scanIt: 'স্ক্যান করুন',
      holding: '{name} ({size}) ধরে রাখা আছে। নতুন ফাইল দিলে এটি বদলে যাবে।',
      title: '{entry}-এর ভাউচার',
    },

    kindFields: {
      paidTo: 'কাকে পরিশোধ',
      givenTo: 'কাকে দেওয়া',
      theirMobile: 'তাঁর মোবাইল',
      whatFor: 'কী বাবদ',
      spentOn: 'কী বাবদ খরচ',
      receivedBy: 'কে নিয়েছেন',
    },

    totals: {
      moneyIn: 'টাকা এসেছে',
      moneyOut: 'টাকা গেছে',
    },

    finalBill: {
      actionsFor: '{unit} {period}-এর জন্য কাজ',
      alreadyReceived: 'এই বিলের বিপরীতে আগেই {amount} পাওয়া গেছে।',
      submittedNone: 'নেই',
      excelBill: 'এক্সেল বিল',
      finalBill: 'ফাইনাল বিল',
      auditDifference: 'নিরীক্ষার পার্থক্য',
      noChange: 'কোনো পরিবর্তন নেই',
      amountLeft: '{amount} বাকি',
      fullyReceived: 'পুরোটাই পাওয়া গেছে',
      recordPayment: 'পাওয়া পেমেন্ট লিখুন',
      editTitle: 'ফাইনাল বিল সম্পাদনা · {unit} · {period}',
      enterTitle: 'ওয়ালটন ফাইনাল বিল লিখুন',
      description:
        'এক্সেল বিল নিরীক্ষার পর ওয়ালটন যে অঙ্ক অনুমোদন করেছে। লাভ-ক্ষতিতে এটিই আয় হিসেবে ধরা হয়।',
      unit: 'ইউনিট',
      amount: 'ফাইনাল বিলের অঙ্ক',
      reference: 'ওয়ালটন রেফারেন্স',
      receivedOn: 'ফাইনাল বিল পাওয়ার তারিখ',
      auditNote: 'নিরীক্ষার নোট',
      auditNoteHint: 'নিরীক্ষায় কী বদলেছে — কোন সারি বাদ, কোন রেট সংশোধন।',
      save: 'ফাইনাল বিল সেভ করুন',
      lookingUp: 'এক্সেল বিলগুলো খোঁজা হচ্ছে…',
      enterUnitFirst: 'এই মাসের এক্সেল বিল দেখতে ইউনিটটি লিখুন।',
      submitted: 'জমা দেওয়া এক্সেল বিল',
    },

    labour: {
      received: 'পাওয়া গেছে',
      billed: 'বিল হয়েছে',
      pendingRows:
        'এই সারিগুলো ট্রিপ DO-এর অপেক্ষায় আছে, তাই এগুলো কোনো CSD-র অধীনে পড়ে না এবং এগুলোর জন্য এখনও কারও কাছে বিল যায়নি। {link} থেকে এটি বসিয়ে দিন, তাহলে এগুলো নিজে নিজেই নিজের CSD-তে চলে যাবে।',
      tripDoSheet: 'ট্রিপ DO শিট',
    },

    profit: {
      finalBillIncome: 'ওয়ালটন ফাইনাল বিল',
      excelBillsAsk: ' — এক্সেল বিলে চাওয়া হয়েছে {amount}',
      profitWord: 'লাভ',
      lossWord: 'ক্ষতি',
      marginSuffix: '(মার্জিন {margin})',
      noIncomeInPeriod: 'এই সময়ে কোনো চূড়ান্ত বিল নেই।',
      noExpenseInPeriod: 'এই সময়ে অফিসের কোনো খরচ নেই।',
      noTripInPeriod: 'এই সময়ে কোনো ট্রিপ নেই।',
      labourIncome: 'ওয়ালটন লেবার বিল',
      tripRent: 'ট্রিপ ভাড়া',
      labourBill: 'লেবার বিল',
      labour: 'লেবার',
      officeExpenses: 'অফিস খরচ',
      office: 'অফিস',
      title: 'লাভ ও ক্ষতি · {period}',
      description: 'ওয়ালটনকে যা বিল করা হয়েছে, তার বিপরীতে প্রতিটি পরিচালন ব্যয়।',
      fullReport: 'পূর্ণ রিপোর্ট',
      noFinalBillYet: 'এই মাসের জন্য এখনও কোনো ওয়ালটন ফাইনাল বিল লেখা হয়নি',
      incomeByUnit: 'ইউনিট অনুযায়ী আয়',
      incomeByUnitHint: 'ফাইনাল বিল, এবং নিরীক্ষায় যা বদলেছে',
      officeExpensesHint: 'খরচের নাম অনুযায়ী',
      tripCostByVendor: 'ভেন্ডর অনুযায়ী ট্রিপের খরচ',
      tripCostHint: 'ভাড়া ও লেবার বিল',
      month: 'মাস',
      totalCost: 'মোট খরচ',
      profit: 'লাভ',
      margin: 'মার্জিন',
      total: 'মোট',
      income: 'আয়',
      operationalCost: 'পরিচালন ব্যয়',
      netProfit: 'নিট লাভ',
      netLoss: 'নিট ক্ষতি',
      noMargin: 'মার্জিন বের করার মতো কোনো আয় নেই',
      marginOf: '{margin} মার্জিন',
      marginAndTrips: '{margin} · {trips}',
      incomeSeries: 'আয় (ওয়ালটনকে বিল করা)',
      chartCaption: 'মাস অনুযায়ী আয়, খরচ ও লাভ',
    },

    period: {
      previousMonth: 'আগের মাস',
      nextMonth: 'পরের মাস',
      thisMonth: 'এই মাস',
    },

    expense: {
      noneThisMonth: 'এই মাসে কোনো অফিস খরচ নেই।',
      namesUsedBefore: 'আগে ব্যবহার করা খরচের নাম',
    },

    trip: {
      label: 'ট্রিপ',
      loadingTrips: 'ট্রিপ লোড হচ্ছে…',
      selected: 'বেছে নেওয়া ট্রিপ',
      searchHint: 'ট্রিপ নম্বর, ভেন্ডর, ড্রাইভার বা প্লেটের অঙ্ক দিয়ে খুঁজুন।',
      listAria: 'ট্রিপ',
      noMatch: 'কোনো ট্রিপ মেলেনি।',
      notEntered: 'লেখা হয়নি',
      noneThisMonth: 'এই মাসে এই ভেন্ডরের কোনো ট্রিপ চলেনি।',
      advance: 'অগ্রিম',
      advanceAgainst: 'এই ট্রিপের বিপরীতে অগ্রিম',
      bill: 'বিল',
    },

    vendorBill: {
      tripAdvances: 'ট্রিপ অগ্রিম',

      /** The printed statement, handed over with the payment. */
      statement: {
        title: 'ভেন্ডর ট্রিপ বিল বিবরণী',
        documentTitle: '{vendor} — ট্রিপ বিল বিবরণী — {period}',
        brand: 'এলবিটিএস · লাইন বিজনেস ট্রান্সপোর্ট সার্ভিস',
        month: 'মাস:',
        status: 'অবস্থা:',
        vendor: 'ভেন্ডর',
        vendorCode: 'ভেন্ডর কোড',
        mobile: 'মোবাইল',
        tripRent: 'ট্রিপ ভাড়া',
        plusLabour: '+ লেবার বিল',
        lessAdvances: '− ট্রিপ অগ্রিম',
        lessPaid: '− পরিশোধিত',
        equalsDue: '= বাকি',
        equalsOverpaid: '= অতিরিক্ত দেওয়া',
        inWords: 'কথায়:',
        overpaidSuffix: ' (অতিরিক্ত দেওয়া)',
        note: 'দ্রষ্টব্য:',
        blankBillsWarning: {
          one: '{count}টি ট্রিপের ভাড়া বা লেবার বিল এখনও লেখা হয়নি। উপরে সেটি শূন্য ধরা হয়েছে, তাই লেখা হলে বাকির পরিমাণ বাড়তে পারে।',
          other: '{count}টি ট্রিপের ভাড়া বা লেবার বিল এখনও লেখা হয়নি। উপরে সেগুলো শূন্য ধরা হয়েছে, তাই লেখা হলে বাকির পরিমাণ বাড়তে পারে।',
        },
        tripsHeading: 'ট্রিপ · {period}',
        paymentsHeading: '{period}-এর পেমেন্ট',
        noTrip: 'এই মাসে এই ভেন্ডরের কোনো ট্রিপ চলেনি।',
        nothingPaid: 'এই মাসের জন্য এখনও কিছু দেওয়া হয়নি।',
        notEntered: 'লেখা হয়নি',
        /** The trip table's column heads. */
        colNumber: 'ক্রম',
        colDate: 'তারিখ',
        colTrip: 'ট্রিপ',
        colVehicle: 'গাড়ি',
        colDriver: 'চালক',
        colPlaces: 'জেলা / থানা',
        colChallans: 'চালান',
        colChallansTitle: 'চালান',
        colQty: 'পরিমাণ',
        colTripRent: 'ট্রিপ ভাড়া',
        colLabour: 'লেবার',
        colBill: 'বিল',
        colAdvance: 'অগ্রিম',
        colNet: 'নিট',
        /** The payments table's own. */
        colEntry: 'এন্ট্রি',
        colPaidFrom: 'যেখান থেকে দেওয়া',
        colReceivedBy: 'যিনি নিয়েছেন',
        colAmount: 'টাকা',
        reference: 'রেফ: {value}',
        entriesTotal: '{entries}',
        tripsTotal: '{trips}',
        accountToDate: 'আজ পর্যন্ত হিসাব (সব মাস):',
        accountBilled: 'বিল {amount}',
        accountSettled: 'অগ্রিম ও পরিশোধিত {amount}',
        accountDue: 'বাকি {amount}',
        accountOverpaid: 'অতিরিক্ত দেওয়া {amount}',
        preparedBy: 'প্রস্তুতকারী',
        approvedBy: 'অনুমোদনকারী',
        receivedByVendor: 'গ্রহণকারী (ভেন্ডর)',
        printedAt: 'প্রিন্ট {when}',
      },
      advancePlusPaid: 'অগ্রিম + পরিশোধিত',
      blankBillsSuffix: ' · {count}টি বিল ফাঁকা',
      vendorProfile: 'ভেন্ডর প্রোফাইল',
      pay: '{amount} পরিশোধ করুন',
      overpaid: 'বেশি পরিশোধ',
      due: 'বাকি',
      dueAndPeriod: '{state} · {period}',
      noneThisMonth: 'এই মাসে কোনো ভেন্ডরের ট্রিপ বিল নেই',
      noneHint: 'কোনো ভেন্ডরের একটি ট্রিপ এই মাসে চললেই সেটি এখানে দেখা যাবে।',
      vendor: 'ভেন্ডর',
      trips: 'ট্রিপ',
      paid: 'পরিশোধিত',
      openVendor: '{name} খুলুন',
      monthByMonth: 'মাসে মাসে',
      allTime: 'সব মিলিয়ে: {billed} বিল · {settled} নিষ্পত্তি · {due} বাকি',
      noMonthYet: 'এখনও কোনো মাস রেকর্ডে নেই।',
      payItAll: 'পুরোটাই পরিশোধ করুন',
      paying: 'পরিশোধ করা হচ্ছে',
      payingValue: '{vendor} · {period}',
      billMonth: 'বিলের মাস',
      year: 'বছর',
      chooseVendor: 'একটি ভেন্ডর বাছুন',
      nothingDue: 'এই মাসে কোনো ভেন্ডরকে কিছুই বাকি নেই।',
      printAria: '{name}-এর স্টেটমেন্ট প্রিন্ট করুন',
      printStatement: 'স্টেটমেন্ট প্রিন্ট করুন',
    },

    wallet: {
      title: 'ওয়ালেট',
      flow: 'জমা {in} · খরচ {out} · {entries}',
      lastEntrySuffix: ' · সর্বশেষ {when}',
      description:
        'প্রতিটি লেনদেনই ক্যাশের মধ্য দিয়ে যায়। ব্যাংক ও মোবাইল ওয়ালেট কেবল ওয়ালটনের বিলের পেমেন্ট নেয়।',
      add: 'ওয়ালেট যোগ করুন',
      addTitle: 'একটি ওয়ালেট যোগ করুন',
      editTitle: '{name} সম্পাদনা',
      editDescription: 'নাম বা বিবরণ বদলান। এর ব্যালেন্স আসে এর এন্ট্রিগুলো থেকে।',
      cashDescription:
        'একটি ক্যাশ বক্স। প্রতিটি লেনদেনই ক্যাশের মধ্য দিয়ে যায় — এর প্রারম্ভিক ব্যালেন্স পরে “টাকা জমা দিন” দিয়ে লিখুন।',
      bankDescription:
        'একটি ব্যাংক অ্যাকাউন্ট বা মোবাইল ব্যাংকিং নম্বর। এটি কেবল ওয়ালটনের বিলের পেমেন্ট নেয়; এখান থেকে কিছু খরচ হয় না, এতে বা এখান থেকে কিছু সরানোও হয় না।',
      kind: 'ধরন',
      name: 'নাম',
      keptBy: 'কার কাছে',
      accountNumber: 'অ্যাকাউন্ট নম্বর',
      note: 'নোট',
      actionsFor: '{name}-এর জন্য কাজ',
      close: 'ওয়ালেট বন্ধ করুন',
      reopen: 'ওয়ালেট আবার খুলুন',
      deleteTitle: '{name} মুছে ফেলবেন?',
      deleteDescription: 'এর বিপরীতে কখনও কিছুই লেখা হয়নি, তাই এটি একেবারে মুছে যাবে।',
      deleteConfirm: 'ওয়ালেট মুছে ফেলুন',
      loading: 'ওয়ালেট লোড হচ্ছে…',
      noCashWallet: 'কোনো ক্যাশ ওয়ালেট খোলা নেই। ওয়ালেট ট্যাব থেকে একটি যোগ করুন।',
      cashOnly: 'কেবল ক্যাশ ওয়ালেট।',
      chooseCash: 'একটি ক্যাশ ওয়ালেট বাছুন',
      choose: 'একটি ওয়ালেট বাছুন',
      cashBalance: 'ক্যাশ ব্যালেন্স {amount}',
      balance: 'ব্যালেন্স {amount}',
    },
    receivable: {
      anyPayment: 'যেকোনো পেমেন্ট',
    },

    vendorBills: {
      hasDue: 'বাকি আছে',
    },
    toasts: {
      kindSaved: '{kind} সেভ হয়েছে',
      kindUpdated: '{kind} হালনাগাদ হয়েছে',
      voucherRemoved: '{entry} থেকে ভাউচার সরানো হয়েছে',
      entryDeleted: '{entry} মুছে ফেলা হয়েছে',
      walletAdded: '{name} যোগ হয়েছে',
      walletUpdated: '{name} হালনাগাদ হয়েছে',
      walletDeleted: 'ওয়ালেট মুছে ফেলা হয়েছে',
      walletClosed: 'ওয়ালেট বন্ধ করা হয়েছে',
      walletClosedNote: 'এতে এন্ট্রি আছে, তাই এর ইতিহাস রেখে দেওয়া হয়েছে।',
      finalBillSaved: 'ফাইনাল বিল সেভ হয়েছে',
      finalBillUpdated: 'ফাইনাল বিল হালনাগাদ হয়েছে',
      finalBillDeleted: '{label}-এর ফাইনাল বিল মুছে ফেলা হয়েছে',
      voucherLoadFailed: 'ভাউচারটি লোড করা যায়নি।',
      voucherDownloadFailed: 'সেই ভাউচারটি ডাউনলোড করা যায়নি।',
    },

    validation: {
      dateRequired: 'একটি তারিখ বাছুন।',
      amountRequired: 'অঙ্কটি লিখুন।',
      amountTooLarge: 'অঙ্কটি খুব বড়।',
      walletRequired: 'একটি ওয়ালেট বাছুন।',
      walletFromRequired: 'টাকা কোন ওয়ালেট থেকে যাচ্ছে তা বাছুন।',
      walletToRequired: 'টাকা কোন ওয়ালেটে যাচ্ছে তা বাছুন।',
      walletDifferent: 'অন্য একটি ওয়ালেট বাছুন।',
      expenseFor: 'খরচটি কী বাবদ তা লিখুন।',
      expenseSpentOn: 'কী বাবদ খরচ হয়েছে তা লিখুন।',
      advanceGivenTo: 'অগ্রিমটি কাকে দেওয়া হয়েছে তা লিখুন।',
      advanceReturnRequired: 'যে অগ্রিমটি ফেরত আসছে সেটি বাছুন।',
      advanceAdjustRequired: 'যে অগ্রিমটি সমন্বয় হচ্ছে সেটি বাছুন।',
      tripRequired: 'অগ্রিমটি কোন ট্রিপের জন্য তা বাছুন।',
      vendorRequired: 'যে ভেন্ডরকে পরিশোধ করা হচ্ছে তা বাছুন।',
      unitRequired: 'ইউনিটটি লিখুন।',
      finalAmountRequired: 'ফাইনাল বিলের অঙ্ক লিখুন।',
      walletNameRequired: 'ওয়ালেটের একটি নাম দিন।',
    },
  },

  vendor: {
    unknown: 'অজানা',
    unrecognised: 'চেনা মানগুলোর মধ্যে পড়ে না।',
    current: 'চলমান',
    period: '{from} — {until}',
    title: 'ভেন্ডর',
    allVendors: 'সব ভেন্ডর',
    addedOn: 'যোগ হয়েছে {when}',
    somethingWrong: 'কিছু একটা ভুল হয়েছে।',
    removedVehicle: 'মুছে ফেলা গাড়ি',
    removedDriver: 'মুছে ফেলা ড্রাইভার',
    notRecorded: 'লেখা হয়নি',
    noExpiryRecorded: 'কোনো মেয়াদ লেখা হয়নি',
    noDriverAssigned: 'কোনো ড্রাইভার দেওয়া হয়নি',
    notAssigned: 'দেওয়া হয়নি',
    unassigned: 'বরাদ্দহীন',
    noLicence: 'কোনো লাইসেন্স লেখা হয়নি',
    notAssignedToVehicle: 'কোনো গাড়িতে দেওয়া হয়নি',

    /** The three states a list panel can be in besides rows. */
    panel: {
      nothingMatches: 'এই ফিল্টারগুলোর সাথে কিছু মেলেনি',
      widenFilters: 'বাকিগুলো দেখতে ফিল্টার একটু আলগা করুন বা মুছে দিন।',
      retrying: 'আবার চেষ্টা করা হচ্ছে…',
    },

    /** The two routes: the directory and a vendor account's own record. */
    page: {
      title: 'ভেন্ডর ব্যবস্থাপনা',
      description:
        'ভেন্ডর, গাড়ি, চালক এবং কাগজপত্রের হালনাগাদ এখান থেকে দেখা ও পরিচালনা করা হয়। প্রতিটি ভেন্ডরের নিজের বহর আছে, আর একজন চালককে কেবল সেই ভেন্ডরের নিজের গাড়িতেই বসানো যায়।',
      directoryAria: 'ভেন্ডর তালিকা',
      myTitle: 'আমার ভেন্ডর',
      myDescription: 'আপনার ভেন্ডরের বহর, চালক, নিয়োগ এবং কাগজপত্র।',
      myLoadFailed: 'আপনার ভেন্ডর লোড করা যায়নি',
      notLinkedDescription:
        'একটি ভেন্ডর অ্যাকাউন্ট যে ভেন্ডরের হয়ে কথা বলে, তার সাথে আগে সংযুক্ত হতে হয় — তার আগে দেখানোর কিছু থাকে না। প্রশাসন পৃষ্ঠা থেকে একজন অ্যাডমিন সেটি করে দেন।',
      readOnlyNotice:
        'আপনি নিজের ভেন্ডর রেকর্ড দেখছেন। এখানে সবকিছু কেবল পড়ার জন্য — কোনো কিছু বদলাতে হলে এলবিটিএস অফিসে যোগাযোগ করুন।',

      notFound: 'ভেন্ডর পাওয়া যায়নি',
      notFoundHint: 'এটি সরিয়ে ফেলা হয়ে থাকতে পারে, বা এই অ্যাকাউন্ট এই ভেন্ডরটি খুলতে না-ও পারে।',
      backToVendors: 'ভেন্ডর তালিকায় ফিরুন',
      loadFailed: 'এই ভেন্ডরটি লোড করা যায়নি',
    },

    documentTypes: {
      'Registration Certificate': 'রেজিস্ট্রেশন সার্টিফিকেট',
      'Fitness Certificate': 'ফিটনেস সার্টিফিকেট',
      'Tax Token': 'ট্যাক্স টোকেন',
      'Route Permit': 'রুট পারমিট',
      Insurance: 'ইনস্যুরেন্স',
      'Driving License': 'ড্রাইভিং লাইসেন্স',
      NID: 'এনআইডি',
    },

    tabs: {
      overview: 'সারসংক্ষেপ',
      vehicles: 'গাড়ি',
      drivers: 'ড্রাইভার',
      assignments: 'অ্যাসাইনমেন্ট',
      documents: 'কাগজপত্র',
      trips: 'ট্রিপ',
      activity: 'কার্যক্রম',
      sectionsAria: 'ভেন্ডরের বিভাগ',
      attentionAria: 'নজর দেওয়া দরকার',
    },

    stats: {
      activeVendors: 'সক্রিয় ভেন্ডর',
      activeVendorsHint: 'নতুন অ্যাসাইনমেন্ট নিতে পারে',
      vehicles: 'গাড়ি',
      acrossEvery: 'সব ভেন্ডর মিলিয়ে',
      drivers: 'ড্রাইভার',
      expiredDocuments: 'মেয়াদোত্তীর্ণ কাগজ',
      expiredHint: 'যে কাগজের মেয়াদ শেষ হয়ে গেছে',
      loadFailed: 'ভেন্ডরের সারসংক্ষেপ লোড করা যায়নি।',
    },

    directory: {
      loadFailed: 'ভেন্ডর লোড করা যায়নি',
      noneYet: 'এখনও কোনো ভেন্ডর নেই',
      noneHint:
        'ভেন্ডর হলো সেই প্রতিষ্ঠান যারা গাড়ি ও ড্রাইভার সরবরাহ করে। প্রথমটি যোগ করুন, তারপর তার নিচে তার ফ্লিট লিখুন।',
      add: 'ভেন্ডর যোগ করুন',
      editVendor: 'ভেন্ডর সম্পাদনা',
      editDescription:
        'ভেন্ডরের কোড একই থাকে — এর নিচের প্রতিটি গাড়ি, ড্রাইভার ও অ্যাসাইনমেন্ট এই কোডেরই অধীনে লেখা।',
      addDescription:
        'ভেন্ডরের কোড স্বয়ংক্রিয়ভাবে দেওয়া হয়। ভেন্ডরটি তৈরি হলে তার নিচে গাড়ি ও ড্রাইভার যোগ করা হয়।',
      information: 'ভেন্ডরের তথ্য',
      nameLabel: 'ভেন্ডরের নাম',
      mobileHint:
        'যেমন টাইপ করা হয়েছে তেমনই রাখা হয়। মিলিয়ে দেখা হয় ১১ অঙ্কের রূপে, তাই দেশের কোড দিয়ে লেখা একই নম্বরেও এই ভেন্ডরটিই পাওয়া যায়।',
      searchPlaceholder: 'ভেন্ডরের নাম, কোড বা মোবাইল',
      searchAria: 'ভেন্ডর খুঁজুন',
      statusAria: 'ভেন্ডরের অবস্থা দিয়ে ফিল্টার',
      complianceAria: 'কাগজপত্রের অবস্থা দিয়ে ফিল্টার',
      sortAria: 'ভেন্ডর সাজান',
      anyCompliance: 'যেকোনো অবস্থা',
      hasExpired: 'মেয়াদোত্তীর্ণ কাগজ আছে',
      hasExpiring: 'মেয়াদ শেষ হচ্ছে এমন কাগজ আছে',
      allInOrder: 'সব কাগজ ঠিক আছে',
      sortName: 'নাম (অ–হ)',
      sortRecent: 'সম্প্রতি যোগ হওয়া',
      sortVehicles: 'সবচেয়ে বেশি গাড়ি',
      sortDrivers: 'সবচেয়ে বেশি ড্রাইভার',
      vendor: 'ভেন্ডর',
      contact: 'যোগাযোগ',
      status: 'অবস্থা',
      compliance: 'কাগজপত্র',
      actions: 'কাজ',
      actionsFor: '{name}-এর জন্য কাজ',
      editDetails: 'তথ্য সম্পাদনা',
      changeStatus: 'অবস্থা বদলান',
      loading: 'লোড হচ্ছে',

      summaryFiltered: { one: '{count}টি ভেন্ডর এই ফিল্টারে মিলেছে', other: '{count}টি ভেন্ডর এই ফিল্টারে মিলেছে' },
      summaryTotal: { one: '{count}টি ভেন্ডর', other: '{count}টি ভেন্ডর' },
      attention: {
        one: '{count}টি কাগজে নজর দেওয়া দরকার',
        other: '{count}টি কাগজে নজর দেওয়া দরকার',
      },
      activeConsequence: 'এই ভেন্ডরের গাড়ি ও চালকদের আবার নিয়োগ দেওয়া যাবে।',
      inactiveConsequence:
        'আগের গাড়ি, চালক, নিয়োগ ও কাগজপত্র সব রেখে দেওয়া হয়। আবার সক্রিয় না হওয়া পর্যন্ত এই ভেন্ডরের অধীনে নতুন কিছু নিয়োগ দেওয়া যাবে না।',
      /** Two removals, the same rule: the page adds what it stops being offered for. */
      removeDescription:
        'কোনো গাড়ি, চালক, নিয়োগ বা ব্যবহারকারী অ্যাকাউন্ট এই ভেন্ডরকে না ধরলে এটি একেবারে মুছে যায়। কোনোটি ধরলে বদলে এটি {kept} — এক বছরের নিয়োগ রেকর্ডকে বলতে পারতে হয় কে গাড়ি চালাচ্ছিল, আর ভেন্ডর মুছে দিলে সেগুলো শূন্যের দিকে তাকিয়ে থাকবে।',
      removeDescriptionListed:
        'কোনো গাড়ি, চালক, নিয়োগ বা ব্যবহারকারী অ্যাকাউন্ট এই ভেন্ডরকে না ধরলে এটি একেবারে মুছে যায়। কোনোটি ধরলে বদলে এটি {kept} — এক বছরের নিয়োগ রেকর্ডকে বলতে পারতে হয় কে গাড়ি চালাচ্ছিল, আর ভেন্ডর মুছে দিলে সেগুলো শূন্যের দিকে তাকিয়ে থাকবে। যেভাবেই হোক, নতুন কাজের জন্য এটি আর দেখানো হবে না।',
      deactivatedAndKept: 'নিষ্ক্রিয় করে রেখে দেওয়া হয়',
    },

    header: {
      changePhoto: 'ভেন্ডরের ছবি বদলান',
      moreActions: 'ভেন্ডরের আরও কাজ',
      removePhoto: 'ছবি সরান',
      remove: 'ভেন্ডর মুছে ফেলুন',

      /** Provenance, as two whole sentences joined by a separator. */
      addedOnBy: '{name} {when} যোগ করেছেন',
      statusChanged: 'অবস্থা সর্বশেষ বদলেছে {when}',
      statusChangedBy: '{name} {when} অবস্থা সর্বশেষ বদলেছেন',
    },

    kpi: {
      vehicles: 'গাড়ি',
      drivers: 'ড্রাইভার',
      compliance: 'কাগজপত্র',

      inFleet: 'বহরে',
      onBooks: 'খাতায়',
      documentsOnFile: 'কাগজ জমা আছে',
      active: 'সক্রিয়',
      underMaintenance: 'মেরামতে',
      expiredPapers: 'মেয়াদ শেষ কাগজ',
      inactiveOrSuspended: 'নিষ্ক্রিয় বা স্থগিত',
      onLeave: 'ছুটিতে',
      suspended: 'স্থগিত',
      inactive: 'নিষ্ক্রিয়',
      valid: 'বৈধ',
      expiringSoon: 'মেয়াদ শেষের পথে',
      expired: 'মেয়াদ শেষ',


    },

    overview: {
      loadFailed: 'সারসংক্ষেপ লোড করা যায়নি',
      expiringDocuments: 'মেয়াদ শেষ হতে থাকা কাগজ',
      allDocuments: 'সব কাগজ',
      nothingDue: 'আগামী {days} দিনে নবায়নের মতো কিছুই নেই।',
      recentAssignments: 'সাম্প্রতিক অ্যাসাইনমেন্ট',
      allAssignments: 'সব অ্যাসাইনমেন্ট',
      noneAssignedYet: 'এখনও কোনো ড্রাইভারকে কোনো গাড়িতে দেওয়া হয়নি।',
      nothingNeedsAttention: 'নজর দেওয়ার মতো কিছু নেই',
      nothingWrong:
        'ফাইলে থাকা প্রতিটি কাগজ মেয়াদের মধ্যে আছে, আর কোনো গাড়ি বা ড্রাইভার সেবার বাইরে নেই।',
      recentActivity: 'সাম্প্রতিক কার্যক্রম',
      recentActivityHint: 'কাজ করার সময়েই লেখা হয়, কখনও সম্পাদনা করা হয় না।',
      activityEmpty:
        '{vendor}-এর জন্য গাড়ি যোগ করা, ড্রাইভার দেওয়া, কাগজ জমা দেওয়া বা ট্রিপ চালানো হলে তা এখানে দেখা যাবে।',

      nothingRecordedYet: 'এখনও কিছু লেখা হয়নি',
      activityDescription:
        '{vendor}, তার বহর, তার চালক এবং তার চালানো ট্রিপে যা বদলেছে — নতুনটি আগে। কাজ করার সময়েই লেখা হয়, কখনও সম্পাদনা করা হয় না।',
      moreAlerts: {
        one: 'আরও {count}টি সতর্কতা দেখানো হয়নি। বাকিগুলো কাগজপত্র ট্যাবে ফিল্টার করে নিষ্পত্তি করা হয়।',
        other: 'আরও {count}টি সতর্কতা দেখানো হয়নি। বাকিগুলো কাগজপত্র ট্যাবে ফিল্টার করে নিষ্পত্তি করা হয়।',
      },
    },

    vehicle: {
      panel: 'গাড়ি',
      searchPlaceholder: 'রেজিস্ট্রেশন, ব্র্যান্ড বা মডেল',
      searchAria: 'গাড়ি খুঁজুন',
      statusAria: 'গাড়ির অবস্থা দিয়ে ফিল্টার',
      ownershipAria: 'মালিকানা দিয়ে ফিল্টার',
      add: 'গাড়ি যোগ করুন',
      loadFailed: 'ফ্লিট লোড করা যায়নি',
      noneYet: 'এখনও কোনো গাড়ি যোগ করা হয়নি',
      noneHint:
        'প্রতিটি গাড়ি ঠিক একটি ভেন্ডরের অধীনে থাকে। {vendor}-এর প্রথম গাড়িটি যোগ করুন, তারপর তাতে একজন ড্রাইভার দিন।',
      registration: 'রেজিস্ট্রেশন',
      brandModel: 'ব্র্যান্ড / মডেল',
      ownership: 'মালিকানা',
      currentDriver: 'বর্তমান ড্রাইভার',
      viewDetails: 'বিস্তারিত দেখুন',
      actionsFor: '{plate}-এর জন্য কাজ',
      removeTitle: '{plate} মুছে ফেলবেন?',
      editTitle: 'গাড়ি সম্পাদনা',
      addTitle: 'গাড়ি যোগ করুন',
      editDescription:
        'গাড়ির কোড আর যে ভেন্ডরের অধীনে আছে তা একই থাকে। এক ভেন্ডর থেকে আরেক ভেন্ডরে গাড়ি সরালে তার অ্যাসাইনমেন্টের ইতিহাস আটকে পড়ত, তাই এটি সম্পাদনার বিষয় নয়।',
      addDescription: 'এই গাড়িটি {vendor}-এর অধীনে থাকবে। গাড়ির কোড স্বয়ংক্রিয়ভাবে দেওয়া হয়।',
      information: 'গাড়ির তথ্য',
      registrationLabel: 'রেজিস্ট্রেশন নম্বর',
      registrationHint:
        'ফাঁকসহ ঠিক যেমন টাইপ করা হয়েছে তেমনই রাখা হয়। মিলিয়ে দেখা হয় একটি সাধারণ রূপে, তাই একই প্লেট সিস্টেমে কেবল একটি গাড়িতেই থাকতে পারে।',
      ownershipSection: 'মালিকানা',
      ownedOrRented: 'নিজের না ভাড়া',
      information2: 'তথ্য',

      summaryFiltered: { one: '{count}টি গাড়ি এই ফিল্টারে মিলেছে', other: '{count}টি গাড়ি এই ফিল্টারে মিলেছে' },
      summaryTotal: { one: 'এই বহরে {count}টি গাড়ি', other: 'এই বহরে {count}টি গাড়ি' },
      changeDriver: 'চালক বদলান',
      removeDescription:
        'গাড়ি, তার কাগজপত্র এবং তার {history} মুছে যায়। যে নিয়োগের গাড়িটিই নেই, সেটি কর্তা ছাড়া একটি বাক্য — তাই সেই সারিগুলো রাখা যায় না। গাড়িটি যদি কেবল বহর ছেড়ে গিয়ে থাকে, নিষ্ক্রিয় চিহ্নিত করলে ইতিহাসটি থেকে যায়।',
      wholeHistory: 'পুরো নিয়োগের ইতিহাস',
      changePhoto: 'গাড়ির ছবি বদলান',
      addPhoto: 'গাড়ির ছবি যোগ করুন',
      brand: 'ব্র্যান্ড',
      model: 'মডেল',
      vendor: 'ভেন্ডর',
      documentsEmpty: 'এই গাড়ির জন্য এখনও কোনো কাগজ জমা দেওয়া হয়নি।',
      assignmentsEmpty: 'এই গাড়িতে এখনও কোনো ড্রাইভার দেওয়া হয়নি।',
      activeConsequence: 'এটিকে আবার ড্রাইভার দেওয়া যাবে।',
      inactiveConsequence:
        'এটির বর্তমান অ্যাসাইনমেন্ট ঠিক যেমন আছে তেমনই থাকে — মঙ্গলবার রাস্তার বাইরে থাকা গাড়িটির সোমবারও একজন ড্রাইভার ছিল। সক্রিয় না হওয়া পর্যন্ত শুধু নতুন ড্রাইভার নিতে পারবে না।',
    },

    driver: {
      panel: 'ড্রাইভার',
      searchPlaceholder: 'নাম, মোবাইল বা লাইসেন্স নম্বর',
      searchAria: 'ড্রাইভার খুঁজুন',
      statusAria: 'ড্রাইভারের অবস্থা দিয়ে ফিল্টার',
      licenceAria: 'লাইসেন্সের মেয়াদ দিয়ে ফিল্টার',
      anyLicence: 'যেকোনো লাইসেন্স',
      licenceExpired: 'লাইসেন্সের মেয়াদ শেষ',
      licenceExpiring: 'লাইসেন্সের মেয়াদ শেষ হচ্ছে',
      add: 'ড্রাইভার যোগ করুন',
      loadFailed: 'ড্রাইভার লোড করা যায়নি',
      noneYet: 'এখনও কোনো ড্রাইভার যোগ করা হয়নি',
      noneHint:
        'প্রতিটি ড্রাইভার ঠিক একটি ভেন্ডরের অধীনে থাকেন, আর কেবল {vendor}-এর নিজের গাড়িতেই দেওয়া যায়।',
      driver: 'ড্রাইভার',
      mobile: 'মোবাইল',
      licence: 'লাইসেন্স',
      assignedVehicle: 'যে গাড়িতে দেওয়া',
      viewDetails: 'বিস্তারিত দেখুন',
      actionsFor: '{name}-এর জন্য কাজ',
      removeTitle: '{name}-কে মুছে ফেলবেন?',
      editTitle: 'ড্রাইভার সম্পাদনা',
      addTitle: 'ড্রাইভার যোগ করুন',
      editDescription: 'ড্রাইভারের কোড আর যে ভেন্ডরের হয়ে কাজ করেন তা একই থাকে।',
      addDescription:
        'এই ড্রাইভার {vendor}-এর হয়ে কাজ করবেন। ড্রাইভারের কোড স্বয়ংক্রিয়ভাবে দেওয়া হয়।',
      information: 'ড্রাইভারের তথ্য',
      fullName: 'পুরো নাম',

      summaryFiltered: { one: '{count}জন চালক এই ফিল্টারে মিলেছেন', other: '{count}জন চালক এই ফিল্টারে মিলেছেন' },
      summaryTotal: { one: 'খাতায় {count}জন চালক', other: 'খাতায় {count}জন চালক' },
      changeVehicle: 'গাড়ি বদলান',
      assignVehicle: 'গাড়ি দিন',
      removeDescription:
        'চালক, তাঁর কাগজপত্র এবং তাঁর {history} মুছে যায়। তিনি যদি কেবল এই ভেন্ডর ছেড়ে গিয়ে থাকেন, নিষ্ক্রিয় চিহ্নিত করলে কোন গাড়ি কখন চালিয়েছেন সেই রেকর্ড থেকে যায়।',
      wholeHistory: 'পুরো নিয়োগের ইতিহাস',
      licenceNote:
        'এখানে লেখা লাইসেন্স একটি {document} কাগজ হিসেবেও জমা হয়, আর সেটিই এর মেয়াদ এই ভেন্ডরের কাগজ হিসাবে তোলে। কাগজপত্র ট্যাব থেকে এর একটি স্ক্যান জুড়ে দিন।',
      mobileNumber: 'মোবাইল নম্বর',
      identity: 'পরিচয়',
      licenceSection: 'লাইসেন্স',
      licenceExpiry: 'লাইসেন্সের মেয়াদ',
      changePhoto: 'ড্রাইভারের ছবি বদলান',
      contact: 'যোগাযোগ',
      address: 'ঠিকানা',
      nid: 'এনআইডি নম্বর',
      licenceNumber: 'লাইসেন্স নম্বর',
      expiry: 'মেয়াদ',
      currentVehicle: 'বর্তমান গাড়ি',
      documents: 'কাগজপত্র',
      documentsEmpty: 'এই ড্রাইভারের জন্য এখনও কোনো কাগজ জমা দেওয়া হয়নি।',
      assignmentHistory: 'অ্যাসাইনমেন্টের ইতিহাস',
      assignmentsEmpty: 'এই ড্রাইভারকে এখনও কোনো গাড়িতে দেওয়া হয়নি।',
      activeConsequence: 'তাঁকে আবার গাড়ি দেওয়া যাবে।',
      inactiveConsequence:
        'তাঁর বর্তমান অ্যাসাইনমেন্ট ঠিক যেমন আছে তেমনই থাকে — মঙ্গলবার থেকে ছুটিতে থাকা ড্রাইভার সোমবারও গাড়ি চালাচ্ছিলেন। সক্রিয় না হওয়া পর্যন্ত শুধু নতুন অ্যাসাইনমেন্ট নিতে পারবেন না।',
    },

    assignment: {
      panel: 'অ্যাসাইনমেন্ট',
      statusAria: 'অ্যাসাইনমেন্টের অবস্থা দিয়ে ফিল্টার',
      activeAndEnded: 'সক্রিয় ও শেষ হওয়া',
      fromAria: 'যেদিন থেকে বলবৎ',
      untilAria: 'যেদিন পর্যন্ত বলবৎ',
      assign: 'ড্রাইভার দিন',
      rangeNote:
        'একটি সময়সীমা দিলে সেই সময়ে বলবৎ থাকা প্রতিটি অ্যাসাইনমেন্ট দেখা যায়, কেবল সেই সময়ে শুরু হওয়াগুলো নয়।',
      loadFailed: 'অ্যাসাইনমেন্ট লোড করা যায়নি',
      noneYet: 'এখনও কোনো অ্যাসাইনমেন্ট নেই',
      noneHint:
        'কোনো গাড়িতে ড্রাইভার দেওয়া মানে একটি ঘর পূরণ নয়, একটি সময়কাল লেখা — তাই এই তালিকাটিই কে কখন কোন গাড়ি চালিয়েছেন তার পূর্ণ ইতিহাস।',
      endTitle: 'এই অ্যাসাইনমেন্ট শেষ করবেন?',
      endConfirm: 'অ্যাসাইনমেন্ট শেষ করুন',
      ending: 'শেষ করা হচ্ছে…',
      deleteTitle: 'এই অ্যাসাইনমেন্টের রেকর্ড মুছে ফেলবেন?',
      deleteConfirm: 'রেকর্ড মুছে ফেলুন',
      actionsFor: '{from} থেকে শুরু হওয়া অ্যাসাইনমেন্টের জন্য কাজ',
      vehicle: 'গাড়ি',
      driver: 'ড্রাইভার',
      from: 'থেকে',
      until: 'পর্যন্ত',
      status: 'অবস্থা',
      recorded: 'লেখা হয়েছে',
      current: 'চলমান',
      dialogTitle: 'ড্রাইভার দিন',
      dialogDescription:
        'গাড়ি আর ড্রাইভার একই ভেন্ডরের হতে হবে, আর একটি গাড়িতে একসঙ্গে কেবল একজনই সক্রিয় ড্রাইভার থাকতে পারেন।',
      section: 'অ্যাসাইনমেন্ট',
      chooseVehicle: 'একটি গাড়ি বাছুন',
      chooseDriver: 'একজন ড্রাইভার বাছুন',
      noActiveVehicles:
        'কোনো সক্রিয় গাড়ি নেই। মেরামতে থাকা, স্থগিত বা কাগজের মেয়াদ শেষ হওয়া গাড়িকে ড্রাইভার দেওয়া যায় না।',
      noActiveDrivers:
        'কোনো সক্রিয় ড্রাইভার নেই। ছুটিতে থাকা, স্থগিত বা নিষ্ক্রিয় ড্রাইভারকে দেওয়া যায় না।',
      alreadyDriving: '{from} থেকে ইতিমধ্যেই {plate} চালাচ্ছেন',
      periodSection: 'সময়কাল',
      assignedFrom: 'যেদিন থেকে',
      assignedUntil: 'যেদিন পর্যন্ত (ঐচ্ছিক)',
      assignedUntilHint: 'খোলা-মেয়াদি অ্যাসাইনমেন্টের জন্য ফাঁকা রাখুন, সাধারণত তাই হয়।',
      closeCurrent: 'বর্তমান অ্যাসাইনমেন্ট বন্ধ করে এই ড্রাইভারকে সক্রিয় করুন।',
      currentlyDrivenBy: 'এখন চালাচ্ছেন {label}',
      currentlyDriving: 'এখন চালাচ্ছেন {label}',

      summaryRange: {
        one: 'এই সময়সীমায় {count}টি নিয়োগ বলবৎ ছিল',
        other: 'এই সময়সীমায় {count}টি নিয়োগ বলবৎ ছিল',
      },
      summaryTotal: { one: 'রেকর্ডে {count}টি নিয়োগ', other: 'রেকর্ডে {count}টি নিয়োগ' },
      theDriver: 'চালক',
      thisVehicle: 'এই গাড়ি',
      now: 'এখন',
      endDescription:
        '{driver} আজ থেকে আর {vehicle}-এর সক্রিয় চালক থাকবেন না, আর সারিটি আজকের তারিখকে শেষ তারিখ ধরে ইতিহাসে থেকে যাবে। নতুন কাউকে না দেওয়া পর্যন্ত গাড়িটির কোনো চালক থাকবে না।',
      deleteDescription:
        'এটি এমন সারির জন্য যা {never} — ধরুন, ভুল গাড়ির নামে লেখা একটি হাতবদল। নিয়োগ এভাবে শেষ হয় না: সত্যিই চলেছে এমন একটি সময়কাল অফিসের দরকারি ইতিহাস, আর সেটি শেষ করার কাজটি করে {ends}।',
      neverExisted: 'কখনও থাকারই কথা ছিল না',
      deletePeriod: 'এই সারিটি {from} থেকে {until} পর্যন্ত।',
      handover:
        '{driver} {vehicle}-এর সক্রিয় চালক হবেন। {displaced}-এর সাথে চলতি নিয়োগটি {day} তারিখে বন্ধ করা হবে, আর ইতিহাসে রেখে দেওয়া হবে।',
      handoverUndated:
        '{driver} {vehicle}-এর সক্রিয় চালক হবেন। {displaced}-এর সাথে চলতি নিয়োগটি বন্ধ করা হবে, আর ইতিহাসে রেখে দেওয়া হবে।',
      replaceDriver: 'চালক বদলান',
    },

    document: {
      panel: 'কাগজপত্র',
      searchPlaceholder: 'কাগজের নম্বর',
      searchAria: 'কাগজ খুঁজুন',
      statusAria: 'কাগজের অবস্থা দিয়ে ফিল্টার',
      belongsToAria: 'কার কাগজ তা দিয়ে ফিল্টার',
      typeAria: 'কাগজের ধরন দিয়ে ফিল্টার',
      anyType: 'যেকোনো ধরন',
      allDocuments: 'সব কাগজ',
      vehicleDocuments: 'গাড়ির কাগজ',
      driverDocuments: 'ড্রাইভারের কাগজ',
      file: 'কাগজ জমা দিন',
      loadFailed: 'কাগজপত্র লোড করা যায়নি',
      noneYet: 'এখনও কোনো কাগজ জমা দেওয়া হয়নি',
      removeTitle: 'এই {type} সরিয়ে ফেলবেন?',
      renewTitle: 'নবায়ন বা প্রতিস্থাপন',
      renewDescription:
        '{subject}-এর জন্য রেকর্ডে থাকা {type} নবায়ন করা হচ্ছে। এটি দ্বিতীয় একটি কাগজ যোগ না করে সেই কাগজটিই বদলে দেয়, ফলে কাগজের হিসাব সঠিক থাকে।',
      detailsSection: 'কাগজের বিবরণ',
      typeLabel: 'কাগজের ধরন',
      alreadyOnRecord:
        'ইতিমধ্যেই রেকর্ডে আছে। সেভ করলে দ্বিতীয় একটি কাগজ জমা না হয়ে ওই কাগজটিই নবায়ন হবে।',
      issueDate: 'ইস্যুর তারিখ (ঐচ্ছিক)',
      expiryDate: 'মেয়াদ শেষের তারিখ',
      expiryHint: 'যে কাগজের মেয়াদ শেষ হয় না, যেমন এনআইডি, তার জন্য ফাঁকা রাখুন।',
      attachment: 'সংযুক্তি',
      attachmentHint:
        'ঐচ্ছিক — সতর্কতা আসে মেয়াদের তারিখ থেকে, আর স্ক্যানারের অপেক্ষায় থাকতে গিয়েই মেয়াদোত্তীর্ণ সার্টিফিকেট চোখ এড়িয়ে যায়। এটি গোপনে সংরক্ষিত হয় এবং কেবল এই অ্যাপ দিয়েই দেখা যায়।',
      subjectTitle: 'এই কাগজটি কার জন্য?',
      subjectDescription:
        'একটি কাগজ কোনো গাড়ির বা কোনো ড্রাইভারের হয়। এখানে বেছে নিলে ধরনের তালিকা কেবল সেগুলোতেই সীমিত হয় যেগুলো এর জন্য অর্থবহ।',
      vehicles: 'গাড়ি',
      drivers: 'ড্রাইভার',
      actionsFor: '{owner}-এর {type}-এর জন্য কাজ',
      viewFile: 'ফাইল দেখুন',
      document: 'কাগজ',
      number: 'নম্বর',
      expiry: 'মেয়াদ',
      fileColumn: 'ফাইল',
      noExpiry: 'মেয়াদ নেই',
      attached: 'সংযুক্ত',
      none: 'নেই',
      noFileAttached: 'কোনো ফাইল সংযুক্ত নেই।',
      removeChosenFile: 'বেছে নেওয়া ফাইলটি সরান',
      scanIt: 'স্ক্যান করুন',
      holding: '{name} ({size}) ধরে রাখা আছে। নতুন ফাইল দিলে এটি বদলে যাবে।',

      summaryFiltered: {
        one: '{count}টি কাগজ এই ফিল্টারে মিলেছে',
        other: '{count}টি কাগজ এই ফিল্টারে মিলেছে',
      },
      summaryTotal: { one: 'জমা আছে {count}টি কাগজ', other: 'জমা আছে {count}টি কাগজ' },
      soonestFirst: 'যেটির মেয়াদ আগে শেষ, সেটি আগে',
      addDescription:
        '{subject}-এর একটি কাগজ। এর অবস্থা মেয়াদের তারিখ থেকেই বের করা হয়, তাই হাতে কিছু বসানোর নেই।',
      removeDescription:
        'সারিটি ও তার সাথে জোড়া ফাইল মুছে যায়, আর এটি {vendor}-এর কাগজ হিসাবে আর গোনা হয় না। কাগজটি যদি কেবল নবায়ন হয়ে থাকে, নতুন তারিখ দিয়ে এটিকেই হালনাগাদ করলে হিসাবটি সঠিক থাকে।',
      noSubjectsYet:
        'এই ভেন্ডরের এখনও কোনো সক্রিয় গাড়ি বা চালক নেই। আগে একটি যোগ করুন — কাগজ কোনো কিছুর হতে হয়।',
      onRecordChip: 'রেকর্ডে আছে',
      typeFixed:
        'ধরন বদলানো যায় না — ট্যাক্স টোকেন আর রুট পারমিট এক নয়, প্রতিটির নিজের সারি আছে।',
      replaceAttached: 'জোড়া ফাইলটি বদলান',
      formatsHint:
        'পিডিএফ, জেপিজি, পিএনজি বা ওয়েবপি, সর্বোচ্চ {size}। কয়েক পাতার স্ক্যান একটি পিডিএফ হিসেবেই রাখা হয়, কারণ একটি কাগজ একটিই ফাইল।',
      viewerTitle: '{owner}-এর {type}',
      fileMeta: '{name} · {size}',
      noNumberRecorded: 'নম্বর লেখা নেই',
    },

    trip: {
      panel: 'ট্রিপ',
      loadFailed: 'ট্রিপ লোড করা যায়নি',
      noneThisMonth: 'এই মাসে কোনো ট্রিপ নেই',
      noneHint:
        '{vendor}-এর কোনো গাড়িই এই মাসে এখনও বেরোয়নি। আগের ট্রিপ দেখতে “যেকোনো তারিখ” বাছুন।',
      searchPlaceholder: 'ট্রিপ নম্বর, প্লেট বা ড্রাইভার',
      searchAria: 'ট্রিপ খুঁজুন',
      fromAria: 'যেদিন থেকে ট্রিপ',
      untilAria: 'যেদিন পর্যন্ত ট্রিপ',
      trip: 'ট্রিপ',
      challans: 'চালান',
      tripRent: 'ট্রিপ ভাড়া',
      labour: 'লেবার',
      labourBill: 'লেবার বিল',
      totalAmount: 'মোট অঙ্ক',
      advance: 'অগ্রিম',
      netAmount: 'নিট অঙ্ক',
      status: 'অবস্থা',
      notEntered: 'লেখা হয়নি',
      overpaid: '{amount} বেশি পরিশোধ',
      overpaidTitle: 'লেখা বিলের চেয়ে অগ্রিম ও পেমেন্ট বেশি',
      advancesAgainst: 'এই ট্রিপের বিপরীতে অগ্রিম',
      monthlyBillAria: 'মাসিক বিল',
      paid: 'পরিশোধিত',
      detailLoadFailed: 'ট্রিপটি লোড করা যায়নি',
      openInDelivery: 'ডেলিভারিতে খুলুন',
      tripSection: 'ট্রিপ',
      vehicle: 'গাড়ি',
      driver: 'ড্রাইভার',
      pieces: 'পিস',
      billSection: 'বিল ও পেমেন্ট',
      challansSection: 'চালান',
      complete: 'সম্পন্ন',
      pending: 'বাকি',

      vehicleDriver: 'গাড়ি · চালক',
      noAdvance: 'এই ট্রিপের বিপরীতে কোনো অগ্রিম দেওয়া হয়নি।',
      awaitingCopy: 'কপির অপেক্ষায়',
      completed: 'সম্পন্ন',
      noRent: 'ট্রিপ ভাড়া নেই',
      noLabour: 'লেবার বিল নেই',
      rentTotal: 'ট্রিপ ভাড়া {amount}',
      labourTotal: 'লেবার বিল {amount}',
      tripFallback: 'ট্রিপ',
    },

    dashboard: {
      title: 'ড্যাশবোর্ড',
      description:
        'LBTS-এর জন্য আপনার ট্রিপ — কী বেরিয়েছে, কী ফেরত এসেছে, কত বিল হয়েছে আর কত এখনও বাকি।',
      notLinkedBadge: 'এখনও সংযুক্ত নয়',
      notLinkedTitle: 'এই অ্যাকাউন্টের সঙ্গে কোনো ভেন্ডর সংযুক্ত নেই',
      loadFailed: 'আপনার ড্যাশবোর্ড লোড করা যায়নি',
      notLinkedFootnote: 'অ্যাকাউন্টটি সংযুক্ত করাতে একজন প্রশাসকের সঙ্গে যোগাযোগ করুন।',
      needsAttention: 'নজর দেওয়া দরকার',
      lastSixMonths: 'গত ছয় মাস',
      lastSixHint:
        'প্রতিটি মাসের ট্রিপে কত বিল হয়েছে। যে মাসে কোনো ট্রিপ নেই সেটি শূন্য, ফাঁক নয়।',
      readOnly:
        'এখানে যা আছে সবই আপনার নিজের ভেন্ডর রেকর্ড এবং কেবল পড়ার জন্য। ট্রিপ, বিল ও পেমেন্ট লেখে LBTS — কিছু সংশোধন করাতে অফিসে যোগাযোগ করুন।',
      paidAhead: 'আগেই পরিশোধ',
      billed: 'বিল হয়েছে',
      advance: 'অগ্রিম',
      paid: 'পরিশোধিত',
      everyTripByMonth: 'প্রতিটি ট্রিপ, মাসে মাসে',
      nothingOutThisMonth: 'এই মাসে এখনও কিছুই বেরোয়নি',
      today: 'আজ',
      noLorryYet: '{day} তারিখে এখনও কোনো লরি বেরোয়নি',
      outOn: '{day} তারিখে বেরিয়েছে',
      nothingBilledYet: 'এই সময়সীমায় এখনও কোনো বিল হয়নি',
      chartCaption: 'মাস অনুযায়ী ট্রিপ, পিস ও বিল হওয়া অঙ্ক',
      month: 'মাস',
      trips: 'ট্রিপ',
      pieces: 'পিস',
      latestTrips: 'সাম্প্রতিক ট্রিপ',
      latestTripsHint:
        'LBTS-এর জন্য সবচেয়ে সাম্প্রতিক চালানগুলো। কোনোটি খুললে তার চালান ও হিসাব দেখা যাবে।',
      allTrips: 'সব ট্রিপ',
      noTripYet: 'LBTS-এর জন্য এখনও কোনো ট্রিপ চালানো হয়নি। চালানো হলে তা এখানে দেখা যাবে।',
      nothingOutstanding: 'বাকি কিছু নেই',
      nothingOutstandingHint:
        'প্রতিটি সই করা কপি এসে গেছে, প্রতিটি ট্রিপের বিল আছে, আর ফাইলে থাকা প্রতিটি কাগজ মেয়াদের মধ্যে আছে।',
      renewBeforeLapse:
        'তারিখ পেরিয়ে গিয়ে গাড়ি বা ড্রাইভার অ্যাসাইন করার অযোগ্য হওয়ার আগেই নবায়ন করুন।',
      deliveredThisMonth: 'এই মাসে ডেলিভারি',
      nothingCarried: 'এখনও কিছুই বহন হয়নি',
      backAtDepot: 'ডিপোতে ফেরত',
      nothingCameBack: 'এই মাসে কিছুই ফেরত আসেনি',
      awaitingCopy: 'সই করা কপির অপেক্ষায়',
      everyCopyIn: 'প্রতিটি কপি এসে গেছে',
      tripsCompleted: 'সম্পন্ন ট্রিপ',
      noTripsThisMonth: 'এই মাসে এখনও কোনো ট্রিপ নেই',
      documentsLapsing: 'মেয়াদ শেষ হতে থাকা কাগজ',
      documents: 'কাগজপত্র',
      inDate: 'মেয়াদের মধ্যে',
      fleetAria: 'রেকর্ডে থাকা ফ্লিট',
      deliveredNote: 'বহন করা {carried}-এর মধ্যে · {rate}',
      returnedNote: 'এই মাসে ট্রিপ থেকে ফেরত আসা পিস',
      awaitingNote: '{trips} জুড়ে',
      awaitingNoteOldest: '{trips} জুড়ে · সবচেয়ে পুরোনো {day}',
      completedNote: 'এই মাসের {trips}-এর মধ্যে',

      copiesTitle: '{copies} এখনও ফেরত আসেনি',
      copiesDetail:
        '{trips}-এ। প্রতিটি গ্রহীতার সই করা চালান স্ক্যান হয়ে গেলেই একটি ট্রিপ বন্ধ হয়।',
      copiesDetailOldest:
        '{trips}-এ, সবচেয়ে পুরোনোটি চলেছিল {day}। প্রতিটি গ্রহীতার সই করা চালান স্ক্যান হয়ে গেলেই একটি ট্রিপ বন্ধ হয়।',
      billsTitle: '{trips}-এর পূর্ণ বিল নেই',
      billsDetail: {
        one: 'এর বিপরীতে ভাড়া বা লেবার এখনও লেখা হয়নি, তাই {period}-এর মোট অঙ্ক প্রকৃত পাওনার চেয়ে কম দেখাচ্ছে।',
        other: 'এগুলোর বিপরীতে ভাড়া বা লেবার এখনও লেখা হয়নি, তাই {period}-এর মোট অঙ্ক প্রকৃত পাওনার চেয়ে কম দেখাচ্ছে।',
      },
      expiredTitle: '{documents} মেয়াদোত্তীর্ণ',
      expiredDetail:
        'যে লরির কাগজের মেয়াদ শেষ, সেটিকে পাঠানো যায় না। নবায়ন করা সার্টিফিকেটটি LBTS-এ পাঠিয়ে ফাইল করিয়ে নিন।',
      expiringTitle: '{documents}-এর মেয়াদ শেষ হচ্ছে',

      due: 'বাকি',
      settled: 'মিটে গেছে',
      piecesCarried: '{pieces} বহন করা হয়েছে',
      deliveredShare: 'যা বেরিয়েছিল তার {rate} ডেলিভারি হয়েই রয়ে গেছে',
      billedPerMonth: 'মাসে বিল — ট্রিপ ভাড়া ও লেবার',
      billedSeries: 'বিল',
      /** An axis figure at the local scale: 12K, 1.5L, 2Cr. */
      compactThousand: '{value} হাজার',
      compactLakh: '{value} লক্ষ',
      compactCrore: '{value} কোটি',
    },

    statusDialog: {
      title: 'অবস্থা বদলান',
      description:
        'একটি {noun}-এর অবস্থা ঠিক করে দেয় এরপর এটি নিয়ে কী করা যাবে। আগে লেখা কিছুই এতে বদলায় না বা মুছে যায় না।',
      currently: 'এখন {status}',
      selectAria: 'একটি অবস্থা বাছুন',
      reason: 'কারণ (ঐচ্ছিক)',
      reasonPlaceholder: 'রেকর্ডে লেখা থাকে, আর আবার সক্রিয় হলে মুছে যায়।',
      confirm: 'পরিবর্তন নিশ্চিত করুন',
      nounVendor: 'ভেন্ডর',
      nounVehicle: 'গাড়ি',
      nounDriver: 'ড্রাইভার',
    },

    remove: {
      vendorTitle: '{name} মুছে ফেলবেন?',
      confirm: 'মুছে ফেলুন',
      removing: 'মুছে ফেলা হচ্ছে…',

      /** What "cancel" says on a removal: what happens if you do not. */
      keepIt: 'রেখে দিন',
      keepThem: 'রেখে দিন',
    },

    photo: {
      viewFullSize: '{label}-এর ছবি পূর্ণ আকারে দেখুন',
      thisVehicle: 'এই গাড়ি',
      removePhoto: 'ছবি সরান',

      formatsHint: 'জেপিজি, পিএনজি বা ওয়েবপি, সর্বোচ্চ {size}',
    },

    validation: {
      mobileRequired: 'মোবাইল নম্বর লিখতে হবে',
      mobileInvalid: '১১ অঙ্কের মোবাইল নম্বর লিখুন, যেমন 01712345678।',
      vendorNameTooShort: 'ভেন্ডরের নাম অন্তত ২ অক্ষরের হতে হবে',
      vendorNameTooLong: 'ভেন্ডরের নাম সর্বোচ্চ ১৬০ অক্ষরের হতে পারে',
      addressTooLong: 'ঠিকানা সর্বোচ্চ ৪০০ অক্ষরের হতে পারে',
      registrationTooShort: 'রেজিস্ট্রেশন নম্বর অন্তত ৪ অক্ষরের হতে হবে',
      registrationTooLong: 'রেজিস্ট্রেশন নম্বর সর্বোচ্চ ৬০ অক্ষরের হতে পারে',
      ownershipRequired: 'গাড়িটি কীভাবে মালিকানায় আছে তা বাছুন।',
      dateInvalid: 'একটি সঠিক তারিখ দিন।',
      driverNameTooShort: 'ড্রাইভারের নাম অন্তত ২ অক্ষরের হতে হবে',
      driverNameTooLong: 'ড্রাইভারের নাম সর্বোচ্চ ১৬০ অক্ষরের হতে পারে',
      licenceTooLong: 'লাইসেন্স নম্বর সর্বোচ্চ ৬০ অক্ষরের হতে পারে',
      licenceNumberNeeded: 'এই মেয়াদ যে লাইসেন্স নম্বরের, সেটি লিখুন।',
      vehicleRequired: 'একটি গাড়ি বাছুন।',
      driverRequired: 'একজন ড্রাইভার বাছুন।',
      assignedFromRequired: 'অ্যাসাইনমেন্ট যেদিন শুরু হচ্ছে সেই তারিখ বাছুন।',
      documentTypeRequired: 'কাগজের একটি ধরন বাছুন।',

      nidTooLong: 'এনআইডি ৪০ অক্ষর বা তার কম হতে হবে',
      endBeforeStart: 'শেষ তারিখ শুরুর তারিখের আগে হতে পারে না।',
      expiryBeforeIssue: 'মেয়াদের তারিখ ইস্যুর তারিখের আগে হতে পারে না।',
    },

    toasts: {
      vehicleAdded: '{plate} যোগ হয়েছে, কোড {code}',
      vehicleUpdated: '{plate} হালনাগাদ হয়েছে',
      vehicleStatus: '{plate} এখন {status}',
      vehicleActiveNote: 'এটিকে আবার ড্রাইভার দেওয়া যাবে।',
      vehicleInactiveNote:
        'এর অ্যাসাইনমেন্টের ইতিহাস অপরিবর্তিত। সক্রিয় না হওয়া পর্যন্ত নতুন ড্রাইভার নিতে পারবে না।',
      vehiclePhotoUpdated: '{plate}-এর ছবি হালনাগাদ হয়েছে',
      vehiclePhotoRemoved: '{plate} থেকে ছবি সরানো হয়েছে',
      vehicleRemoved: '{label} মুছে ফেলা হয়েছে',
      vehicleRemovedNote: 'এর অ্যাসাইনমেন্টের ইতিহাস ও কাগজপত্রও সঙ্গে গেছে।',
      driverAdded: '{name} যোগ হয়েছেন, কোড {code}',
      driverLicenceNote:
        'লাইসেন্সটি একটি কাগজ হিসেবে জমা হয়েছে, তাই এর মেয়াদ এখন কাগজপত্রের হিসাবে দেখা যাবে।',
      driverUpdated: '{name} হালনাগাদ হয়েছেন',
      driverStatus: '{name} এখন {status}',
      driverActiveNote: 'তাঁকে আবার অ্যাসাইন করা যাবে।',
      driverInactiveNote:
        'তাঁর অ্যাসাইনমেন্টের ইতিহাস অপরিবর্তিত। সক্রিয় না হওয়া পর্যন্ত নতুন অ্যাসাইনমেন্ট নিতে পারবেন না।',
      driverRemoved: '{label} মুছে ফেলা হয়েছে',
      driverRemovedNote: 'তাঁর অ্যাসাইনমেন্টের ইতিহাস ও কাগজপত্রও সঙ্গে গেছে।',
      photoUpdated: 'ছবি হালনাগাদ হয়েছে',
      photoRemoved: 'ছবি সরানো হয়েছে',
      assignmentEnded: 'অ্যাসাইনমেন্ট শেষ হয়েছে',
      assignmentEndedNote: '{plate}-এর এখন কোনো ড্রাইভার নেই।',
      theVehicle: 'গাড়িটির',
      assignmentRemoved: 'অ্যাসাইনমেন্টের রেকর্ড সরানো হয়েছে',
      assignmentRemovedNote: 'এটি শেষ হিসেবে চিহ্নিত না হয়ে ইতিহাস থেকেই মুছে গেছে।',
      documentFiled: '{owner}-এর জন্য {type} জমা হয়েছে',
      documentUpdated: '{type} হালনাগাদ হয়েছে',
      documentRemoved: '{label} মুছে ফেলা হয়েছে',
      vendorAdded: '{name} যোগ হয়েছে, কোড {code}',
      vendorActiveNote: 'এটি সঙ্গে সঙ্গেই অ্যাসাইনমেন্ট নিতে পারবে।',
      vendorInactiveNote: 'এটি {status}, তাই এর অধীনে এখনও কিছুই অ্যাসাইন করা যাবে না।',
      vendorUpdated: '{name} হালনাগাদ হয়েছে',
      vendorStatus: '{name} এখন {status}',
      vendorStatusActiveNote: 'এটি আবার নতুন অ্যাসাইনমেন্ট নিতে পারবে।',
      vendorStatusInactiveNote:
        'পুরোনো রেকর্ড রেখে দেওয়া হয়েছে। এর অধীনে নতুন কিছুই অ্যাসাইন করা যাবে না।',
      vendorGone: 'কিছুই এটিকে উল্লেখ করেনি, তাই এটি মুছে গেছে।',
      fileLoadFailed: 'ফাইলটি লোড করা যায়নি।',
      fileDownloadFailed: 'সেই ফাইলটি ডাউনলোড করা যায়নি।',
      photoTypeUnsupported: 'এই ধরনের ফাইল চলবে না',
      photoTypeHint: 'জেপিজি, পিএনজি বা ওয়েবপি ধরনের একটি ছবি বাছুন।',
      photoTooLarge: 'ছবিটি ৫ MB-র চেয়ে বড়',
      photoTooLargeHint: 'ছোট একটি ফাইল বাছুন, বা কম রেজোলিউশনে রপ্তানি করুন।',
      documentTypeHint: 'পিডিএফ, জেপিজি, পিএনজি বা ওয়েবপি ধরনের একটি ফাইল সংযুক্ত করুন।',
      documentTooLarge: 'ফাইলটি ২৫ MB-র চেয়ে বড়',
      documentTooLargeHint: 'কম রেজোলিউশনে স্ক্যান করে আবার সংযুক্ত করুন।',

      assignmentCreated: '{driver}-কে {vehicle}-এ দেওয়া হয়েছে',
      aDriver: 'চালক',
      theVehicleLower: 'গাড়িটি',
      vendorDeactivated: '{label} নিষ্ক্রিয় করা হয়েছে',
      vendorDeleted: '{label} মুছে ফেলা হয়েছে',
      vendorStillReferenced: {
        one: '{count}টি রেকর্ড এখনও এটিকে ধরে আছে, তাই মুছে না ফেলে ব্যবহারের বাইরে রাখা হয়েছে।',
        other: '{count}টি রেকর্ড এখনও এটিকে ধরে আছে, তাই মুছে না ফেলে ব্যবহারের বাইরে রাখা হয়েছে।',
      },
    },
    filters: {
      anyStatus: 'যেকোনো অবস্থা',
      anyOwnership: 'যেকোনো মালিকানা',
    },
    compliance: {
      noneFiled: 'কিছুই জমা নেই',
      allValid: '{n}টি বৈধ',
      expired: '{n}টি মেয়াদোত্তীর্ণ',
      expiring: '{n}টির মেয়াদ শেষ হচ্ছে',
      expiredTitle: {
        one: 'এই বিষয়ের জমা দেওয়া {total}টি কাগজের {n}টির মেয়াদ পেরিয়ে গেছে',
        other: 'এই বিষয়ের জমা দেওয়া {total}টি কাগজের {n}টির মেয়াদ পেরিয়ে গেছে',
      },
      expiringTitle: {
        one: 'এই বিষয়ের জমা দেওয়া {total}টি কাগজের {n}টির মেয়াদ {days} দিনের মধ্যে শেষ হচ্ছে',
        other: 'এই বিষয়ের জমা দেওয়া {total}টি কাগজের {n}টির মেয়াদ {days} দিনের মধ্যে শেষ হচ্ছে',
      },
    },

    vendorStatuses: {
      Pending: { label: 'অপেক্ষমাণ', description: 'রেকর্ডে আছে, তবে এখনও কাজের অনুমতি পায়নি।' },
      Active: { label: 'সক্রিয়', description: 'কাজ করছে, এবং নতুন অ্যাসাইনমেন্ট নিতে পারে।' },
      Inactive: {
        label: 'নিষ্ক্রিয়',
        description: 'ব্যবহারে নেই। পুরোনো রেকর্ড রেখে দেওয়া হয়; নতুন কিছু দেওয়া হয় না।',
      },
      Suspended: {
        label: 'স্থগিত',
        description: 'আমরা থামিয়ে রেখেছি। আবার চালু না করা পর্যন্ত নতুন কোনো অ্যাসাইনমেন্ট নয়।',
      },
    },

    vehicleStatuses: {
      Active: { label: 'সক্রিয়', description: 'রাস্তায় আছে, এবং ড্রাইভার নিতে পারে।' },
      Inactive: { label: 'নিষ্ক্রিয়', description: 'আপাতত ফ্লিটের বাইরে।' },
      'Under Maintenance': {
        label: 'মেরামতে',
        description: 'ওয়ার্কশপে আছে। নতুন অ্যাসাইনমেন্টের জন্য পাওয়া যাবে না।',
      },
      Suspended: { label: 'স্থগিত', description: 'পরবর্তী নির্দেশ পর্যন্ত আমরা থামিয়ে রেখেছি।' },
      Expired: {
        label: 'মেয়াদোত্তীর্ণ',
        description: 'কাগজপত্রের মেয়াদ শেষ। এটিকে ড্রাইভার দেওয়া যাবে না।',
      },
    },

    driverStatuses: {
      Active: { label: 'সক্রিয়', description: 'পাওয়া যাচ্ছে, এবং অ্যাসাইন করা যাবে।' },
      Inactive: { label: 'নিষ্ক্রিয়', description: 'এই ভেন্ডরের হয়ে আর কাজ করেন না।' },
      Suspended: { label: 'স্থগিত', description: 'আমরা থামিয়ে রেখেছি। অ্যাসাইন করা যাবে না।' },
      'On Leave': {
        label: 'ছুটিতে',
        description: 'ছুটিতে আছেন, পরে ফিরবেন। এর মধ্যে নতুন অ্যাসাইনমেন্ট নিতে পারবেন না।',
      },
    },

    assignmentStatuses: {
      Active: { label: 'সক্রিয়', description: 'এখন বলবৎ আছে।' },
      Ended: {
        label: 'শেষ হয়েছে',
        description: 'ইতিহাস। কে চালাচ্ছিলেন তা রেকর্ড যাতে বলতে পারে, সে জন্য রাখা।',
      },
    },

    documentStatuses: {
      Valid: { label: 'বৈধ', description: 'মেয়াদের মধ্যে, হাতে সময়ও আছে।' },
      'Expiring Soon': {
        label: 'মেয়াদ শেষ হচ্ছে',
        description: 'নবায়নের সময়সীমার মধ্যে আছে। মেয়াদ শেষ হওয়ার আগেই নবায়ন করুন।',
      },
      Expired: {
        label: 'মেয়াদোত্তীর্ণ',
        description: 'মেয়াদ শেষ। এটি নিয়ে গাড়ি বা ড্রাইভারের কাজ করা উচিত নয়।',
      },
    },

    ownership: {
      'Vendor Owned': { label: 'নিজের', description: 'ভেন্ডরের নিজের গাড়ি।' },
      Rented: { label: 'ভাড়া', description: 'ভেন্ডর ভাড়ায় এনেছে।' },
    },
  },

}
