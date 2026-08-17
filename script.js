/* ---------- data helpers ---------- */
function getData(key) {
  return JSON.parse(localStorage.getItem(key) || "[]");
}
function setData(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}
function readFileAsDataURL(fileInput) {
  return new Promise(resolve => {
    const file = fileInput.files && fileInput.files[0];
    if (!file) { resolve(""); return; }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
}
function bindPhotoPreview(inputId, previewId) {
  const input = document.getElementById(inputId);
  const preview = document.getElementById(previewId);
  if (!input || !preview) return;
  input.addEventListener("change", () => {
    const file = input.files && input.files[0];
    if (!file) { preview.style.display = "none"; return; }
    const reader = new FileReader();
    reader.onload = () => { preview.src = reader.result; preview.style.display = "block"; };
    reader.readAsDataURL(file);
  });
}

/* ---------- seed sample data once ---------- */
function seedData() {
  if (localStorage.getItem("ss_seeded")) return;

  setData("ss_content", [
    { id: uid(), type: "Notice", title: "Mid-term exam schedule", desc: "Exam routine has been published. Check the notice board.", date: "2026-08-20" },
    { id: uid(), type: "Notice", title: "Class suspended", desc: "Classes suspended tomorrow due to holiday.", date: "2026-08-18" },
    { id: uid(), type: "Event", title: "Annual Tech Fest", desc: "Join the annual tech fest with workshops and competitions.", date: "2026-09-05" },
    { id: uid(), type: "Event", title: "Freshers Reception", desc: "Welcome program for new students.", date: "2026-08-25" },
    { id: uid(), type: "Job", title: "Software Engineer Intern", desc: "3-month internship, remote friendly.", date: "2026-08-15", company: "TechNova Ltd" },
    { id: uid(), type: "Job", title: "Junior Web Developer", desc: "Entry-level role for recent graduates.", date: "2026-08-10", company: "PixelWorks" }
  ]);

  setData("ss_resources", [
    { id: uid(), title: "Data Structures Notes", category: "Lecture notes", batch: "2021" },
    { id: uid(), title: "Algorithms Question Bank", category: "Previous questions", batch: "2020" },
    { id: uid(), title: "OOP Slides", category: "Slides", batch: "2021" }
  ]);

  setData("ss_gallery", [
    { id: uid(), title: "Tech Fest 2025", category: "Event album", batch: "2025" },
    { id: uid(), title: "Orientation Day", category: "Campus life", batch: "2025" }
  ]);

  setData("ss_achievements", [
    { id: uid(), name: "Rafiul Islam", title: "1st place, National Programming Contest" },
    { id: uid(), name: "Nusrat Jahan", title: "Best Project Award, Tech Fest" }
  ]);

  setData("ss_committee", [
    { id: uid(), name: "Tanvir Ahmed", role: "President", email: "president@softwaresociety.org" },
    { id: uid(), name: "Sadia Rahman", role: "General Secretary", email: "secretary@softwaresociety.org" }
  ]);

  localStorage.setItem("ss_seeded", "1");
}

/* ---------- nav active link ---------- */
function highlightNav() {
  const page = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("header a").forEach(a => {
    if (a.getAttribute("href") === page) a.classList.add("active");
  });
}

/* ---------- public: notice/event/job cards ---------- */
function renderCardList(containerId, type, limit) {
  const el = document.getElementById(containerId);
  if (!el) return;
  let items = getData("ss_content").filter(i => i.type === type);
  items.sort((a, b) => new Date(b.date) - new Date(a.date));
  if (limit) items = items.slice(0, limit);

  if (items.length === 0) {
    el.innerHTML = '<p class="empty">No ' + type.toLowerCase() + 's posted yet.</p>';
    return;
  }

  el.innerHTML = items.map(i => `
    <div class="card">
      <h3>${i.title}</h3>
      <p>${i.date}${i.company ? " · " + i.company : ""}</p>
      <p style="margin-top:6px; color:#555;">${i.desc}</p>
      ${i.type === "Job" ? '<p style="margin-top:6px;"><a href="#" onclick="return false;" style="color:#2980b9;">View posting</a></p>' : ""}
    </div>
  `).join("");
}

/* ---------- public: resources with filters ---------- */
function renderResources() {
  const listEl = document.getElementById("resource-list");
  if (!listEl) return;

  const catSel = document.getElementById("filter-category");
  const batchSel = document.getElementById("filter-batch");
  const data = getData("ss_resources");

  const cats = [...new Set(data.map(r => r.category))];
  const batches = [...new Set(data.map(r => r.batch))];
  catSel.innerHTML = '<option value="">All categories</option>' + cats.map(c => `<option>${c}</option>`).join("");
  batchSel.innerHTML = '<option value="">All batches</option>' + batches.map(b => `<option>${b}</option>`).join("");

  function draw() {
    const cat = catSel.value, batch = batchSel.value;
    const filtered = data.filter(r => (!cat || r.category === cat) && (!batch || r.batch === batch));
    listEl.innerHTML = filtered.length
      ? filtered.map(r => `
        <div class="list-item">
          <span>${r.title} <small style="color:#999;">(${r.category}, batch ${r.batch})</small></span>
          <a href="#" onclick="alert('Demo: file download would start here.'); return false;">Download</a>
        </div>`).join("")
      : '<p class="empty">No resources match this filter.</p>';
  }

  catSel.addEventListener("change", draw);
  batchSel.addEventListener("change", draw);
  draw();
}

/* ---------- public: gallery / achievements / committee ---------- */
function renderGallery() {
  const el = document.getElementById("gallery-list");
  if (!el) return;
  const items = getData("ss_gallery");
  el.innerHTML = items.length
    ? items.map(g => `<div class="gallery-item" title="${g.title}"></div>`).join("")
    : '<p class="empty">No photos uploaded yet.</p>';
}

function renderAchievements() {
  const el = document.getElementById("achievement-list");
  if (!el) return;
  const items = getData("ss_achievements");
  el.innerHTML = items.length
    ? items.map(a => `<div class="card profile-card">
        ${a.photo ? `<img src="${a.photo}" style="width:46px;height:46px;border-radius:50%;object-fit:cover;margin:0 auto 8px;display:block;">` : '<div class="avatar"></div>'}
        <h3>${a.name}</h3><p>${a.title}</p>
        ${a.desc ? `<p style="margin-top:6px;color:#555;">${a.desc}</p>` : ""}
      </div>`).join("")
    : '<p class="empty">No achievements recorded yet.</p>';
}

function renderCommittee() {
  const el = document.getElementById("committee-list");
  if (!el) return;
  const items = getData("ss_committee");
  el.innerHTML = items.length
    ? items.map(m => `<div class="card profile-card">
        ${m.photo ? `<img src="${m.photo}" style="width:46px;height:46px;border-radius:50%;object-fit:cover;margin:0 auto 8px;display:block;">` : '<div class="avatar"></div>'}
        <h3>${m.name}</h3><p>${m.role}</p><p><a href="mailto:${m.email}">${m.email}</a></p>
      </div>`).join("")
    : '<p class="empty">No committee records yet.</p>';
}

/* ---------- contact form ---------- */
function bindContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;
  form.addEventListener("submit", e => {
    e.preventDefault();
    alert("Demo: message sent (no backend connected).");
    form.reset();
  });
}

/* ================= ADMIN ================= */

function requireLogin() {
  if (!sessionStorage.getItem("ss_admin")) {
    location.href = "admin-login.html";
  }
}

function bindLoginForm() {
  const form = document.getElementById("login-form");
  if (!form) return;
  form.addEventListener("submit", e => {
    e.preventDefault();
    const u = document.getElementById("username").value.trim();
    const p = document.getElementById("password").value.trim();
    const errEl = document.getElementById("login-error");
    // demo credentials
    if (u === "admin" && p === "admin123") {
      sessionStorage.setItem("ss_admin", "1");
      location.href = "admin-dashboard.html";
    } else {
      errEl.textContent = "Invalid username or password.";
    }
  });
}

function bindLogout() {
  const btn = document.getElementById("logout-btn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    sessionStorage.removeItem("ss_admin");
    location.href = "admin-login.html";
  });
}

