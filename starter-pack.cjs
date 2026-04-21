(function (root, factory) {
  const api = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }

  root.AI_SHORTCUTS_DATA = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const DEFAULT_CLI_PREFIX = "@@";

  const emptyProfile = {
    prefix: ">",
    fullName: "",
    email: "",
    phone: "",
    dob: "",
    passportNumber: "",
    idNumber: "",
    airlineLoyaltyNumber: "",
    knownTravelerNumber: "",
    website: "",
    whatsappNumber: "",
    telegramUsername: "",
    xUsername: "",
    linkedinUsername: "",
    homeAddress: "",
    workAddress: "",
    calendly: "",
    bio: "",
    bankInfo: "",
    company: "",
  };

  function firstTruthy() {
    for (const value of arguments) {
      if (value && String(value).trim()) {
        return value;
      }
    }
    return "";
  }

  function firstNameFromFullName(fullName) {
    const trimmed = String(fullName || "").trim();
    return trimmed ? trimmed.split(/\s+/)[0] : "";
  }

  function normalizeHandle(value, prefixes = []) {
    let normalized = String(value || "").trim();

    for (const prefix of prefixes) {
      if (normalized.toLowerCase().startsWith(prefix.toLowerCase())) {
        normalized = normalized.slice(prefix.length);
      }
    }

    normalized = normalized.replace(/^@+/, "").replace(/^\/+/, "");
    return normalized.replace(/\/+$/, "").trim();
  }

  function normalizeWhatsAppNumber(value) {
    return String(value || "").replace(/\D/g, "");
  }

  const starterPack = [
    {
      id: "name",
      category: "Identity",
      title: "Full name",
      description: "A quick full-name shortcut for forms and signatures.",
      suffix: "name",
      requiredProfileFields: ["fullName"],
      placeholder: "Bob Jones",
      build: (profile) => profile.fullName || "Your Full Name",
    },
    {
      id: "email",
      category: "Identity",
      title: "Email",
      description: "Your primary email address.",
      suffix: "email",
      requiredProfileFields: ["email"],
      placeholder: "your@email.com",
      build: (profile) => profile.email || "your@email.com",
    },
    {
      id: "phone",
      category: "Identity",
      title: "Phone number",
      description: "A fast phone-number shortcut inspired by the original post.",
      suffix: "phone",
      requiredProfileFields: ["phone"],
      placeholder: "+1 555 555 5555",
      build: (profile) => profile.phone || "+1 555 555 5555",
    },
    {
      id: "dob",
      category: "Identity",
      title: "Date of birth",
      description: "Useful for forms, travel bookings, and admin paperwork.",
      suffix: "dob",
      requiredProfileFields: ["dob"],
      placeholder: "14 March 1990",
      build: (profile) => profile.dob || "14 March 1990",
    },
    {
      id: "passport",
      category: "Identity",
      title: "Passport number",
      description: "A quick shortcut for a passport number you do not want to remember.",
      suffix: "pp",
      requiredProfileFields: ["passportNumber"],
      placeholder: "A1234567",
      build: (profile) => profile.passportNumber || "A1234567",
    },
    {
      id: "idNumber",
      category: "Identity",
      title: "ID number",
      description: "Good for national ID, license, or another personal identifier.",
      suffix: "id",
      requiredProfileFields: ["idNumber"],
      placeholder: "ID-12345678",
      build: (profile) => profile.idNumber || "ID-12345678",
    },
    {
      id: "airlineLoyalty",
      category: "Travel",
      title: "Airline loyalty number",
      description: "Useful for bookings when you want your frequent-flyer number close at hand.",
      suffix: "air",
      requiredProfileFields: ["airlineLoyaltyNumber"],
      placeholder: "ABC123456",
      build: (profile) => profile.airlineLoyaltyNumber || "ABC123456",
    },
    {
      id: "knownTravelerNumber",
      category: "Travel",
      title: "Known Traveler Number (KTN)",
      description: "Helpful for TSA PreCheck or other trusted-traveler forms.",
      suffix: "ktn",
      requiredProfileFields: ["knownTravelerNumber"],
      placeholder: "123456789",
      build: (profile) => profile.knownTravelerNumber || "123456789",
    },
    {
      id: "homeAddress",
      category: "Identity",
      title: "Home address",
      description: "Useful for shipping details, forms, and personal logistics.",
      suffix: "addr",
      requiredProfileFields: ["homeAddress"],
      placeholder: "123 Main Street, Apt 4B, Brooklyn, NY 11201",
      build: (profile) =>
        profile.homeAddress || "123 Main Street, Apt 4B, Brooklyn, NY 11201",
    },
    {
      id: "workAddress",
      category: "Identity",
      title: "Work address",
      description: "Helpful for invoices, meetings, and office logistics.",
      suffix: "workaddr",
      requiredProfileFields: ["workAddress"],
      placeholder: "200 Broadway, Floor 8, New York, NY 10038",
      build: (profile) =>
        profile.workAddress || "200 Broadway, Floor 8, New York, NY 10038",
    },
    {
      id: "website",
      category: "Identity",
      title: "Website",
      description: "Your personal site or portfolio.",
      suffix: "site",
      requiredProfileFields: ["website"],
      placeholder: "https://your-site.com",
      build: (profile) => profile.website || "https://your-site.com",
    },
    {
      id: "whatsapp",
      category: "Links / Social",
      title: "WhatsApp link",
      description: "A direct WhatsApp link built from your WhatsApp number.",
      suffix: "wa",
      requiredProfileFields: ["whatsappNumber"],
      placeholder: "https://wa.me/15551234567",
      build: (profile) => {
        const digits = normalizeWhatsAppNumber(profile.whatsappNumber);
        return digits ? `https://wa.me/${digits}` : "https://wa.me/15551234567";
      },
    },
    {
      id: "telegram",
      category: "Links / Social",
      title: "Telegram link",
      description: "A direct Telegram link built from your username.",
      suffix: "tg",
      requiredProfileFields: ["telegramUsername"],
      placeholder: "https://telegram.me/yourname",
      build: (profile) => {
        const username = normalizeHandle(profile.telegramUsername, [
          "https://telegram.me/",
          "https://t.me/",
          "http://telegram.me/",
          "http://t.me/",
        ]);
        return username ? `https://telegram.me/${username}` : "https://telegram.me/yourname";
      },
    },
    {
      id: "x",
      category: "Links / Social",
      title: "X profile",
      description: "Your X profile link built from your username.",
      suffix: "x",
      requiredProfileFields: ["xUsername"],
      placeholder: "https://x.com/yourname",
      build: (profile) => {
        const username = normalizeHandle(profile.xUsername, [
          "https://x.com/",
          "http://x.com/",
          "https://twitter.com/",
          "http://twitter.com/",
        ]);
        return username ? `https://x.com/${username}` : "https://x.com/yourname";
      },
    },
    {
      id: "linkedin",
      category: "Links / Social",
      title: "LinkedIn profile",
      description: "Your LinkedIn profile link built from your username.",
      suffix: "li",
      requiredProfileFields: ["linkedinUsername"],
      placeholder: "https://www.linkedin.com/in/yourname",
      build: (profile) => {
        const username = normalizeHandle(profile.linkedinUsername, [
          "https://www.linkedin.com/in/",
          "http://www.linkedin.com/in/",
          "https://linkedin.com/in/",
          "http://linkedin.com/in/",
        ]);
        return username
          ? `https://www.linkedin.com/in/${username}`
          : "https://www.linkedin.com/in/yourname";
      },
    },
    {
      id: "bio",
      category: "Identity",
      title: "Short bio",
      description: "A reusable paragraph for intros and forms.",
      suffix: "bio",
      requiredProfileFields: ["bio"],
      placeholder: "A short professional bio goes here.",
      build: (profile) => profile.bio || "A short professional bio goes here.",
    },
    {
      id: "bankInfo",
      category: "Identity",
      title: "Bank info",
      description: "A reusable bank details block for invoices or transfers.",
      suffix: "bank",
      requiredProfileFields: ["bankInfo"],
      placeholder: "Account name: Your Name\nBank: Example Bank\nAccount number: 12345678",
      build: (profile) =>
        profile.bankInfo ||
        "Account name: Your Name\nBank: Example Bank\nAccount number: 12345678",
    },
    {
      id: "signature",
      category: "Identity",
      title: "Signature block",
      description: "A plain-text signature with your core contact info.",
      suffix: "sig",
      autoEnable: false,
      requiredProfileFields: ["fullName", "email", "website"],
      requiredProfileMode: "any",
      placeholder: "Your Full Name\nyour@email.com\nhttps://your-site.com",
      build: (profile) => {
        const lines = [
          profile.fullName || "Your Full Name",
          profile.email || "your@email.com",
          profile.website || "https://your-site.com",
        ].filter(Boolean);
        return lines.join("\n");
      },
    },
    {
      id: "intro",
      category: "Work",
      title: "Intro thank-you",
      description: "A reusable note after someone makes an introduction.",
      suffix: "intro",
      autoEnable: false,
      requiredProfileFields: ["fullName"],
      placeholder:
        "Thanks so much for the introduction. Great to meet you, and I will follow up directly from here.\n\nBest,\nYour first name",
      build: (profile) => {
        const sender = firstTruthy(firstNameFromFullName(profile.fullName), "Your first name");
        return `Thanks so much for the introduction. Great to meet you, and I will follow up directly from here.\n\nBest,\n${sender}`;
      },
    },
    {
      id: "intro2",
      category: "Work",
      title: "Intro nice-to-meet-you",
      description: "A shorter first-reply snippet for new connections.",
      suffix: "intro2",
      autoEnable: false,
      requiredProfileFields: ["fullName"],
      placeholder:
        "Great to meet you, and thanks again for the introduction. Looking forward to connecting.\n\nBest,\nYour first name",
      build: (profile) => {
        const sender = firstTruthy(firstNameFromFullName(profile.fullName), "Your first name");
        return `Great to meet you, and thanks again for the introduction. Looking forward to connecting.\n\nBest,\n${sender}`;
      },
    },
    {
      id: "calendar",
      category: "Work",
      title: "Scheduling link",
      description: "Your Calendly or booking page.",
      suffix: "calendar",
      requiredProfileFields: ["calendly"],
      placeholder: "https://calendly.com/your-name",
      build: (profile) => profile.calendly || "https://calendly.com/your-name",
    },
    {
      id: "thanks",
      category: "Work",
      title: "Thanks",
      description: "A short thank-you line you can drop into emails.",
      suffix: "thanks",
      placeholder: "Thanks so much for sending this over.",
      build: () => "Thanks so much for sending this over.",
    },
    {
      id: "followup",
      category: "Work",
      title: "Follow-up",
      description: "A polite nudge when something has gone quiet.",
      suffix: "followup",
      placeholder: "Circling back on this in case it slipped through.",
      build: () => "Circling back on this in case it slipped through.",
    },
    {
      id: "fyi",
      category: "Work",
      title: "FYI",
      description: "A clean FYI lead-in.",
      suffix: "fyi",
      placeholder: "FYI:",
      build: () => "FYI:",
    },
    {
      id: "lmk",
      category: "Work",
      title: "Let me know",
      description: "A short closing prompt.",
      suffix: "lmk",
      placeholder: "Let me know what you think.",
      build: () => "Let me know what you think.",
    },
    {
      id: "bullet",
      category: "Writing / Thinking",
      title: "Bullet starter",
      description: "A quick seed for outlining.",
      suffix: "bullet",
      placeholder: "- ",
      build: () => "- ",
    },
    {
      id: "decision",
      category: "Writing / Thinking",
      title: "Decision label",
      description: "A reusable decision heading.",
      suffix: "decision",
      placeholder: "Decision:",
      build: () => "Decision:",
    },
    {
      id: "meeting",
      category: "Writing / Thinking",
      title: "Meeting notes scaffold",
      description: "A small starting structure for next steps.",
      suffix: "meeting",
      placeholder: "Next steps:\n- ",
      build: () => "Next steps:\n- ",
    },
    {
      id: "company",
      category: "Personal / Custom",
      title: "Company name",
      description: "A placeholder for the company or org you mention often.",
      suffix: "company",
      requiredProfileFields: ["company"],
      placeholder: "Your Company Name",
      build: (profile) => profile.company || "Your Company Name",
    },
    {
      id: "shipping",
      category: "Personal / Custom",
      title: "Shipping address",
      description: "A shipping variant of your home address.",
      suffix: "shipping",
      requiredProfileFields: ["homeAddress"],
      placeholder: "Your shipping address",
      build: (profile) => profile.homeAddress || "Your shipping address",
    },
    {
      id: "link",
      category: "Personal / Custom",
      title: "Primary link",
      description: "A default link shortcut for a site or document you share a lot.",
      suffix: "link",
      requiredProfileFields: ["website", "calendly"],
      requiredProfileMode: "any",
      placeholder: "https://your-link.com",
      build: (profile) =>
        firstTruthy(profile.website, profile.calendly, "https://your-link.com"),
    },
  ];

  function buildGenericStarterEntries(prefix = DEFAULT_CLI_PREFIX) {
    return starterPack.map((item) => ({
      category: item.category,
      title: item.title,
      shortcut: `${prefix}${item.suffix}`,
      phrase: item.placeholder,
    }));
  }

  function groupByCategory(items) {
    return items.reduce((groups, item) => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
      return groups;
    }, {});
  }

  return {
    DEFAULT_CLI_PREFIX,
    emptyProfile,
    starterPack,
    buildGenericStarterEntries,
    groupByCategory,
  };
});
