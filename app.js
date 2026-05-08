const shortcutData = globalThis.AI_SHORTCUTS_DATA;
const emptyProfile = shortcutData.emptyProfile;
const starterPack = shortcutData.starterPack;
const DRAFT_STORAGE_KEY = "shortcut-pack-draft-v1";
let shouldPersistDraft = true;

function buildDefaultStarters(profile = emptyProfile) {
  return starterPack.map((definition) => ({
    id: definition.id,
    enabled: false,
    suffix: definition.suffix,
    phrase: definition.build(profile),
    customized: false,
    manuallySetEnabled: false,
  }));
}

const state = {
  profile: { ...emptyProfile },
  starters: buildDefaultStarters(),
  custom: [],
  activePacks: [],
  previewDevice: "mac",
  previewEntry: null,
  starterFilter: "",
};

const SHORTCUT_PACKS = {
  personal: {
    name: "Personal",
    description: "Address, email, phone, the basics.",
    starterIds: ["name", "email", "phone", "homeAddress"],
  },
  work: {
    name: "Work",
    description: "Intro reply, signature, scheduling.",
    starterIds: ["intro", "signature", "calendar"],
  },
  travel: {
    name: "Travel",
    description: "Passport, KTN, airline loyalty.",
    starterIds: ["passport", "passportExpiryDate", "knownTravelerNumber", "airlineLoyalty", "homeAddress"],
  },
  founder: {
    name: "Founder",
    description: "Bio, links, calendar.",
    starterIds: ["bio", "linkedin", "x", "calendar", "website"],
  },
};

const profileShortcutPreviewMap = [
  { field: "fullName", starterId: "name" },
  { field: "email", starterId: "email" },
  { field: "phone", starterId: "phone" },
  { field: "dob", starterId: "dob" },
  { field: "passportNumber", starterId: "passport" },
  { field: "passportExpiryDate", starterId: "passportExpiryDate" },
  { field: "idNumber", starterId: "idNumber" },
  { field: "airlineLoyaltyNumber", starterId: "airlineLoyalty" },
  { field: "knownTravelerNumber", starterId: "knownTravelerNumber" },
  { field: "website", starterId: "website" },
  { field: "whatsappNumber", starterId: "whatsapp" },
  { field: "telegramUsername", starterId: "telegram" },
  { field: "xUsername", starterId: "x" },
  { field: "linkedinUsername", starterId: "linkedin" },
  { field: "homeAddress", starterId: "homeAddress" },
  { field: "workAddress", starterId: "workAddress" },
  { field: "calendly", starterId: "calendar" },
  { field: "bankInfo", starterId: "bankInfo" },
  { field: "bio", starterId: "bio" },
];

const detailGroups = [
  {
    title: "Identity",
    fields: ["fullName", "email", "phone", "dob", "bio"],
  },
  {
    title: "Documents",
    fields: ["passportNumber", "passportExpiryDate", "idNumber"],
  },
  {
    title: "Travel",
    fields: ["airlineLoyaltyNumber", "knownTravelerNumber"],
  },
  {
    title: "Addresses",
    fields: ["homeAddress", "workAddress"],
  },
  {
    title: "Links & social",
    fields: ["website", "calendly", "whatsappNumber", "telegramUsername", "xUsername", "linkedinUsername"],
  },
  {
    title: "Other",
    fields: ["bankInfo"],
  },
];

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function definitionById(id) {
  return starterPack.find((item) => item.id === id);
}

function storageAvailable() {
  try {
    return typeof window !== "undefined" && "localStorage" in window && window.localStorage;
  } catch {
    return false;
  }
}

function resetStateToDefaults() {
  state.profile = { ...emptyProfile };
  state.starters = buildDefaultStarters();
  state.custom = [];
  state.activePacks = [];
  state.previewDevice = "mac";
  state.previewEntry = null;
  state.starterFilter = "";
}

function serializeState() {
  return {
    profile: state.profile,
    starters: state.starters.map((starter) => ({
      id: starter.id,
      enabled: Boolean(starter.enabled),
      suffix: starter.suffix,
      phrase: starter.phrase,
      customized: Boolean(starter.customized),
      manuallySetEnabled: Boolean(starter.manuallySetEnabled),
    })),
    custom: state.custom.map((row) => ({
      id: row.id,
      enabled: Boolean(row.enabled),
      suffix: row.suffix,
      phrase: row.phrase,
    })),
    activePacks: state.activePacks.filter((slug) => SHORTCUT_PACKS[slug]),
  };
}

function applySavedState(saved) {
  resetStateToDefaults();

  if (saved?.profile && typeof saved.profile === "object") {
    state.profile = {
      ...emptyProfile,
      ...Object.fromEntries(
        Object.keys(emptyProfile).map((key) => [key, String(saved.profile[key] || "")]),
      ),
    };
  }

  if (Array.isArray(saved?.starters)) {
    const savedById = new Map(saved.starters.map((starter) => [starter.id, starter]));
    state.starters = starterPack.map((definition) => {
      const starter = savedById.get(definition.id);
      if (!starter) {
        return {
          id: definition.id,
          enabled: false,
          suffix: definition.suffix,
          phrase: definition.build(state.profile),
          customized: false,
          manuallySetEnabled: false,
        };
      }

      return {
        id: definition.id,
        enabled: Boolean(starter.enabled),
        suffix: String(starter.suffix ?? definition.suffix ?? ""),
        phrase: String(starter.phrase ?? definition.build(state.profile)),
        customized: Boolean(starter.customized),
        manuallySetEnabled: Boolean(starter.manuallySetEnabled),
      };
    });
  }

  if (Array.isArray(saved?.custom)) {
    state.custom = saved.custom
      .filter((row) => row && typeof row === "object")
      .map((row) => ({
        id: String(row.id || makeId()),
        enabled: row.enabled !== false,
        suffix: String(row.suffix || ""),
        phrase: String(row.phrase || ""),
      }));
  }

  if (Array.isArray(saved?.activePacks)) {
    state.activePacks = saved.activePacks
      .map((slug) => String(slug || ""))
      .filter((slug) => SHORTCUT_PACKS[slug]);
  }
}