/* ---- admin dashboard: notices/events/jobs table ---- */
function initAdminDashboard() {
  const table = document.getElementById("content-table");
  if (!table) return;

  const params = new URLSearchParams(location.search);
  const type = params.get("type") || "Notice";
  document.querySelectorAll(".tab-link").forEach(t => {
    t.classList.toggle("active", t.dataset.type === type);
  });
  document.getElementById("dashboard-title").textContent = "Manage " + type.toLowerCase() + "s";
  document.getElementById("add-new-link").href = "admin-form.html?type=" + type;

  function draw() {
    const items = getData("ss_content").filter(i => i.type === type)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    const body = document.getElementById("content-table-body");
    body.innerHTML = items.length
      ? items.map(i => `
        <tr>
          <td>${i.title}</td>
          <td>${i.date}</td>
          <td>${i.company || "-"}</td>
          <td>
            <a href="admin-form.html?type=${type}&id=${i.id}">Edit</a> |
            <a href="#" onclick="deleteContent('${i.id}'); return false;">Delete</a>
          </td>
        </tr>`).join("")
      : '<tr><td colspan="4" class="empty">No entries yet.</td></tr>';
  }
  window.deleteContent = function (id) {
    if (!confirm("Delete this entry?")) return;
    setData("ss_content", getData("ss_content").filter(i => i.id !== id));
    draw();
  };
  draw();
}

