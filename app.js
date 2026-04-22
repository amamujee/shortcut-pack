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
}

function updateDraftStatus(message) {
  const node = document.querySelector("#draftStatus");
  if (node) {
    node.textContent = message;
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
    updateDraftStatus("Saved locally in this browser.");
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

  state.starters.forEach((starter) => {
    const definition = definitionById(starter.id);
    const node = template.content.cloneNode(true);
    const autoEnabled = starterShouldAutoEnable(definition);
    const exportable = starterIsExportable(starter);
    const missingFields = formatMissingFields(definition);

    node.querySelector(".starter-enabled").checked = starter.enabled;
    node.querySelector(".starter-category").textContent = definition.category;
    node.querySelector(".starter-title").textContent = definition.title;
    node.querySelector(".starter-description").textContent = definition.description;
    node.querySelector(".starter-trigger-preview").textContent = `${
      state.profile.prefix || ""
    }${starter.suffix || ""}`;
    node.querySelector(".starter-suffix").value = starter.suffix;
    node.querySelector(".starter-phrase").value = starter.phrase;
    node.querySelector(".prefix-chip").textContent = state.profile.prefix || " ";
    node.querySelector(".starter-suffix").dataset.validate = "triggerEnding";

    const card = node.querySelector(".starter-card");
    const note = node.querySelector(".starter-note");
    const status = node.querySelector(".starter-status");

    card.classList.toggle("is-disabled", !starter.enabled);

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
      card.querySelector(".starter-trigger-preview").textContent = `${
        state.profile.prefix || ""
      }${starter.suffix || ""}`;
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
      renderPreview();
    });

    root.appendChild(node);
    validateFieldElement(card.querySelector(".starter-suffix"));
  });
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

  previewBody.innerHTML = "";
  prefixPreview.textContent = state.profile.prefix || "(none)";
  count.textContent = String(entries.length);
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
  updateDraftStatus("Local draft cleared from this browser.");
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
    "Downloaded Text Substitutions.plist. Open System Settings > Keyboard > Text Replacements and drag it in.",
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
  wireProfileForm();
  document.querySelector("#addCustomShortcut").addEventListener("click", addCustomRow);
  document.querySelector("#downloadPlist").addEventListener("click", exportPlist);
  document.querySelector("#clearSavedDraft").addEventListener("click", clearDraft);

  render();

  if (loadedDraft) {
    updateDraftStatus("Loaded your local draft from this browser.");
  } else {
    updateDraftStatus("Saved locally in this browser.");
  }
});