function updateDraftStatus(message) {
  const node = document.querySelector("#draftStatus");
  if (node) {
    node.textContent = message || "Saved locally";
  }
}

function loadDraft() {
  if (!storageAvailable()) {
    return false;
  }

  try {
    const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) {
      return false;
    }
    applySavedState(JSON.parse(raw));
    refreshGeneratedStarters();
    return true;
  } catch {
    return false;
  }
}

function saveDraft() {
  if (!shouldPersistDraft) {
    return;
  }

  if (!storageAvailable()) {
    updateDraftStatus("Local draft unavailable in this browser.");
    return;
  }

  try {
    window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(serializeState()));
    updateDraftStatus("Saved locally");
  } catch {
    updateDraftStatus("Could not save a local draft in this browser.");
  }
}

function validateTriggerValue(value, label = "Trigger") {
  const trimmed = String(value || "").trim();

  if (!trimmed) {
    return `${label} cannot be blank.`;
  }

  if (/\s/.test(trimmed)) {
    return `${label} cannot contain spaces.`;
  }

  if (trimmed.length > 24) {
    return `${label} should stay under 24 characters.`;
  }

  return "";
}

function isLikelyValidDate(value) {
  const trimmed = String(value || "").trim();

  if (!trimmed) {
    return true;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const parsed = Date.parse(`${trimmed}T00:00:00`);
    return !Number.isNaN(parsed);
  }

  return !Number.isNaN(Date.parse(trimmed));
}

