const shortcutData = globalThis.AI_SHORTCUTS_DATA;
const emptyProfile = shortcutData.emptyProfile;
const starterPack = shortcutData.starterPack;

const state = {
  profile: { ...emptyProfile },
  starters: starterPack.map((definition) => ({
    id: definition.id,
    enabled: true,
    suffix: definition.suffix,
    phrase: definition.build(emptyProfile),
    customized: false,
  })),
  custom: [],
};

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

function profileValuePresent(key) {
  return Boolean(state.profile[key] && String(state.profile[key]).trim());
}

function starterRequirementsMet(definition) {
  const requiredFields = definition?.requiredProfileFields || [];

  if (!requiredFields.length) {
    return true;
  }

  const matches = requiredFields.map(profileValuePresent);

  if (definition.requiredProfileMode === "any") {
    return matches.some(Boolean);
  }

  return matches.every(Boolean);
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
    firstName: "first name",
    email: "email",
    phone: "phone",
    website: "website",
    address: "address",
    calendly: "scheduling link",
    bio: "short bio",
    company: "company",
    family: "family detail",
  };

  const requiredFields = definition?.requiredProfileFields || [];
  const missingFields = requiredFields.filter((key) => !profileValuePresent(key));

  return missingFields.map((key) => labels[key] || key);
}

function computeStarterPhrase(id) {
  const definition = definitionById(id);
  return definition ? definition.build(state.profile) : "";
}

function makeId() {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `custom-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function refreshGeneratedStarters(force = false) {
  state.starters = state.starters.map((item) => {
    if (!item.customized || force) {
      return {
        ...item,
        phrase: computeStarterPhrase(item.id),
        customized: false,
      };
    }
    return item;
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

    node.querySelector(".starter-enabled").checked = starter.enabled;
    node.querySelector(".starter-category").textContent = definition.category;
    node.querySelector(".starter-title").textContent = definition.title;
    node.querySelector(".starter-description").textContent = definition.description;
    node.querySelector(".starter-suffix").value = starter.suffix;
    node.querySelector(".starter-phrase").value = starter.phrase;
    node.querySelector(".prefix-chip").textContent = state.profile.prefix || " ";

    const card = node.querySelector(".starter-card");
    const note = node.querySelector(".starter-note");
    const exportable = starterIsExportable(starter);
    const missingFields = formatMissingFields(definition);

    if (!exportable && !starter.customized && missingFields.length) {
      note.hidden = false;
      note.textContent = `Excluded from export until you fill in: ${missingFields.join(", ")}.`;
    }

    card.querySelector(".starter-enabled").addEventListener("change", (event) => {
      starter.enabled = event.target.checked;
      render();
    });

    card.querySelector(".starter-suffix").addEventListener("input", (event) => {
      starter.suffix = event.target.value;
      renderPreview();
    });

    card.querySelector(".starter-phrase").addEventListener("input", (event) => {
      starter.phrase = event.target.value;
      starter.customized = true;
      renderPreview();
    });

    root.appendChild(node);
  });
}

function renderCustomRows() {
  const root = document.querySelector("#customList");
  const template = document.querySelector("#customTemplate");
  root.innerHTML = "";

  if (!state.custom.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "No custom rows yet. Add any extra shortcut that is unique to you.";
    root.appendChild(empty);
    return;
  }

  state.custom.forEach((row) => {
    const node = template.content.cloneNode(true);
    node.querySelector(".custom-enabled").checked = row.enabled;
    node.querySelector(".custom-suffix").value = row.suffix;
    node.querySelector(".custom-phrase").value = row.phrase;
    node.querySelector(".prefix-chip").textContent = state.profile.prefix || " ";

    const card = node.querySelector(".custom-card");

    card.querySelector(".custom-enabled").addEventListener("change", (event) => {
      row.enabled = event.target.checked;
      renderPreview();
    });

    card.querySelector(".custom-suffix").addEventListener("input", (event) => {
      row.suffix = event.target.value;
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
      '<td colspan="3" class="empty-state">Fill in some profile details or add a custom shortcut to see the export preview.</td>';
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
      "No valid shortcuts yet. Add at least one shortcut with both a suffix and expanded text.",
    );
    return;
  }

  if (duplicates.size) {
    setStatus(
      "Duplicate shortcuts detected. Adjust the suffixes before exporting so macOS only sees one phrase for each trigger.",
      "warning",
    );
    return;
  }

  setStatus(
    "Your shortcut pack is ready to export. Download the plist and drag it into macOS Text Replacements.",
    "success",
  );
}

function render() {
  renderStarters();
  renderCustomRows();
  renderPreview();
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

function wireProfileForm() {
  Object.keys(emptyProfile).forEach((key) => {
    const input = document.querySelector(`#${key}`);
    if (!input) return;

    input.value = state.profile[key];
    input.addEventListener("input", (event) => {
      state.profile[key] = event.target.value;
      refreshGeneratedStarters();
      render();
    });
  });
}

function exportPlist() {
  const entries = buildEntries();
  const duplicates = findDuplicates(entries);

  if (!entries.length) {
    setStatus("Nothing to export yet. Add at least one valid shortcut first.", "warning");
    return;
  }

  if (duplicates.size) {
    setStatus("Resolve duplicate shortcuts before exporting.", "warning");
    return;
  }

  downloadTextFile("Text Substitutions.plist", buildPlist(entries));
  setStatus(
    "Downloaded Text Substitutions.plist. Import it by dragging it into macOS Text Replacements.",
    "success",
  );
}

document.addEventListener("DOMContentLoaded", () => {
  if (!shortcutData) {
    setStatus(
      "The starter pack failed to load. Try reopening this folder in a browser or let me know and I will tighten it further.",
      "warning",
    );
    return;
  }

  wireProfileForm();
  document.querySelector("#addCustomShortcut").addEventListener("click", addCustomRow);
  document.querySelector("#downloadPlist").addEventListener("click", exportPlist);
  document.querySelector("#resetGenerated").addEventListener("click", () => {
    refreshGeneratedStarters(true);
    render();
  });

  render();
});
