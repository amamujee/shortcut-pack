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
    firstName: "",
    email: "",
    phone: "",
    website: "",
    address: "",
    calendly: "",
    bio: "",
    company: "",
    family: "",
  };

  function firstTruthy() {
    for (const value of arguments) {
      if (value && String(value).trim()) {
        return value;
      }
    }
    return "";
  }

  const starterPack = [
    {
      id: "name",
      category: "Identity",
      title: "Full name",
      description: "A quick full-name shortcut for forms and signatures.",
      suffix: "name",
      requiredProfileFields: ["fullName"],
      placeholder: "Your Full Name",
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
      id: "address",
      category: "Identity",
      title: "Address",
      description: "Helpful for shipping details, invoices, and invites.",
      suffix: "addr",
      requiredProfileFields: ["address"],
      placeholder: "123 Main Street, City, State ZIP",
      build: (profile) => profile.address || "123 Main Street, City, State ZIP",
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
      id: "signature",
      category: "Identity",
      title: "Signature block",
      description: "A plain-text signature with your core contact info.",
      suffix: "sig",
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
      requiredProfileFields: ["firstName", "fullName"],
      requiredProfileMode: "any",
      placeholder:
        "Thanks so much for the introduction. Great to meet you, and I will follow up directly from here.\n\nBest,\nYour First Name",
      build: (profile) => {
        const sender = firstTruthy(profile.firstName, profile.fullName, "Your First Name");
        return `Thanks so much for the introduction. Great to meet you, and I will follow up directly from here.\n\nBest,\n${sender}`;
      },
    },
    {
      id: "intro2",
      category: "Work",
      title: "Intro nice-to-meet-you",
      description: "A shorter first-reply snippet for new connections.",
      suffix: "intro2",
      requiredProfileFields: ["firstName", "fullName"],
      requiredProfileMode: "any",
      placeholder:
        "Great to meet you, and thanks again for the introduction. Looking forward to connecting.\n\nBest,\nYour First Name",
      build: (profile) => {
        const sender = firstTruthy(profile.firstName, profile.fullName, "Your First Name");
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
      id: "family",
      category: "Personal / Custom",
      title: "Family details",
      description: "A placeholder slot for a personal snippet you reuse often.",
      suffix: "family",
      requiredProfileFields: ["family"],
      placeholder: "A family-related detail you repeat often.",
      build: (profile) => profile.family || "A family-related detail you repeat often.",
    },
    {
      id: "shipping",
      category: "Personal / Custom",
      title: "Shipping address",
      description: "A shipping variant of your address.",
      suffix: "shipping",
      requiredProfileFields: ["address"],
      placeholder: "Your shipping address",
      build: (profile) => profile.address || "Your shipping address",
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