/* ---- admin: add/edit notice/event/job form ---- */
function initContentForm() {
  const form = document.getElementById("content-form");
  if (!form) return;

  const params = new URLSearchParams(location.search);
  const type = params.get("type") || "Notice";
  const id = params.get("id");

  document.getElementById("form-title").textContent = (id ? "Edit " : "Add new ") + type.toLowerCase();
  document.getElementById("type-field").value = type;

  const companyRow = document.getElementById("company-row");
  companyRow.style.display = type === "Job" ? "block" : "none";

  if (id) {
    const item = getData("ss_content").find(i => i.id === id);
    if (item) {
      document.getElementById("title-field").value = item.title;
      document.getElementById("desc-field").value = item.desc;
      document.getElementById("date-field").value = item.date;
      if (item.company) document.getElementById("company-field").value = item.company;
    }
  }

  function save(publish) {
    const title = document.getElementById("title-field").value.trim();
    const desc = document.getElementById("desc-field").value.trim();
    const date = document.getElementById("date-field").value;
    const company = document.getElementById("company-field").value.trim();
    if (!title || !date) {
      document.getElementById("form-error").textContent = "Title and date are required.";
      return;
    }
    let items = getData("ss_content");
    if (id) {
      items = items.map(i => i.id === id ? { ...i, title, desc, date, company, status: publish ? "Published" : "Draft" } : i);
    } else {
      items.push({ id: uid(), type, title, desc, date, company, status: publish ? "Published" : "Draft" });
    }
    setData("ss_content", items);
    location.href = "admin-dashboard.html?type=" + type;
  }

  document.getElementById("save-draft-btn").addEventListener("click", () => save(false));
  document.getElementById("publish-btn").addEventListener("click", () => save(true));
}

/* ---- admin: resource upload ---- */
function initResourceAdmin() {
  const form = document.getElementById("resource-form");
  if (!form) return;

  function draw() {
    const items = getData("ss_resources");
    document.getElementById("resource-table-body").innerHTML = items.length
      ? items.map(r => `<tr><td>${r.title}</td><td>${r.category}</td><td>${r.batch}</td>
          <td><a href="#" onclick="deleteResource('${r.id}'); return false;">Delete</a></td></tr>`).join("")
      : '<tr><td colspan="4" class="empty">No resources uploaded yet.</td></tr>';
  }
  window.deleteResource = function (id) {
    if (!confirm("Delete this resource?")) return;
    setData("ss_resources", getData("ss_resources").filter(r => r.id !== id));
    draw();
  };

  document.getElementById("resource-upload-btn").addEventListener("click", () => {
    const title = document.getElementById("res-title").value.trim();
    const category = document.getElementById("res-category").value;
    const batch = document.getElementById("res-batch").value.trim();
    if (!title || !batch) {
      document.getElementById("resource-error").textContent = "File title and batch are required.";
      return;
    }
    const items = getData("ss_resources");
    items.push({ id: uid(), title, category, batch });
    setData("ss_resources", items);
    document.getElementById("res-title").value = "";
    document.getElementById("res-batch").value = "";
    document.getElementById("resource-error").textContent = "";
    draw();
  });
  draw();
}

/* ---- admin: gallery upload ---- */
function initGalleryAdmin() {
  const form = document.getElementById("gallery-form");
  if (!form) return;

  function draw() {
    const items = getData("ss_gallery");
    document.getElementById("admin-gallery-grid").innerHTML = items.length
      ? items.map(g => `<div class="gallery-item" title="${g.title}"></div>`).join("")
      : '<p class="empty">No images uploaded yet.</p>';
  }

  document.getElementById("gallery-upload-btn").addEventListener("click", () => {
    const title = document.getElementById("gal-title").value.trim();
    const category = document.getElementById("gal-category").value;
    const batch = document.getElementById("gal-batch").value.trim();
    if (!title) {
      document.getElementById("gallery-error").textContent = "File title is required.";
      return;
    }
    const items = getData("ss_gallery");
    items.push({ id: uid(), title, category, batch });
    setData("ss_gallery", items);
    document.getElementById("gal-title").value = "";
    document.getElementById("gal-batch").value = "";
    document.getElementById("gallery-error").textContent = "";
    draw();
  });
  draw();
}