function normalizeSocialHandle(value) {
  return String(value || "")
    .trim()
    .replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//i, "")
    .replace(/^https?:\/\/(www\.)?x\.com\//i, "")
    .replace(/^https?:\/\/(www\.)?twitter\.com\//i, "")
    .replace(/^https?:\/\/(www\.)?telegram\.me\//i, "")
    .replace(/^https?:\/\/(www\.)?t\.me\//i, "")
    .replace(/^@+/, "")
    .replace(/^\/+/, "")
    .replace(/\/+$/, "");
}

function validateProfileValue(key, value) {
  const trimmed = String(value || "").trim();

  if (!trimmed) {
    return "";
  }

  switch (key) {
    case "prefix":
      return validateTriggerValue(trimmed, "Trigger prefix");
    case "fullName":
      return trimmed.length < 2 ? "Full name looks too short." : "";
    case "email":
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)
        ? ""
        : "Enter a valid email address.";
    case "phone": {
      const digits = trimmed.replace(/\D/g, "");
      return digits.length >= 7 && /^[0-9+().\-\s/x]+$/i.test(trimmed)
        ? ""
        : "Enter a valid phone number.";
    }
    case "whatsappNumber": {
      const digits = trimmed.replace(/\D/g, "");
      return digits.length >= 8 ? "" : "Enter a valid WhatsApp number with country code.";
    }
    case "dob":
    case "passportExpiryDate":
      return isLikelyValidDate(trimmed)
        ? ""
        : "Use a real date like 14 March 1990 or 1990-03-14.";
    case "passportNumber":
    case "idNumber":
    case "airlineLoyaltyNumber":
    case "knownTravelerNumber":
      return /^[A-Za-z0-9][A-Za-z0-9\-\/ ]{2,31}$/.test(trimmed)
        ? ""
        : "Use letters, numbers, spaces, /, or - only.";
    case "telegramUsername":
    case "xUsername":
    case "linkedinUsername":
      return /^[A-Za-z0-9_.-]{2,100}$/.test(normalizeSocialHandle(trimmed))
        ? ""
        : "Use a username without spaces.";
    case "website":
    case "calendly":
      try {
        const url = new URL(trimmed);
        return /^https?:$/.test(url.protocol)
          ? ""
          : "Use a full URL starting with http:// or https://.";
      } catch {
        return "Use a full URL starting with http:// or https://.";
      }
    default:
      return "";
  }
}

function profileValuePresent(key) {
  return (
    Boolean(state.profile[key] && String(state.profile[key]).trim()) &&
    !validateProfileValue(key, state.profile[key])
  );
}

function validateFieldElement(input) {
  if (!input) {
    return "";
  }

  const rowCard = input.closest(".starter-card, .custom-card");
  const rowToggle = rowCard?.querySelector(".starter-enabled, .custom-enabled");

  if (rowToggle && !rowToggle.checked) {
    input.setCustomValidity("");
    input.classList.remove("is-invalid");
    return "";
  }

  const rule = input.dataset.validate;
  let message = "";

  if (rule === "triggerPrefix") {
    message = validateProfileValue("prefix", input.value);
  } else if (rule === "triggerEnding") {
    message = validateTriggerValue(input.value, "Trigger");
  } else if (rule === "customTriggerEnding") {
    message = validateTriggerValue(input.value, "Custom trigger");
  } else if (rule === "whatsappNumber" || rule === "socialHandle") {
    message = validateProfileValue(input.id, input.value);
  } else if (rule === "documentId") {
    message = validateProfileValue(input.id, input.value);
  } else if (rule) {
    message = validateProfileValue(input.id, input.value);
  }

  input.setCustomValidity(message);
  input.classList.toggle("is-invalid", Boolean(message));
  return message;
}

function validateForm(report = false) {
  const inputs = document.querySelectorAll("[data-validate]");

  for (const input of inputs) {
    const message = validateFieldElement(input);
    if (message) {
      if (report) {
        input.reportValidity();
        input.focus();
      }
      return message;
    }
  }

  return "";
}

function starterRequirementsMetForProfile(definition, profile) {
  const requiredFields = definition?.requiredProfileFields || [];

  if (!requiredFields.length) {
    return true;
  }

  const matches = requiredFields.map(
    (key) => Boolean(profile[key] && String(profile[key]).trim()),
  );

  if (definition.requiredProfileMode === "any") {
    return matches.some(Boolean);
  }

  return matches.every(Boolean);
}

function starterRequirementsMet(definition) {
  return starterRequirementsMetForProfile(definition, state.profile);
}

function starterShouldAutoEnable(definition, profile = state.profile) {
  if (definition?.autoEnable === false) {
    return false;
  }

  if (!definition?.requiredProfileFields?.length) {
    return false;
  }

  return starterRequirementsMetForProfile(definition, profile);
}

function starterIsExportable(item) {
  if (item.customized) {
    return true;
  }

  return starterRequirementsMet(definitionById(item.id));
}

function formatMissingFields(definition) {
  const labels = {
    fullName: "full name",
    email: "email",
    phone: "phone",
    dob: "date of birth",
    passportNumber: "passport number",
    passportExpiryDate: "passport expiry date",
    idNumber: "ID number",
    airlineLoyaltyNumber: "airline loyalty number",
    knownTravelerNumber: "Known Traveler Number",
    website: "website",
    whatsappNumber: "WhatsApp number",
    telegramUsername: "Telegram username",
    xUsername: "X username",
    linkedinUsername: "LinkedIn username",
    homeAddress: "home address",
    workAddress: "work address",
    calendly: "scheduling link",
    bio: "short bio",
    bankInfo: "bank info",
  };

  const requiredFields = definition?.requiredProfileFields || [];
  const missingFields = requiredFields.filter((key) => !profileValuePresent(key));

  return missingFields.map((key) => labels[key] || key);
}

function computeStarterPhrase(id) {
  const definition = definitionById(id);
  return definition ? definition.build(state.profile) : "";
}

function truncatePreviewText(value, maxLength = 72) {
  const singleLine = String(value || "").replace(/\s+/g, " ").trim();
  if (!singleLine) {
    return "";
  }
  return singleLine.length > maxLength
    ? `${singleLine.slice(0, maxLength - 1).trimEnd()}…`
    : singleLine;
}

function renderProfileShortcutPreviews() {
  const prefix = state.profile.prefix || "";
  const previewRoot = document.querySelector("#liveShortcutPreview");
  const prefixExample = document.querySelector("#prefixExample");

  if (prefixExample) {
    prefixExample.textContent = `${prefix}email`;
  }

  document.querySelectorAll("[data-prefix-live]").forEach((node, index) => {
    const suffixes = ["email", "phone", "home"];
    node.textContent = `${prefix}${suffixes[index] || "email"}`;
  });

  document
    .querySelectorAll("[data-preview-field][data-preview-starter]")
    .forEach((field) => {
      const profileField = field.dataset.previewField;
      const starterId = field.dataset.previewStarter;
      const badge = field.querySelector(".field-shortcut-preview");
      const definition = definitionById(starterId);

      if (!badge || !definition) {
        return;
      }

      if (!profileValuePresent(profileField)) {
        badge.hidden = true;
        badge.textContent = "";
        return;
      }

      badge.hidden = false;
      badge.textContent = `${prefix}${definition.suffix}`;
    });

  if (!previewRoot) {
    return;
  }

  const entries = profileShortcutPreviewMap
    .map(({ field, starterId }) => {
      const definition = definitionById(starterId);
      if (!definition || !profileValuePresent(field)) {
        return null;
      }

      return {
        field,
        label: definition.title,
        shortcut: `${prefix}${definition.suffix}`,
        value: truncatePreviewText(computeStarterPhrase(starterId)),
      };
    })
    .filter(Boolean);

  previewRoot.innerHTML = "";

  if (!entries.length) {
    const empty = document.createElement("div");
    empty.className = "live-shortcut-empty";
    empty.textContent = "Add a detail to see the shortcut it creates.";
    previewRoot.appendChild(empty);
    return;
  }

  entries.forEach((entry) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "live-shortcut-card";
    card.dataset.previewTarget = entry.field;
    card.innerHTML = `
      <p class="live-shortcut-label">${escapeXml(entry.label)}</p>
      <p class="live-shortcut-code"><code>${escapeXml(entry.shortcut)}</code></p>
      <p class="live-shortcut-value">${escapeXml(entry.value)}</p>
    `;
    card.addEventListener("click", () => {
      const target = document.querySelector(`#${entry.field}`);
      if (!target) {
        return;
      }
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      window.setTimeout(() => target.focus(), 120);
    });
    previewRoot.appendChild(card);
  });
}

function makeId() {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `custom-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function refreshGeneratedStarters(force = false) {
  state.starters = state.starters.map((item) => {
    const definition = definitionById(item.id);
    const autoEnabled = starterShouldAutoEnable(definition);
    let nextItem = item;

    if (!item.customized || force) {
      nextItem = {
        ...nextItem,
        phrase: computeStarterPhrase(item.id),
        customized: false,
      };
    }

    if (force) {
      return {
        ...nextItem,
        enabled: autoEnabled,
        manuallySetEnabled: false,
      };
    }

    if (!item.manuallySetEnabled) {
      return {
        ...nextItem,
        enabled: autoEnabled,
      };
    }

    return nextItem;
  });
}

function buildEntries() {
  const starterEntries = state.starters
    .filter((item) => item.enabled && starterIsExportable(item))
    .map((item) => ({
      shortcut: `${state.profile.prefix || ""}${item.suffix || ""}`.trim(),
      phrase: item.phrase.trim(),
      category: definitionById(item.id)?.category || "Starter",
    }));

  const customEntries = state.custom
    .filter((item) => item.enabled)
    .map((item) => ({
      shortcut: `${state.profile.prefix || ""}${item.suffix || ""}`.trim(),
      phrase: item.phrase.trim(),
      category: "Custom",
    }));

  return [...starterEntries, ...customEntries].filter(
    (item) => item.shortcut && item.phrase,
  );
}

function findDuplicates(entries) {
  const counts = new Map();
  entries.forEach((entry) => {
    counts.set(entry.shortcut, (counts.get(entry.shortcut) || 0) + 1);
  });

  return new Set(
    [...counts.entries()]
      .filter(([, count]) => count > 1)
      .map(([shortcut]) => shortcut),
  );
}

function starterShortcut(starter) {
  return `${state.profile.prefix || ""}${starter?.suffix || ""}`.trim();
}

function packTriggerSamples(pack) {
  return pack.starterIds
    .map((id) => definitionById(id))
    .filter(Boolean)
    .slice(0, 4)
    .map((definition) => `${state.profile.prefix || ""}${definition.suffix}`);
}

function applyActivePacks() {
  const starterIds = new Set(
    state.activePacks.flatMap((slug) => SHORTCUT_PACKS[slug]?.starterIds || []),
  );

  state.starters = state.starters.map((starter) => {
    if (starterIds.has(starter.id)) {
      return {
        ...starter,
        enabled: true,
        manuallySetEnabled: true,
      };
    }

    if (starter.customized) {
      return starter;
    }

    return {
      ...starter,
      enabled: false,
      manuallySetEnabled: false,
    };
  });
}

function applyPackDeepLink() {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("packs") || params.get("pack");
  if (!raw) {
    return false;
  }

  const slugs = raw
    .split(",")
    .map((slug) => slug.trim())
    .filter((slug) => SHORTCUT_PACKS[slug]);

  if (!slugs.length) {
    return false;
  }

  state.activePacks = [...new Set(slugs)];
  applyActivePacks();
  window.history.replaceState(null, "", window.location.pathname + window.location.hash);
  return true;
}

function setActivePacks(slugs) {
  state.activePacks = [...new Set(slugs.filter((slug) => SHORTCUT_PACKS[slug]))];
  applyActivePacks();
  resetDetailGroupToggles();
  render();
}

function previewFromStarter(starter) {
  if (!starter) return null;
  const definition = definitionById(starter.id);
  return {
    trigger: starterShortcut(starter),
    expansion: starter.phrase || definition?.placeholder || "",
    label: definition?.title || "Shortcut",
  };
}

function firstPreviewEntry() {
  const starter = state.starters.find((item) => item.enabled);
  if (starter) {
    return previewFromStarter(starter);
  }

  const custom = state.custom.find((item) => item.enabled && item.suffix && item.phrase);
  if (custom) {
    return {
      trigger: `${state.profile.prefix || ""}${custom.suffix || ""}`.trim(),
      expansion: custom.phrase,
      label: "Custom shortcut",
    };
  }

  return {
    trigger: `${state.profile.prefix || ""}home`,
    expansion: "123 Main Street, Apt 4B, Brooklyn, NY 11201",
    label: "Home address",
  };
}

function renderDevicePreview() {
  const root = document.querySelector("#builderDevicePreview");
  if (!root || !window.ShortcutDevicePreviews) {
    return;
  }

  const entry = state.previewEntry || firstPreviewEntry();
  root.classList.toggle("is-iphone", state.previewDevice === "iphone");
  root.classList.toggle("is-ipad", state.previewDevice === "ipad");

  if (state.previewDevice === "iphone") {
    window.ShortcutDevicePreviews.renderIphonePreview(root, { ...entry, width: 230 });
    return;
  }

  if (state.previewDevice === "ipad") {
    window.ShortcutDevicePreviews.renderIpadPreview(root, { ...entry, width: 470 });
    return;
  }

  window.ShortcutDevicePreviews.renderMacPreview(root, entry);
}

function renderActivePackStack() {
  const root = document.querySelector("#activePackStack");
  if (!root) {
    return;
  }

  root.innerHTML = "";

  state.activePacks.forEach((slug) => {
    const pack = SHORTCUT_PACKS[slug];
    if (!pack) return;

    const chip = document.createElement("span");
    chip.className = "pack-chip";
    chip.innerHTML = `
      <span class="pack-chip-dot"></span>
      <span>${escapeXml(pack.name)}</span>
      <button type="button" aria-label="Remove ${escapeXml(pack.name)} pack">×</button>
    `;
    chip.querySelector("button").addEventListener("click", () => {
      setActivePacks(state.activePacks.filter((activeSlug) => activeSlug !== slug));
    });
    root.appendChild(chip);
  });

  const addButton = document.createElement("button");
  addButton.type = "button";
  addButton.className = "add-pack-chip";
  addButton.textContent = "+ Add pack";
  addButton.addEventListener("click", openPackModal);
  root.appendChild(addButton);
}

function renderPackModal() {
  const root = document.querySelector("#packModalGrid");
  const summary = document.querySelector("#packModalSummary");
  if (!root || !summary) {
    return;
  }

  root.innerHTML = "";

  Object.entries(SHORTCUT_PACKS).forEach(([slug, pack]) => {
    const active = state.activePacks.includes(slug);
    const button = document.createElement("button");
    button.type = "button";
    button.className = `pack-modal-card${active ? " is-active" : ""}`;
    button.setAttribute("aria-pressed", String(active));
    button.innerHTML = `
      <h3>${escapeXml(pack.name)}</h3>
      <p>${escapeXml(pack.description)}</p>
      <span class="pack-modal-triggers">
        ${packTriggerSamples(pack).map((trigger) => `<code class="pack-modal-trigger">${escapeXml(trigger)}</code>`).join("")}
      </span>
    `;
    button.addEventListener("click", () => {
      const next = active
        ? state.activePacks.filter((activeSlug) => activeSlug !== slug)
        : [...state.activePacks, slug];
      setActivePacks(next);
      openPackModal();
    });
    root.appendChild(button);
  });

  const enabledCount = state.starters.filter((starter) => starter.enabled).length;
  summary.textContent = `${state.activePacks.length} pack${state.activePacks.length === 1 ? "" : "s"} active · ${enabledCount} shortcuts on`;
}

function openPackModal() {
  const modal = document.querySelector("#packModal");
  if (!modal) {
    return;
  }

  renderPackModal();
  modal.hidden = false;
  modal.querySelector("button")?.focus();
}

function closePackModal() {
  const modal = document.querySelector("#packModal");
  if (modal) {
    modal.hidden = true;
  }
}

function filledDetailCount(fields) {
  return fields.filter((field) => profileValuePresent(field)).length;
}

function selectedPackStarterIds() {
  return new Set(
    state.activePacks.flatMap((slug) => SHORTCUT_PACKS[slug]?.starterIds || []),
  );
}

function relevantProfileFields() {
  const packStarterIds = selectedPackStarterIds();
  const sourceStarters = packStarterIds.size
    ? starterPack.filter((definition) => packStarterIds.has(definition.id))
    : state.starters
        .filter((starter) => starter.enabled)
        .map((starter) => definitionById(starter.id))
        .filter(Boolean);

  const fields = new Set(
    sourceStarters.flatMap((definition) => definition.requiredProfileFields || []),
  );

  return fields.size
    ? fields
    : new Set(detailGroups.flatMap((group) => group.fields));
}

function resetDetailGroupToggles() {
  document.querySelectorAll(".detail-group").forEach((group) => {
    delete group.dataset.userToggled;
  });
}

function refreshDetailGroupCounts() {
  const relevantFields = relevantProfileFields();
  document.querySelectorAll(".detail-group").forEach((group) => {
    const fields = (group.dataset.fields || "").split(",").filter(Boolean);
    const relevant = fields.some((field) => relevantFields.has(field));
    const count = group.querySelector(".detail-group-count");

    group.classList.toggle("is-relevant", relevant);
    if (group.dataset.userToggled !== "true") {
      group.dataset.autoSyncing = "true";
      group.open = relevant;
      window.setTimeout(() => {
        delete group.dataset.autoSyncing;
      }, 0);
    }

    if (count) {
      count.textContent = `${filledDetailCount(fields)}/${fields.length} filled`;
    }

    const hideEmpty = document.querySelector("#hideEmptyFields")?.checked;
    group.querySelectorAll("[data-preview-field]").forEach((fieldNode) => {
      const field = fieldNode.dataset.previewField;
      fieldNode.hidden = Boolean(hideEmpty && !profileValuePresent(field));
    });
  });
}

function groupProfileFields() {
  const form = document.querySelector("#profileForm");
  const livePreview = document.querySelector(".live-shortcut-preview");
  if (!form || !livePreview || form.dataset.grouped === "true") {
    return;
  }

  const fragment = document.createDocumentFragment();

  detailGroups.forEach((group) => {
    const details = document.createElement("details");
    details.className = "detail-group";
    details.open = true;
    details.dataset.fields = group.fields.join(",");
    details.addEventListener("toggle", () => {
      if (details.dataset.autoSyncing !== "true") {
        details.dataset.userToggled = "true";
      }
    });

    const summary = document.createElement("summary");
    summary.innerHTML = `
      <span class="detail-group-title">${escapeXml(group.title)}</span>
      <span class="detail-group-count">${filledDetailCount(group.fields)}/${group.fields.length} filled</span>
    `;

    const body = document.createElement("div");
    body.className = "detail-group-body";

    group.fields.forEach((field) => {
      const node = form.querySelector(`[data-preview-field="${field}"]`);
      if (node) {
        node.classList.remove("span-2", "span-3");
        body.appendChild(node);
      }
    });

    details.append(summary, body);
    fragment.appendChild(details);
  });

  livePreview.after(fragment);
  form.dataset.grouped = "true";
}

function refreshPrefixPicker() {
  const prefix = state.profile.prefix || "";
  const buttons = document.querySelectorAll("[data-prefix-choice]");
  const customInput = document.querySelector("#customPrefixInput");
  const common = [">", "-", "@@", ">>"];
  const isCommon = common.includes(prefix);

  buttons.forEach((button) => {
    const choice = button.dataset.prefixChoice;
    button.classList.toggle("is-active", choice === prefix);
  });

  if (customInput && document.activeElement !== customInput) {
    customInput.value = isCommon ? "" : prefix;
  }
}

function setPrefix(value) {
  const input = document.querySelector("#prefix");
  state.profile.prefix = value;
  if (input) {
    input.value = value;
    validateFieldElement(input);
  }
  refreshGeneratedStarters();
  render();
}

function buildPlist(entries) {
  const body = entries
    .map(
      (entry) => `  <dict>
    <key>phrase</key>
    <string>${escapeXml(entry.phrase)}</string>
    <key>shortcut</key>
    <string>${escapeXml(entry.shortcut)}</string>
  </dict>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<array>
${body}
</array>
</plist>
`;
}

function downloadTextFile(filename, content) {
  const blob = new Blob([content], { type: "application/x-plist+xml" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();

  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 0);
}

function setStatus(message, tone = "") {
  const banner = document.querySelector("#statusBanner");
  banner.textContent = message;
  banner.className = "status-banner";
  if (tone) {
    banner.classList.add(tone);
  }
}

function renderStarters() {
  const root = document.querySelector("#starterList");
  const template = document.querySelector("#starterTemplate");
  root.innerHTML = "";
  const entries = buildEntries();
  const duplicates = findDuplicates(entries);
  const filter = state.starterFilter.trim().toLowerCase();
  let renderedCount = 0;

  state.starters.forEach((starter) => {
    const definition = definitionById(starter.id);
    const matchesFilter =
      !filter ||
      definition.title.toLowerCase().includes(filter) ||
      definition.category.toLowerCase().includes(filter) ||
      definition.suffix.toLowerCase().includes(filter) ||
      starter.suffix.toLowerCase().includes(filter) ||
      starter.phrase.toLowerCase().includes(filter);

    if (!matchesFilter) {
      return;
    }

    const node = template.content.cloneNode(true);
    const autoEnabled = starterShouldAutoEnable(definition);
    const exportable = starterIsExportable(starter);
    const missingFields = formatMissingFields(definition);
    const shortcut = starterShortcut(starter);
    const isDuplicate = duplicates.has(shortcut) && starter.enabled && exportable;

    node.querySelector(".starter-enabled").checked = starter.enabled;
    node.querySelector(".starter-category").textContent = definition.category;
    node.querySelector(".starter-title").textContent = definition.title;
    node.querySelector(".starter-description").textContent = definition.description;
    node.querySelector(".starter-trigger-preview").textContent = shortcut;
    node.querySelector(".starter-suffix").value = starter.suffix;
    node.querySelector(".starter-phrase").value = starter.phrase;
    node.querySelector(".prefix-chip").textContent = state.profile.prefix || " ";
    node.querySelector(".starter-suffix").dataset.validate = "triggerEnding";

    const card = node.querySelector(".starter-card");
    const note = node.querySelector(".starter-note");
    const status = node.querySelector(".starter-status");
    const duplicateChip = node.querySelector(".duplicate-chip");
    const resetButton = node.querySelector(".starter-reset");

    card.classList.toggle("is-disabled", !starter.enabled);
    card.classList.toggle("starter-card--duplicate", isDuplicate);
    card.dataset.starterId = starter.id;
    duplicateChip.hidden = !isDuplicate;
    resetButton.hidden = !starter.customized && starter.suffix === definition.suffix;

    if (starter.enabled && exportable) {
      status.textContent = starter.customized ? "Manual" : "On";
      status.className = "starter-status is-on";
    } else if (starter.enabled) {
      status.textContent = "Needs info";
      status.className = "starter-status is-warning";
    } else if (exportable && definition.autoEnable === false) {
      status.textContent = "Optional";
      status.className = "starter-status is-ready";
    } else if (autoEnabled) {
      status.textContent = "Ready";
      status.className = "starter-status is-ready";
    } else {
      status.textContent = "Off";
      status.className = "starter-status";
    }

    if (!exportable && !starter.customized && missingFields.length) {
      note.hidden = false;
      note.textContent = `Auto-on with: ${missingFields.join(", ")}.`;
    }

    card.querySelector(".starter-enabled").addEventListener("change", (event) => {
      starter.enabled = event.target.checked;
      starter.manuallySetEnabled = true;
      validateFieldElement(card.querySelector(".starter-suffix"));
      renderStarters();
      renderPreview();
    });

    card.querySelector(".starter-suffix").addEventListener("input", (event) => {
      validateFieldElement(event.target);
      starter.suffix = event.target.value;
      starter.enabled = true;
      starter.manuallySetEnabled = true;
      card.classList.remove("is-disabled");
      card.querySelector(".starter-enabled").checked = true;
      status.textContent = "Manual";
      status.className = "starter-status is-on";
      card.querySelector(".starter-trigger-preview").textContent = starterShortcut(starter);
      state.previewEntry = previewFromStarter(starter);
      renderPreview();
    });

    card.querySelector(".starter-phrase").addEventListener("input", (event) => {
      starter.phrase = event.target.value;
      starter.customized = true;
      starter.enabled = true;
      starter.manuallySetEnabled = true;
      card.classList.remove("is-disabled");
      card.querySelector(".starter-enabled").checked = true;
      status.textContent = "Manual";
      status.className = "starter-status is-on";
      state.previewEntry = previewFromStarter(starter);
      renderPreview();
    });

    resetButton.addEventListener("click", () => {
      starter.suffix = definition.suffix;
      starter.phrase = definition.build(state.profile);
      starter.customized = false;
      render();
    });

    card.addEventListener("mouseenter", () => {
      state.previewEntry = previewFromStarter(starter);
      renderDevicePreview();
    });

    card.addEventListener("focusin", () => {
      state.previewEntry = previewFromStarter(starter);
      renderDevicePreview();
    });

    root.appendChild(node);
    validateFieldElement(card.querySelector(".starter-suffix"));
    renderedCount += 1;
  });

  if (!renderedCount) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "No starter shortcuts match that search.";
    root.appendChild(empty);
  }
}

function renderCustomRows() {
  const root = document.querySelector("#customList");
  const template = document.querySelector("#customTemplate");
  root.innerHTML = "";

  if (!state.custom.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent =
      "No custom shortcuts yet. Add anything the starter list does not already cover.";
    root.appendChild(empty);
    return;
  }

  state.custom.forEach((row) => {
    const node = template.content.cloneNode(true);
    node.querySelector(".custom-enabled").checked = row.enabled;
    node.querySelector(".custom-suffix").value = row.suffix;
    node.querySelector(".custom-phrase").value = row.phrase;
    node.querySelector(".prefix-chip").textContent = state.profile.prefix || " ";
    node.querySelector(".custom-trigger-preview").textContent = `${state.profile.prefix || ""}${row.suffix || ""}`;
    node.querySelector(".custom-suffix").dataset.validate = "customTriggerEnding";

    const card = node.querySelector(".custom-card");
    card.classList.toggle("is-disabled", !row.enabled);

    card.querySelector(".custom-enabled").addEventListener("change", (event) => {
      row.enabled = event.target.checked;
      card.classList.toggle("is-disabled", !row.enabled);
      validateFieldElement(card.querySelector(".custom-suffix"));
      renderPreview();
    });

    card.querySelector(".custom-suffix").addEventListener("input", (event) => {
      validateFieldElement(event.target);
      row.suffix = event.target.value;
      card.querySelector(".custom-trigger-preview").textContent = `${state.profile.prefix || ""}${row.suffix || ""}`;
      renderPreview();
    });

    card.querySelector(".custom-phrase").addEventListener("input", (event) => {
      row.phrase = event.target.value;
      renderPreview();
    });

    card.querySelector(".custom-remove").addEventListener("click", () => {
      state.custom = state.custom.filter((item) => item.id !== row.id);
      render();
    });

    root.appendChild(node);
    validateFieldElement(card.querySelector(".custom-suffix"));
  });
}

function renderPreview() {
  const previewBody = document.querySelector("#previewBody");
  const count = document.querySelector("#shortcutCount");
  const prefixPreview = document.querySelector("#prefixPreview");
  const duplicateCount = document.querySelector("#duplicateCount");

  const entries = buildEntries();
  const duplicates = findDuplicates(entries);
  const enabledCount = state.starters.filter((starter) => starter.enabled).length + state.custom.filter((row) => row.enabled).length;

  previewBody.innerHTML = "";
  prefixPreview.textContent = state.profile.prefix || "(none)";
  count.textContent = String(enabledCount);
  duplicateCount.textContent = String(duplicates.size);

  if (!entries.length) {
    const row = document.createElement("tr");
    row.innerHTML =
      '<td colspan="3" class="empty-state">Add a detail above or turn on a shortcut to preview what will export.</td>';
    previewBody.appendChild(row);
  } else {
    entries.forEach((entry) => {
      const row = document.createElement("tr");
      if (duplicates.has(entry.shortcut)) {
        row.classList.add("duplicate-row");
      }

      row.innerHTML = `
        <td><code>${escapeXml(entry.shortcut)}</code></td>
        <td>${escapeXml(entry.phrase).replaceAll("\n", "<br />")}</td>
        <td>${entry.category}</td>
      `;
      previewBody.appendChild(row);
    });
  }

  renderDevicePreview();

  if (!entries.length) {
    setStatus(
      "Nothing is ready yet. Add a detail above or turn on a shortcut to preview your export.",
    );
    return;
  }

  if (duplicates.size) {
    setStatus(
      "Duplicate triggers detected. Change one of them before you export.",
      "warning",
    );
    return;
  }

  setStatus(
    "Ready to export. Only the shortcuts you kept and completed will be included.",
    "success",
  );
}

function render() {
  renderProfileShortcutPreviews();
  refreshDetailGroupCounts();
  refreshPrefixPicker();
  renderActivePackStack();
  renderPackModal();
  renderStarters();
  renderCustomRows();
  renderPreview();
  saveDraft();
}

function addCustomRow() {
  state.custom.push({
    id: makeId(),
    enabled: true,
    suffix: "",
    phrase: "",
  });
  render();
}

function addCustomRows(count) {
  for (let index = 0; index < count; index += 1) {
    state.custom.push({
      id: makeId(),
      enabled: true,
      suffix: "",
      phrase: "",
    });
  }
  render();
}

function syncProfileFormValues() {
  Object.keys(emptyProfile).forEach((key) => {
    const input = document.querySelector(`#${key}`);
    if (input) {
      input.value = state.profile[key];
      validateFieldElement(input);
    }
  });
}

