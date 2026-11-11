// Filter options are fixed so the chips stay in a stable order as data changes.
// Add a new office area here before using it in data/jobs.json.
const SENIORITY = ["Junior", "Mid-level", "Senior", "Director/Head of"];
const LOCATIONS = [
  "King's Cross",
  "Old Street / Shoreditch",
  "Oxford Circus / Soho",
  "Farringdon",
  "London Bridge",
  "Canary Wharf",
  "Fully remote"
];

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const state = { level: "", office: "" };
let jobs = [];
let companies = {};

const officeOf = (j) => (companies[j.company_id] || {}).office_area;

// Keep filters in the URL so a filtered view can be shared or bookmarked.
function readUrl() {
  const p = new URLSearchParams(location.search);
  state.level = SENIORITY.includes(p.get("level")) ? p.get("level") : "";
  state.office = LOCATIONS.includes(p.get("office")) ? p.get("office") : "";
}

function writeUrl() {
  const p = new URLSearchParams();
  if (state.level) p.set("level", state.level);
  if (state.office) p.set("office", state.office);
  const q = p.toString();
  history.replaceState(null, "", q ? `?${q}` : location.pathname);
}

function renderChips(el, options, key, countFor) {
  const all = [["", "All", null], ...options.map((o) => [o, o, countFor(o)])];
  el.innerHTML = all.map(([value, label, n]) => {
    const pressed = state[key] === value;
    const disabled = n === 0 && !pressed;
    return `<button type="button" class="chip" data-key="${key}" data-value="${esc(value)}"
      aria-pressed="${pressed}"${disabled ? " disabled" : ""}>${esc(label)}${n === null ? "" : `<span class="n">${n}</span>`}</button>`;
  }).join("");
}

function renderFilters() {
  // Each count reflects the other active filter, so it shows what you'd get by tapping it.
  renderChips($("f-seniority"), SENIORITY, "level",
    (v) => jobs.filter((j) => j.seniority === v && (!state.office || officeOf(j) === state.office)).length);
  renderChips($("f-location"), LOCATIONS, "office",
    (v) => jobs.filter((j) => officeOf(j) === v && (!state.level || j.seniority === state.level)).length);
}

function jobHtml(j) {
  const c = companies[j.company_id] || {};
  const tags = [j.seniority, j.type, c.office_area].filter(Boolean);
  const facts = [
    ["Sector", c.sector],
    ["Stage", c.stage],
    ["Funding", c.funding_news],
    ["Website", c.website ? `<a href="${esc(c.website)}" target="_blank" rel="noopener">${esc(c.website.replace(/^https?:\/\//, ""))}</a>` : ""]
  ].filter(([, v]) => v);

  return `
    <li class="job">
      <div>
        ${c.sector ? `<p class="job-sector">${esc(c.sector)}</p>` : ""}
        <h2 class="job-title">${esc(j.title)}</h2>
        <p class="job-company">${esc(c.name)}</p>
        <ul class="tags">${tags.map((t) => `<li class="tag">${esc(t)}</li>`).join("")}</ul>
      </div>
      <a class="apply" href="${esc(j.apply_url)}" target="_blank" rel="noopener">Apply<span class="visually-hidden"> for ${esc(j.title)} at ${esc(c.name)}</span></a>
      <details class="about">
        <summary>About ${esc(c.name)}</summary>
        <div class="about-body">
          ${c.mission ? `<p class="mission">${esc(c.mission)}</p>` : ""}
          ${facts.length ? `<dl class="facts">${facts.map(([k, v]) => `<dt>${k}</dt><dd>${k === "Website" ? v : esc(v)}</dd>`).join("")}</dl>` : ""}
        </div>
      </details>
    </li>`;
}

function render() {
  const list = jobs.filter((j) =>
    (!state.level || j.seniority === state.level) &&
    (!state.office || officeOf(j) === state.office));

  renderFilters();
  $("f-reset").hidden = !state.level && !state.office;
  $("count").textContent = `${list.length} open role${list.length === 1 ? "" : "s"}`;

  $("jobs").innerHTML = list.length
    ? list.map(jobHtml).join("")
    : `<li class="empty"><p>No roles match these filters yet. Try another level or office.</p></li>`;
}

function onChipClick(e) {
  const chip = e.target.closest(".chip");
  if (!chip || chip.disabled) return;
  state[chip.dataset.key] = chip.dataset.value;
  writeUrl();
  render();
  // Re-rendering replaces the buttons, so put focus back on the one just pressed.
  const again = document.querySelector(`.chip[data-key="${chip.dataset.key}"][data-value="${CSS.escape(chip.dataset.value)}"]`);
  if (again) again.focus();
}

async function init() {
  readUrl();
  $("f-seniority").addEventListener("click", onChipClick);
  $("f-location").addEventListener("click", onChipClick);
  $("f-reset").addEventListener("click", () => {
    state.level = ""; state.office = "";
    writeUrl(); render();
  });

  try {
    const res = await fetch("data/jobs.json", { cache: "no-cache" });
    if (!res.ok) throw new Error(res.status);
    const data = await res.json();
    jobs = (data.jobs || []).sort((a, b) => (b.posted || "").localeCompare(a.posted || ""));
    companies = Object.fromEntries((data.companies || []).map((c) => [c.id, c]));
    render();
  } catch (e) {
    $("count").textContent = "";
    $("jobs").innerHTML = '<li class="empty"><p>The job list didn\'t load. Refresh the page to try again.</p></li>';
  }
}

init();
