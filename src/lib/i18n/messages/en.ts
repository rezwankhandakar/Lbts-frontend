import type { MessageTree } from '../translate.ts'

/**
 * The English message tree — the reference every other locale is typed
 * against, and the fallback every other locale falls back to.
 *
 * `satisfies MessageTree` rather than a type annotation, deliberately: the
 * annotation would widen every leaf to `string` and the key union derived from
 * this file would collapse to nothing. `satisfies` validates the shape while
 * keeping the literal inference that makes `TranslationKey` a real union — so
 * `t('common.actions.save')` compiles and `t('common.actions.svae')` does not.
 *
 * Organisation mirrors the app rather than the alphabet: `common` is the
 * vocabulary every module shares, `nav` and `pages` are the shell, and each
 * module owns a branch named after its folder. A string used by exactly one
 * module belongs in that module's branch; the moment a second module wants it,
 * it moves to `common` — the same rule CLAUDE.md sets for a shared helper.
 */
export const en = {
  app: {
    name: 'LBTS',
    fullName: 'Line Business Transport Service',
    tagline: 'Transport operations management',
  },

  language: {
    label: 'Language',
    switchTo: 'Switch to {language}',
    current: 'Current language: {language}',
    english: 'English',
    bangla: 'Bangla',
    changed: 'Language changed to {language}',
  },

  /**
   * The vocabulary every module shares. A word only earns a place here once a
   * second module wants it — a one-module string lives in that module's branch,
   * because a shared key meaning two slightly different things in two places is
   * how a translation quietly becomes wrong in one of them.
   */
  common: {
    actions: {
      save: 'Save',
      saveChanges: 'Save changes',
      cancel: 'Cancel',
      close: 'Close',
      confirm: 'Confirm',
      delete: 'Delete',
      remove: 'Remove',
      edit: 'Edit',
      create: 'Create',
      add: 'Add',
      update: 'Update',
      submit: 'Submit',
      search: 'Search',
      filter: 'Filter',
      filters: 'Filters',
      moreFilters: 'More filters',
      clear: 'Clear',
      undo: 'Undo',
      clearAll: 'Clear all',
      clearFilters: 'Clear filters',
      apply: 'Apply',
      reset: 'Reset',
      refresh: 'Refresh',
      retry: 'Try again',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      continue: 'Continue',
      done: 'Done',
      open: 'Open',
      view: 'View',
      viewAll: 'View all',
      download: 'Download',
      print: 'Print',
      export: 'Export',
      upload: 'Upload',
      attachFile: 'Attach a file',
      scan: 'Scan',
      replace: 'Replace',
      selectAll: 'Select all',
      copy: 'Copy',
      skip: 'Skip',
      finish: 'Finish',
      showMore: 'Show more',
      showLess: 'Show less',
      expand: 'Expand',
      collapse: 'Collapse',
      goBack: 'Go back',
      goToDashboard: 'Go to dashboard',
      reload: 'Reload the page',
      dismiss: 'Dismiss',
      markAllRead: 'Mark all as read',
    },

    labels: {
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      date: 'Date',
      dateRange: 'Date range',
      from: 'From',
      to: 'To',
      status: 'Status',
      role: 'Role',
      type: 'Type',
      amount: 'Amount',
      total: 'Total',
      quantity: 'Quantity',
      qty: 'Qty',
      rate: 'Rate',
      notes: 'Notes',
      note: 'Note',
      reason: 'Reason',
      description: 'Description',
      details: 'Details',
      summary: 'Summary',
      actions: 'Actions',
      createdBy: 'Created by',
      createdAt: 'Created',
      updatedBy: 'Updated by',
      updatedAt: 'Updated',
      customer: 'Customer',
      address: 'Address',
      district: 'District',
      thana: 'Thana',
      location: 'Location',
      vendor: 'Vendor',
      vehicle: 'Vehicle',
      driver: 'Driver',
      product: 'Product',
      model: 'Model',
      unit: 'Unit',
      csd: 'CSD',
      month: 'Month',
      year: 'Year',
      all: 'All',
      none: 'None',
      other: 'Other',
      optional: 'Optional',
      /** The parenthesis a form puts after a label, not the word on its own. */
      optionalSuffix: '(optional)',
      required: 'Required',
      /** Read out beside a required field's label, never drawn. */
      requiredSr: '(required)',
      document: 'Document',
      file: 'File',
      photo: 'Photo',
      monthYear: '{month} {year}',
    },

    states: {
      loading: 'Loading…',
      saving: 'Saving…',
      deleting: 'Deleting…',
      uploading: 'Uploading…',
      searching: 'Searching…',
      noResults: 'No results',
      noData: 'Nothing to show yet',
      empty: 'Nothing here yet',
      notSet: 'Not set',
      notAvailable: 'Not available',
      never: 'Never',
      unknown: 'Unknown',
      blanks: '(Blanks)',
      yes: 'Yes',
      no: 'No',
      enabled: 'Enabled',
      disabled: 'Disabled',
      active: 'Active',
      inactive: 'Inactive',
    },

    pagination: {
      showing: 'Showing {from}–{to} of {total}',
      /**
       * The noun is interpolated rather than concatenated, because the two
       * languages put it in different places: English trails it after the
       * total, Bangla leads with it. A sentence assembled from fragments in
       * JSX could only ever be right in one of them.
       */
      showingNoun: 'Showing {from}–{to} of {total} {noun}',
      pagesAria: '{noun} pages',
      page: 'Page {page} of {pages}',
      rows: { one: '{count} row', other: '{count} rows' },
      records: { zero: 'No records', one: '{count} record', other: '{count} records' },
      results: { zero: 'No results', one: '{count} result', other: '{count} results' },
      selected: '{count} selected',
      /**
       * "3 challans" — a count and the noun it counts, agreed.
       *
       * One frame for every counted noun in the app. Bangla attaches its
       * classifier to the number rather than to the noun, which is exactly
       * the kind of thing a concatenation in a component gets wrong.
       */
      counted: '{n} {noun}',
    },

    validation: {
      required: 'This field is required',
      invalidEmail: 'Enter a valid email address',
      invalidPhone: 'Enter a valid phone number',
      invalidNumber: 'Enter a valid number',
      invalidDate: 'Enter a valid date',
      minLength: 'Must be at least {min} characters',
      maxLength: 'Must be at most {max} characters',
      minValue: 'Must be at least {min}',
      maxValue: 'Must be at most {max}',
      positiveNumber: 'Must be a positive number',
      wholeNumber: 'Must be a whole number',
      passwordTooShort: 'Password must be at least {min} characters',
      passwordsDoNotMatch: 'Passwords do not match',
      selectOne: 'Choose an option',
      fileTooLarge: 'File is larger than {max}',
      fileTypeNotAllowed: 'That file type is not accepted',
    },

    confirm: {
      title: 'Are you sure?',
      deleteTitle: 'Delete this permanently?',
      deleteBody: 'This cannot be undone.',
      unsavedTitle: 'Leave without saving?',
      unsavedBody: 'Your changes will be lost.',
    },
  },

  /**
   * Time wording. The *formatting* is `Intl`'s and lives in `lib/i18n/format.ts`;
   * what is here is the handful of words no formatter produces.
   */
  time: {
    justNow: 'Just now',
    today: 'Today',
    yesterday: 'Yesterday',
    tomorrow: 'Tomorrow',
    todayAt: 'Today, {time}',
    yesterdayAt: 'Yesterday, {time}',
    thisMonth: 'This month',
    lastMonth: 'Last month',
    thisYear: 'This year',
    anyDate: 'Any date',
    never: 'Never',
    daysAgo: { one: '{count} day ago', other: '{count} days ago' },
    inDays: { one: 'in {count} day', other: 'in {count} days' },
    expiresIn: { one: 'Expires in {count} day', other: 'Expires in {count} days' },
    expiredAgo: { one: 'Expired {count} day ago', other: 'Expired {count} days ago' },
  },

  /** Sidebar groups and destinations. Mirrors `app/nav-config.ts` key for key. */
  nav: {
    ariaLabel: 'Main',
    sections: {
      Main: 'Main',
      System: 'System',
      Account: 'Account',
      Accounts: 'Accounts',
    },
    items: {
      dashboard: 'Dashboard',
      gatePass: 'Gate Pass',
      challan: 'Challan',
      delivery: 'Delivery',
      tripDo: 'Trip DO',
      excelBill: 'Excel Bill',
      labourBill: 'Labour Bill',
      accounts: 'Accounts',
      vendors: 'Vendors',
      myVendor: 'My Vendor',
      administration: 'Administration',
      activityLogs: 'Activity Logs',
      locations: 'Locations',
      productRates: 'Product Rates',
    },
  },

  /** Titles for routes deliberately absent from the sidebar. */
  pages: {
    profile: 'Profile',
    notifications: 'Notifications',
    newGatePass: 'New gate pass',
    challanEntry: 'Challan entry',
    sourcePdfs: 'Source PDFs',
    newDelivery: 'New delivery',
    myVendor: 'My Vendor',
    cash: 'Cash',
    cashBook: 'Cash Book',
    vendorTripBills: 'Vendor Trip Bills',
    advances: 'Advances',
    expenses: 'Expenses',
    waltonFinalBill: 'Walton Final Bill',
    waltonLabourBill: 'Walton Labour Bill',
    profitLoss: 'Profit & Loss',
    wallets: 'Wallets',
    notFound: 'Not found',
  },

  /** The shell itself — header controls, sidebar chrome, the account menu. */
  shell: {
    openNavigation: 'Open navigation menu',
    expandSidebar: 'Expand sidebar',
    collapseSidebar: 'Collapse sidebar',
    navigationTitle: 'Navigation',
    loadingPage: 'Loading page',
    loadingApp: 'Loading LBTS…',
    checkingSession: 'Checking your session',
    sameAsLastWith: 'Same as last:',
    navigationDescription: 'Links to each module in the application.',
    openAccountMenu: 'Open account menu',
    switchToLight: 'Switch to light theme',
    switchToDark: 'Switch to dark theme',
    signOut: 'Sign out',
    signedOut: 'Signed out',
    notSignedIn: 'Not signed in',
    notAuthenticated: 'Not authenticated',
    member: 'Member',
    account: 'account',
    profile: 'Profile',
  },

  /** Role labels and what each one means. Mirrors `lib/roles.ts`. */
  roles: {
    Admin: { label: 'Admin', description: 'Full system administration' },
    Manager: { label: 'Manager', description: 'Day-to-day operational management' },
    CEO: { label: 'CEO', description: 'Executive oversight' },
    OpEx: { label: 'OpEx', description: 'Operation Executive' },
    Vendor: { label: 'Vendor', description: 'External supplier or partner' },
    unknown: { label: 'Unknown', description: 'Unrecognised role' },
  },

  /** Account lifecycle. Mirrors `lib/roles.ts`. */
  accountStatuses: {
    Pending: { label: 'Pending', description: 'Awaiting an administrator decision' },
    Active: { label: 'Active', description: 'Approved and able to sign in' },
    Rejected: { label: 'Rejected', description: 'Access request declined' },
    Suspended: { label: 'Suspended', description: 'Access withdrawn until reactivated' },
    unknown: { label: 'Unknown', description: 'Unrecognised status' },
  },

  /**
   * Failure surfaces. Separate from `common` because these are read by somebody
   * who is already stuck, and the wording has to say what to do rather than
   * what went wrong.
   */
  errors: {
    generic: 'Something went wrong',
    genericBody: 'The page ran into a problem. Try again, and if it keeps happening, tell an administrator.',
    network: 'Could not reach the server',
    networkBody: 'Check the connection and try again. The first request after a quiet period can take up to a minute.',
    timeout: 'The request took too long',
    notFoundTitle: 'Page not found',
    notFoundBody: 'That address does not match anything in the application.',
    forbiddenTitle: 'You do not have access to this page',
    forbiddenBody: 'Your role does not include this module. If you think that is wrong, ask an administrator.',
    unauthorized: 'Please sign in again',
    serverError: 'The server ran into a problem',
    loadFailed: 'Could not load this',
    saveFailed: 'Could not save',
    deleteFailed: 'Could not delete',
    uploadFailed: 'Could not upload the file',
    downloadFailed: 'Could not download the file',
    boundaryTitle: 'This page stopped working',
    boundaryBody: 'The rest of the application is fine — go back, or reload to try again.',
    detailsHeading: 'Error detail (development only)',
  },

  /**
   * Account lockout screens, shown in place of the whole shell.
   *
   * `Active` is here even though an Active account never reaches this surface:
   * the component indexes this branch by the status it was handed, and a
   * missing key would render the status's own name on the one screen somebody
   * locked out of the app is trying to read.
   */
  accountInactive: {
    Pending: {
      title: 'Your account is awaiting approval',
      body: 'An administrator has to approve this account before you can use LBTS. You will be able to sign in as soon as that happens.',
    },
    Rejected: {
      title: 'Your account request was declined',
      body: 'An administrator declined access for this account. Contact them if you believe this is a mistake.',
    },
    Suspended: {
      title: 'Your account has been suspended',
      body: 'Access has been withdrawn for this account. An administrator can reactivate it.',
    },
    Active: {
      title: 'Your account is active',
      body: 'This account is in good standing.',
    },
  },

  auth: {
    brandHeadline: 'Move your business forward.',
    brandBody:
      'Manage your line-haul and business transport operations from one connected platform.',
    signIn: {
      googleButton: 'Sign in with Google',
      divider: 'or continue with email',
      emailLabel: 'Email',
      emailPlaceholder: 'you@company.com',
      passwordLabel: 'Password',
      passwordPlaceholder: 'Enter your password',
      forgotPassword: 'Forgot password?',
      submit: 'Sign in',
      submitting: 'Signing in…',
      welcomeBack: 'Welcome back!',
    },
    signUp: {
      googleButton: 'Sign up with Google',
      divider: 'or sign up with email',
      nameLabel: 'Full name',
      namePlaceholder: 'Your full name',
      emailLabel: 'Work email',
      passwordLabel: 'Password',
      passwordPlaceholder: 'At least 8 characters',
      confirmLabel: 'Confirm password',
      confirmPlaceholder: 'Re-enter your password',
      /**
       * Split around the two named documents so each can be a link — or, in a
       * locale that names them differently, something else entirely. A single
       * sentence with markup inside it cannot be translated at all.
       */
      termsBefore: 'I agree to the',
      termsOfService: 'Terms of Service',
      termsAnd: 'and',
      privacyPolicy: 'Privacy Policy',
      submit: 'Create account',
      submitting: 'Creating account…',
      roleNoticeBefore: 'New accounts are created with the',
      roleNoticeRole: 'User',
      roleNoticeAfter: 'role. An administrator can change this later.',
      created: 'Account created. Welcome to LBTS!',
      ready: 'Account ready. Welcome to LBTS!',
    },
    forgotPassword: {
      emailLabel: 'Email',
      submit: 'Send reset link',
      submitting: 'Sending…',
      sentTitle: 'Check your inbox',
      /**
       * The address sits inside the sentence rather than after it, because the
       * two languages put it in different places — and it is emphasised, which
       * is why it is its own placeholder rather than part of the text.
       */
      sentBody:
        'If an account exists for {email}, a reset link is on its way. Remember to check your spam folder.',
      useDifferent: 'Use a different email',
    },
    password: {
      show: 'Show password',
      hide: 'Hide password',
      strength: 'Password strength: {level}',
      tooShort: 'Too short',
      weak: 'Weak',
      fair: 'Fair',
      good: 'Good',
      strong: 'Strong',
    },
    brand: {
      connected: { title: 'Connected operations', copy: 'Every movement, one system of record.' },
      routes: {
        title: 'Route & schedule visibility',
        copy: 'See the whole line-haul at a glance.',
      },
      access: {
        title: 'Role-based team access',
        copy: 'People see exactly what they should.',
      },
    },
    /**
     * Firebase error codes are not user-facing. Keyed by the part of the code
     * after the slash, so the mapping table stays a mapping table and the
     * wording lives here with everything else somebody reads.
     */
    firebase: {
      invalidCredential: 'Incorrect email or password.',
      invalidEmail: 'Enter a valid email address.',
      userDisabled: 'This account has been disabled.',
      emailAlreadyInUse: 'An account with this email already exists.',
      weakPassword: 'Password is too weak. Use at least 8 characters.',
      tooManyRequests: 'Too many attempts. Please wait a moment and try again.',
      requiresRecentLogin: 'For security, sign in again before changing this.',
      networkRequestFailed: 'Network error. Check your connection and try again.',
      popupClosed: 'Sign-in window closed before finishing.',
      popupCancelled: 'Sign-in was cancelled.',
      popupBlocked: 'Your browser blocked the sign-in window. Allow pop-ups and try again.',
      operationNotAllowed: 'This sign-in method is not enabled in Firebase.',
      differentCredential: 'This email is already registered with a different sign-in method.',
      generic: 'Something went wrong. Please try again.',
    },
    /**
     * Validation messages, reached by the Zod schemas as **keys**.
     *
     * A schema is built once at module scope and can never re-run for a
     * language change, so the message it carries has to be a key that the
     * field resolves at render time — which is also why `FormField` translates
     * whatever it is handed. A server sentence passed through the same call
     * comes back unchanged, because an unknown key resolves to itself.
     */
    validation: {
      emailInvalid: 'Enter a valid email address',
      passwordRequired: 'Password is required',
      nameTooShort: 'Name must be at least 2 characters',
      nameTooLong: 'Name is too long',
      passwordTooShort: 'Password must be at least 8 characters',
      needsLowercase: 'Include at least one lowercase letter',
      needsUppercase: 'Include at least one uppercase letter',
      needsNumber: 'Include at least one number',
      confirmRequired: 'Confirm your password',
      passwordsDoNotMatch: 'Passwords do not match',
      acceptTerms: 'Accept the terms to continue',
    },
    /** The three auth routes' own headings and footers. */
    pages: {
      signInTitle: 'Welcome back',
      signInSubtitle: 'Sign in to your LBTS account to continue.',
      noAccount: "Don't have an account?",
      createOne: 'Create one',
      signUpTitle: 'Create your account',
      signUpSubtitle: 'Get started with LBTS in less than a minute.',
      haveAccount: 'Already have an account?',
      signIn: 'Sign in',
      forgotTitle: 'Reset your password',
      forgotSubtitle: "Enter your email and we'll send you a link to set a new password.",
      backToSignIn: 'Back to sign in',
    },
    signOutSuccess: 'Signed out',
  },

  /**
   * The countable things this app lists, as plurals with **no count inside
   * them** — just the word.
   *
   * They exist because a paging control says "of 43 challans" and the count,
   * the noun and the sentence around them sit in three different places in the
   * two languages. Giving the noun its own key lets one sentence serve every
   * list, instead of twenty call sites each assembling their own.
   *
   * English needs the pair for agreement; Bangla's noun does not inflect, so
   * its two forms are identical and that is correct rather than lazy.
   */
  nouns: {
    record: { one: 'record', other: 'records' },
    gatePass: { one: 'gate pass', other: 'gate passes' },
    challan: { one: 'challan', other: 'challans' },
    sourcePdf: { one: 'source PDF', other: 'source PDFs' },
    trip: { one: 'trip', other: 'trips' },
    vendor: { one: 'vendor', other: 'vendors' },
    vehicle: { one: 'vehicle', other: 'vehicles' },
    driver: { one: 'driver', other: 'drivers' },
    assignment: { one: 'assignment', other: 'assignments' },
    document: { one: 'document', other: 'documents' },
    location: { one: 'location', other: 'locations' },
    rate: { one: 'rate', other: 'rates' },
    row: { one: 'row', other: 'rows' },
    unit: { one: 'unit', other: 'units' },
    cashWallet: { one: 'cash wallet', other: 'cash wallets' },
    page: { one: 'page', other: 'pages' },
    piece: { one: 'piece', other: 'pieces' },
    pc: { one: 'pc', other: 'pcs' },
    line: { one: 'line', other: 'lines' },
    field: { one: 'field', other: 'fields' },
    signedCopy: { one: 'signed copy', other: 'signed copies' },
    notification: { one: 'notification', other: 'notifications' },
    event: { one: 'event', other: 'events' },
    bill: { one: 'bill', other: 'bills' },
    labourBill: { one: 'labour bill', other: 'labour bills' },
    finalBill: { one: 'final bill', other: 'final bills' },
    month: { one: 'month', other: 'months' },
    entry: { one: 'entry', other: 'entries' },
    expense: { one: 'expense', other: 'expenses' },
    advance: { one: 'advance', other: 'advances' },
    user: { one: 'user', other: 'users' },
  },

  /** Surfaces in `components/shared/` — used by every module, owned by none. */
  shared: {
    accessDenied: {
      title: "You don't have access to {area}",
      restricted: '{area} is restricted to administrators.',
      askAdmin: 'Ask an Admin if you believe you should have access.',
      signedInAs: 'Signed in as',
      backToDashboard: 'Back to dashboard',
    },
    comingSoon: {
      badge: 'Coming soon',
      title: '{module} is not available yet',
      description:
        'This module has been reserved in the navigation, but none of its screens have been built.',
      footnote: 'This module is under development',
    },

    errorFallback: {
      routeTitle: 'This page ran into a problem',
      routeBody: 'Nothing was lost. Try again, or use the sidebar to go somewhere else.',
      appTitle: 'LBTS could not start',
      appBody: 'Something went wrong while loading the application. Reloading usually clears it.',
      reload: 'Reload LBTS',
    },

    zoom: {
      group: 'Zoom',
      out: 'Zoom out',
      in: 'Zoom in',
      fit: 'Fit the whole page on screen',
    },

    columnFilter: {
      selectAll: 'Select all',
      loadingValues: 'Loading values…',
      noValues: 'No values under the other filters.',
      truncated: 'Only the first {count} values are listed. Narrow another column first.',
      apply: 'Apply',
      clearFilter: 'Clear filter',
    },

    documentScan: {
      flatbed: 'Flatbed glass',
      feeder: 'Document feeder',
      colour: 'Colour',
      greyscale: 'Greyscale',
      blackwhite: 'Black & white',
      sourceLabel: 'Source',
      colourLabel: 'Colour',
      sheets: { one: '{n} sheet', other: '{n} sheets' },
      scanNow: 'Scan now',
      stop: 'Stop',
      hide: 'Hide',
    },
  },

  /**
   * The scanner seam, shared by Gate Pass, Vendor, Delivery and Accounts.
   *
   * `states` mirrors `SCANNER_STATE_COPY` in `lib/scanner-messages.ts` key for
   * key — including the hyphens, which survive because a message key is a
   * string. That file keeps what it was for: the tone, whether the panel reads
   * as busy, and **which states offer a retry at all**, which is a property of
   * the failure rather than of its wording.
   *
   * No driver string, HRESULT or file path ever reaches this table, in either
   * language. That was true of the English and it stays true here.
   */
  scanner: {
    pairing: {
      title: 'Connect the scanner',
      description:
        'Start the LBTS Scanner Agent on this computer. It prints a pairing code the first time it runs; paste it here.',
      codeLabel: 'Pairing code',
      codePlaceholder: 'Paste the code from the helper window',
      codeNote: 'Stored in this browser only. It is not sent to the LBTS server.',
      addressLabel: 'Helper address',
      addressNote: 'Change this only if the helper was started on a different port.',
      connect: 'Connect',
    },
    retry: {
      checkScanner: 'Check scanner',
      checkAgain: 'Check again',
      connectScanner: 'Connect scanner',
      tryAgain: 'Try again',
    },
    states: {
      idle: {
        title: 'Scanner not checked',
        description: 'Check whether a scanner is available on this computer.',
      },
      checking: {
        title: 'Checking for a scanner',
        description: 'Looking for the LBTS scanner helper on this computer.',
      },
      'agent-missing': {
        title: 'Scanner helper not running',
        description:
          'Scanning needs the LBTS Scanner Agent running on this computer. Start it, then check again. You can still attach a scan from a file.',
      },
      unpaired: {
        title: 'Scanner not connected',
        description:
          'The scanner helper is running but this browser has not been paired with it yet. Connect it with the pairing code the helper printed.',
      },
      unsupported: {
        title: 'Scanning is not available here',
        description:
          'The scanner helper runs on the Windows computer the scanner is connected to. Attach a scan from a file instead.',
      },
      ready: {
        title: 'Scanner ready',
        description: 'Place the gate pass on the glass or in the feeder, then start the scan.',
      },
      'no-device': {
        title: 'No scanner detected',
        description:
          'The helper is running but found no scanner. Check that the scanner is switched on and on the same network, then try again.',
      },
      scanning: {
        title: 'Scanning',
        description: 'Capturing the page. Do not open the lid or remove the paper.',
      },
      processing: {
        title: 'Preparing the document',
        description: 'Assembling the scanned pages.',
      },
      completed: {
        title: 'Scan complete',
        description: 'Check that the whole gate pass is readable before you submit.',
      },
      busy: {
        title: 'Scanner busy',
        description: 'The scanner is working on another job. Wait for it to finish, then try again.',
      },
      'no-paper': {
        title: 'No paper detected',
        description: 'The document feeder is empty. Load the gate pass and start the scan again.',
      },
      'cover-open': {
        title: 'Scanner cover is open',
        description: 'Close the scanner lid, then start the scan again.',
      },
      'paper-jam': {
        title: 'Paper jam',
        description: 'Clear the jam at the scanner, then start the scan again.',
      },
      'driver-error': {
        title: 'The scanner did not respond',
        description:
          'The scanner driver stopped answering. Restarting the scanner usually clears it. You can also attach a scan from a file.',
      },
      'network-error': {
        title: 'Lost contact with the scanner helper',
        description: 'The helper stopped answering. Check that it is still running on this computer.',
      },
      failed: {
        title: 'The scan did not complete',
        description: 'Nothing was captured. Try again, or attach a scan from a file.',
      },
    },
  },

  /**
   * The dashboard.
   *
   * Two conventions run through the counted strings here and are worth stating
   * once, because every module that follows copies them:
   *
   *  - **`{count}` chooses the plural and `{n}` is what gets printed.** They
   *    are the same figure and they cannot be the same placeholder: the choice
   *    needs a raw number, and the screen needs ১২ rather than 12. Every
   *    counted message therefore takes both.
   *  - **A row's wording is keyed on its own id.** `attention.rows` mirrors the
   *    ids in `attention.ts`, hyphens included, so a row cannot be added
   *    without somebody noticing there is no wording for it.
   */
  dashboard: {
    figuresFailed: 'These figures could not be loaded.',
    greeting: {
      lateNight: 'Still up',
      morning: 'Good morning',
      afternoon: 'Good afternoon',
      evening: 'Good evening',
      /**
       * The comma belongs to the language, not to the name. A greeting that
       * reads "Good morning," with nothing after it is what a template gets
       * wrong, so the join happens here where a locale can say how it joins.
       */
      withName: '{greeting}, {name}',
    },

    hero: {
      piecesOutToday: 'Pieces out today',
      gatePassesToday: 'Gate passes today',
      challansFiledToday: 'Challans filed today',
      counting: 'Counting what has gone out.',
      nothingOutYet: 'Nothing has left the gate yet today.',
      carriedOn: { one: 'Carried on one trip so far today.', other: 'Carried on {n} trips so far today.' },
      filedToday: 'Filed today.',
      tripsOut: 'Trips out',
      noLorryYet: 'No lorry out yet',
      onTheRoadToday: 'on the road today',
      gatePasses: 'Gate passes',
      datedToday: 'dated today',
      challansFiled: 'Challans filed',
      outOfOfficePdfs: 'out of the office PDFs',
      fileGatePass: 'File a gate pass',
      openSourcePdf: 'Open a source PDF',
      startTrip: 'Start a trip',
    },

    modules: {
      heading: 'Your modules',
      subtitle: 'What each one holds, and a way into it.',
      otherModules: 'Other modules',
      onRecord: 'On record',
      gatePass: {
        description: 'Trips recorded against a scanned hard copy.',
        verified: 'Verified',
        awaitingCheck: 'Awaiting check',
        drafts: 'Drafts',
      },
      challan: {
        description: "Deliveries filed out of the office's PDFs.",
        pieces: 'Pieces',
        charged: 'Charged',
        sourcePdfsOpen: 'Source PDFs open',
      },
      delivery: {
        description: 'Trips, and the challans that went out on them.',
        tripsRun: 'Trips run',
        signedFor: 'Signed for',
        awaitingCopies: 'Awaiting copies',
        piecesToday: 'Pieces today',
      },
      vendor: {
        description: 'The fleet behind the trips, and its papers.',
        activeVendors: 'Active vendors',
        vehicles: 'Vehicles',
        drivers: 'Drivers',
        papersLapsing: 'Papers lapsing',
        papers: 'Papers',
        inDate: 'In date',
      },
    },

    money: {
      heading: 'Money',
      subtitle: 'Cash in hand, what is owed either way, and how the months are running.',
      loadFailed: 'The money summary could not be loaded.',
      cashBalance: 'Cash balance',
      cashWalletsOnly: 'Cash wallets only.',
      acrossWallets: {
        one: 'Across one cash wallet — bank and mobile are not added in.',
        other: 'Across {n} cash wallets — bank and mobile are not added in.',
      },
      in: 'In · {period}',
      out: 'Out · {period}',
      profit: 'Profit · {period}',
      thisMonth: 'this month',
      noIncomeYet: 'No income booked for this month yet',
      margin: '{margin}% margin on what has been billed',
      owedToVendors: 'Owed to vendors',
      everyVendorSettled: 'Every vendor month is settled',
      acrossVendors: { one: 'Across one vendor', other: 'Across {n} vendors' },
      toComeIn: 'To come in from Walton',
      receivableNote: '{bills} · {csds}',
      finalBills: { one: '{n} final bill', other: '{n} final bills' },
      labourCsds: { one: '{n} labour CSD', other: '{n} labour CSDs' },
      incomeAgainstCost: 'Income against cost',
      incomeAgainstCostNote:
        'Costs are accrued by trip month, not by when a vendor was paid. A month whose final bill has not been audited is not counted.',
    },

    noModules: {
      title: 'No modules are open to this account yet',
      description:
        'Your role does not reach any module that reports figures. An administrator can tell you what this account is meant to cover.',
      footnote: 'Nothing is missing — there is simply nothing this role is allowed to summarise.',
    },

    attention: {
      heading: 'Needs attention',
      urgent: '{n} urgent',
      toWorkThrough: '{n} to work through',
      showMore: 'Show {n} more',
      /** Read by somebody hearing the row rather than seeing it. */
      rowAria: '{title}. {action}.',
      partialFailure: 'Some figures could not be loaded, so this list may be incomplete.',
      nothingLoaded: 'Nothing could be loaded, so there is no way to say what is outstanding.',
      settledTitle: 'Nothing is outstanding',
      settledBody:
        'Every gate pass is checked, every challan is placed and charged, every signed copy is in and every document on file is in date.',
      unaskedTitle: 'Nothing to show here',
      unaskedBody:
        'This account does not read any module that reports a backlog. The modules it can reach are listed below.',

      actions: {
        gatePass: 'Open Gate Pass',
        challan: 'Open Challan',
        sourcePdfs: 'Open source PDFs',
        delivery: 'Open Delivery',
        vendors: 'Open Vendors',
        administration: 'Open Administration',
        vendorBills: 'Open Vendor Bills',
        finalBills: 'Open Final Bills',
        advances: 'Open Advances',
      },

      rows: {
        'gate-pass-rejected': {
          title: { one: '{n} gate pass sent back', other: '{n} gate passes sent back' },
          detail:
            'A reviewer found something wrong and returned these. Each one is corrected and resent — until then it carries a verdict nobody has answered.',
        },
        'gate-pass-submitted': {
          title: { one: '{n} gate pass awaiting a check', other: '{n} gate passes awaiting a check' },
          detail:
            'Filed with their scan and waiting to be verified against it. A verification says these values match this paper.',
        },
        'gate-pass-draft': {
          title: { one: '{n} gate pass still a draft', other: '{n} gate passes still a draft' },
          detail:
            'Started and never submitted. A draft is in no report and no count, so it is work that has not landed anywhere yet.',
        },
        'challan-partial-amount': {
          title: { one: '{n} challan only partly charged', other: '{n} challans only partly charged' },
          detail:
            'Some lines carry a rate and some do not, so the amount looks complete and is not. Usually a product the rate card does not name yet.',
        },
        'challan-blank-amount': {
          title: { one: '{n} challan with no amount', other: '{n} challans with no amount' },
          detail:
            'Nothing on the rate card answered these lines, or the challan has no location yet and the card has no column to read.',
        },
        'challan-batches': {
          title: { one: '{n} source PDF unfinished', other: '{n} source PDFs unfinished' },
          detail:
            'Pages in these files belong to no challan and are not marked blank. A batch cannot be downloaded or printed until every page is accounted for.',
        },
        'challan-location-pending': {
          title: { one: '{n} challan without a location', other: '{n} challans without a location' },
          detail:
            'Nothing could be determined from the thana, the district or the address. A blank beats a wrong one — these are settled by hand, two clicks each.',
        },
        'challan-location-review': {
          title: { one: '{n} location nobody has confirmed', other: '{n} locations nobody has confirmed' },
          detail:
            'A spelling normalised, a near-enough row picked, or a shortlist chosen from. A wrong district on a filed challan is invisible to everything downstream.',
        },
        'challan-returned': {
          title: { one: '{n} challan back at the depot', other: '{n} challans back at the depot' },
          detail:
            'Goods went out, came back off a trip and have not gone out again. These still read Pending, because they are still waiting for a lorry.',
        },
        'delivery-open': {
          title: { one: '{n} trip awaiting a signed copy', other: '{n} trips awaiting a signed copy' },
          detail:
            'A trip closes when every receiver’s signed challan is scanned back in, or the copy is declared lost. Scanning one is a single barcode read.',
        },
        'vendor-expired': {
          title: { one: '{n} vendor document expired', other: '{n} vendor documents expired' },
          detail:
            'A lorry or a driver whose papers have lapsed should not go out. File the renewed certificate against the vehicle or the driver.',
        },
        'vendor-expiring': {
          title: { one: '{n} vendor document expiring soon', other: '{n} vendor documents expiring soon' },
          detail:
            'Inside thirty days of the expiry date. Renew before it passes and the vehicle or driver stops being assignable.',
        },
        'users-pending': {
          title: { one: '{n} account waiting for approval', other: '{n} accounts waiting for approval' },
          detail:
            'A new account is created with the least privilege and no access at all until it is approved. Whoever signed up cannot do anything yet.',
        },
        'accounts-blank-bills': {
          title: { one: '{n} trip without a full bill', other: '{n} trips without a full bill' },
          detail:
            'Rent or labour has not been entered, so the vendor’s month reads lower than what is actually owed. It is the one way a month looks paid when it is not.',
        },
        'accounts-vendor-due': {
          title: '{amount} owed to vendors',
          detail:
            'Trip rent and labour billed, less advances and payments. Each month settles on its own — the Vendor Bills page shows them apart.',
        },
        'accounts-receivable': {
          title: '{amount} to come in from Walton',
          detail:
            'Final bills and labour bill CSDs together, less what has already been received against them.',
        },
        'accounts-pending-final': {
          title: { one: '{n} bill waiting on an audit', other: '{n} bills waiting on an audit' },
          detail:
            'Submitted to Walton with no approved figure typed back in yet. A month without one is listed as pending and is not counted as income.',
        },
        'accounts-advances': {
          title: '{amount} out on advances',
          detail:
            'Money handed out and not yet returned in cash. An advance is settled by cash coming back and by nothing else.',
        },
      },
    },
  },

  /** The account owner's own account. */
  profile: {
    loading: 'Loading your profile',
    changePasswordTitle: 'Change password',
    changePasswordHint:
      'Confirm your current password, then choose a new one. You stay signed in on this device.',
    passwordsNotStored:
      'Passwords are held by the authentication provider. LBTS never stores or receives them.',
    pageDescription: 'Manage your personal information, account details and security.',
    loadFailed: 'Your profile could not be loaded',
    serverSilent: 'The server did not answer. It may still be waking up.',
    coldStartNote: 'A first request after an idle period can take up to a minute.',
    editProfile: 'Edit profile',
    memberSince: 'Member since {date}',

    personal: {
      title: 'Personal information',
      description: 'Details you maintain yourself',
      footnote:
        'Your name and phone number are yours to change. Email is managed by the sign-in provider.',
      fullName: 'Full name',
      emailAddress: 'Email address',
      emailManagedBy: 'Managed by the sign-in provider',
      verified: 'Verified',
      notVerifiedYet: 'Not verified yet',
      phoneNumber: 'Phone number',
      phoneHint: 'Add a number so colleagues can reach you.',
      profilePhoto: 'Profile photo',
      photoHint: 'Change it from the photo control at the top of this page.',
      photoUploaded: 'Uploaded',
      photoInitials: 'Using your initials — no photo uploaded',
    },

    account: {
      title: 'Account information',
      description: 'Managed by the system',
      footnote:
        'Your role and account status are set by an administrator and cannot be changed from this page.',
      userId: 'User ID',
      userIdHint: 'Quote this when contacting an administrator.',
      userIdLabel: 'user ID',
      assignedByAdmin: 'Assigned by an administrator',
      setByAdmin: 'Set by an administrator',
      emailVerification: 'Email verification',
      confirmedByProvider: 'Confirmed by the sign-in provider',
      verified: 'Verified',
      notVerified: 'Not verified',
      memberSince: 'Member since',
      lastSignIn: 'Last sign-in',
    },

    security: {
      title: 'Security',
      description: 'How you sign in to LBTS',
      footnoteWithProviders:
        'Sign-in method: {providers}. Passwords are stored by the authentication provider, never by LBTS.',
      footnote: 'Passwords are stored by the authentication provider, never by LBTS.',
      password: 'Password',
      passwordHidden: 'Your password is hidden.',
      passwordConfirmNote: 'You will be asked for your current password to confirm the change.',
      credentialElsewhere:
        'Your credential is held by {providers}. Change it there, and it changes here.',
      yourProvider: 'your sign-in provider',
      changePassword: 'Change password',
      managedExternally: 'Managed externally',
      emailVerified: 'Email verified',
      emailNotVerified: 'Email not verified',
      emailConfirmed: '{email} is confirmed. Password resets and account notices reach you.',
      emailUnconfirmed:
        'We could not confirm {email} yet. Verify it so password resets can reach you.',
      verified: 'Verified',
      /**
       * A countdown, so the number is a `{seconds}` placeholder rather than a
       * fragment glued to an `s` — which is a unit abbreviation in English and
       * a different word entirely in Bangla.
       */
      resendIn: 'Resend in {seconds}s',
      sendVerification: 'Send verification email',
    },

    infoRow: {
      editable: 'You can change this',
      readOnly: 'Read-only',
      notProvided: 'Not provided',
    },

    copy: {
      copied: '{label} copied',
      copy: 'Copy {label}',
    },

    edit: {
      title: 'Edit profile',
      description: 'Update how you appear across LBTS. Your role and account status are not affected.',
      namePlaceholder: 'Your full name',
      phoneHint: 'Optional. Leave empty to remove the number on file.',
      phonePlaceholder: '+880 1712 345678',
      /** The address is emphasised inside the sentence, so it is its own placeholder. */
      lockedNoticeBefore: 'is managed by the sign-in provider, and your role is set by an administrator. Neither can be changed here.',
      saving: 'Saving…',
      updated: 'Profile updated',
      failed: 'Your changes were not saved. Check the details and try again.',
    },

    photo: {
      change: 'Change photo',
      upload: 'Upload photo',
      changeAria: 'Change profile photo',
      uploadAria: 'Upload a profile photo',
      preview: 'Preview.',
      previewNote: 'Not saved yet — {size}',
      savePhoto: 'Save photo',
      saving: 'Saving…',
      remove: 'Remove',
      removeTitle: 'Remove profile photo?',
      removeBody:
        'The stored image is deleted permanently. Your avatar goes back to your initials, and you can upload a new photo at any time.',
      removing: 'Removing…',
      removeConfirm: 'Remove photo',
      updated: 'Profile photo updated',
      removed: 'Profile photo removed',
      rulesHint: 'JPG, PNG or WEBP · up to 5 MB',
      cannotUse: 'That image cannot be used',
      badType: 'That file type is not supported. Choose a JPG, PNG or WEBP image.',
      tooLarge: 'That image is {size}. The limit is 5 MB.',
      empty: 'That file is empty. Choose a different image.',
    },

    changePassword: {
      currentLabel: 'Current password',
      currentPlaceholder: 'Your current password',
      newLabel: 'New password',
      newPlaceholder: 'At least 8 characters',
      confirmLabel: 'Confirm new password',
      confirmPlaceholder: 'Re-enter your new password',
      updating: 'Updating…',
      submit: 'Update password',
      changed: 'Password changed',
      changedNote: 'Use your new password the next time you sign in.',
      failed: 'Your password could not be changed.',
      sessionExpired: 'Your session has expired. Sign in again to change your password.',
      sessionExpiredShort: 'Your session has expired. Sign in again.',
      wrongCurrent: 'Your current password is incorrect.',
      missingCurrent: 'Enter your current password.',
    },

    verification: {
      sent: 'Verification email sent',
      confirmed: 'Your email is verified',
      confirmedNote: 'Thanks for confirming — your account details are up to date.',
    },

    providers: {
      password: 'Email and password',
      google: 'Google',
    },

    validation: {
      nameTooShort: 'Name must be at least 2 characters',
      nameTooLong: 'Name must be 80 characters or fewer',
      phoneTooLong: 'Phone number must be 24 characters or fewer',
      phoneInvalid: 'Enter a valid phone number, for example +880 1712 345678',
      currentRequired: 'Enter your current password',
      confirmRequired: 'Confirm your new password',
      sameAsOld: 'Choose a password you have not used here before',
    },
  },

  /** The rate card. Reference data, Admin-only. */
  productRate: {
    title: 'Product Rates',
    description:
      'What each product is charged for delivery, in each of the three areas. A challan line is priced from this card when its product and location are both known, and the figure is copied onto the record — so correcting a rate here changes what is charged next and never rewrites what has already been charged.',
    cardAria: 'Product rate card',
    addProduct: 'Add product',
    addFirst: 'Add a product',
    inactive: 'Inactive',
    osdMetro: 'OSD-Metro',
    osdThana: 'OSD-Thana',
    anyModel: 'Any model',
    /** The rate-card group above a product type-ahead, and what each row says. */
    fromCard: 'From the rate card',
    pricedAnyModel: 'Priced whatever the model',
    modelsOnCard: { one: '{n} model on the card', other: '{n} models on the card' },
    tieredRate: 'Tiered rate',
    deactivate: 'Deactivate',
    reactivate: 'Reactivate',

    stats: {
      inUse: 'Rates in use',
      inUseHint: { one: '{n} product', other: '{n} products' },
      byModel: 'Priced by model',
      byModelHint: '{n} priced whatever the model',
      tiered: 'Tiered rates',
      tieredHint: 'First N pieces at one figure, the rest at another',
      deactivated: 'Deactivated',
      deactivatedHint: 'Kept, so past charges stay traceable',
    },

    filters: {
      searchPlaceholder: 'Product, model or capacity',
      searchAria: 'Search the rate card',
      modelAria: 'Filter by whether it names a model',
      activeAria: 'Filter by whether it is in use',
      modelAll: 'With and without model',
      modelYes: 'Has a model',
      modelNo: 'Any model',
      activeAll: 'Active and inactive',
      activeOnly: 'Active only',
      inactiveOnly: 'Inactive only',
    },

    directory: {
      loading: 'Loading product rates',
      noneFound: 'No products found',
      empty: 'The rate card is empty',
      filteredHint: 'No product, model or capacity matches your current filters.',
      emptyHint:
        'The supplied rate card is installed automatically when the API connects to the database. If it is still empty, add the products you need — challans can be filed either way, and their lines are simply left uncharged.',
      loadFailed: 'Could not load the rate card',
      retrying: 'Retrying…',
    },

    table: {
      product: 'Product',
      model: 'Model',
      capacity: 'Capacity',
      actions: 'Actions',
    },

    form: {
      addTitle: 'Add product rate',
      editTitle: 'Edit rate',
      addDescription:
        'A product, optionally a model, and what it is charged at in each of the three delivery areas.',
      editDescription:
        'Challans filed from now on are charged at these figures. Ones already charged from this row keep the figures they were charged at.',
      isdHint: 'Inside the metropolitan delivery area.',
      osdMetroHint: 'Outside it, in a metropolitan or sadar thana.',
      osdThanaHint: 'Outside it, in an upazila thana.',
      inUse: 'In use',
      inUseHint: 'It is deactivated, so it prices nothing and is offered nowhere.',
      submitAdd: 'Add to rate card',
      flat: 'Flat',
      tiered: 'Tiered',
      firstPieces: 'First pieces',
      atEach: 'At each',
      thenEach: 'Then each',
      perPiece: 'Per piece',
    },

    remove: {
      title: 'Remove {label}?',
      body: 'If no challan was ever charged from this row it is deleted outright. If some were, it is deactivated instead and kept: their figures do not change either way, but the row is what says where those figures came from. Either way it stops pricing new challans and stops being offered as a product suggestion.',
      keep: 'Keep it',
      removing: 'Removing…',
      confirm: 'Remove',
      deleted: 'Nothing was ever charged from it, so it is gone.',
      deactivated: 'It is deactivated, so it prices nothing and is offered nowhere.',
    },

    rate: {
      none: 'No rate set.',
      perPiece: '{amount} per piece.',
      /**
       * The tiered sentence as one message rather than three fragments: the
       * allowance, the first figure and the rest sit in a different order in
       * the two languages, and a sentence built by concatenation could only
       * be right in one of them.
       */
      tiered: {
        one: 'First {n} piece on a challan at {first} each, then {rest} each.',
        other: 'First {n} pieces on a challan at {first} each, then {rest} each.',
      },
    },

    validation: {
      productTooShort: 'Product must be at least 2 characters',
      productTooLong: 'Product must be 200 characters or fewer',
      modelTooLong: 'Model must be 120 characters or fewer',
      capacityTooLong: 'Capacity must be 120 characters or fewer',
      rateRequired: 'Enter a rate.',
      notANumber: 'That is not a number.',
      negative: 'A rate cannot be negative.',
      tooLarge: 'That looks too large. Check the card.',
      firstQty: 'Enter a whole number of pieces, at least one.',
    },
  },

  /** The district and thana master list. Reference data, Admin-only. */
  location: {
    addFirst: 'Add a location',
    district: 'District',
    thana: 'Thana',
    inactive: 'Inactive',
    lookupFailed:
      'The location list could not be loaded. The challan can still be saved without one.',
    title: 'Locations',
    description:
      "The district and thana list challans are classified against. A challan's location type is read from this list and never typed beside it, so correcting a row here corrects every challan that points at it.",
    listAria: 'Location master list',
    addLocation: 'Add location',
    anyType: 'Any location type',
    deactivate: 'Deactivate',
    reactivate: 'Reactivate',

    /**
     * The three location types. **The labels are codes** — `ISD`, `OSD-Metro`
     * and `OSD-Thana` are what the supplied rate card prints and what the
     * office says aloud, so they are identical in both languages and only the
     * descriptions are translated.
     */
    types: {
      ISD: { label: 'ISD', description: 'Inside the metropolitan delivery area.' },
      'OSD-Metro': {
        label: 'OSD-Metro',
        description: 'Outside the delivery area, in a metropolitan or sadar thana.',
      },
      'OSD-Thana': {
        label: 'OSD-Thana',
        description: 'Outside the delivery area, in an upazila thana.',
      },
      unknown: { label: 'Unknown', description: 'Not one of the recognised location types.' },
    },

    statuses: {
      Verified: { label: 'Location set', description: 'Matched to the location master list.' },
      Pending: {
        label: 'Location pending',
        description: 'Not determined yet. An administrator can set it at any time.',
      },
    },
    review: 'Unconfirmed',
    reviewTitle: '{source}. Nobody has confirmed it yet.',
    unconfirmedLocation: 'Unconfirmed location',

    sources: {
      master_exact: 'Matched the master list exactly',
      master_normalized: 'Matched the master list after normalising the spelling',
      master_fuzzy: 'Matched the nearest master entry',
      gemini_assisted: 'Chosen from master entries with assistance',
      admin_manual: 'Set by hand',
      unknown: 'Set from the master list',
    },

    stats: {
      inUse: 'Locations in use',
      deactivated: 'Deactivated',
      deactivatedHint: 'Kept for the challans that reference them',
      byType: 'By location type',
      byTypeHint: '{isd} ISD · {metro} Metro · {thana} Thana',
      assisted: 'Assisted resolution',
      assistedOff: 'Not configured. The master list answers on its own.',
      assistedPaused: 'Paused after repeated failures. Locations are left for an administrator.',
      paused: 'Paused',
    },

    filters: {
      searchPlaceholder: 'District or thana',
      searchAria: 'Search locations',
      typeAria: 'Filter by location type',
      activeAria: 'Filter by whether it is in use',
      activeAll: 'Active and inactive',
      activeOnly: 'Active only',
      inactiveOnly: 'Inactive only',
    },

    directory: {
      loading: 'Loading locations',
      noneFound: 'No locations found',
      empty: 'The location master list is empty',
      filteredHint: 'No district or thana matches your current filters.',
      emptyHint:
        'The supplied district and thana list is installed automatically when the API connects to the database. If it is still empty, add the locations you need — challans can be filed either way, and their location is simply left for later.',
      loadFailed: 'Could not load locations',
      retrying: 'Retrying…',
    },

    table: {
      district: 'District',
      thana: 'Thana',
      location: 'Location',
      source: 'Source',
      updated: 'Updated',
      actions: 'Actions',
      suppliedList: 'Supplied list',
      addedByHand: 'Added by hand',
    },

    form: {
      addTitle: 'Add location',
      editTitle: 'Edit location',
      addDescription:
        'A district and thana pair, and what kind of place it is. Challans are matched against this list.',
      editDescription:
        'Challans that already point at this row read their district, thana and location type through it, so correcting it here corrects all of them.',
      inUse: 'In use',
    },

    select: {
      chooseDistrict: 'Choose a district',
      searchDistricts: 'Search districts…',
      noDistrict: 'No district matches that.',
      chooseThana: 'Choose a thana',
      chooseDistrictFirst: 'Choose a district first',
      searchThanas: 'Search thanas…',
      noThana: 'No thana matches that.',
      setAutomatically: 'Set automatically once a thana is chosen.',
    },

    remove: {
      keep: 'Keep it',
      removing: 'Removing…',
      confirm: 'Remove',
      corrected: 'Challans that reference it now read the corrected values.',
      deactivated: 'It is deactivated, so it can no longer be chosen or matched.',
      deleted: 'Nothing referenced it, so it is gone.',
    },

    validation: {
      districtTooShort: 'District must be at least 2 characters',
      districtTooLong: 'District must be 120 characters or fewer',
      thanaTooShort: 'Thana must be at least 2 characters',
      thanaTooLong: 'Thana must be 120 characters or fewer',
      typeRequired: 'Choose a location type.',
    },
  },

  /**
   * Notifications — what one person needs to be told.
   *
   * The three vocabularies are kept apart here exactly as they are in
   * `notification-meta.ts`: module carries the colour, category the icon,
   * priority the emphasis. Only the words moved.
   *
   * **The message titles and bodies are not here**, and cannot be: they are
   * written by the server when the message is created and stored on the row,
   * because a notification is a sentence about a moment — who submitted what,
   * against which record. Translating those would mean translating them at
   * fan-out time, in the API, against the recipient's own preference. What is
   * translatable on this side is the chrome around them.
   */
  notification: {
    title: 'Notifications',
    description:
      'What the system needs you to know: accounts waiting for approval, gate pass verdicts, certificates about to lapse, goods back at the depot and money movements. Each one is addressed to you — what you see here is not what anybody else sees.',
    listAria: 'Your notifications',
    bellNothing: 'Notifications, nothing unread',
    bellUnread: { one: 'Notifications, {n} unread', other: 'Notifications, {n} unread' },

    modules: {
      Account: 'Account',
      'Gate Pass': 'Gate Pass',
      Delivery: 'Delivery',
      Vendor: 'Vendor',
      Billing: 'Billing',
      Accounts: 'Accounts',
      unknown: 'System',
    },

    categories: {
      approvals: {
        label: 'Approvals',
        description: 'Accounts waiting for someone to approve them and assign a role.',
      },
      review: {
        label: 'Review',
        description: 'Gate passes submitted for checking, verified, or sent back.',
      },
      compliance: {
        label: 'Compliance',
        description: 'Certificates about to lapse, and deliveries closed with no signed copy.',
      },
      operations: {
        label: 'Operations',
        description: 'Goods back at the depot, and other facts about the day’s trips.',
      },
      money: {
        label: 'Money',
        description: 'Bills signed off, and payments recorded against a vendor.',
      },
      account: {
        label: 'Your account',
        description:
          'Your own role and account status. This one cannot be switched off — an account that stops working without a word is worse than an interruption.',
      },
    },

    priorities: {
      info: 'For information',
      attention: 'Needs attention',
      urgent: 'Urgent',
    },

    links: {
      gatePass: 'Open gate pass',
      challan: 'Open challan',
      trip: 'Open trip',
      vendor: 'Open vendor',
      bill: 'Open bill',
      administration: 'Open Administration',
      cashBook: 'Open cash book',
      generic: 'Open',
    },

    panel: {
      checking: 'Checking…',
      nothingWaiting: 'Nothing waiting',
      unread: { one: '{n} unread', other: '{n} unread' },
      settings: 'Notification settings',
      markAll: 'Mark all',
      markAllRead: 'Mark all read',
      clearRead: 'Clear read',
      settingsShort: 'Settings',
      seeUnread: 'See unread',
      seeAll: 'All notifications',
      alwaysOn: 'Always on',
      outsideFilters: 'There may still be notifications outside them.',
      loadFailed: 'Could not load notifications',
      upToDate: 'You are up to date',
    },

    item: {
      markRead: 'Mark read',
      markUnread: 'Unread',
      dismiss: 'Dismiss: {title}',
      foundByCheck: 'Found by the compliance check',
      /** The actor's role in brackets after their name, where there is one. */
      actorWithRole: '{name} ({role})',
    },

    list: {
      loadFailed: 'Could not load your notifications',
      noMatches: 'Nothing matches these filters',
      upToDate: 'You are up to date',
    },

    overview: {
      unread: 'Unread',
      unreadHintEmpty: 'You are up to date',
      unreadHint: 'Everything you have not opened',
      urgent: 'Urgent',
      urgentHint: 'Already wrong, or hard to undo',
      attention: 'Needs attention',
      attentionHint: 'Waiting on somebody to do something',
      busiestHint: 'The most of any kind right now',
    },

    toolbar: {
      searchPlaceholder: 'What it says, or which record',
      searchAria: 'Search notifications',
      stateAria: 'Filter by read state',
      moduleAria: 'Filter by module',
      kindAria: 'Filter by kind',
      priorityAria: 'Filter by priority',
      eventAria: 'Filter by exact notification',
      everything: 'Everything',
      unread: 'Unread',
      read: 'Read',
      everyModule: 'Every module',
      everyKind: 'Every kind',
      anyPriority: 'Any priority',
      anyNotification: 'Any notification',
    },

    preferences: {
      title: 'Notification settings',
      loadFailed: 'Could not load your settings',
      saving: 'Saving…',
      save: 'Save settings',
    },

    toasts: {
      markedRead: { one: '{n} notification marked read', other: '{n} notifications marked read' },
      nothingToClear: 'There was nothing read to clear',
      cleared: {
        one: '{n} read notification cleared',
        other: '{n} read notifications cleared',
      },
      hearEverything: 'You will hear about everything',
      switchedOff: { one: '{n} category switched off', other: '{n} categories switched off' },
      appliesToNew: 'This applies to new notifications. What is already here stays.',
    },
  },

  /**
   * The Excel Bill — a unit's month of Trip DO rows, in the office's layout.
   *
   * The sheet's column headings are translated because this is the screen; the
   * `.xlsx` the office sends is built on the server and keeps its own English
   * headings, the split the Trip DO sheet already makes.
   */
  bill: {
    title: 'Excel Bill',
    pageDescription:
      "Open a bill slot for a month and a unit, add its Trip DOs, and download the bill in the office's own Excel layout — one SL per Trip DO. Every row you add is marked billed on the Trip DO sheet, the challan and the gate pass.",
    listDescription:
      "A bill is one unit's month of Trip DOs, laid out as the Excel sheet the office sends. Open a slot, search its Trip DOs, and every row you add is marked billed on the Trip DO sheet, the challan and the gate pass.",
    billsAria: 'Bills',
    sheetAria: 'Bill sheet',
    sheetHeading: 'Bill sheet',
    billAmount: 'Bill amount',
    noCsd: 'No CSD',
    noUnit: 'No unit',
    noLocation: 'No location',
    pending: 'Pending',
    notBilled: 'Not billed',
    onThisBill: 'On this bill',
    allBills: 'All bills',
    addTripDo: 'Add Trip DO',
    blankUnit: '(blank)',

    statuses: {
      Draft: {
        label: 'Draft',
        description: 'Still being prepared: rows can be added and taken off.',
      },
      Finalized: {
        label: 'Finalized',
        description: 'Signed off. What it carries is fixed until an Admin or Manager reopens it.',
      },
    },

    billingStatuses: {
      Unbilled: { label: 'Not billed', description: 'None of its Trip DO rows is on a bill yet.' },
      Partial: {
        label: 'Partly billed',
        description: 'Some of its Trip DO rows are on a bill and some are not.',
      },
      Billed: { label: 'Billed', description: 'Every one of its Trip DO rows is on a bill.' },
    },

    billingFilters: {
      all: 'Any billing',
      unbilled: 'Not billed',
      partial: 'Partly billed',
      billed: 'Billed',
    },

    badges: {
      onBill: 'On {bill}',
      more: '+{n}',
      /** The tooltip: the status, then each bill on its own line. */
      tooltip: '{description}\n{bills}',
      sameSlot: {
        one: '{unit} already has a bill for {period}',
        other: '{unit} already has {n} bills for {period}',
      },
      sameSlotHint: 'You can still open another — a part bill, say.',
    },

    columns: {
      sl: 'SL',
      customer: 'Customer',
      csd: 'CSD',
      receiver: 'Receiver Number',
      address: 'Address',
      district: 'District',
      thana: 'Thana',
      location: 'Location',
      unit: 'Unit',
      model: 'Products Model',
      qty: 'Qty.',
      rate: 'Rate',
      amount: 'Amount',
      products: 'Products',
      tripDo: 'Trip Do',
      capacity: 'Capacity',
      remarks: 'Remarks',
    },

    stats: {
      bills: 'Bills',
      drafts: 'Drafts',
      finalized: 'Finalized',
      billedAmount: 'Billed amount',
      pcsAcross: '{n} pcs across these bills',
      tripDoCount: { one: '{n} Trip DO', other: '{n} Trip DOs' },
      piecesCount: { one: '{n} pc', other: '{n} pcs' },
      challans: 'Challans',
      pieces: 'Pieces',
      rows: 'Rows',
      tripDo: 'Trip DO',
    },

    toolbar: {
      statusAria: 'Bill status',
      monthAria: 'Billing month',
      yearAria: 'Billing year',
      anyMonth: 'Any month',
      anyYear: 'Any year',
      drafts: 'Drafts',
      finalized: 'Finalized',
      unitsAria: 'Units on record',
      all: 'All',
      searchAria: 'Search bills by number, unit or note',
      unitAria: 'Unit',
      yearOnly: 'Year',
      tripDoAria: 'Trip DO or gate pass number',
    },

    confirm: {
      finalizeTitle: 'Finalize {bill}?',
      reopenTitle: 'Reopen {bill}?',
      deleteTitle: 'Delete {bill}?',
      removeTitle: 'Take {label} off the bill?',
      theseRows: 'these rows',
      /**
       * One sentence rather than eight JSX fragments: the unit, the month and
       * the three counts sit in a different order in the two languages.
       */
      finalizeBody:
        '{amount} for {tripDos} ({rows}, {pcs}), unit {unit}, {period}. Once finalized, rows cannot be added or taken off until an Admin or Manager reopens it.',
      unpricedNote: {
        one: '{n} row has no rate and adds nothing to the total.',
        other: '{n} rows have no rate and add nothing to the total.',
      },
      deleteDescription: {
        one: 'Its {n} row goes back to the Trip DO sheet unbilled, and the challans and gate passes behind it are marked accordingly. The bill number is not reused.',
        other:
          'Its {n} rows go back to the Trip DO sheet unbilled, and the challans and gate passes behind them are marked accordingly. The bill number is not reused.',
      },
      removeDescription: {
        one: '{n} row goes back to the Trip DO sheet unbilled, free to add to this bill again or to another.',
        other:
          '{n} rows go back to the Trip DO sheet unbilled, free to add to this bill again or to another.',
      },
      finalize: 'Finalize bill',
      reopen: 'Reopen as draft',
      deleteBill: 'Delete bill',
      takeRowOff: 'Take row off',
      takeRowsOff: 'Take {count} rows off',
    },

    list: {
      loading: 'Loading bills',
      loadFailed: 'Could not load bills',
      retrying: 'Retrying…',
      noMatches: 'No bills match',
      empty: 'No bills yet',
      noMatchesHint: 'No bill matches the current search, status, month, year or unit.',
      openFirst: 'Open the first bill',
      emptyHint:
        'Choose the billing month and the unit, then add its Trip DOs — the Excel bill builds itself as you go.',
    },

    details: {
      loading: 'Loading the bill',
      openFailed: 'Could not open this bill',
      noRows: 'No Trip DO on this bill yet',
      noRowsHint: 'Nobody has added a Trip DO to this bill yet.',
      addHint:
        'Search a Trip DO and add it. Every row it carries lands here under one SL, in the Excel layout — returns and re-sends marked in Remarks.',
      finalizedHint:
        'This bill is finalized, so it keeps what it charged. Reopen it to bring it up to date.',
      driftTitle: 'The Trip DO sheet has moved since these rows were added',
      driftHint:
        'Refresh to copy the sheet again — rows that are gone are taken off. A bill cannot be finalized until it matches.',
      refreshing: 'Refreshing…',
      refresh: 'Refresh from Trip DO',
      building: 'Building…',
      downloadExcel: 'Download Excel',
      removeRow: 'Remove',
      none: 'None',
      sheetTotal: 'Total',
      tripDoAria: 'Trip DO {tripDo}',
      removeTripDo: 'Take Trip DO {tripDo} off the bill',
      removeLine: 'Take {challan} {model} off the bill',
      lineLabel: '{challan} · {model}',
      driftChanged: { one: '{n} row has changed', other: '{n} rows have changed' },
      driftMissing: {
        one: '{n} row is no longer on the sheet',
        other: '{n} rows are no longer on the sheet',
      },
      driftBoth: '{changed} and {missing}',
      driftSentence: '{summary}. {hint}',
      opened: 'Opened {when}',
      openedBy: 'Opened {when} by {name}',
      finalizedOn: 'finalized {when}',
      finalizedOnBy: 'finalized {when} by {name}',
      reopenedOn: 'reopened {when}',
      reopenedOnBy: 'reopened {when} by {name}',
    },

    search: {
      searching: 'Searching the Trip DO sheet',
      enterHint: 'Press Enter to add the whole Trip DO when the search finds just one.',
      noMatch: 'No Trip DO matches “{query}”',
      nothingLeft: 'Nothing left to bill this month',
      onlyWithTripDo:
        'Only rows that have a Trip DO set on the Trip DO sheet can be billed. Check the number, or set its Trip DO there first.',
      onlyThisUnit: 'Only Trip DOs whose gate pass carries this unit can be added.',
      switchUnit: 'Switch the bill to this unit to add it.',
      otherUnit: 'Add it to a bill for its own unit, or correct the unit on its gate pass.',
      alreadyOn: 'Already on this bill',
      onBill: 'On {bill}',
      otherUnitAria: "Another unit's Trip DO",
      goneAria: 'No longer on the Trip DO sheet',
      changedAria: 'Changed on the Trip DO sheet since it was added',
      addTripDo: 'Add Trip DO',
      addRows: 'Add {count} rows',
      noRate: 'No rate on the card for this line, so it adds nothing',
      unitMismatch:
        'This Trip DO’s gate pass is unit {theirs}, and this bill is for unit {ours}.',
      moreRows: 'More rows match than one search shows. Type more of the Trip DO to narrow it.',
      hint:
        'Type a Trip DO or gate pass number. Until then: {unit} Trip DOs from {period} that are on no bill.',
      addRowAria: 'Add {challan} {model}',
    },

    form: {
      openTitle: 'Open a bill slot',
      editTitle: 'Edit {bill}',
      openDescription:
        'Choose the billing month and the unit, then add its Trip DOs — the Excel bill builds itself as you go.',
      editDescription: 'Correct the billing month, the unit or the note. The bill number stays.',
      billingMonth: 'Billing month',
      unit: 'Unit',
      unitFixed: 'The unit is fixed while the bill carries rows.',
      unitRequired: 'Enter the unit this bill is for.',
      openBill: 'Open bill',
    },

    menu: {
      edit: 'Edit month, unit or note',
      refresh: 'Refresh from Trip DO sheet',
      finalize: 'Finalize bill',
      reopen: 'Reopen as draft',
      delete: 'Delete bill',
    },

    actions: {
      opened: '{bill} opened',
      openedNote: 'Unit {unit} · {period}',
      updated: '{bill} updated',
      deleted: '{bill} deleted',
      releasedNote: {
        one: '{n} Trip DO row is free to bill again.',
        other: '{n} Trip DO rows are free to bill again.',
      },
      alreadyOn: 'Already on {bill}',
      added: { one: '{n} row added to {bill}', other: '{n} rows added to {bill}' },
      skippedNote: '· {n} already on the bill',
      takenOff: { one: '{n} row taken off {bill}', other: '{n} rows taken off {bill}' },
      refreshed: '{bill} refreshed from the Trip DO sheet',
      refreshedNote: '{updated} updated · {removed} taken off',
      finalized: '{bill} finalized',
      deleting: 'Deleting…',
      finalizing: 'Finalizing…',
      reopening: 'Reopening…',
      takingOff: 'Taking off…',
      reopened: '{bill} reopened',
      reopenedNote: 'It is a draft again.',
      reopenDescription:
        'It becomes a draft again, so rows can be added, taken off and refreshed from the Trip DO sheet. If the finalized file has already been sent, whoever received it will need the corrected one.',
      freeToBill: 'They are free to bill again.',
      buildingToast: 'Building the Excel bill…',
      downloaded: 'Excel bill downloaded',
    },
  },

  /**
   * The Walton Labour Bill — what the *handling* cost, typed row by row.
   *
   * The column headings are translated because this is the screen; the
   * workbook the office sends is built on the server and keeps its own English
   * headings, the split the Trip DO sheet and the Excel Bill both make.
   */
  labourBill: {
    title: 'Walton Labour Bill',
    pageDescription:
      'One bill per CSD per month. Open a slot, scan the challans in, and type what the handling cost against each model — van, pulling and labour on one side, the floor it went up to on the other. It charges nothing the Excel bill charges, and marks nothing on the Trip DO sheet.',
    listDescription:
      "A labour bill is one CSD's month of handling charges: open a slot, scan the challans in, and type what the van, the pulling and the stairs cost against each model. A month of deliveries is as many bills as there were CSDs in it. It charges nothing the Excel bill charges — that one carries the rate card's transport, this one the labour beside it.",
    listAria: 'Labour bills',
    sheetAria: 'Labour bill sheet',
    sheetHeading: 'Labour bill sheet',
    allBills: 'All labour bills',
    newBill: 'New labour bill',
    signedCopies: 'Signed copies',
    noCustomer: 'No customer',
    tripDoPending: 'Trip DO pending',
    noTripDoChip: 'No Trip DO',
    notSet: 'Not set',
    cardTotal: 'Labour bill total',

    statuses: {
      Draft: {
        label: 'Draft',
        description: 'Still being prepared: challans can be scanned in and amounts typed.',
      },
      Finalized: {
        label: 'Finalized',
        description: 'Signed off. What it charges is fixed until an Admin or Manager reopens it.',
      },
    },

    /**
     * The sheet's own column headings.
     *
     * These are the **screen**. The workbook the office sends is built on the
     * server and keeps the English headings it has always had — the split the
     * Trip DO sheet and the Excel Bill both make.
     */
    columns: {
      sl: 'SL',
      customer: 'Customer',
      csd: 'CSD',
      receiver: 'Receiver Number',
      address: 'Address',
      unit: 'Unit',
      model: 'Model',
      tripDo: 'Trip Do',
      qty: 'Qty',
      labour: 'Ven/Pulling/Labour',
      floor: 'Floor',
      floorNo: 'Floor No.',
      floorAmount: 'Amount',
      total: 'Total Amount',
      /** The foot of one CSD's section: "WFR total". */
      sectionTotal: '{section} total',
    },

    fields: {
      unitCompany: 'Unit / Company',
      labour: 'Ven / Pulling / Labour',
      floorNo: 'Floor no.',
      floorAmount: 'Floor amount',
      total: 'Total',
      untypedRow: 'Neither cell has been typed yet, so this row adds nothing to the bill',
      noTripDo:
        'This challan line has no Trip DO yet. Link its gate pass on the Trip DO sheet, then Refresh.',
    },

    /**
     * What each typed cell is called to a screen reader. The challan and the
     * model are in every one of them, because a sheet of three hundred boxes
     * reading "Amount" three hundred times names nothing at all.
     */
    cells: {
      company: 'Company for {challan} {model}',
      labour: 'Ven, pulling and labour for {challan} {model}',
      floorNo: 'Floor number for {challan} {model}',
      floorAmount: 'Floor amount for {challan} {model}',
      removeChallan: 'Take challan {challan} off the labour bill',
      removeLine: 'Take {challan} {model} off the labour bill',
      removeModel: 'Take {model} off the labour bill',
      /** What the confirmation is asked about — a noun phrase, never a sentence. */
      challanLabel: 'challan {challan}',
      lineLabel: '{challan} · {model}',
      theseRows: 'these rows',
    },

    stats: {
      bills: 'Labour bills',
      drafts: 'Drafts',
      finalized: 'Finalized',
      charged: 'Labour charged',
      unpriced: 'Rows with no amount',
      challans: 'Challans',
      rows: 'Rows',
      pcs: 'Pcs',
      labour: 'Ven/Pulling/Labour',
      floor: 'Floor',
      /** "3 rows · 2 challans" — one line a card and a toast both want. */
      rowsAndChallans: '{rows} · {challans}',
      rowCount: { one: '{n} row', other: '{n} rows' },
      challanCount: { one: '{n} challan', other: '{n} challans' },
      pcsCount: { one: '{n} pc', other: '{n} pcs' },
      sectionCount: { one: '{n} section', other: '{n} sections' },
      billCount: { one: '{n} labour bill', other: '{n} labour bills' },
      /** "across 3 CSDs in September 2026" — the sections a month came to. */
      acrossCsds: { one: 'across {n} CSD in {period}', other: 'across {n} CSDs in {period}' },
      sections: { one: '{n} CSD', other: '{n} CSDs' },
      /** A CSD section's banner, and the same line again on a phone. */
      sectionSummary: '{rows} · {challans} · {pcs}',
      sectionSummaryLong: '{rows} · {challans} · {pcs} · {labour} labour · {floor} floor',
      sheetSummary: '{rows} · {challans} · {sections}',
      labourAndFloor: '{labour} labour · {floor} floor',
      blank: '{n} blank',
      updated: 'updated {when}',
      updatedBy: '{name} · updated {when}',
      summaryFiltered: '{bills} · {amount} match these filters',
      summaryTotal: '{bills} · {amount} in total',
      pcsHandled: '{n} pcs handled',
      stillPreparing: 'still being prepared',
      nothingTyped: 'nothing typed, so nothing charged',
      signedOff: 'signed off and sent',
      unpricedNote: {
        one: '{n} row has no amount yet and adds nothing',
        other: '{n} rows have no amount yet and add nothing',
      },
    },

    toolbar: {
      searchAria: 'Search labour bills by number, company or note',
      statusAria: 'Labour bill status',
      monthAria: 'Billing month',
      yearAria: 'Billing year',
      yearGroupAria: 'Year',
      anyMonth: 'Any month',
      anyYear: 'Any year',
      all: 'All',
      drafts: 'Drafts',
      finalized: 'Finalized',
      companiesAria: 'Companies on record',
      scanAria: 'Challan number or SL',
      scanPlaceholder: 'LBTS-CH-2026-000067',
    },

    list: {
      loading: 'Loading labour bills',
      loadFailed: 'Could not load labour bills',
      retrying: 'Retrying…',
      noMatches: 'No labour bills match',
      empty: 'No labour bills yet',
      noMatchesHint: 'No labour bill matches the current search, status, CSD, month or year.',
      openFirst: 'Open the first labour bill',
      emptyHint:
        'Choose the month, then scan the challans in. Every model becomes its own row, and the sheet files each one under its own CSD by itself.',
    },

    details: {
      loading: 'Loading the labour bill',
      openFailed: 'Could not open this labour bill',
      noRows: 'Nothing on this labour bill yet',
      noRowsHint: 'Nobody has scanned a challan onto this labour bill yet.',
      scanHint:
        'Scan a challan’s barcode — anywhere on this page, no need to click first. Every model on it becomes its own row, and the sheet files each one under its own CSD by itself.',
      scanAnywhere:
        'Scan anywhere on this page — no need to click first. Every model on the challan becomes its own row, and each files itself under its own CSD.',
      sheetHint:
        'Exactly what the Excel file carries — a section per CSD, one SL per challan, one row per model. The tinted cells are yours to type; Enter saves, Escape puts it back.',
      sheetHintReadOnly:
        'Exactly what the Excel file carries — a section per CSD, one SL per challan, one row per model.',
      driftTitle: 'The Trip DO sheet has moved since these rows were scanned in',
      driftChanged: { one: '{n} row has changed', other: '{n} rows have changed' },
      driftMissing: {
        one: '{n} row is no longer on the sheet',
        other: '{n} rows are no longer on the sheet',
      },
      /** The joiner, and the sentence the summary and the advice make together. */
      driftBoth: '{changed} and {missing}',
      driftSentence: '{summary}. {hint}',
      scanTitle: 'Scan a challan to add its models',
      driftHint:
        'Refresh to re-read the sheet — every amount you have typed is kept, rows that are gone are taken off, and a row that has just learned its CSD moves into that section. A labour bill cannot be finalized until it matches.',
      finalizedHint:
        'This bill is finalized, so it keeps what it charged. Reopen it to bring it up to date.',
      refreshing: 'Refreshing…',
      refresh: 'Refresh from Trip DO',
      building: 'Building…',
      downloadExcel: 'Download Excel',
      removeRow: 'Remove',
      readingChallan: 'Reading that challan…',
      readingBack: 'Reading what has come back…',
      goneAria: 'No longer on the Trip DO sheet — Refresh takes it off',
      changedAria: 'Changed on the Trip DO sheet since it was scanned in — Refresh to re-read it',
      /** The pending section: rows whose gate pass nobody has matched yet. */
      pendingHint:
        'These rows have no Trip DO yet, so nothing says which CSD they belong to. Set it on the Trip DO sheet and each one moves into its own section by itself — the amounts typed here come with it.',
      pendingHintShort:
        'No Trip DO yet, so nothing says which CSD these belong to. Set it on the Trip DO sheet and each one moves into its own section by itself — with the amounts typed here.',
      /** Who opened the bill, and who signed it off or reopened it. */
      opened: 'Opened {when}',
      openedBy: 'Opened {when} by {name}',
      finalizedOn: 'finalized {when}',
      finalizedOnBy: 'finalized {when} by {name}',
      reopenedOn: 'reopened {when}',
      reopenedOnBy: 'reopened {when} by {name}',
    },

    menu: {
      moreAria: 'More actions for {bill}',
      edit: 'Edit month, company or note',
      refresh: 'Refresh from Trip DO sheet',
      finalize: 'Finalize labour bill',
      reopen: 'Reopen as draft',
      delete: 'Delete labour bill',
    },

    copies: {
      title: 'Signed copies for {bill}',
      count: { one: '{n} signed copy', other: '{n} signed copies' },
      summary: '{copies} for {withCopy} of {challans} on {period}.',
      summaryWaiting:
        '{copies} for {withCopy} of {challans} on {period} — {waiting} still waiting, and the file simply leaves those out.',
      overMax:
        '{copies} is more than the {max} one file can hold — every copy is merged in memory. Print a CSD section at a time instead, which is how the bills go out anyway.',
      nothingToPrint: 'Nothing has been scanned onto this bill yet, so there is no paper to print.',
      collecting: 'Collecting…',
      print: 'Print',
      printAll: 'Print all',
      downloadAll: 'Download all',
      noneYet: {
        one: 'No signed copy yet for its {n} challan',
        other: 'No signed copy yet for any of its {n} challans',
      },
      sectionSummary: '{copies} · {withCopy} of {challans}',
      sectionSummaryWaiting: '{copies} · {withCopy} of {challans} · {waiting} waiting',
      downloadAria: 'Download the signed copies for {section}',
      printAria: 'Print the signed copies for {section}',
      rowAria: 'Signed copy for challan {challan}',
      rowNoneAria: '{label}: none yet',
      rowOneTitle: '{label} · {trip}',
      rowTripsAria: '{label}: {n} trips',
      rowTripsTitle: '{n} signed copies — this challan went out on more than one trip',
      wentOutOn: '{challan} went out on {n} trips',
      collectingToast: 'Collecting the signed copies…',
      printed: 'Signed copies sent to the printer',
      downloaded: 'Signed copies downloaded',
      /** Why a challan has no copy, in the Delivery module's own vocabulary. */
      notBack: 'The signed copy for this delivery has not come back yet.',
      declaredLost: 'The signed copy for this delivery was declared lost.',
      allReturned: 'Everything on this challan came back, so nobody signed for it.',
      noTrip: 'This challan is on no trip yet, so there is no signed copy to print.',
    },

    form: {
      openTitle: 'Open a labour bill',
      editTitle: 'Edit {bill}',
      editDescription: 'Correct the billing month, the company or the note. The bill number stays.',
      billingMonth: 'Billing month',
      company: 'Company',
      companyHint:
        'What goes in the sheet’s Unit column. It fills in each row as it is scanned and stays editable there; leave it blank and a row takes the unit off its own gate pass.',
      openBill: 'Open labour bill',
    },

    confirm: {
      finalizeTitle: 'Finalize {bill}?',
      finalize: 'Finalize labour bill',
      finalizeBody:
        '{amount} for {rows} {sections} — {labour} Ven/Pulling/Labour and {floor} floor. Once finalized, challans cannot be scanned in and amounts cannot be typed until an Admin or Manager reopens it.',
      finalizeUnpriced: {
        one: '{n} row has no amount at all, so this will be refused until it says what it cost — 0 where a delivery needed no help.',
        other:
          '{n} rows have no amount at all, so this will be refused until each says what it cost — 0 where a delivery needed no help.',
      },
      finalizePending: {
        one: '{n} row is still waiting for a Trip DO, so it belongs to no CSD and would be charged to nobody — this will be refused until it is matched or taken off.',
        other:
          '{n} rows are still waiting for a Trip DO, so they belong to no CSD and would be charged to nobody — this will be refused until they are matched or taken off.',
      },
      reopenTitle: 'Reopen {bill}?',
      reopen: 'Reopen as draft',
      reopenDescription:
        'It becomes a draft again, so challans can be scanned in and amounts corrected. If the finalized file has already been sent, whoever received it will need the corrected one.',
      deleteTitle: 'Delete {bill}?',
      deleteBill: 'Delete labour bill',
      deleteDescription: {
        one: 'Its {n} row and the amount typed into it are gone for good. Nothing on the Trip DO sheet, the challans or the gate passes changes — a labour bill claims none of them. The bill number is not reused.',
        other:
          'Its {n} rows and the amounts typed into them are gone for good. Nothing on the Trip DO sheet, the challans or the gate passes changes — a labour bill claims none of them. The bill number is not reused.',
      },
      removeTitle: 'Take {label} off the labour bill?',
      takeRowOff: 'Take row off',
      takeRowsOff: 'Take {count} rows off',
      removeDescription: {
        one: '{n} row goes, and any amount typed into it goes with it. Scanning the challan again brings the row back, empty.',
        other:
          '{n} rows go, and any amount typed into them go with them. Scanning the challan again brings the rows back, empty.',
      },
      nothingChanges: 'Nothing on the Trip DO sheet changes.',
    },

    actions: {
      deleting: 'Deleting…',
      finalizing: 'Finalizing…',
      reopening: 'Reopening…',
      takingOff: 'Taking off…',
      opened: '{bill} opened',
      updated: '{bill} updated',
      deleted: '{bill} deleted',
      deletedNote: {
        one: '{n} row gone. Nothing on the Trip DO sheet changes.',
        other: '{n} rows gone. Nothing on the Trip DO sheet changes.',
      },
      finalized: '{bill} finalized',
      reopened: '{bill} reopened',
      reopenedNote: 'It is a draft again.',
      takenOff: { one: '{n} row taken off {bill}', other: '{n} rows taken off {bill}' },
      alreadyMatches: '{bill} already matches the Trip DO sheet',
      refreshed: '{bill} refreshed from the Trip DO sheet',
      refreshedNote: '{updated} re-read · {removed} taken off · every amount kept',
      buildingToast: 'Building the labour bill…',
      downloaded: 'Labour bill downloaded',
    },

    scan: {
      alreadyOn: '{challan} is already on {bill}',
      added: { one: '{challan}: {n} row added', other: '{challan}: {n} rows added' },
      skipped: { one: '{n} already on the sheet', other: '{n} already on the sheet' },
      filedUnder: 'filed under {csds}',
      waiting: '{models} waiting for a Trip DO',
    },
  },

  /** Gate Pass — the operating record, one printed challan per row. */
  /**
   * Challan — the corporate office's paperwork, cut out of one WhatsApp PDF and
   * filed a challan at a time.
   */
  challan: {
    title: 'Challan',
    listAria: 'Challan records',
    recordsHeading: 'Challan records',
    listSubtitle:
      'Every challan filed out of a corporate PDF — serial, barcode back page and document.',
    locationRunPosition: '{position} of {total}',
    locationSubtitle:
      '{challan} · SL {sl} · nothing on the challan or in the stored document changes, so there is never anything to reprint.',
    sourcePdfs: 'Source PDFs',
    sourcePdfsDescription:
      'Every corporate PDF challans have been filed out of, and how far through each one the operation got. The files themselves are never stored — a batch is created by the first challan filed out of a file, and this is the only trace of it that survives.',
    batchesAria: 'Source PDF batches',
    openChallanPdf: 'Open a challan PDF',
    allChallans: 'All challans',
    backToList: 'Back to challans',
    backToChallan: 'Back to the challan',
    notFound: 'Challan not found',
    notFoundHint: 'It may have been deleted, or you may not have access to it.',
    somethingWrong: 'Something went wrong.',
    loading: 'Loading challan',
    unknown: 'Unknown',

    statuses: {
      Submitted: {
        label: 'Submitted',
        description: 'Filed, numbered and stored with its barcode back page.',
      },
      Amended: {
        label: 'Amended',
        description: 'Corrected after filing — by hand, or by a trip that carried it.',
      },
      unknown: { label: 'Unknown', description: 'Unrecognised status' },
    },

    dispatchStatuses: {
      Pending: { label: 'Not dispatched', description: 'Filed, and on no trip yet.' },
      Partial: {
        label: 'Partly sent',
        description: 'Split across trips, with something still to go.',
      },
      Dispatched: {
        label: 'Sent',
        description: 'Everything on it has left the gate; the signed copy is not back yet.',
      },
      Delivered: {
        label: 'Delivered',
        description: 'Every trip carrying it has its signed copy in.',
      },
      Returned: {
        label: 'Returned',
        description: 'Went out and came back; waiting at the depot for another trip.',
      },
    },

    /** What the trips say about a challan, as this module draws it. */
    dispatch: {
      ofTotal: '{sent} of {total}',
      sentSlash: '{sent}/{total}',
      progressTitle: '{sent} of {total} dispatched. {description}',
      backAtDepot: '{n} back at depot',
      resent: '{n} re-sent',
      returnTitle: '{returned} came back off a trip; {resent} went out again.',
    },

    batchStatuses: {
      Processing: {
        label: 'Processing',
        description: 'Pages of this source PDF have not been filed as challans yet.',
      },
      Completed: {
        label: 'Completed',
        description: 'Every page of the source PDF belongs to a submitted challan.',
      },
    },

    /**
     * A page range, as a sentence. English agrees the noun with the count and
     * Bangla does not, so "page 4" and "pages 4–6" are two whole messages
     * rather than a noun with an `s` bolted on.
     */
    pages: {
      range: { one: 'page {range}', other: 'pages {range}' },
      none: 'none',
      /** "pages 3–4 and 7–9" — a list of gaps, joined. */
      listJoin: '{head} and {last}',
      slWith: 'SL {sl}',
      pageN: 'Page {n}',
    },

    backlog: {
      heading: 'Needs attention',
      blankAmount: 'Blank amount',
      blankAmountHint:
        'Challans where nothing has been charged. Either the location is not set, or the products are not on the rate card.',
      partlyCharged: 'Partly charged',
      partlyChargedHint:
        'Challans charged for some of their product lines but not all of them — the amount shown is less than the full charge.',
      locationPending: 'Location pending',
      locationPendingHint:
        'Challans whose district and thana have not been determined. Setting one also prices its lines.',
      unconfirmedMatch: 'Unconfirmed match',
      unconfirmedMatchHint:
        'Locations the system inferred that nobody has confirmed. Opening one and agreeing takes it out of this list.',
      notDispatched: 'Not dispatched',
      notDispatchedHint:
        'Challans that are filed but on no trip yet — the goods have not left the gate.',
      partlySent: 'Partly sent',
      partlySentHint:
        'Challans split across trips with something still to go. They read as sent at a glance, which is why they are counted apart.',
      returnedAtDepot: 'Returned at depot',
      returnedAtDepotHint:
        'Goods that came back off a lorry and have not gone out again — they are on the shelf, waiting for another trip.',
    },

    filters: {
      searchPlaceholder: 'Search challan no, SL, customer, address, product',
      searchAria: 'Search challans',
      statusAria: 'Filter by status',
      anyStatus: 'Any status',
      locationAria: 'Filter by location',
      anyLocation: 'Any location',
      locationSet: 'Location set',
      locationPending: 'Location pending',
      unconfirmedMatch: 'Unconfirmed match',
      dateAria: 'Filing date',
      amount: 'Amount',
      anyAmount: 'Any amount',
      blankAmount: 'Blank amount',
      partlyCharged: 'Partly charged',
      dispatch: 'Dispatch',
      anyDispatch: 'Any dispatch',
      notDispatched: 'Not dispatched',
      partlySent: 'Partly sent',
      sent: 'Sent',
      delivered: 'Delivered',
      returnedAtDepot: 'Returned at depot',
      bill: 'Bill',
      filedFrom: 'Filed from',
      filedTo: 'Filed to',
      customer: 'Customer',
      district: 'District',
      product: 'Product',
      model: 'Model',
      zonePo: 'Zone / PO',
      filedBy: 'Filed by',
      onlyMine: 'Only mine',
      everyone: 'Everyone',
      sourceFilePlaceholder: 'Source file name',
      sourceSearchAria: 'Search source PDFs',
    },

    list: {
      loading: 'Loading challans',
      loadFailed: 'Could not load challans',
      retrying: 'Retrying…',
      noneFound: 'No challans found',
      noneYet: 'No challans yet',
      filteredHint: 'No challan records match your current filters.',
      emptyHint:
        'Open the challan PDF that arrived from the corporate office, mark out each challan, and file them one at a time.',
      challanAria: 'Challan {challan}',
      /** Labelled halves: a blank thana and a blank district are different gaps. */
      thanaDistrict: 'Thana: {thana} · District: {district}',
      unpricedNote:
        '{n} of these challans carry a line that is not on the rate card, so this total does not include them.',
    },

    stats: {
      today: 'Filed today',
      todayHint: 'Filed since midnight',
      total: 'Challans on record',
      totalHint: 'Every challan ever filed',
      batches: 'Batches in progress',
      batchesHint: 'Source PDFs with pages unfiled',
      quantity: 'Total quantity',
      quantityHint: 'Units across every challan',
      loadFailed: 'The challan overview could not be loaded.',
      needsAttention: 'Needs attention',
      todayLabel: 'Today’s challans',
    },

    goods: {
      product: 'Product',
      model: 'Model',
      capacity: 'Capacity',
      qty: 'Qty',
      rate: 'Rate',
      amount: 'Amount',
      noLocationYet:
        'Nothing is charged yet: the rate depends on where this went, and the location has not been set. Setting it prices every line automatically.',
      notOnCard:
        'Nothing is charged: none of these products is on the rate card for this location. Adding them to Product Rates and correcting the challan prices it.',
      /** "This total covers 2 of 3 lines. One product is not on the rate card." */
      partialTotal: 'This total covers {priced} of {total} lines. {unpriced} not on the rate card.',
      total: 'Total',
      unpricedProducts: { one: '{n} product is', other: '{n} products are' },
    },

    details: {
      identifiers: 'Identifiers',
      identifiersHint: 'Allocated by LBTS when this challan was filed.',
      slNumber: 'SL number',
      challanNumber: 'Challan number',
      barcodeNote:
        'The challan number is what the barcode on the back page encodes, so a scanner and a person reading the sheet can never get two different answers.',
      customerAndDelivery: 'Customer and delivery',
      asTranscribed: 'As transcribed from the challan.',
      customer: 'Customer',
      deliveryAddress: 'Delivery address',
      thana: 'Thana',
      district: 'District',
      location: 'Location',
      locationHint: 'Matched against the location master list. Optional — a challan files without it.',
      noLocation:
        'No district or thana could be determined from what was entered, so none was recorded — a blank is kept rather than a guess. Setting it here does not change the challan text or its printed document.',
      setLocation: 'Set location',
      changeLocation: 'Change location',
      checkLocation: 'Check location',
      contactAndReference: 'Contact and reference',
      contactHint: 'Who to call, and what it is filed against.',
      receiverMobile: 'Receiver mobile',
      senderMobile: 'Sender mobile',
      zonePo: 'Zone / PO',
      goods: 'Goods',
      goodsHint: 'What this challan carries.',
      sourceAndDocument: 'Source and document',
      sourceHint: 'Where these pages came from, and what is stored.',
      sourceFile: 'Source file',
      pagesTaken: 'Pages taken',
      storedDocument: 'Stored document',
      generated: 'Generated',
      productLines: '{n} product lines on this challan.',
      documentSize: '{pages} · {size}',
      resolvedAt: '{source} · {when}',
      resolvedByAt: '{source} by {name} · {when}',
      editSubtitle: '{challan} · SL {sl} · check every field against the pages beside it.',
      saveAndRegenerate: 'Save and regenerate',
      storedNote:
        'The stored PDF is the original challan pages exactly as they arrived, followed by the generated LBTS back page. The source file itself was never uploaded.',
      openSourceBatch: 'Open the source batch',
      filing: 'Filing',
      filingHint: 'Who filed it, who printed it, and when.',
      filedBy: 'Filed by',
      filedAt: 'Filed at',
      printed: 'Printed',
      notYet: 'Not yet',
      correctedAt: 'Corrected at',
      correctedBy: 'Corrected by',
      amendedNote:
        'This challan was corrected after filing, and its document was regenerated to match. Anybody holding a printed copy needs the new one.',
      documentAria: 'Challan document',
      generatedDocument: 'Generated challan document',
      generatedDocumentHint: 'The original challan pages, then the LBTS back page with the barcode.',
      storedDocumentHeading: 'The stored document',
      storedDocumentHint: 'The original challan pages. Check the values against these.',
      storedDocumentAria: 'Stored challan document',
      waitingForDocument: 'Waiting for the document',
      correct: 'Correct',
      correctTitle: 'Correct challan',
      regenerates: 'Saving regenerates the document.',
      regeneratesNote:
        'The back page is redrawn from what you save, and the stored PDF is replaced — the SL number, challan number and barcode stay the same. Any copy printed before now shows the old details, so reprint it if it is already in circulation. The page range ({range} of {file}) cannot be changed here — the source PDF was never stored.',
      detailsAria: 'Challan details',
      filedLine: 'SL {sl} · {customer} · filed {when}',
      filedLineBy: 'SL {sl} · {customer} · filed {when} by {name}',
      batchButton: 'Batch',
      loadFailed: 'The document could not be loaded',
      printFailed: 'The challan document could not be loaded, so there is nothing to print.',
    },

    entry: {
      customerAndDelivery: 'Customer and delivery',
      customerHint: 'Who the goods are going to, and where.',
      contactAndReference: 'Contact and reference',
      contactHint: 'How to reach them, and what this challan is filed against.',
      goods: 'Goods',
      goodsHint: 'What is on this challan. Add a row for each product it lists.',
      customerName: 'Customer name',
      deliveryAddress: 'Delivery address',
      addressHint: 'House, road and area exactly as printed. Thana and district go below.',
      thana: 'Thana',
      thanaHint: 'Exactly as printed, if the challan gives one.',
      district: 'District',
      districtHint: 'Leave blank if the challan does not say.',
      receiverMobile: 'Receiver mobile',
      senderMobile: 'Sender mobile',
      zonePo: 'Zone / PO',
      zonePoHint: 'Copied as one value, exactly as the challan prints it.',
      receiverHint: '01712345678, or with +880. Stored in the local eleven-digit form.',
      optional: 'Optional',
      productIndex: 'Product {n}',
      removeProduct: 'Remove product {n}',
      addProduct: 'Add another product',
      maxProducts: 'That is as many products as one challan can carry.',
      rowsTotal: '{rows} · {total} total',
      productLabel: 'Product',
      modelLabel: 'Model',
      qtyLabel: 'Qty',
      carryFields: 'Customer name and Zone / PO',
      sameAsLast: 'Same as last',
      carryBanner:
        '{fields} from {source} are shown above their boxes. Tick “{tick}” on either that matches this challan; both stay empty until you type them.',
      /** The keyboard hint under the entry form's footer. */
      shortcutCtrl: 'Ctrl',
      shortcutEnter: 'Enter',
      shortcutHint: 'files this challan',
    },

    location: {
      heading: 'Location',
      optional: 'Optional',
      autoFilled: 'Filled in automatically from the thana, district or address above.',
      lookupFailed:
        'The lookup could not run. The challan can still be filed; the location can be set afterwards.',
      notDetermined: 'Not determined yet. This challan can still be filed.',
      checkAgain: 'Check again',
      clear: 'Clear',
      close: 'Close',
      choose: 'Choose',
      filesWithout:
        'A challan files whether or not this is set. The thana and district you typed are stored exactly as typed either way.',
      transcribedAria: 'What the challan says',
      transcribedHeading: 'As transcribed',
      transcribedHint:
        'Exactly what was typed off the challan. Never rewritten by a location, and this is what a match is judged against.',
      decidedAria: 'What the system decided',
      unconfirmed:
        'Nobody has confirmed this. Check it against the transcribed thana, district and address, then confirm or correct it.',
      chooseAria: 'Choose the location',
      changeOrConfirm: 'Change it, or confirm what is there',
      chooseHeading: 'Choose the location',
      masterHint:
        'The district and thana come from the master list, and the location type follows from the row — it is never typed beside a challan.',
      clearLocation: 'Clear location',
      confirmLocation: 'Confirm location',
      setTitle: 'Set the location',
      checkTitle: 'Check the location',
      districtThana: '{district} / {thana}',
      chosen: '— chosen',
      fromMaster: '— from the master list',
      checking: 'Checking the location master list…',
      /** "Matched exactly by an administrator · 24 Sep 2026, 4:12 pm" */
      decidedBy: '{source} by {name} · {when}',
      decidedConfidence: '{source} · {confidence} confident · {when}',
      decidedPlain: '{source} · {when}',
    },

    queue: {
      ariaLabel: 'Challans in this PDF',
      heading: 'Challan queue',
      addChallan: 'Add challan',
      everyPageTaken: 'Every page of this PDF already belongs to a challan',
      inProgress: 'In progress',
      notStarted: 'Not started',
      removeFromQueue: 'Remove challan {n} from the queue',
      challanN: 'Challan {n}',
      challan: 'Challan',
      filedWith: 'SL {sl} · {challan}',
      nextChallan: 'Next challan',
      addNext: 'Add the next challan',
      fileThis: 'File {label}',
      everyPageFiled: 'Every page of this PDF has been filed. Add a challan to carry on.',
      openDifferent: 'Open a different PDF',
      complete: 'Complete',
      filedAria: 'Pages filed as challans',
      pagesOf: '{assigned}/{total} pages',
      notFiled: '{n} not filed',
      pendingWarning: {
        one: '{n} challan is still only in this browser. Nothing is saved until you file each one, and closing this page loses what has not been filed.',
        other: '{n} challans are still only in this browser. Nothing is saved until you file each one, and closing this page loses what has not been filed.',
      },
    },

    batch: {
      actionsAria: 'Batch actions',
      summaryAria: 'Batch summary',
      notFound: 'Batch not found',
      notFoundHint:
        'It may have been removed when its last challan was deleted, or you may not have access to it.',
      loading: 'Loading batch',
      loadingWorkspace: 'Loading the batch',
      challansAria: 'Challans in this batch',
      challansHeading: 'Challans from this PDF',
      challansHint: 'In the order the source file had them, not the order they were filed.',
      allFiled: 'All {challans} from this PDF are filed',
      notFinished: 'This PDF is not finished yet',
      openBatch: 'Open the batch',
      assembling: 'Assembling…',
      printAll: 'Print all challans',
      downloadBatch: 'Download batch PDF',
      continueEntering: 'Continue entering',
      startedAt: 'Started {when}',
      startedBy: 'Started {when} by {name}',
      accountedOf: '{assigned} of {total} pages accounted for',
      filedAndAccounted: '{challans} filed · {assigned} of {total} pages accounted for',
      notAccounted: {
        one: '{n} page is not accounted for — {ranges}.',
        other: '{n} pages are not accounted for — {ranges}.',
      },
      notAccountedNote:
        'The batch cannot be printed or downloaded as one document until every page is either filed as a challan or marked as blank, because the file would be missing them without saying so. The source PDF was never stored, so filing them means opening it again: “{action}” asks for that file and carries on in this batch.',
      markedBlankNote: '{ranges} — not filed as challans, and not in the batch document.',
      openSameAgainNote:
        'It was never stored, so this is the only way back to it — and the challans you file from it join this batch rather than starting a new one.',
      stillToFileLine:
        'Still to be filed: {ranges}. Pages already filed are marked in the queue and cannot be claimed twice.',
      accounted:
        'Every page of this PDF is accounted for. The batch document is each challan’s pages in source order, with its back page behind them.',
      continueHint: 'asks for that same file again — the page count has to match.',
      notChallans: 'Not challans at all?',
      markBlank: 'Mark {range} blank',
      markedBlank: 'Marked blank:',
      notPrintedYet: 'Not printed yet.',
      printingMarksNote:
        'Printing the batch sends every challan to the printer as one document and marks them here.',
      allMarkedPrinted: {
        one: 'All {n} challan is marked as printed.',
        other: 'All {n} challans are marked as printed.',
      },
      reprintNote: 'Printing again is never refused — reprint whenever a copy is needed.',
      printedOf: '{printed} of {total} printed.',
      printedOfShort: '{printed}/{total} printed',
      filedCount: '{n} filed',
      pagesOf: '{assigned}/{total} pages',
      unaccounted: {
        one: '{n} page still unaccounted for',
        other: '{n} pages still unaccounted for',
      },
      printingMarks: 'Printing the batch marks every challan in it.',
      restOnFile: 'The rest are still only on file.',
      notPrinted: 'Not printed',
      continuingHeading: 'Continuing a batch',
      backToBatch: 'Back to the batch',
      openDifferentInstead: 'Open a different PDF instead',
      openSameAgain: 'Open the same PDF again to carry on.',
      stillToFile: 'Still to be filed:',
      notThisFile: 'Not this file? Start a new batch',
      resumeFailed: 'That batch could not be opened',
      continuedAria: 'Batch being continued',
      openPdf: 'Open a PDF',
      loadingList: 'Loading source PDFs',
      loadFailed: 'Could not load source PDFs',
      noneFound: 'No source PDFs found',
      noneYet: 'No source PDFs yet',
      filteredHint: 'No source file matches your current filters.',
      emptyHint:
        'A source PDF appears here as soon as the first challan is filed out of it. Opening a file records nothing on its own — the file itself is never stored.',
      pagesChallansLine: '{pages} · {challans} filed',
      completedAlso: '{started} · completed {when}',
      printableNote:
        'They can be printed as one document — each challan’s pages followed by its LBTS back page, in the order the source file had them.',
      notPrintableYet: {
        one: '{n} page is neither filed nor marked blank, so the set cannot be printed as one document yet.',
        other: '{n} pages are neither filed nor marked blank, so the set cannot be printed as one document yet.',
      },
    },

    pdf: {
      sourceAria: 'Source PDF',
      closeAria: 'Close this PDF',
      heldHere: '{pages} · {size} · held in this browser only',
      scanNoText: 'This page is a scan — there is no text to select, so type the values in',
      selectTextHint: 'Select text on the page and copy it straight into a field',
      notAChallan: 'Not a challan — a blank sheet, a cover page, a duplicate?',
      markedBlankWith: 'Marked blank: {pages}',
      skipAsBlank: 'Skip {range} as blank',
      pagesAria: 'Pages of the source PDF',
      firstPage: 'First page',
      lastPage: 'Last page',
      filedAs: 'Filed as {challan}',
      startedAt: 'Started at page {page} — click the last page of this challan',
      thisChallanIs: 'This challan is {range}',
      alreadyFiled: 'Already filed as a challan',
      belongsToAnother: 'Belongs to another challan in this queue',
      legendThis: 'This challan',
      legendQueued: 'Queued',
      legendFiled: 'Filed',
      legendUnassigned: 'Unassigned',
      previousPage: 'Previous page',
      nextPage: 'Next page',
      pageNumber: 'Page number',
      ofPages: 'of {pages}',
      fitLabel: 'Fit',
      fitPageLabel: 'Page',
      fitWidthLabel: 'Width',
      zoomIn: 'Zoom in',
      zoomOut: 'Zoom out',
      fitPage: 'Fit the whole page',
      rotate: 'Rotate',
      fullscreen: 'Fullscreen',
      leaveFullscreen: 'Leave fullscreen',
      pageDrawFailed: 'This page could not be drawn.',
      openingPdf: 'Opening the PDF…',
      openSameAgain: 'Open the same PDF again',
      openChallanPdf: 'Open the challan PDF',
      dropzoneHint:
        'The file Walton sent over WhatsApp, however many challans it holds. Drop it here or choose it from this computer.',
      choosePdf: 'Choose a PDF',
      expectingFile:
        '{file} — the {pages} file this batch was started from. Drop it here or choose it from this computer.',
      limits: 'PDF up to {mb} MB, up to {pages} pages',
      neverUploaded: 'This PDF is never uploaded.',
      neverUploadedNote:
        'It is read in this browser and forgotten when the tab closes. Only the pages of each challan you file are sent, cut out and stored.',
      workspaceTabsAria: 'Challan workspace',
      tabEntry: 'Entry',
      tabPdf: 'PDF',
    },

    extracted: {
      read: 'Read the text on these pages',
      readAgain: 'Read again',
      copyAll: 'Copy all',
      copied: 'Copied',
      textAria: 'Text found on these pages',
      noText:
        'No selectable text on these pages — this challan is a scanned image. Read it from the page above and type the values in.',
    },

    paste: {
      prompt: 'Paste a block from the PDF',
      heading: 'Paste and fill',
      hint: 'Select the challan text in the PDF, paste it here, and anything labelled is offered for an empty field.',
      textAria: 'Text pasted from the challan PDF',
      seeWhatItFound: 'See what it found',
      fillFields: 'Fill {fields}',
      nothingNewLong:
        'Nothing new to fill. Either the fields are already filled in, or this text has no labels it recognises — type the values in by hand.',
      hintLong:
        'Select the challan text in the PDF, paste it here, and anything labelled is offered for the fields you have not filled in yet.',
      nothingNew:
        'Nothing new to fill. Either the fields are already filled in, or this text has no labels the parser recognises.',
      fields: {
        customerName: 'Customer name',
        deliveryAddress: 'Delivery address',
        thana: 'Thana',
        district: 'District',
        receiverMobile: 'Receiver mobile',
        senderMobile: 'Sender mobile',
        zonePo: 'Zone / PO',
        product: 'Product',
        model: 'Model',
        qty: 'Quantity',
      },
    },

    bangla: {
      looksLegacy: 'This looks like Bijoy text — convert',
      convert: 'Convert to Unicode',
      previewAria: 'Unicode preview for {label}',
      previewHeading: 'Unicode preview',
      useThis: 'Use this',
      keepMine: 'Keep what I typed',
      hint: 'If the preview is wrong, keep what you typed and correct it by hand.',
    },

    filed: {
      ariaLabel: 'Challan filed',
      filed: 'Filed',
      sl: 'SL',
      heading: 'Challan',
    },

    duplicate: {
      batch: 'Same customer, address, number and model — out of this same PDF',
      recent: 'Same customer, address, number and model in the last three months',
      description:
        'Check whether this is the same delivery before filing it. Nothing has been saved yet, so nothing is lost either way.',
      goBack: 'Go back and check',
      title: {
        one: 'A similar challan has already been filed',
        other: '{n} similar challans have already been filed',
      },
      goodsLine: '{product} ({model}) × {qty}',
      moreItems: '+{n} more',
      filing: 'Filing…',
      fileAnyway: 'Different delivery — file it',
    },

    remove: {
      title: 'Delete {challan}?',
      body:
        'This challan and its generated PDF are removed permanently, and SL {sl} is not reissued. {range} of {file} become unassigned again, so the batch they came from re-opens and can no longer be downloaded as a finished set. This cannot be undone.',
      keepIt: 'Keep it',
      deleting: 'Deleting…',
      confirm: 'Delete challan',
    },

    menu: {
      aria: 'Actions for {challan}',
      view: 'View details',
      correct: 'Correct',
      setLocation: 'Set location',
      checkLocation: 'Check location',
      changeLocation: 'Change location',
      downloadPdf: 'Download PDF',
      printChallan: 'Print challan',
      markPrinted: 'Mark as printed',
      markNotPrinted: 'Mark as not printed',
      openSourceBatch: 'Open source batch',
      deleteChallan: 'Delete challan',
    },

    printMark: {
      printed: 'Printed',
      notPrinted: 'Not printed',
      printedAt: 'Printed {when}',
      printedAtBy: 'Printed {when} by {name}',
    },

    stages: {
      extracting: 'Cutting the challan pages out of the PDF',
      filing: 'Filing this challan…',
      uploading: 'Uploading the challan pages',
      finalizing: 'Checking, numbering and filing the challan',
      coldStart:
        'The server may take a moment to wake up. Nothing is lost if this is slow, and pressing the button again will not file it twice.',
    },

    toasts: {
      preparing: 'Preparing the challan…',
      downloaded: 'Challan downloaded',
      preparingPrint: 'Preparing to print…',
      assemblingBatch: 'Assembling the batch PDF…',
      batchDownloaded: 'Batch downloaded',
      assemblingBatchPrint: 'Assembling the batch PDF to print…',
      corrected: 'Challan corrected',
      batchComplete: 'Batch complete',
      blankCleared: 'Blank pages cleared',
      stillToAccount: {
        one: '{n} page still to account for.',
        other: '{n} pages still to account for.',
      },
      markedBlank: 'Marked as blank',
      batchAccounted: 'Every page of this PDF is accounted for. The batch can be downloaded as one document.',
      batchPrinted: 'Batch marked as printed',
      printMarksCleared: 'Print marks cleared',
      batchPrintedNote: 'All {challans} from {file} are marked as printed.',
      batchNotPrintedNote: 'None of this batch is marked as printed any more.',
      locationSet: 'Location set',
      locationCleared: 'Location cleared',
      deleted: '{challan} was deleted',
      deletedNote: 'Its pages are unassigned again in the batch it came from.',
      documentLoadFailed: 'The document could not be loaded.',
    },

    resume: {
      allAccounted:
        'Every page of this PDF is already accounted for, so there is nothing left to file from it.',
      notYours:
        'This batch was started by somebody else. Only they, or a Manager, can file the rest of its challans.',
      openFailed:
        'That batch could not be opened. It may have been removed when its last challan was deleted.',
    },

    source: {
      wrongPageCount:
        'That file has {pages} and this batch was started from a {expected}-page PDF, so it is not the same document. Open the file this batch came from — “{file}”.',
      openFailed: 'That PDF could not be opened. Try the file again.',
      empty: 'That file is empty. Choose the PDF again.',
      tooLarge: 'That PDF is {size}. This workspace opens files up to {limit} MB.',
      notPdf: 'That file is not a PDF. Choose the challan PDF from WhatsApp.',
      passwordProtected: 'That PDF is password protected. Remove the protection and open it again.',
      damaged: 'That PDF could not be opened. It may be damaged.',
      tooManyPages: 'That PDF has {pages} pages. This workspace handles up to {max}.',
      rangeOutside: 'Pages {from}–{to} are not inside this PDF, which has {total}.',
    },

    pageRange: {
      notAWholeNumber: 'A page number has to be a whole number.',
      overlap: {
        one: '{range} already belongs to {challans}.',
        other: '{range} already belong to {challans}.',
      },
      firstPageAtLeastOne: 'The first page of a challan is page 1 or later.',
      reversed: 'The last page comes before the first page.',
      noPages: 'The source PDF has no pages to select from.',
      sourceTooLong: 'That PDF has {pages} pages. This workspace handles up to {max}.',
      endsAt: 'The source PDF ends at page {last}.',
      tooManyForOne: 'That is {pages} pages for one challan. The limit is {max}.',
    },

    validation: {
      customerNameTooShort: 'Customer name must be at least 2 characters',
      customerNameTooLong: 'Customer name must be 200 characters or fewer',
      addressTooShort: 'Delivery address must be at least 3 characters',
      addressTooLong: 'Delivery address must be 500 characters or fewer',
      productTooShort: 'Product must be at least 2 characters',
      productTooLong: 'Product must be 200 characters or fewer',
      modelRequired: 'Model is required',
      modelTooLong: 'Model must be 120 characters or fewer',
      receiverMobileInvalid: 'Enter a valid receiver mobile, for example 01712345678.',
      senderMobileInvalid: 'Enter a valid sender mobile, or leave it blank.',
      senderMobileTooLong: 'Sender mobile must be 40 characters or fewer',
      thanaTooLong: 'Thana must be 120 characters or fewer',
      districtTooLong: 'District must be 120 characters or fewer',
      zonePoTooLong: 'Zone / PO must be 120 characters or fewer',
      qtyRequired: 'Quantity is required',
      qtyWhole: 'Quantity must be a whole number',
      qtyAtLeastOne: 'Quantity must be at least 1',
      qtyTooLarge: 'Quantity looks too large. Check the challan.',
      itemsAtLeastOne: 'Add at least one product',
      itemsTooMany: 'A challan can carry at most 30 products',
    },
  },
  /**
   * Delivery — one trip: a vehicle, a driver, a vendor, and the challans that
   * went out on it.
   *
   * The printed manifest is translated along with the screen, unlike the Trip
   * DO and Excel Bill workbooks: those are built server-side and go to the
   * office in the layout it already uses, while this sheet is composed here
   * and read by the driver at the gate.
   */
  delivery: {
    title: 'Delivery',
    pageDescription:
      'Every trip: which vehicle and driver, which vendor it was assigned to, and exactly which challans — and how much of each — went out on it.',
    tripsAria: 'Trips',
    newDelivery: 'New delivery',
    backToList: 'Back to deliveries',
    allDeliveries: 'All deliveries',
    deliveries: 'Deliveries',
    somethingWrong: 'Something went wrong.',
    manifestAria: 'Manifest',

    tripStatuses: {
      Open: {
        label: 'Awaiting copy',
        description: 'A challan on this trip is still waiting for its signed copy.',
      },
      Completed: {
        label: 'Completed',
        description: 'Every challan on the trip has been signed for.',
      },
    },

    outcomes: {
      Pending: {
        label: 'Awaiting copy',
        description: 'The signed challan copy has not been scanned in yet.',
      },
      Complete: {
        label: 'Complete',
        description: 'The receiver signed for it and the copy is on record.',
      },
    },

    completionMethods: {
      Returned: {
        label: 'Returned',
        description: 'Everything came back. Nothing was delivered, so no signed copy is needed.',
      },
      CopyMissing: {
        label: 'Copy missing',
        description: 'Completed without the signed copy, on the operator’s word.',
      },
    },

    /** What this trip did to one challan line. */
    lineChanges: {
      'as-ordered': {
        label: 'As ordered',
        description: 'The product, the model and the quantity the challan orders.',
      },
      split: {
        label: 'Split',
        description: 'Part of this line goes on a later trip. The challan keeps the rest.',
      },
      reduced: {
        label: 'Cut',
        description:
          'Fewer than the challan orders, with nothing held back — the challan is corrected down to what went.',
      },
      increased: {
        label: 'More',
        description: 'More than the challan orders — the challan is corrected up to what went.',
      },
      substituted: {
        label: 'Replaced',
        description:
          'A different product or model standing in for the one on the challan, which it replaces there too.',
      },
      added: {
        label: 'Added',
        description: 'A product the challan never listed. It is added to the challan as well.',
      },
    },

    /** What a line's badge says underneath it. */
    lineDetail: {
      split: '{qty} of {ordered} · rest on another trip',
      corrected: 'challan was {ordered}',
      substituted: 'for {model}',
    },

    /** A correction, as one sentence. */
    changes: {
      removed: '{product} removed (was {from})',
      added: '{product} added ({to})',
      cutTo: '{product} cut to {to} (was {from})',
      raisedTo: '{product} raised to {to} (was {from})',
    },

    carryingKinds: {
      Vehicle: {
        label: 'Vehicle',
        hint: 'A rickshaw van, a CNG — whatever took it the last stretch.',
      },
      Labour: {
        label: 'Labour',
        hint: 'People hired to carry it in or up.',
      },
    },

    partyLabels: {
      customerName: 'Customer',
      deliveryAddress: 'Delivery address',
      thana: 'Thana',
      district: 'District',
      receiverMobile: 'Receiver',
    },

    returned: 'Returned',
    cameBack: 'Came back',
    slWith: 'SL {sl}',
    addedWith: 'Added {challan}',
    driverWith: 'Driver {name}',
    noChallanMatches: 'No challan matches {query}.',
    tripRentWith: 'Trip rent {amount}',
    labourBillWith: 'Labour bill {amount}',
    totalWith: 'Total {amount}',

    /**
     * "3rd floor".
     *
     * English agrees the suffix with the number and Bangla does not, so the
     * four English forms are four messages chosen by `Intl.PluralRules` in
     * ordinal mode — the one place in the app that needs it. Bangla writes the
     * same sentence in all four.
     */
    floorNotRecorded: 'Not recorded',
    groundFloor: 'Ground floor',
    floorSt: '{n}st floor',
    floorNd: '{n}nd floor',
    floorRd: '{n}rd floor',
    floorTh: '{n}th floor',

    workspace: {
      stepVehicle: 'Vehicle and driver',
      stepVehicleHint:
        'Find the lorry by its plate. Its vendor and assigned driver fill in; the driver can be changed for this trip alone.',
      stepChallans: 'Challans',
      stepChallansHint:
        'Add the challans going on this lorry. Trim a quantity, replace a model, add a product or split a challan across trips.',
      newTitle: 'New delivery',
      newDescription:
        'Choose the vehicle, confirm who drives it, then put the challans on the lorry. The trip is numbered under the vehicle’s vendor when you confirm.',
      editTitle: 'Edit {trip}',
      cannotEdit: '{trip} cannot be edited',
      completionDescription: '{trip} · {plate} · {driver} · {date}',
      vendorAndDate: '{vendor} · {date}',
      editDescription:
        'Correct the load, the delivery details or who drives it. The trip keeps its number and its vendor.',
      backToTrip: 'Back to the trip',
      notYours: 'Only the operator who created this trip, or an Admin or Manager, can change it.',
      leftTheGate:
        'It is {status}: the load has left the gate and the manifest is fixed. Move it back to Assigned to correct it.',
    },

    vehicle: {
      registrationNumber: 'Registration number',
      searchHint: 'Type the last digits on the plate — {digits} finds {plate}. Only vehicles that can take a trip are listed.',
      fillsIn: 'The vehicle’s vendor and its assigned driver fill in as soon as you choose it.',
      searchFailed: 'The vehicle search failed.',
      matchesAria: 'Matching vehicles',
      noMatch: 'No vehicle that can take a trip matches {query}.',
      unavailable: {
        one: '{n} matching vehicle cannot take a trip',
        other: '{n} matching vehicles cannot take a trip',
      },
      noDriverAssigned: 'No driver assigned',
      onTrip: 'On {trip}',
      heading: 'Vehicle',
      change: 'Change vehicle',
      keep: 'Keep {plate}',
      alreadyOn: 'Already on',
      cannotTakeTrip:
        'This vehicle cannot take a trip now. {reason} Choose another vehicle from the same vendor.',
    },

    driver: {
      heading: 'Driver',
      forThisTrip: 'Driver for this trip',
      assignedToVehicle: 'Assigned to this vehicle',
      mobile: 'Mobile',
      licence: 'Licence',
      notRecorded: 'Not recorded',
      change: 'Change driver',
      choose: 'Choose driver',
      addNew: 'Add new driver',
      useAssigned: 'Use {name}',
      chooseAnother: 'Choose another driver for this trip.',
      /** One sentence: the name, why they cannot drive, and what to do instead. */
      assignedButBlocked: '{name} is assigned to this vehicle but cannot drive — {reason} {advice}',
      noneAssigned:
        'This vehicle has no assigned driver. Choose who drives this trip, or add a new driver.',
      filterAria: 'Filter drivers',
      filterPlaceholder: 'Name, code, mobile or licence',
      noMatch: 'No active driver matches that.',
      vendorHasNone: '{vendor} has no active drivers.',
      activeAria: 'Active drivers',
      assigned: 'Assigned',
      normallyOn: 'Normally on {plate}',
      selected: 'Selected',
      photo: 'Photo',
      photoAria: 'Driver photo',
      choosePhoto: 'Choose a photo',
      chooseAnotherPhoto: 'Choose another',
      addedFor: 'This driver will work for {vendor} and drive this trip. A driver code is allocated automatically.',
      added: '{name} added as {code}',
      addedNote: 'They are driving this trip. The vehicle’s assigned driver is unchanged.',
      photoFailed: '{name} was added, but the photo did not upload',
      droveInPlace: 'Drove in place of {name}, the vehicle’s assigned driver.',
    },

    vendor: {
      heading: 'Vendor',
      mobile: 'Mobile',
      tripNumber: 'Trip number',
    },

    finder: {
      label: 'Find or scan a challan',
      hint: 'Challan number, SL, customer or receiver number. Scanning a printed challan’s barcode adds it straight away.',
      matchesAria: 'Matching challans',
      noMatch: 'No challan matches',
      sentInFull: 'Sent in full',
      add: 'Add',
      addAnyway: 'Add anyway',
      added: 'Added',
      alreadyOnTrip: '{challan} is on this trip',
      addChallan: 'Add {challan}',
      scannerReady: 'Barcode scanner ready',
      scannerPaused: 'Scanner paused while a dialog is open',
      alreadyOn: '{challan} is already on this trip',
      goneOutInFull: '{challan} has already gone out in full',
      onTrips: 'On {trips}.',
      addedNote: '{customer} · {pieces}',
      alsoWentOut: 'It also went out on {trips}.',
      tripOpenedNote: '{plate} · {driver}',
      addedToast: '{challan} added',
    },

    cart: {
      empty: 'No challans on this trip yet',
      emptyHint: 'No need to click anywhere first',
      challanAria: 'Challan {challan}',
      actionsAria: 'Actions for {challan}',
      detailsEdited: 'Details edited',
      editedFor: 'Changed for this trip: {fields}',
      changedForThisTrip: 'Changed for this trip:',
      addProduct: 'Add product',
      addBack: 'Add back {product}',
      moreFor: 'More for {label}',
      editProduct: 'Edit product',
      changeModel: 'Change model or product',
      removeProduct: 'Remove this product',
      removeFromBoth: 'Remove from trip and challan',
      editDetails: 'Edit delivery details',
      splitAcross: 'Split across trips',
      openChallan: 'Open the challan',
      correctChallan: 'Correct the filed challan',
      removeFromTrip: 'Remove from this trip',
      thanaWith: 'Thana:',
      /** "Customer (challan: Rahim Traders)" — one edited field, named. */
      editedField: '{label} (challan: {was})',
      blankValue: 'blank',
      where: 'Thana: {thana} · District: {district}',
    },

    party: {
      forThisTripOnly: 'Changes here are for this trip only. The filed challan keeps what it printed.',
      noteForDriver: 'Note for the driver',
      useChallanDetails: 'Use the challan’s details',
      saveForTrip: 'Save for this trip',
      customerRequired: 'Customer name is required',
      addressRequired: 'Delivery address is required',
      mobileInvalid: 'Enter a valid receiver mobile, for example 01712345678.',
    },

    line: {
      addTitle: 'Add a product',
      changeTitle: 'Change this line',
      addDescription: 'A line added to this trip.',
      replaceDescription:
        'The challan orders {product} {model} × {ordered}. A different product or model here is recorded as a replacement for it.',
      model: 'Model',
      productName: 'Product name',
      qtyOnTrip: 'Quantity on this trip',
      addButton: 'Add product',
      saveButton: 'Save line',
      productRequired: 'Product name is required',
      modelRequired: 'Model is required',
      qtyNotNumber: 'Quantity must be a number',
      qtyWhole: 'Quantity must be a whole number',
      qtyAtLeastOne: 'Quantity must be at least 1',
      qtyTooLarge: 'Quantity is too large',
      oneFewer: 'One fewer {label}',
      oneMore: 'One more {label}',
      qtyOf: 'Quantity of {label}',
      ordered: 'Ordered {n}',
    },

    split: {
      description:
        'Choose how much of each line this trip carries. The rest stays on the challan for a later trip, which is what makes this different from trimming a quantity on the card — that corrects the challan down to what went.',
      everythingLeft: 'Everything left',
      title: 'Split {challan}',
      mustCarrySomething:
        'This trip has to carry something from the challan. To send all of it later, remove the challan from this trip instead.',
      apply: 'Apply split',
    },

    summary: {
      panelAria: 'Delivery summary',
      heading: 'Delivery summary',
      noVehicle: 'No vehicle chosen yet',
      tripDate: 'Trip date',
      tripNote: 'Trip note',
      create: 'Create delivery',
      save: 'Save trip',
      createShort: 'Create',
      saveShort: 'Save',
      readyToConfirm: 'Ready to confirm',
      numberedOn: 'Numbered on confirmation as',
      split: 'Split',
      challansUpdated: 'Challans updated',
      detailsEdited: 'Details edited',
      linesChanged: 'Lines changed',
      overTheOrder: 'Over the order',
      chooseVehicle: 'Choose a vehicle.',
      chooseDriver: 'Choose the driver for this trip.',
      addChallan: 'Add at least one challan.',
      chooseDate: 'Choose the trip date.',
      vehicleBlocked: '{plate} cannot take a trip. {reason}',
      driverBlocked: '{name} is {status} and cannot drive.',
      wrongVendor: '{trip} is {vendor}’s trip',
      wrongVendorHint:
        'Choose one of their vehicles, or delete this trip and confirm a new one under {vendor}.',
    },

    confirm: {
      createTitle: 'Create this delivery?',
      saveTitle: 'Save {trip}?',
      createDescription:
        'The trip is assigned to {vendor} and numbered from their own serial. A number, once given, is never reused.',
      saveDescription:
        'The trip keeps its number. Every challan on it is re-read against the current paper.',
      backToCart: 'Back to the cart',
      confirmDelivery: 'Confirm delivery',
      saveTrip: 'Save trip',
    },

    overage: {
      title: 'More than the challan orders',
      goBack: 'Go back and adjust',
      sendAnyway: 'Send anyway',
    },

    created: {
      assignedTo: 'Trip assigned to {vendor}',
      saved: 'Trip saved',
      startAnother: 'Start another delivery',
      printManifest: 'Print manifest',
      openTrip: 'Open the trip',
    },

    dispatch: {
      panelAria: 'Dispatch',
      heading: 'Dispatch',
      nothingDelivered: 'Nothing on this challan has been delivered yet',
      cameBack: 'Came back',
      returnedStay: 'Returned goods stay on this challan and can go out on another trip.',
      correctedByDelivery: 'Corrected by a delivery',
      pdfShowsOriginal:
        'The attached PDF is what the office sent and still shows the original quantities.',
      confirmingUpdates: 'Confirming updates {challan} permanently',
      cannotBeAdded:
        'Anything cut or removed cannot be added to a later trip. To send the rest later, split the challan instead.',
      productSummary: 'Product Summary',
      totalProduct: 'Total product',
      challanQuantityAria: 'Challan quantity',
      challanPdf: 'Challan PDF',
      signedCopy: 'Signed copy',
      noSignedCopyYet: 'No signed copy has been filed yet',
      pdfLoadFailed: 'The challan PDF could not be loaded.',
    },

    completion: {
      heading: 'What happened to the goods?',
      radioAria: 'What happened to the goods',
      allDelivered: 'All delivered',
      allDeliveredHint: 'Nothing came back',
      someCameBack: 'Some came back',
      someCameBackHint: 'Choose what returned',
      fullReturn: 'Full challan returned',
      fullReturnHint: 'One click · no copy needed',
      setReturned: 'Set how many of each product came back on the lines above.',
      returnedStay: 'Returned goods stay on the challan for another trip.',
      saveReturns: 'Save returns',
      returnedInFull: 'Returned in full — delivery closed',
      saved: 'Saved',
      title: 'Complete delivery',
      notOnTrip: 'That challan is not on this trip',
      notOnTripHint:
        'It may have been taken off when the trip was corrected. Open the trip to see what it carries now.',
      openDelivery: 'Open the delivery',
      completeDelivery: 'Complete this delivery',
      leftOnChallan: 'Left on the challan for a later trip:',
    },

    extras: {
      heading: 'Floor, carrying & note',
      optional: 'Optional',
      floorLabel: 'Carried up to which floor',
      floorBlank: 'Blank if it never went up.',
      noteLabel: 'Delivery note',
      carrying: 'Carrying',
      carryingTotal: 'Carrying total',
      carryingWith: 'Carrying {amount}',
      saveDetails: 'Save details',
      floorOutOfRange: 'A floor has to be between 0 and {max}, or left blank.',
      detailsHeading: 'Details',
      total: 'Total',
      removeCharge: 'Remove this charge',
      firstCharge: 'A vehicle or labour was used',
      addAnother: 'Add another',
      chargeHint:
        'Only if something was hired to get the goods in. A charge of nothing is worth recording — it says the address needed help.',
    },

    copy: {
      heading: 'Signed copy',
      fallbackName: 'Signed copy',
      replace: 'Replace',
      removeAria: 'Remove the signed copy',
      scanNew: 'Scan the new copy',
      everythingCameBack: 'Everything came back, so no signed copy is needed. This delivery is closed.',
      completedWithout: 'Completed without the signed copy',
      noReason: 'No reason given.',
      quotedReason: '“{reason}”',
      foundIt: 'Found it? Scan the copy',
      waiting: 'Waiting for the signed copy.',
      scan: 'Scan signed copy',
      missingPrompt: 'Copy missing? Complete without it',
      missingTitle: 'Complete without the signed copy?',
      missingHint:
        'Only when the copy is lost. The delivery shows “{badge}”, and scanning the copy later replaces that mark.',
      missingBadge: 'Copy missing',
      whatHappened: 'What happened?',
      completeWithout: 'Complete without copy',
      viewerAlt: 'Signed copy for {challan}',
      loadFailed: 'The signed copy could not be loaded.',
      downloadFailed: 'That signed copy could not be downloaded.',
      filed: 'Signed copy filed',
      filedNote: 'This delivery is complete.',
      filedTripComplete: 'Every challan on {trip} has now been signed for.',
      removed: 'Signed copy removed',
      removedNote: 'The delivery is open again.',
      completedNote: 'Recorded without a signed copy. Scan it if it turns up.',
      completed: 'Delivery completed',
      reopened: 'The delivery is open again',
      filingCopy: 'Filing the copy…',
      stopScanning: 'Stop scanning',
      connectScanner: 'Connect the scanner',
      scanFromAria: 'Scan from',
      glass: 'Glass',
      feeder: 'Feeder',
    },

    receipt: {
      prompt: 'A signed copy came back, or a manifest in hand?',
      listening:
        'Scan anywhere on this page: a challan opens the delivery it belongs to, a manifest opens its trip.',
      paused: 'Close what is open to scan, or type the challan number.',
      placeholder: 'LBTS-CH-2026-000067',
      alreadyOpen: '{challan} is already open',
      openedOn: '{challan} on {trip}',
      tripAlreadyOpen: '{trip} is already open',
      tripOpened: '{trip} · {vendor}',
    },

    bill: {
      heading: 'Trip bill',
      notEntered: 'Not entered',
      tripRent: 'Trip rent (গাড়ি ভাড়া)',
      labourBill: 'Labour bill (লেবার বিল)',
      tripRentShort: 'Trip rent',
      labourBillShort: 'Labour bill',
      rent: 'Rent',
      labour: 'Labour',
      save: 'Save bill',
      saved: 'Trip bill saved',
    },

    trip: {
      printManifest: 'Print manifest',
      deleteTrip: 'Delete trip',
      deleting: 'Deleting…',
      deleteTitle: 'Delete {trip}?',
      deleteTitleGeneric: 'Delete trip?',
      deleteDescription:
        'Only a trip that has not been dispatched can be deleted. Every challan on it is released for another trip. The trip number is not reused — the vendor’s serial simply skips it.',
      deleted: 'Trip deleted',
      deletedNote: 'Every challan quantity it held is free for another trip.',
      actionsAria: 'Actions for {trip}',
      fileSignedCopy: 'File a signed copy',
      editTrip: 'Edit trip',
      notFound: 'Trip not found',
      loadFailed: 'Could not load this trip',
      deletedHint:
        'It may have been deleted before it left the gate, which releases every challan it carried.',
      assignedTo: 'Assigned to {vendor} · {date} · {plate} driven by {driver}',
      history: 'History',
      notYet: 'Not yet',
      note: 'Note',
      byAt: '{when} · {name}',
      forThisTripOnly: 'For this trip only',
    },

    list: {
      loadFailed: 'The trips could not be loaded',
      noMatches: 'No trip matches these filters',
      empty: 'No deliveries yet',
      filteredHint: 'Clear a filter or search for something else.',
      emptyHint:
        'A trip is created when a vehicle, its driver and the challans on it are confirmed.',
      createFirst: 'Create the first delivery',
      figuresFailed: 'The delivery figures could not be loaded.',
      tripsToday: 'Trips today',
      summaryFiltered: '{trips} match these filters · {challans} · {pieces}',
      summaryTotal: '{trips} · {challans} · {pieces}',
    },

    filters: {
      searchPlaceholder: 'Trip, plate, driver, vendor or challan',
      searchAria: 'Search trips',
      statusAria: 'Filter by status',
      anyStatus: 'Any status',
      vendorAria: 'Filter by vendor',
      everyVendor: 'Every vendor',
      fromAria: 'Trips from',
      untilAria: 'Trips until',
      noRent: 'No trip rent',
      noLabour: 'No labour bill',
    },

    table: {
      trip: 'Trip',
      date: 'Date',
      vehicle: 'Vehicle',
      driver: 'Driver',
      challans: 'Challans',
      tripRent: 'Trip rent',
      labourBill: 'Labour bill',
      status: 'Status',
      actions: 'Actions',
      total: 'Total',
    },

    /** The printed manifest — composed here, so it follows the reader. */
    manifest: {
      onTheLorry: 'On the lorry',
      where: 'Thana: {thana} · District: {district}',
      date: 'Date:',
      status: 'Status:',
      vehicle: 'Vehicle',
      vendor: 'Vendor',
      driver: 'Driver',
      sl: 'SL',
      customerAndDelivery: 'Customer and delivery',
      products: 'Products',
      qty: 'Qty',
      note: 'Note',
      tripNote: 'Trip note:',
      preparedBy: 'Prepared by',
      documentTitle: '{trip} — Trip manifest',
      brandLine: 'LBTS · Trip manifest',
      wholeTrip: 'Whole trip · {challans}',
      endOfManifest: 'End of manifest · {challans} · {pieces}',
      tripRent: 'Trip rent',
      labourBill: 'Labour bill',
    },
  },

  gatePass: {
    title: 'Gate Pass',
    pageDescription:
      'Every gate pass recorded against a trip, with the scanned hard copy attached to it.',
    listAria: 'Gate pass records',
    newGatePass: 'New gate pass',
    correctGatePass: 'Correct gate pass',
    allGatePasses: 'All gate passes',
    backToList: 'Back to gate passes',
    notFound: 'Gate pass not found',
    notFoundHint: 'It may have been deleted, or you may not have access to it.',
    somethingWrong: 'Something went wrong.',
    hasDocument: 'Has a scanned document',

    statuses: {
      Draft: { label: 'Draft', description: 'Being prepared. Not yet part of the record.' },
      Submitted: {
        label: 'Submitted',
        description: 'Awaiting verification against the physical document.',
      },
      Verified: {
        label: 'Verified',
        description: 'Checked against the scanned gate pass and accepted.',
      },
      Rejected: {
        label: 'Rejected',
        description: 'Sent back for correction. Fix it and submit again.',
      },
      unknown: { label: 'Unknown', description: 'Unrecognised status' },
    },

    referenceTypes: {
      None: 'No reference',
      Zone: 'Zone',
      PO: 'PO',
    },
    /** "Zone CSD-07" and "PO 627143140" — the value follows the word in both. */
    zoneWith: 'Zone {value}',
    poWith: 'PO {value}',

    columns: {
      tripDate: 'Trip Date',
      delivery: 'Delivery Status',
      csd: 'CSD',
      unit: 'Unit',
      vehicle: 'Vehicle',
      customer: 'Customer',
      product: 'Product',
      model: 'Model',
      qty: 'QTY',
      status: 'Status',
      tripDo: 'Trip Do',
      actions: 'Actions',
    },

    /** "Refrigerator (WCF-1D5) +2 more" — a load in one line. */
    itemSummary: '{product} ({model})',
    itemSummaryMore: '{product} ({model}) +{count} more',

    stats: {
      today: 'Today’s gate passes',
      todayHint: 'Trips dated today',
      submitted: 'Awaiting verification',
      submittedHint: 'Submitted, not yet checked',
      verified: 'Verified',
      verifiedHint: 'Checked against the scan',
      rejected: 'Sent back',
      rejectedHint: 'Waiting on a correction',
      loadFailed: 'The gate pass overview could not be loaded.',

      delivered: 'Delivered Qty',
      notDelivered: 'Not Delivered Qty',
      pcs: 'pcs',
      deliveredHint: '{percent} of {total} pcs {scope}',
      notDeliveredHint: '{percent} still to deliver, or not on a challan yet',
      scopeFiltered: 'on the gate passes these filters match',
      scopeAll: 'on every gate pass',

      recordCount: { one: '{n} gate pass', other: '{n} gate passes' },
      summaryFiltered: '{records} match these filters',
      summaryTotal: '{records} on record',
      /** "3/5 delivered" on a sheet row. */
      deliveredOf: '{delivered}/{total} delivered',
    },

    list: {
      loading: 'Loading gate passes',
      loadFailed: 'Could not load gate passes',
      retrying: 'Retrying…',
      noneFound: 'No gate passes found',
      noneYet: 'No gate passes yet',
      filteredHint: 'No gate pass records match your current filters.',
      emptyHint: 'Scan a hard copy and record its details, and it will appear here.',
    },

    filters: {
      searchPlaceholder: 'Gate pass, DO, customer, vehicle, model',
      searchAria: 'Search gate passes',
      dateFrom: 'Trip date from',
      dateTo: 'Trip date to',
      bill: 'Bill',
      referenceType: 'Reference type',
      any: 'Any',
      reference: 'Zone or PO',
      referencePlaceholder: 'CSD-07 or 627143140',
      createdBy: 'Created by',
      onlyMine: 'Only mine',
      everyone: 'Everyone',
      /** The custom range chip, where either end may still be unset. */
      customRange: '{from} to {to}',
      unset: '…',
    },

    /** The entry form, in the order the values appear on a Walton challan. */
    sections: {
      trip: 'Trip',
      tripHint: 'The delivery order and where it left from.',
      delivery: 'Delivery',
      deliveryHint: 'Who the goods are going to, and what is carrying them.',
      reference: 'Reference',
      referenceHint: 'Optional. Filed against a zone or a purchase order.',
      goods: 'Goods',
      goodsHint: 'What is on the vehicle. Add a row for each product on the challan.',
    },

    fields: {
      tripDo: 'Trip DO',
      tripDoHint: 'Exactly as printed. Punctuation and spacing are kept.',
      tripDate: 'Trip date',
      csd: 'CSD',
      unit: 'Unit',
      customerName: 'Customer name',
      vehicleNo: 'Vehicle number',
      vehicleHint: 'Typed in capitals. Spacing and punctuation are kept as printed.',
      referenceType: 'Reference type',
      zone: 'Zone',
      po: 'PO number',
      noReference: 'This gate pass is not filed against a zone or a PO.',
      productName: 'Product name',
      model: 'Model',
      qty: 'Qty',
      productIndex: 'Product {n}',
      removeProduct: 'Remove product {n}',
      addProduct: 'Add another product',
      maxProducts: 'That is as many products as one gate pass can carry.',
      /** "3 rows · 12 total" under the product list. */
      rowTotal: '{rows} · {total} total',
    },

    /**
     * What the last gate pass left. One fixed list rather than a join: the
     * order and the "and" are English's, and a locale that writes a list
     * differently needs the whole sentence, not a separator.
     */
    carry: {
      fields: 'Trip date, CSD, Unit, Customer name and Vehicle number',
      sameAsLast: 'Same as last',
      banner:
        '{fields} from {source} are shown above their boxes. Tick “{tick}” on any that match this sheet; the rest stay empty until you type them.',
    },

    footer: {
      documentAttached: 'Document attached',
      documentRequired: 'A scanned document is required to submit.',
      attachedSr: 'A scanned document is attached.',
      noDocumentSr: 'No scanned document yet.',
      saveDraft: 'Save draft',
      blocked:
        'Join the {n} scanned sheets into one document first, or remove the ones that do not belong.',
    },

    submit: {
      gatePass: 'Submit gate pass',
      sheetOf: 'Submit sheet {position} of {total}',
      saveReverify: 'Save and re-verify',
      saveChanges: 'Save changes',
      resubmit: 'Resubmit',
    },

    workspace: {
      newHint: 'Scan the whole stack in one pass, then enter each sheet against the image beside it.',
      correctHint: '{gatePass} · check every field against the scan, then {verb}.',
      verbSave: 'save the correction',
      verbSubmit: 'submit',
      verifiedTitle: 'This gate pass has been verified.',
      verifiedBody:
        'That verification was against what it says now, so saving a correction — to the values or to the scan — returns it to a reviewer to be checked again.',
      savedAt: 'Saved {time}',
      detailsAria: 'Gate pass details',
      backToDetails: 'Back to the details',
      tabsAria: 'Gate pass workspace',
      tabDetails: 'Details',
      tabScan: 'Scan',
    },

    scanner: {
      panelAria: 'Scanner and document',
      source: 'Source',
      flatbed: 'Flatbed glass',
      feeder: 'Document feeder',
      resolution: 'Resolution',
      dpi: '{n} dpi',
      colour: 'Colour',
      colorModes: {
        color: 'Colour',
        grayscale: 'Greyscale',
        blackwhite: 'Black & white',
      },
      stop: 'Stop scanning',
      scan: 'Scan gate pass',
      fileRejected: 'That file cannot be used',
      bothSources: 'flatbed and feeder',
      page: 'page {n}',
      emptyDealt: 'Every scanned sheet has been dealt with. Scan the next stack, or attach a file.',
      emptyNone: 'No gate pass document yet. Put the stack in the feeder and scan, or attach a file.',
      readyToFile: 'Ready to file',
      pageCount: { one: '{n} page', other: '{n} pages' },
      sheetsJoined: { one: '{n} sheet joined', other: '{n} sheets joined' },
    },

    tray: {
      ariaLabel: 'Scanned sheets',
      sheetsScanned: { one: '{n} sheet scanned', other: '{n} sheets scanned' },
      savedAsOne: 'Saved as one document',
      filedOf: '{filed} of {total} filed',
      filedOfToGo: '{filed} of {total} filed · {remaining} to go',
      selectSheets: 'Select sheets',
      theseAreOne: 'These are one gate pass',
      clearAll: 'Clear all',
      pickHint:
        'Tick the sheets that are one gate pass. Join them into a single document, in the order they were scanned — or remove the ones that do not belong.',
      remove: 'Remove',
      removeCount: 'Remove {n}',
      joinSheets: 'Join sheets',
      joinCount: 'Join {n} sheets',
      joining: 'Joining…',
      oneDocument:
        'This gate pass holds one document. Join these {n} sheets into one, or remove the ones that do not belong.',
      joinAll: 'Join all {n}',
      showingSheet: 'Showing sheet {position} of {total}',
      enteringSheet: 'Entering sheet {position} of {total}',
      separate: 'Separate again',
      skip: 'Skip this sheet',
      discard: 'Discard',
      sheetStatuses: {
        pending: 'Not entered yet',
        submitted: 'Submitted',
        draft: 'Saved as a draft',
        skipped: 'Skipped',
      },
      tileSheet: 'Sheet {n}',
      tileJoined: '{sheets} into one gate pass · {status}',
      tileDescription: 'Sheet {n} · {status}',
      tileAlreadyFiled: ' · already filed, cannot be joined',
    },

    batch: {
      ariaLabel: 'Batch complete',
      filedOf: '{filed} of {total} sheets filed',
      allFiled: 'Every scanned sheet is now a gate pass.',
      skippedNote: {
        one: '{n} sheet was skipped and not recorded.',
        other: '{n} sheets were skipped and not recorded.',
      },
      sheetN: 'Sheet {n}',
      skipped: 'Skipped',
      notEntered: 'Not entered',
      draft: 'draft',
      open: 'Open',
      viewAll: 'View all gate passes',
      scanNext: 'Scan the next stack',
    },

    viewer: {
      loading: 'Loading the scanned document…',
      loadFailed: 'The document could not be loaded',
      empty: 'No gate pass document scanned yet.',
      scannedTitle: 'Scanned gate pass',
      scannedAria: 'Scanned document',
      scannedHint: 'The original hard copy, as it was scanned.',
      noDocument: 'This gate pass has no scanned document.',
      scanItNow: 'Scan it now',
      pdfDocument: 'PDF document',
      pdfHint: ' · use the viewer controls to page and zoom',
      fit: 'Fit',
      zoomIn: 'Zoom in',
      zoomOut: 'Zoom out',
      rotateLeft: 'Rotate left',
      rotateRight: 'Rotate right',
      fullscreen: 'Fullscreen',
      exitFullscreen: 'Exit fullscreen',
      rescan: 'Rescan',
      removeDocument: 'Remove document',
      loadingRecord: 'Loading the gate pass',
    },

    duplicate: {
      titleOne: 'This Trip DO is already on a gate pass',
      titleMany: 'This Trip DO is already on {n} gate passes',
      description:
        'Check whether this is the same trip before you submit. Your work is saved as a draft either way.',
      matchedTripDo: 'Same Trip DO',
      moreItems: '+{n} more',
      view: 'View',
      goBack: 'Go back and check',
      submitting: 'Submitting…',
      submitAnyway: 'This is a different trip — submit',
    },

    review: {
      verifyTitle: 'Verify this gate pass',
      verifyDescription: 'Confirm that {gatePass} matches the scanned document in every detail.',
      verifyConfirm: 'Verify',
      verifyNoteLabel: 'Note (optional)',
      verifyNotePlaceholder: 'Anything worth recording about this check',
      rejectTitle: 'Send back for correction',
      rejectDescription: '{gatePass} returns to its author, who can fix it and submit it again.',
      rejectConfirm: 'Send back',
      rejectNoteLabel: 'What needs correcting',
      rejectNotePlaceholder: 'Vehicle number does not match the challan',
      noteHint: 'The author sees this, so say what to change.',
      working: 'Working…',
      reviewerNote: 'Note from the reviewer:',
    },

    remove: {
      title: 'Delete {gatePass}?',
      draftBody:
        'This draft and its scanned document are removed permanently. Nothing that has been submitted is affected.',
      filedBody:
        'This {status} gate pass and its scanned document are removed permanently, and it leaves every list and count it appears in. This cannot be undone.',
      keepIt: 'Keep it',
      deleteDraft: 'Delete draft',
      deleteGatePass: 'Delete gate pass',
      deleting: 'Deleting…',
    },

    exportDialog: {
      title: 'Export {records}?',
      filteredBody:
        'The {records} matching these filters download as an Excel file — {qty} total qty between them.',
      allBody:
        'Every gate pass on record downloads as an Excel file — {records}, {qty} total qty between them.',
      lineNote:
        'Each product line is its own row, so a gate pass carrying more than one product appears more than once.',
      building: 'Building…',
      confirm: 'Export',
      trigger: 'Export',
    },

    menu: {
      aria: 'Actions for {gatePass}',
      view: 'View details',
      download: 'Download document',
      print: 'Print gate pass',
      verify: 'Verify',
      sendBack: 'Send back',
    },

    detail: {
      /** "Rahim Traders · created 3 Sep 2026 by Karim". */
      created: '{customer} · created {when}',
      createdBy: '{customer} · created {when} by {name}',
      printWaiting: 'Waiting for the scan',
      trip: 'Trip',
      delivery: 'Delivery',
      goods: 'Goods',
      reference: 'Reference',
      document: 'Document',
      history: 'History',
      customer: 'Customer',
      vehicle: 'Vehicle',
      product: 'Product',
      model: 'Model',
      total: 'Total',
      type: 'Type',
      value: 'Value',
      file: 'File',
      size: 'Size',
      pages: 'Pages',
      scanned: 'Scanned',
      pdf: 'PDF',
      image: 'Image',
      noneAttached: 'No scanned document attached',
      created_: 'Created',
      submitted: 'Submitted',
      lastChange: 'Last change',
      lastEdited: 'Last edited',
      /** "3 Sep 2026 · Karim" — a moment and who caused it. */
      byPerson: '{when} · {name}',
    },

    stages: {
      saving: 'Saving gate pass…',
      uploading: 'Uploading document…',
      finalizing: 'Finalising…',
      coldStart: 'The server may take a moment to wake up. Nothing is lost if this is slow.',
    },

    toasts: {
      preparing: 'Preparing the document…',
      documentDownloaded: 'Document downloaded',
      buildingSpreadsheet: 'Building the spreadsheet…',
      spreadsheetDownloaded: 'Spreadsheet downloaded',
      verified: 'Gate pass verified',
      sentBack: 'Gate pass sent back for correction',
      deleted: '{gatePass} was deleted',
      draftSaved: 'Draft saved',
      draftSavedNote: '{gatePass} is saved. You can finish it later.',
      sentBackForVerification: 'Sent back for verification',
      reverifyNote: '{gatePass} returns to a reviewer, because what was verified has changed.',
      changesSaved: 'Changes saved',
      upToDate: '{gatePass} is up to date.',
      scanFirst: 'Scan the gate pass first',
      scanFirstNote: 'A submitted gate pass has to carry its scanned document.',
      nothingToPrint: 'This gate pass has no scanned document to print.',
      scanLoadFailed: 'The scan could not be loaded, so there is nothing to print.',
      sheetsJoined: { one: '{n} sheet joined', other: '{n} sheets joined' },
      sheetsJoinedNote: {
        one: 'It is now one {pages}-page document, filed as one gate pass.',
        other: 'They are now one {pages}-page document, filed as one gate pass.',
      },
      joinFailed: 'Those sheets could not be joined. Remove one, or scan the challan as a single PDF.',
      /** The one reported field under an error message. */
      errorDetail: '{path}: {message}',
    },

    documentRules: {
      hint: 'PDF up to 25 MB, or JPG, PNG, WEBP up to 10 MB',
      wrongType: 'That file type is not supported. Use a PDF, JPG, PNG or WEBP.',
      emptyFile: 'That file is empty. Choose a different file.',
      tooLarge: 'That file is {size}. The limit is {limit}.',
      imageUnreadable: '{file} could not be read as an image.',
      pdfUnreadable: '{file} is not a readable PDF.',
      unopenable: '{file} could not be opened. It may be damaged.',
      needTwoSheets: 'Choose at least two sheets to join.',
      imageConvertFailed: 'This browser could not convert that image. Scan it as a PDF.',
    },

    validation: {
      tripDoRequired: 'Trip DO is required',
      tripDoTooLong: 'Trip DO must be 60 characters or fewer',
      csdRequired: 'CSD is required',
      csdTooLong: 'CSD must be 24 characters or fewer',
      unitRequired: 'Unit is required',
      unitTooLong: 'Unit must be 24 characters or fewer',
      modelRequired: 'Model is required',
      modelTooLong: 'Model must be 80 characters or fewer',
      vehicleRequired: 'Vehicle number is required',
      vehicleTooLong: 'Vehicle number must be 60 characters or fewer',
      productTooShort: 'Product name must be at least 2 characters',
      productTooLong: 'Product name must be 160 characters or fewer',
      qtyRequired: 'Quantity is required',
      qtyWhole: 'Quantity must be a whole number',
      qtyAtLeastOne: 'Quantity must be at least 1',
      qtyTooLarge: 'Quantity looks too large. Check the challan.',
      tripDateRequired: 'Trip date is required',
      tripDateInvalid: 'Enter a valid date',
      tripDateOutOfRange: 'That date is outside the range this system records',
      customerTooShort: 'Customer name must be at least 2 characters',
      customerTooLong: 'Customer name must be 160 characters or fewer',
      vehicleTooShort: 'Vehicle number must be at least 3 characters',
      itemsAtLeastOne: 'Add at least one product',
      itemsTooMany: 'A gate pass can carry at most 50 products',
      zoneTooLong: 'Zone must be 60 characters or fewer',
      poTooLong: 'PO must be 60 characters or fewer',
      zoneRequired: 'Enter the zone.',
      poRequired: 'Enter the PO number.',
      noteTooLong: 'Note must be 400 characters or fewer',
    },
  },

  /**
   * The Trip DO sheet — one row per challan product line.
   *
   * The column headings are the office's own spreadsheet headings, and they are
   * translated here because this is the **screen**. The `.xlsx` export is built
   * on the server and keeps the English headings the office sends out, which is
   * the right split: a file that leaves the building should read the way the
   * business writes, and a screen should read the way its operator does.
   */
  tripDo: {
    title: 'Trip DO',
    description:
      'Every challan product line on a row of its own, with returns and re-sends beneath it. Set the Trip DO a row came out on — split the quantity when a line came out on more than one — and the gate pass supplies its CSD and unit, and shows where its goods are.',
    sheetAria: 'Trip DO sheet',
    setTripDo: 'Set Trip DO',
    openSheet: 'Open sheet',
    unitWith: 'Unit {unit}',
    changeTripDo: 'Change Trip DO',
    notSet: 'Not set',
    noModel: 'No model',
    pending: 'Pending',

    columns: {
      date: 'Date',
      trip: 'Trip Number',
      status: 'Delivery Status',
      customer: 'Customer',
      address: 'Address',
      district: 'District',
      thana: 'Thana',
      location: 'Location',
      receiver: 'Receiver number',
      zone: 'Zone',
      product: 'Product name',
      model: 'Model',
      qty: 'Qty',
      rate: 'Rate',
      amount: 'Amount',
      capacity: 'Capacity',
      csd: 'CSD',
      unit: 'Unit',
      bill: 'Bill',
      tripDo: 'Trip Do',
    },

    rowStatuses: {
      Pending: { label: 'Not dispatched', description: 'Filed, and on no trip yet.' },
      Partial: { label: 'Partly sent', description: 'Split across trips, with something still to go.' },
      Dispatched: { label: 'Sent', description: 'Out of the gate; the signed copy is not back yet.' },
      Delivered: { label: 'Delivered', description: 'Every trip carrying it has its signed copy in.' },
      Returned: { label: 'Returned', description: 'Went out and came back; waiting at the depot.' },
    },

    gatePassStatuses: {
      Unlinked: {
        label: 'No challan yet',
        description: 'No challan row has this gate pass as its Trip DO.',
      },
      Returned: {
        description: 'A linked return is back at the depot, and nothing linked has taken it out again.',
      },
      Resent: {
        label: 'Re-sent',
        description: 'Returned pieces have gone out again on a later trip; not all signed for yet.',
      },
    },

    kinds: {
      Order: { label: 'Order', description: 'A product line as the challan orders it.' },
      Return: { label: 'Return', description: 'Pieces that went out on this trip and came back.' },
      Resent: { label: 'Re-sent', description: 'Pieces that had come back and this trip took out again.' },
    },

    filters: {
      kindAll: 'Every row',
      kindOrder: 'Order rows',
      kindReturn: 'Returns',
      kindResent: 'Re-sends',
      linkAll: 'Any Trip DO',
      linkLinked: 'Trip DO set',
      linkUnlinked: 'Waiting for Trip DO',
      statusAll: 'Any delivery status',
      tripDoAria: 'Filter by Trip DO',
      kindAria: 'Filter by row type',
      searchPlaceholder: 'SL, challan, customer, phone, model, Trip DO or trip',
      searchAria: 'Search the Trip DO sheet',
    },

    overview: {
      rows: 'Rows on the sheet',
      linked: 'Trip DO set',
      waiting: 'Waiting for Trip DO',
      returns: 'Returns & re-sends',
    },

    directory: {
      loading: 'Loading the Trip DO sheet',
      loadFailed: 'Could not load the sheet',
      retrying: 'Retrying…',
      noRows: 'No rows match',
      empty: 'The sheet is empty',
      filteredHint: 'No challan product line, return or re-send matches the current filters.',
      emptyHint:
        'Every product line of every filed challan appears here on its own. File a challan and its lines arrive on the sheet, ready for a Trip DO.',
    },

    assign: {
      chooseGatePass: 'Choose the gate pass these goods came out on.',
      linkAtLeastOne: 'Link at least one piece.',
      alreadySet: 'This is already the Trip DO.',
      searchPlaceholder: 'Trip DO, gate pass number or vehicle',
      searchAria: 'Find a gate pass',
      saving: 'Saving…',
      setWith: 'Set Trip DO {tripDo}',
      noOffer: 'No gate pass to offer',
      gatePassesAria: 'Gate passes',
      returnsNote: 'Returned and re-sent pieces do not use up the gate pass',
      howMany: 'How many came out on this Trip DO?',
      oneFewer: 'One fewer',
      oneMore: 'One more',
      piecesAria: 'Pieces on this Trip DO',
      tickedRows: 'Ticked rows',
      current: 'Current',
      sameAsOrder: 'Same as order row',
      chooseGatePassLong:
        'Choose the gate pass these goods came out on. Its CSD and unit are set on the row with it.',
      tickRows: 'Tick the rows that came out on one gate pass.',
      differentModels:
        'The ticked rows carry different models. A Trip DO is set on one gate pass line at a time.',
    },

    split: {
      title: 'Split quantity',
      description: 'Each part can then be given its own Trip DO.',
      evenlyInto: 'Evenly into',
      splitting: 'Splitting…',
      splitInto: 'Split into {parts}',
      addPart: 'Add part',
      atLeastTwo: 'A split needs at least two parts.',
      everyPart: 'Every part needs at least one piece.',
      tooManyParts: 'Split into at most {max} parts.',
      stillToPlace: '{short} still to place — the parts add up to {sum} of {total}.',
      tooMany: '{over} too many — the parts add up to {sum} of {total}.',
    },

    gatePassPanel: {
      heading: 'Challans on this Trip DO',
      description: 'Where the goods on this gate pass went, as the challans say.',
      loadFailed: 'The linked challans could not be loaded.',
      noneYet: 'No challan row has this line as its Trip DO yet.',
    },

    sheet: {
      tickAll: 'Tick every row on this page',
      sl: 'SL',
    },

    rowMenu: {
      openBill: 'Open {bill}',
      splitQuantity: 'Split quantity',
      mergeParts: 'Merge parts back',
      removeTripDo: 'Remove Trip DO',
      openChallan: 'Open challan',
      openGatePass: 'Open gate pass',
    },

    option: {
      leftOf: 'left of {total}',
      onGatePass: 'on gate pass',
      onlyLeft: 'Only {qty} {model} left on this gate pass.',
    },

    remove: {
      keep: 'Keep it',
      removing: 'Removing…',
      confirm: 'Remove Trip DO',
      removed: 'Trip DO removed',
      removedNote:
        'The row is waiting for a Trip DO again, merged with any other waiting part of the line.',
      mergedBack: 'Parts merged back into {qty}',
      nothingToMerge: 'Nothing to merge',
      partsApart: 'The other parts of this line carry a different Trip DO, so they stay apart.',
    },

    export: {
      building: 'Building…',
      download: 'Download .xlsx',
      exporting: 'Exporting…',
      exportExcel: 'Export Excel',
      buildingToast: 'Building the spreadsheet…',
      downloaded: 'Spreadsheet downloaded',
    },
  },

  /**
   * Activity Logs — the journal every module writes through.
   *
   * **A row's own summary is not here.** Every sentence in the journal was
   * written by the service that recorded it and stored on the row, because an
   * audit row is a statement about a moment that has to still read in two
   * years — translating it now would mean rewriting history at read time. What
   * is translatable is the vocabulary around it: which module, what kind of
   * change, how much it matters.
   */
  activity: {
    title: 'Activity Logs',
    description:
      'Every change the system records, in one place: what happened, which record it touched, and who did it. Rows are written by the system as people work and can never be edited or removed from here — that is what makes it worth reading.',
    /**
     * A row with no actor. Nothing invents a name here: a made-up "System" in
     * an audit log is the one thing this collection must never contain, and
     * that holds in every language.
     */
    noActor: 'No actor recorded',

    modules: {
      Administration: 'Administration',
      Vendor: 'Vendor',
      Delivery: 'Delivery',
      'Gate Pass': 'Gate Pass',
      Challan: 'Challan',
      Location: 'Location',
      'Product Rate': 'Product Rate',
      'Excel Bill': 'Excel Bill',
      'Labour Bill': 'Labour Bill',
      Accounts: 'Accounts',
      unknown: 'Activity',
    },

    categories: {
      create: 'Created',
      update: 'Corrected',
      status: 'Status',
      delete: 'Deleted',
      access: 'Access',
      money: 'Money',
      document: 'Document',
      unknown: 'Change',
    },

    severities: {
      info: 'Routine',
      notice: 'Notable',
      critical: 'Critical',
    },

    entities: {
      User: 'Account',
      Vendor: 'Vendor',
      Vehicle: 'Vehicle',
      Driver: 'Driver',
      Assignment: 'Assignment',
      Document: 'Document',
      Trip: 'Trip',
      GatePass: 'Gate pass',
      Challan: 'Challan',
      Location: 'Location',
      ProductRate: 'Product rate',
      Bill: 'Excel bill',
      LabourBill: 'Labour bill',
      AccountsEntry: 'Accounts entry',
    },

    overview: {
      recorded: 'Events recorded',
      mostIn: 'Most in {module} · {count}',
      noMatches: 'Nothing matches these filters',
      today: 'Today',
      lastSevenDays: '{n} in the last seven days',
      critical: 'Critical',
      criticalHint: 'Deletions, access and money corrections',
      people: 'People',
      busiest: 'Busiest: {name} · {count}',
      nobody: 'Nobody in this range',
    },

    timeline: {
      loadFailed: 'The journal could not be read',
      noMatchesTitle: 'Nothing matches these filters',
      noMatchesBody:
        'No event in the journal answers this combination. Widen the date range, or clear the filters and start again.',
      emptyTitle: 'Nothing recorded yet',
      emptyBody:
        'The journal fills itself as people work — a gate pass filed, a rate corrected, an account approved. Nothing has been written to it yet.',
      emptyFootnote: 'Rows are appended by the system. Nothing can be added here by hand.',
      feedEmptyTitle: 'Nothing recorded yet',
      feedEmptyBody: 'Changes appear here as people make them.',
    },

    trend: {
      heading: 'Last 14 days',
      caption: 'Events per day over the last fourteen days',
    },

    detail: {
      touched: 'What it touched',
      doneBy: 'Done by',
      when: 'When',
      changed: 'What changed',
      reference: 'Reference',
      action: 'Action',
      eventId: 'Event id',
      recordId: 'Record id',
    },

    toolbar: {
      searchPlaceholder: 'What happened, which record, or who',
      searchAria: 'Search the journal',
      moduleAria: 'Filter by module',
      everyModule: 'Every module',
      fromDate: 'From date',
      toDate: 'To date',
      categoryAria: 'Filter by kind of change',
      anyCategory: 'Any kind of change',
      severityAria: 'Filter by how much it matters',
      anySeverity: 'Any importance',
      actionAria: 'Filter by exact action',
      anyAction: 'Any action',
      entityAria: 'Filter by record type',
      anyEntity: 'Any record',
      actorAria: 'Filter by who did it',
      anyone: 'Anyone',
    },

    export: {
      title: 'Export the activity journal?',
      /**
       * One sentence rather than six fragments stitched together in JSX. The
       * original assembled a count, an optional "covering N people", a clause
       * that changed with the filters and an optional critical tail — an order
       * that is English's alone. Each variant is its own message now, and the
       * component picks one.
       */
      bodyFiltered: '{events} match the filters in force. One row per event, with what changed in a single column.',
      bodyAll: '{events} — the whole journal, unfiltered. One row per event, with what changed in a single column.',
      events: { one: '{n} event', other: '{n} events' },
      covering: { one: 'covering {n} person', other: 'covering {n} people' },
      criticalNote: {
        one: '{n} of them is critical — deletions, access changes and money corrections.',
        other: '{n} of them are critical — deletions, access changes and money corrections.',
      },
      warning: 'The file is a copy of the audit trail, so treat it as one.',
      building: 'Building…',
      download: 'Download spreadsheet',
      buildingToast: 'Building the spreadsheet…',
      exported: 'Activity exported',
    },
  },

  /**
   * Administration — the account directory and the lifecycle around it.
   *
   * The `actions` branch is shaped like `USER_ACTIONS` in
   * `administration-actions.ts`, key for key, because that table still owns the
   * icon, the colour, the target status and the two flags. What moved here is
   * every word it used to carry, including the three sentences that were
   * functions of a name — they are `{name}` interpolations now, which is what
   * lets Bangla put the name where Bangla puts it.
   */
  administration: {
    title: 'Administration',
    subtitle: 'Manage users, roles and account access.',
    adminOnly: 'Admin only',
    you: 'You',
    joined: 'Joined {date}',
    viewDetails: 'View details',
    changeRole: 'Change role',
    actionsFor: 'Actions for {name}',
    cannotChangeSelf: 'You cannot change your own role or account status. Ask another Admin.',

    stats: {
      overviewFailed: 'The account overview could not be loaded.',
      total: { label: 'Total users', hint: 'Every account on record' },
      pending: { label: 'Pending approval', hint: 'Waiting on a decision' },
      active: { label: 'Active users', hint: 'Approved and able to sign in' },
      suspended: { label: 'Suspended', hint: 'Access withdrawn' },
    },

    filters: {
      searchPlaceholder: 'Search by name or email',
      searchAria: 'Search users',
      roleAria: 'Filter by role',
      statusAria: 'Filter by account status',
      allRoles: 'All roles',
      allStatus: 'All status',
    },

    directory: {
      loading: 'Loading users',
      noneFound: 'No users found',
      noneYet: 'No accounts yet',
      filteredHint: 'Try changing your search or filters.',
      emptyHint:
        'Accounts appear here as soon as someone signs up. Every new account arrives pending your approval.',
      clearFilters: 'Clear filters',
      loadFailed: 'Could not load users',
      retrying: 'Retrying…',
      pagesAria: 'User list pages',
    },

    table: {
      user: 'User',
      email: 'Email',
      role: 'Role',
      accountStatus: 'Account status',
      created: 'Created',
      actions: 'Actions',
    },

    details: {
      srTitle: 'Account details',
      srDescription: 'Role, account status and history for {name}.',
      email: 'Email',
      emailVerified: 'Email verified',
      emailNotVerified: 'Email not verified',
      accountCreated: 'Account created',
      lastSignIn: 'Last sign-in',
      neverSignedIn: 'Never signed in',
      lastChange: 'Last administrative change',
      noChanges: 'No administrative changes recorded',
      roleSetTo: 'Role set to {role} {when}',
      roleSetToBy: 'Role set to {role} {when} by {actor}',
      markedStatus: 'Marked {status} {when}',
      markedStatusBy: 'Marked {status} {when} by {actor}',
      ownAccount: 'This is your own account. Another Admin has to change your role or status.',
    },

    role: {
      title: 'Change role',
      description:
        'A role decides who someone is to the business. What each role may do inside a module is configured by that module.',
      selectAria: 'Select a role',
      current: 'current',
      linkedVendor: 'Linked vendor',
      chooseVendor: 'Choose a vendor',
      vendorScopeNote:
        "This account will see that vendor's fleet, drivers, assignments and documents — read-only, and nothing belonging to any other vendor.",
      noVendors: 'No vendors exist yet. Add one on the Vendors page before linking an account to it.',
      summary: "You're changing this user's role from {from} to {to}.",
      adminWarning:
        'Admin grants full access to Administration, including the ability to change every other account.',
      vendorUnlinkWarning:
        'The link to {vendor} is cleared, so this account will no longer see any vendor’s records.',
      theirVendor: 'their vendor',
      confirm: 'Confirm change',
    },

    confirm: {
      reasonLabel: 'Reason (optional)',
      reasonPlaceholder: 'Recorded on the account, visible to administrators.',
      working: 'Working…',
    },

    actions: {
      approve: {
        label: 'Approve',
        confirmLabel: 'Approve account',
        title: 'Approve this account?',
        body: '{name} will be able to sign in and use LBTS with their assigned role.',
        success: "{name}'s account was approved",
      },
      reject: {
        label: 'Reject',
        confirmLabel: 'Reject account',
        title: 'Reject this account?',
        body: '{name} will be refused access. The account stays on record, and an Admin can approve it later.',
        success: "{name}'s account was rejected",
      },
      suspend: {
        label: 'Suspend',
        confirmLabel: 'Suspend account',
        title: 'Suspend this account?',
        body: '{name} will lose access immediately and cannot sign in until the account is reactivated.',
        success: "{name}'s account was suspended",
      },
      reactivate: {
        label: 'Reactivate',
        confirmLabel: 'Reactivate account',
        title: 'Reactivate this account?',
        body: '{name} will regain access to LBTS with their current role.',
        success: "{name}'s account was reactivated",
      },
      delete: {
        label: 'Delete',
        confirmLabel: 'Delete user',
        title: 'Delete this user?',
        body: "This permanently removes {name}'s account from LBTS and from the sign-in provider. This action cannot be undone.",
        success: "{name}'s account was deleted",
      },
    },
  },

  /**
   * The office's money.
   *
   * The vocabulary comes first, because eight kinds of entry are what every
   * screen in this module is a view of. `kinds.*` carries three words for each
   * — what it is, what the button that makes one says, and what it means — and
   * `accounts-meta.ts` keeps the icon and the colour beside them.
   */
  accounts: {
    title: 'Accounts',
    sectionsAria: 'Accounts sections',
    filters: {
      searchAria: 'Search by number, person, vendor, trip, reference or note',
      directionAria: 'Direction',
      anyDirection: 'Everything',
      moneyIn: 'Money in',
      moneyOut: 'Money out',
      kindAria: 'Entry type',
      anyKind: 'Any type',
      walletAria: 'Wallet',
      everyWallet: 'Every wallet',
      wallet: 'Wallet',
      fromDate: 'From date',
      toDate: 'To date',
    },

    list: {
      date: 'Date',
      entry: 'Entry',
      wallet: 'Wallet',
      amount: 'Amount',
      actions: 'Actions',
      noCashMoved: 'No cash moved',
      noCash: 'No cash',
      /** "Vendor payment · Trip bill · September 2026 · Ref 4471" */
      kindAndDetail: '{kind} · {detail}',
      reference: 'Ref {reference}',
      rowLine: '{day} · {wallet} · {entry}',
      emptyTitle: 'No entries yet',
      emptyDescription: 'Money added, spent, advanced or paid shows up here.',
      voucherAttached: 'Voucher attached',
      openVoucher: 'Open the voucher for {entry}',
      actionsFor: 'Actions for {entry}',
      opening: 'Opening',
      closing: 'Closing',
    },

    form: {
      editTitle: 'Edit {entry}',
      amount: 'Amount',
      date: 'Date',
      paidFromCash: 'Paid from cash',
      depositInto: 'Deposit into cash',
      returnedInto: 'Returned into cash',
      fromCashWallet: 'From cash wallet',
      receivedInto: 'Received into',
      toCashWallet: 'To cash wallet',
      reference: 'Reference',
      note: 'Note',
      uploadingVoucher: 'Uploading the voucher…',
      saveKind: 'Save {kind}',
    },

    report: {
      thisMonth: 'This month',
      lastMonth: 'Last month',
      lastMonths: 'Last {n} months',
      last3: 'Last 3 months',
      last6: 'Last 6 months',
      thisFiscalYear: 'This fiscal year',
      lastFiscalYear: 'Last fiscal year',
      thisYear: 'This year',
      periodAria: 'Report period',
      fromMonth: 'From month',
      toMonth: 'To month',
    },

    nav: {
      overview: 'Overview',
      cash: 'Cash',
      cashBook: 'Cash Book',
      vendorBills: 'Vendor Bills',
      advances: 'Advances',
      expenses: 'Expenses',
      finalBills: 'Walton Final Bill',
      labourBills: 'Walton Labour Bill',
      profitLoss: 'Profit & Loss',
      wallets: 'Wallets',
    },

    kinds: {
      Deposit: {
        label: 'Deposit',
        action: 'Add money',
        description: 'Money added into cash as a deposit. Every transaction runs through cash.',
      },
      Transfer: {
        label: 'Transfer',
        action: 'Transfer',
        description: 'Move money between two cash wallets — the cash box and petty cash.',
      },
      Expense: {
        label: 'Expense',
        action: 'Add expense',
        description: 'Any office expense — rent, bills, salary, conveyance and the rest.',
      },
      Advance: {
        label: 'Advance',
        action: 'Give advance',
        description: 'Money handed to anyone, to be returned in cash later.',
      },
      AdvanceReturn: {
        label: 'Advance return',
        action: 'Record return',
        description:
          'Cash given back against an advance. It comes off the advance in cash out, not added to cash in.',
      },
      AdvanceAdjust: {
        label: 'Advance adjusted',
        action: 'Advance adjusted',
        description:
          'An older adjustment of an advance, recorded before advances were settled by cash alone.',
      },
      TripAdvance: {
        label: 'Trip advance',
        action: 'Trip advance',
        description: 'An advance to a vendor against one trip’s rent and labour bill.',
      },
      VendorPayment: {
        label: 'Vendor payment',
        action: 'Pay vendor',
        description: 'A vendor’s monthly trip bill, after its advances.',
      },
    },

    walletKinds: {
      Cash: 'Cash',
      Bank: 'Bank account',
      'Mobile Banking': 'Mobile banking',
    },

    vendorStatuses: {
      'No Bill': 'No bill yet',
      Unpaid: 'Unpaid',
      Partial: 'Partly paid',
      Paid: 'Paid',
      Overpaid: 'Overpaid',
    },

    settlement: {
      Open: { label: 'Open', received: 'Not received' },
      Partial: { label: 'Partly settled', received: 'Partly received' },
      Settled: { label: 'Settled', received: 'Received' },
    },

    /**
     * What an entry was, in two lines. Every one is a whole message rather than
     * a stem with a name appended: "Returned against EXP-2026-00042" puts the
     * reference last in English and first in Bangla.
     */
    describe: {
      labourPayment: 'Walton Labour Bill payment',
      finalPayment: 'Walton Final Bill payment',
      cashDeposit: 'Cash deposit',
      betweenWallets: 'Between wallets',
      walletToWallet: '{from} → {to}',
      expense: 'Expense',
      paidTo: 'Paid to {name}',
      returnedAgainst: 'Returned against {entry}',
      anAdvance: 'an advance',
      adjustedFrom: '{expense} · from {entry}',
      tripAdvance: 'Trip advance',
      vendorPayment: 'Vendor payment',
      toParty: 'to {name}',
      tripBillPeriod: 'Trip bill · {period}',
      tripBillPeriodTo: 'Trip bill · {period} · to {name}',
    },

    fiscalYear: 'FY {from}–{to}',
    /**
     * The pages themselves — a title, the sentence under it, and the tiles.
     *
     * Each tile's hint is one whole message rather than a figure with a word
     * bolted on: "৩টি অগ্রিম নিষ্পত্তি হয়নি" puts the count and the verb in an
     * order English does not.
     */
    pages: {
      advances: {
        title: 'Advances',
        description:
          'Money given to anyone — staff, a driver, a contractor — until it comes back in cash. Trip advances to vendors are on Vendor Bills.',
        outstanding: 'Outstanding',
        notSettled: '{advances} not settled',
        given: 'Given',
        inThisView: '{advances} in this view',
        settled: 'Settled',
        cashReturned: 'Cash returned',
        searchAria: 'Search by person, purpose, phone or number',
        statusAria: 'Status',
        untouched: 'Untouched',
        partlySettled: 'Partly settled',
        noneOutstanding: 'No advance is outstanding',
        noneHere: 'No advance here',
        staysListed: 'An advance stays listed until its cash is returned.',
      },

      cashBook: {
        title: 'Cash Book',
        entriesAria: 'Entries',
        nothingMatches: 'Nothing matches these filters',
      },

      cash: {
        title: 'Cash',
        description:
          'Your cash balance, how much cash has come in and gone out until today, and the same month by month or year by year. Every transaction in Accounts runs through cash.',
        balance: 'Cash balance',
        walletCount: '{wallets}',
        inUntilToday: 'Total cash in, until today',
        depositsHint: 'Deposits {amount}',
        outUntilToday: 'Total cash out, until today',
        outHint: 'Vendors {vendors} · Expenses {expenses}',
        inThisRange: 'Cash in, this range',
        rangeHint: '{from} – {to}',
        groupByAria: 'Group by',
        monthByMonth: 'Month by month',
        yearByYear: 'Year by year',
        yearRangeAria: 'Year range',
        thisYear: 'This year',
        lastYears: 'Last {n} years',
        byMonthTitle: 'Cash in and out by month',
        byYearTitle: 'Cash in and out by year',
        byRangeDescription:
          'Cash in is deposits, Walton payments received into cash included. Cash out is every vendor payment, trip advance and expense, and advances less the cash returned against them.',
        rangeBackwards: 'The range has to end on or after the month it starts.',
      },

      expenses: {
        title: 'Expenses',
        description:
          'Every office expense, month by month, grouped by the name it was recorded under. Type the name when you add an expense — names used before are suggested.',
        officeExpenses: 'Office expenses',
        officeHint: 'Every office expense this month',
        namesUsed: 'Expense names used',
        thisMonth: 'This month',
        rentAndLabour: 'Trip rent + labour',
        rentAndLabourHint: 'For comparison — from vendor trip bills',
        byName: 'By expense name',
        byNameHint: 'Press one to see only its expenses.',
        listAria: 'Expenses',
      },

      finalBills: {
        title: 'Walton Final Bill',
        description:
          'After Walton audits a submitted Excel bill, enter the final approved amount here. It is the income the profit and loss is built on, compared against what the Excel bill asked for.',
        enter: 'Enter final bill',
        finalBills: 'Final bills',
        unitMonths: '{n} unit-months',
        excelAsked: 'Excel bills asked',
        excelAskedHint: 'For the same units and months',
        auditDifference: 'Audit difference',
        auditDifferenceHint: 'Final less submitted',
        stillToReceive: 'Still to receive',
        receivedHint: '{amount} received',
        yearAria: 'Year',
        allYears: 'All years',
        paymentAria: 'Payment',
        unitAria: 'Unit',
        noneEntered: 'No final bill entered',
        noneHint:
          'When Walton sends back the audited amount for a unit’s month, enter it here. Until then that month has no income in the profit and loss.',
        deleteTitle: 'Delete the final bill for {unit} · {period}?',
        deleteTitleGeneric: 'Delete final bill?',
        deleteDescription:
          'Its income leaves the profit and loss. A final bill with payments recorded against it cannot be deleted until those deposits are.',
        deleteConfirm: 'Delete final bill',
      },

      labourBill: {
        title: 'Walton Labour Bill',
        monthDescription:
          'Each CSD of this month is settled on its own, so each has its own card. What it is owed comes off the labour bill sheet; what has arrived is the payments recorded here.',
        allMonths: 'All months',
        received: 'Received',
        stillToReceive: 'Still to receive',
        openSheet: 'Open the sheet',
        openSheetHint: 'See the rows behind these figures',
        csdsAria: 'CSDs',
        nothingYet: 'Nothing on this month’s labour bill yet',
        scanOnto: 'Scan the challans onto',
        paymentsReceived: 'Payments received',
        paymentsHint: 'Every Walton payment recorded against a CSD of this month.',
        labourBilled: 'Labour billed',
        receivedHint: 'Walton payments against a CSD',
        stillHint: 'Across every CSD of every month',
        months: 'Months',
        monthsHint: 'Matching these filters',
        noneToReceive: 'No labour bill to receive against',
        noneHint:
          'A month appears here as soon as a labour bill is opened for it and challans are scanned in. What each CSD comes to is read off that sheet, so there is nothing to enter.',
      },

      profitLoss: {
        title: 'Profit & Loss',
        rangeBackwards: 'The report has to end on or after the month it starts.',
        incomeAgainstCost: 'Income against cost',
        incomeAgainstCostHint: 'Month by month — hover a month for its profit.',
        statementByMonth: 'Statement by month',
      },

      vendorBill: {
        title: '{vendor} · Trip bill',
        titleGeneric: 'Vendor trip bill',
        description:
          'Every trip in the month with its rent and labour bill, the advances paid against them, and the monthly payments.',
        allVendors: 'All vendors',
        tripsTitle: 'Trips · {period}',
        tripsHint: 'Bills are entered on each trip’s page; advances are paid from here.',
        advancesTitle: 'Trip advances',
        advancesHint: '{amount} against this month’s trips',
        paymentsTitle: 'Payments',
        paymentsHint: '{amount} paid for {period}',
      },

      vendorBills: {
        title: 'Vendor Trip Bills',
        billThisMonth: 'Trip bill this month',
        billHint: '{trips} · {vendors}',
        advanced: 'Advanced on trips',
        advancedHint: 'Adjusted from the bill',
        paid: 'Paid',
        paidHint: 'Monthly payments',
        stillDue: 'Still due',
        overpaidElsewhere: '{amount} overpaid elsewhere',
        blankBills: '{n} trips have no bill yet',
        afterEverything: 'After advances and payments',
        listAria: 'Vendor trip bills',
        searchAria: 'Search vendors',
        statusAria: 'Status',
      },

      wallets: {
        title: 'Wallets',
        description: 'The wallets money is kept in.',
      },

      overview: {
        vendorDue: 'Vendor bills due',
        openAdvances: 'Open advances',
        receivable: 'Receivable from Walton',
        profitPeriod: 'Profit · {period}',
        thisMonth: 'this month',
        lastSixMonths: 'Last six months',
        lastSixHint: 'Walton final bills against trip and office costs.',
        recentEntries: 'Recent entries',
        cashBook: 'Cash book',
      },
    },
    hero: {
      cashBalance: 'Cash balance',
      noCashWallet: 'No cash wallet yet',
      byMonthAndYear: 'Cash in & out by month and year',
      paidFromHand: 'Paid out of what was already on hand',
      nothingMoved: 'Nothing has moved yet',
      net: 'Net {amount}',
    },

    attention: {
      heading: 'Needs attention',
      description: 'What is still owed, blank or unsettled.',
      allCaughtUp: 'All caught up',
      nothingWaiting: 'Nothing is owed, blank or waiting.',
      blankBillDetail: 'Rent or labour bill is blank on the trip, so it counts as nothing',
      pendingFinalDetail:
        'Last six months — no income is counted until the final figure is entered',
    },

    cash: {
      deposits: 'Deposit',
      transfersIn: 'Transfer in',
      vendorPayments: 'Vendor payment',
      tripAdvances: 'Trip advance',
      advancesNet: 'Advance (after return)',
      expenses: 'Expense',
      transfersOut: 'Transfer out',
      chooseRange: 'Choose a range to see cash in and out.',
      cashIn: 'Cash in',
      cashOut: 'Cash out',
      totalIn: 'Total in',
      totalOut: 'Total out',
      rangeTotal: 'Range total',
      shareGoneOut: '{share} of cash in has gone out',
      in: 'In',
      out: 'Out',
    },

    advance: {
      noPurpose: 'No purpose noted',
      settled: 'Settled',
      cashReturned: 'Cash returned',
      history: 'History',
      settleAll: 'Settle all of it',
      label: 'Advance',
      given: 'Given {day}',
      givenFor: 'Given {day} for {purpose}',
      choose: 'Choose an advance',
      noneOutstanding: 'No advance is outstanding.',
    },

    deposit: {
      fillIt: 'Fill it',
      againstFinalBill: 'Walton payment against final bill',
      finalBill: 'Final bill',
      unitAndPeriod: '{unit} · {period}',
      finalBillDetail: 'Final bill {amount} · {received} received',
      againstLabourBill: 'Walton payment against labour bill',
      labourCsd: 'Labour bill CSD',
    },

    voucher: {
      removeTitle: 'Remove the voucher from {entry}?',
      removeDescription:
        'The entry itself is untouched — the figures, the wallet and the day stay exactly as they are. Only the file behind it is deleted, and it cannot be recovered.',
      remove: 'Remove voucher',
      removing: 'Removing…',
      attach: 'Attach a voucher',
      deleteTitle: 'Delete {entry}?',
      deleteDescription:
        'This {kind} of {amount} is removed from the books, and every balance and total it counted in is recalculated without it.',
      deleteConfirm: 'Delete entry',
      deleting: 'Deleting…',
      removeChosen: 'Remove the chosen voucher',
      replaceFile: 'Replace the file',
      scanIt: 'Scan it',
      holding: 'Holding {name} ({size}). A new file replaces it.',
      title: 'Voucher for {entry}',
    },

    kindFields: {
      paidTo: 'Paid to',
      givenTo: 'Given to',
      theirMobile: 'Their mobile',
      whatFor: 'What it is for',
      spentOn: 'Spent on',
      receivedBy: 'Received by',
    },

    totals: {
      moneyIn: 'Money in',
      moneyOut: 'Money out',
    },

    finalBill: {
      actionsFor: 'Actions for {unit} {period}',
      excelBill: 'Excel bill',
      finalBill: 'Final bill',
      auditDifference: 'Audit difference',
      noChange: 'No change',
      amountLeft: '{amount} left',
      fullyReceived: 'Fully received',
      recordPayment: 'Record payment received',
      editTitle: 'Edit final bill · {unit} · {period}',
      enterTitle: 'Enter Walton final bill',
      description:
        'The amount Walton approved after auditing the Excel bill. This is the income the profit and loss counts.',
      unit: 'Unit',
      amount: 'Final bill amount',
      reference: 'Walton reference',
      receivedOn: 'Final bill received on',
      auditNote: 'Audit note',
      auditNoteHint: 'What the audit changed — rows disallowed, rates corrected.',
      save: 'Save final bill',
      lookingUp: 'Looking up the Excel bills…',
      enterUnitFirst: 'Enter the unit to see its Excel bills for the month.',
      submitted: 'Excel bills submitted',
    },

    labour: {
      received: 'Received',
      billed: 'Billed',
      pendingRows:
        'These rows are waiting for a Trip DO, so they belong to no CSD and nobody has been billed for them yet.',
      tripDoSheet: 'Trip DO sheet',
    },

    profit: {
      finalBillIncome: 'Walton final bill',
      labourIncome: 'Walton labour bill',
      tripRent: 'Trip rent',
      labourBill: 'Labour bill',
      labour: 'Labour',
      officeExpenses: 'Office expenses',
      office: 'Office',
      title: 'Profit & loss · {period}',
      description: 'What Walton was billed, against every operational cost.',
      fullReport: 'Full report',
      noFinalBillYet: 'No Walton final bill is entered for this month yet',
      incomeByUnit: 'Income by unit',
      incomeByUnitHint: 'Final bill, and what the audit changed',
      officeExpensesHint: 'By expense name',
      tripCostByVendor: 'Trip cost by vendor',
      tripCostHint: 'Rent and labour bill',
      month: 'Month',
      totalCost: 'Total cost',
      profit: 'Profit',
      margin: 'Margin',
      total: 'Total',
      income: 'Income',
      operationalCost: 'Operational cost',
      netProfit: 'Net profit',
      netLoss: 'Net loss',
      noMargin: 'No income to take a margin of',
      marginOf: '{margin} margin',
      /** "12% margin · 34 trips" */
      marginAndTrips: '{margin} · {trips}',
      incomeSeries: 'Income (Walton billed)',
      chartCaption: 'Income, cost and profit by month',
    },

    period: {
      previousMonth: 'Previous month',
      nextMonth: 'Next month',
      thisMonth: 'This month',
    },

    expense: {
      noneThisMonth: 'No office expense this month.',
      namesUsedBefore: 'Expense names used before',
    },

    trip: {
      label: 'Trip',
      selected: 'Selected trip',
      searchHint: 'Search by trip number, vendor, driver or plate digits.',
      listAria: 'Trips',
      noMatch: 'No trip matches.',
      notEntered: 'Not entered',
      noneThisMonth: 'No trip ran for this vendor in the month.',
      advance: 'Advance',
      advanceAgainst: 'Advance against this trip',
      bill: 'Bill',
    },

    vendorBill: {
      tripAdvances: 'Trip advances',
      vendorProfile: 'Vendor profile',
      pay: 'Pay {amount}',
      overpaid: 'Overpaid',
      due: 'Due',
      dueAndPeriod: '{state} · {period}',
      noneThisMonth: 'No vendor trip bills for this month',
      noneHint: 'A vendor appears here once one of its trips runs in the month.',
      vendor: 'Vendor',
      trips: 'Trips',
      paid: 'Paid',
      openVendor: 'Open {name}',
      monthByMonth: 'Month by month',
      allTime: 'All time: {billed} billed · {settled} settled · {due} due',
      noMonthYet: 'No month on record yet.',
      payItAll: 'Pay it all',
      paying: 'Paying',
      payingValue: '{vendor} · {period}',
      billMonth: 'Bill month',
      year: 'Year',
      chooseVendor: 'Choose a vendor',
      nothingDue: 'Nothing is due to any vendor for this month.',
      printAria: 'Print {name}’s statement',
      printStatement: 'Print statement',
    },

    wallet: {
      title: 'Wallets',
      description:
        'Every transaction runs through cash. Bank and mobile wallets only receive Walton bill payments.',
      add: 'Add wallet',
      addTitle: 'Add a wallet',
      editTitle: 'Edit {name}',
      editDescription: 'Rename it or change its details. Its balance comes from its entries.',
      cashDescription:
        'A cash box. Every transaction runs through cash — record its opening balance afterwards with Add money.',
      bankDescription:
        'A bank account or mobile banking number. It only receives Walton bill payments; nothing is spent from it or moved into or out of it.',
      kind: 'Kind',
      name: 'Name',
      keptBy: 'Kept by',
      accountNumber: 'Account number',
      note: 'Note',
      actionsFor: 'Actions for {name}',
      close: 'Close wallet',
      reopen: 'Reopen wallet',
      deleteTitle: 'Delete {name}?',
      deleteDescription: 'Nothing was ever recorded against it, so it is removed outright.',
      deleteConfirm: 'Delete wallet',
      loading: 'Loading wallets…',
      noCashWallet: 'No cash wallet is open. Add one on the Wallets tab.',
      cashOnly: 'Cash wallets only.',
      chooseCash: 'Choose a cash wallet',
      choose: 'Choose a wallet',
      cashBalance: 'Cash balance {amount}',
      balance: 'Balance {amount}',
    },
    receivable: {
      anyPayment: 'Any payment',
    },

    vendorBills: {
      hasDue: 'Has due',
    },
    toasts: {
      kindSaved: '{kind} saved',
      kindUpdated: '{kind} updated',
      voucherRemoved: 'Voucher removed from {entry}',
      entryDeleted: '{entry} deleted',
      walletAdded: '{name} added',
      walletUpdated: '{name} updated',
      walletDeleted: 'Wallet deleted',
      walletClosed: 'Wallet closed',
      walletClosedNote: 'It has entries, so its history is kept.',
      finalBillSaved: 'Final bill saved',
      finalBillUpdated: 'Final bill updated',
      finalBillDeleted: 'Final bill for {label} deleted',
      voucherLoadFailed: 'The voucher could not be loaded.',
      voucherDownloadFailed: 'That voucher could not be downloaded.',
    },

    validation: {
      dateRequired: 'Choose a date.',
      amountRequired: 'Enter an amount.',
      amountTooLarge: 'That amount is too large.',
      walletRequired: 'Choose a wallet.',
      walletFromRequired: 'Choose the wallet the money leaves.',
      walletToRequired: 'Choose the wallet the money goes to.',
      walletDifferent: 'Choose a different wallet.',
      expenseFor: 'Write what the expense was for.',
      expenseSpentOn: 'Write what it was spent on.',
      advanceGivenTo: 'Say who the advance was given to.',
      advanceReturnRequired: 'Choose the advance being returned.',
      advanceAdjustRequired: 'Choose the advance being adjusted.',
      tripRequired: 'Choose the trip the advance is for.',
      vendorRequired: 'Choose the vendor being paid.',
      unitRequired: 'Enter the unit.',
      finalAmountRequired: 'Enter the final bill amount.',
      walletNameRequired: 'Name the wallet.',
    },
  },
} satisfies MessageTree