function wireProfileForm() {
  Object.keys(emptyProfile).forEach((key) => {
    const input = document.querySelector(`#${key}`);
    if (!input) return;

    input.value = state.profile[key];
    input.addEventListener("input", (event) => {
      state.profile[key] = event.target.value;
      validateFieldElement(event.target);
      refreshGeneratedStarters();
      render();
    });
    input.addEventListener("blur", (event) => {
      validateFieldElement(event.target);
    });
    validateFieldElement(input);
  });
}

function clearDraft() {
  if (!storageAvailable()) {
    updateDraftStatus("Local draft unavailable in this browser.");
    return;
  }

  window.localStorage.removeItem(DRAFT_STORAGE_KEY);
  resetStateToDefaults();
  refreshGeneratedStarters(true);
  syncProfileFormValues();
  shouldPersistDraft = false;
  render();
  shouldPersistDraft = true;
  updateDraftStatus("Saved locally");
  setStatus("Local draft cleared. You can start fresh now.", "success");
}

function exportPlist() {
  const validationMessage = validateForm(true);

  if (validationMessage) {
    setStatus(validationMessage, "warning");
    return;
  }

  const entries = buildEntries();
  const duplicates = findDuplicates(entries);

  if (!entries.length) {
    setStatus("Nothing to export yet. Add a detail above or switch on a shortcut first.", "warning");
    return;
  }

  if (duplicates.size) {
    setStatus("Resolve the duplicate triggers before exporting.", "warning");
    return;
  }

  downloadTextFile("Text Substitutions.plist", buildPlist(entries));
  setStatus(
    "Downloaded Text Substitutions.plist. Import it from System Settings on your Mac.",
    "success",
  );
}

