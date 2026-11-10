// Fixed filter options so the dropdowns stay stable as data changes.
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

let jobs = [];
let companies = {};

function fillSelect(el, values) {
  for (const v of values) {
    const o = document.createElement("option");
    o.value = v; o.textContent = v;
    el.appendChild(o);
  }
}

function render() {
  const s = $("f-seniority").value;
  const l = $("f-location").value;
  const list = jobs.filter((j) => {
    const c = companies[j.company_id] || {};
    return (!s || j.seniority === s) && (!l || c.office_area === l);
  });

  $("count").textContent = `${list.length} role${list.length === 1 ? "" : "s"}`;

  if (!list.length) {
    $("jobs").innerHTML = '<p class="empty">No roles match these filters yet.</p>';
    return;
  }

  $("jobs").innerHTML = list.map((j) => {
    const c = companies[j.company_id] || {};
    return `
      <article class="job">
        <div class="job-top">
          <div>
            <h2>${esc(j.title)}</h2>
            <div class="company">${esc(c.name)}</div>
            <div class="chips">
              <span class="chip">${esc(j.seniority)}</span>
              <span class="chip">${esc(j.type)}</span>
              <span class="chip">${esc(c.office_area)}</span>
              ${c.stage ? `<span class="chip">${esc(c.stage)}</span>` : ""}
            </div>
          </div>
          <a class="apply" href="${esc(j.apply_url)}" target="_blank" rel="noopener">Apply</a>
        </div>
        <details>
          <summary>About ${esc(c.name)}</summary>
          <p><strong>Mission:</strong> ${esc(c.mission)}</p>
          ${c.sector ? `<p><strong>Sector:</strong> ${esc(c.sector)}</p>` : ""}
          ${c.funding_news ? `<p><strong>Funding:</strong> ${esc(c.funding_news)}</p>` : ""}
        </details>
      </article>`;
  }).join("");
}

async function init() {
  fillSelect($("f-seniority"), SENIORITY);
  fillSelect($("f-location"), LOCATIONS);
  $("f-seniority").addEventListener("change", render);
  $("f-location").addEventListener("change", render);
  $("f-reset").addEventListener("click", () => {
    $("f-seniority").value = ""; $("f-location").value = ""; render();
  });

  try {
    const res = await fetch("data/jobs.json", { cache: "no-cache" });
    const data = await res.json();
    jobs = (data.jobs || []).sort((a, b) => (b.posted || "").localeCompare(a.posted || ""));
    companies = Object.fromEntries((data.companies || []).map((c) => [c.id, c]));
    render();
  } catch (e) {
    $("jobs").innerHTML = '<p class="empty">Could not load jobs.</p>';
  }
}

init();