/* ---- admin: achievements ---- */
function initAchievementAdmin() {
  const form = document.getElementById("achievement-form");
  if (!form) return;

  function drawTable() {
    const items = getData("ss_achievements");
    document.getElementById("achievement-table-body").innerHTML = items.length
      ? items.map(a => `<tr><td>${a.photo ? `<img src="${a.photo}" style="width:32px;height:32px;border-radius:6px;object-fit:cover;vertical-align:middle;margin-right:8px;">` : ""}${a.name}</td><td>${a.title}</td>
          <td><a href="#" onclick="deleteAchievement('${a.id}'); return false;">Delete</a></td></tr>`).join("")
      : '<tr><td colspan="3" class="empty">No achievements yet.</td></tr>';
  }
  window.deleteAchievement = function (id) {
    if (!confirm("Delete this achievement?")) return;
    setData("ss_achievements", getData("ss_achievements").filter(a => a.id !== id));
    drawTable();
  };

  bindPhotoPreview("ach-photo", "ach-photo-preview");

  document.getElementById("achievement-save-btn").addEventListener("click", async () => {
    const name = document.getElementById("ach-name").value.trim();
    const title = document.getElementById("ach-title").value.trim();
    const desc = document.getElementById("ach-desc").value.trim();
    const photoInput = document.getElementById("ach-photo");
    if (!name || !title) { document.getElementById("achievement-error").textContent = "Name and title are required."; return; }
    const photo = await readFileAsDataURL(photoInput);
    const items = getData("ss_achievements");
    items.push({ id: uid(), name, title, desc, photo });
    setData("ss_achievements", items);
    document.getElementById("ach-name").value = "";
    document.getElementById("ach-title").value = "";
    document.getElementById("ach-desc").value = "";
    photoInput.value = "";
    document.getElementById("ach-photo-preview").style.display = "none";
    document.getElementById("achievement-error").textContent = "";
    drawTable();
  });

  drawTable();
}

/* ---- admin: committee ---- */
function initCommitteeAdmin() {
  const form = document.getElementById("committee-form");
  if (!form) return;

  function drawTable() {
    const items = getData("ss_committee");
    document.getElementById("committee-table-body").innerHTML = items.length
      ? items.map(m => `<tr><td>${m.photo ? `<img src="${m.photo}" style="width:32px;height:32px;border-radius:50%;object-fit:cover;vertical-align:middle;margin-right:8px;">` : ""}${m.name}</td><td>${m.role}</td>
          <td><a href="#" onclick="deleteCommitteeMember('${m.id}'); return false;">Delete</a></td></tr>`).join("")
      : '<tr><td colspan="3" class="empty">No committee members yet.</td></tr>';
  }
  window.deleteCommitteeMember = function (id) {
    if (!confirm("Delete this member?")) return;
    setData("ss_committee", getData("ss_committee").filter(m => m.id !== id));
    drawTable();
  };

  bindPhotoPreview("mem-photo", "mem-photo-preview");

  document.getElementById("committee-save-btn").addEventListener("click", async () => {
    const name = document.getElementById("mem-name").value.trim();
    const role = document.getElementById("mem-role").value.trim();
    const email = document.getElementById("mem-email").value.trim();
    const photoInput = document.getElementById("mem-photo");
    if (!name || !role) { document.getElementById("committee-error").textContent = "Name and role are required."; return; }
    const photo = await readFileAsDataURL(photoInput);
    const items = getData("ss_committee");
    items.push({ id: uid(), name, role, email, photo });
    setData("ss_committee", items);
    document.getElementById("mem-name").value = "";
    document.getElementById("mem-role").value = "";
    document.getElementById("mem-email").value = "";
    photoInput.value = "";
    document.getElementById("mem-photo-preview").style.display = "none";
    document.getElementById("committee-error").textContent = "";
    drawTable();
  });

  drawTable();
}

/* ---------- run on every page load ---------- */
document.addEventListener("DOMContentLoaded", () => {
  seedData();
  highlightNav();

  renderCardList("home-notice-list", "Notice", 3);
  renderCardList("notice-list", "Notice");
  renderCardList("event-list", "Event");
  renderCardList("job-list", "Job");
  renderResources();
  renderGallery();
  renderAchievements();
  renderCommittee();
  bindContactForm();

  bindLoginForm();
  bindLogout();
  initAdminDashboard();
  initContentForm();
  initResourceAdmin();
  initGalleryAdmin();
  initAchievementAdmin();
  initCommitteeAdmin();
});