document.addEventListener("DOMContentLoaded", () => {
  if (!shortcutData) {
    setStatus(
      "Shortcut Pack did not load correctly. Reopen the file or download the builder again.",
      "warning",
    );
    return;
  }

  const loadedDraft = loadDraft();
  const loadedPacks = applyPackDeepLink();
  groupProfileFields();
  wireProfileForm();
  document.querySelector("#addCustomShortcut")?.addEventListener("click", addCustomRow);
  document.querySelector("#addFiveCustomShortcuts")?.addEventListener("click", () => addCustomRows(5));
  document.querySelector("#downloadPlist")?.addEventListener("click", exportPlist);
  document.querySelector("#topDownloadPlist")?.addEventListener("click", exportPlist);
  document.querySelector("#clearSavedDraft")?.addEventListener("click", clearDraft);
  document.querySelector("#closePackModal")?.addEventListener("click", closePackModal);
  document.querySelector("#packModal")?.addEventListener("click", (event) => {
    if (event.target.id === "packModal") {
      closePackModal();
    }
  });
  document.querySelector("#starterSearch")?.addEventListener("input", (event) => {
    state.starterFilter = event.target.value;
    renderStarters();
  });
  document.querySelector("#hideEmptyFields")?.addEventListener("change", refreshDetailGroupCounts);
  document.querySelectorAll("[data-prefix-choice]").forEach((button) => {
    button.addEventListener("click", () => {
      const choice = button.dataset.prefixChoice;
      setPrefix(choice);
    });
  });
  document.querySelector("#customPrefixInput")?.addEventListener("input", (event) => {
    const value = event.target.value.trim();
    if (value) {
      setPrefix(value);
    }
  });

  document.querySelectorAll("[data-preview-device]").forEach((button) => {
    button.addEventListener("click", () => {
      state.previewDevice = button.dataset.previewDevice;
      document
        .querySelectorAll("[data-preview-device]")
        .forEach((tab) => tab.classList.toggle("is-active", tab === button));
      renderDevicePreview();
    });
  });

  document.addEventListener("keydown", (event) => {
    const target = event.target;
    const inTextField =
      target instanceof HTMLElement &&
      ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
    const command = event.metaKey || event.ctrlKey;

    if (command && event.key.toLowerCase() === "d" && !inTextField) {
      event.preventDefault();
      exportPlist();
    }

    if (command && event.key === "/" && !inTextField) {
      event.preventDefault();
      document.querySelector(".builder-preview")?.classList.toggle("is-collapsed");
    }

    if (command && event.shiftKey && event.key.toLowerCase() === "n" && !inTextField) {
      event.preventDefault();
      addCustomRow();
    }

    if (event.key === "Escape") {
      closePackModal();
    }
  });

  const navLinks = Array.from(document.querySelectorAll("[data-section-nav]"));
  const navTargets = navLinks
    .map((link) => document.getElementById(link.dataset.sectionNav))
    .filter(Boolean);

  function setActiveNav(sectionId) {
    navLinks.forEach((link) => {
      link.classList.toggle("is-active", link.dataset.sectionNav === sectionId);
    });
  }

  function updateActiveNav() {
    if (!navTargets.length) return;

    const topbarHeight = document.querySelector(".topbar")?.getBoundingClientRect().height || 0;
    const markerY = window.scrollY + topbarHeight + 28;
    let activeTarget = navTargets[0];

    navTargets.forEach((target) => {
      const targetTop = target.getBoundingClientRect().top + window.scrollY;
      if (targetTop <= markerY) {
        activeTarget = target;
      }
    });

    const pageBottom = window.scrollY + window.innerHeight;
    const documentBottom = document.documentElement.scrollHeight;
    if (documentBottom - pageBottom < 4) {
      activeTarget = navTargets[navTargets.length - 1];
    }

    setActiveNav(activeTarget.id);
  }

  if (navTargets.length) {
    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        setActiveNav(link.dataset.sectionNav);
      });
    });

    updateActiveNav();
    window.addEventListener("scroll", updateActiveNav, { passive: true });
    window.addEventListener("resize", updateActiveNav);
  }

  render();

  if (loadedPacks) {
    updateDraftStatus("Saved locally");
  } else if (loadedDraft) {
    updateDraftStatus("Saved locally");
  } else {
    updateDraftStatus("Saved locally");
  }
});
