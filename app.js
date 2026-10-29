const menuToggle = document.querySelector(".menu-toggle");
const primaryNav = document.querySelector(".primary-nav");
const contrastToggle = document.querySelector(".contrast-toggle");
const searchInput = document.querySelector("#site-search");
const programCards = [...document.querySelectorAll(".program-card")];
const searchableItems = [...document.querySelectorAll("[data-searchable]")];
const noResults = document.querySelector("#no-results");
const searchHint = document.querySelector("#search-hint");
const portalDialog = document.querySelector("#portal-dialog");
const contactDialog = document.querySelector("#contact-dialog");
const contactForm = document.querySelector("#contact-form");
const contactStatus = document.querySelector("#contact-status");
const selectedCourses = new Set();
let activePortalScreen = "signin";

document.querySelector("#current-year").textContent = String(new Date().getFullYear());

menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  menuToggle.querySelector(".sr-only").textContent = isOpen ? "Open navigation" : "Close navigation";
  primaryNav.classList.toggle("is-open", !isOpen);
});

primaryNav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.querySelector(".sr-only").textContent = "Open navigation";
    primaryNav.classList.remove("is-open");
  });
});

contrastToggle.addEventListener("click", () => {
  const enabled = document.body.classList.toggle("high-contrast");
  contrastToggle.setAttribute("aria-pressed", String(enabled));
  contrastToggle.querySelector("span:last-child").textContent = enabled ? "Standard" : "Contrast";
});

function runSearch(query) {
  const normalized = query.trim().toLowerCase();
  let matches = 0;
  searchableItems.forEach((item) => {
    const isMatch = !normalized || item.dataset.searchable.toLowerCase().includes(normalized);
    if (item.classList.contains("program-card")) {
      item.hidden = !isMatch;
      if (isMatch) matches += 1;
    } else {
      const details = item.closest("details");
      item.hidden = !isMatch;
      if (isMatch) matches += 1;
      if (details) details.open = Boolean(normalized && isMatch);
    }
  });
  noResults.hidden = !normalized || matches > 0;
  searchHint.textContent = normalized
    ? `${matches} ${matches === 1 ? "match" : "matches"} across programs, calendar, FAQs, and admissions`
    : "Search programs, calendar, FAQs, and admissions";
}

searchInput.addEventListener("input", (event) => runSearch(event.target.value));
searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    searchInput.value = "";
    runSearch("");
    searchInput.blur();
  }
});
document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    searchInput.focus();
  }
});

function openDialog(dialog) {
  if (!dialog.open) dialog.showModal();
  document.body.classList.add("dialog-open");
}

function closeDialog(dialog) {
  dialog.close();
  if (!portalDialog.open && !contactDialog.open) document.body.classList.remove("dialog-open");
}

document.querySelectorAll(".app-dialog").forEach((dialog) => {
  dialog.querySelector(".dialog-close").addEventListener("click", () => closeDialog(dialog));
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closeDialog(dialog);
  });
  dialog.addEventListener("close", () => {
    if (!portalDialog.open && !contactDialog.open) document.body.classList.remove("dialog-open");
  });
});

document.querySelectorAll("[data-open-contact], [data-contact-method]").forEach((button) => {
  button.addEventListener("click", () => {
    const method = button.dataset.contactMethod;
    if (method) document.querySelector("#followup-select").value = method;
    contactStatus.textContent = "";
    openDialog(contactDialog);
  });
});

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(contactForm);
  const firstName = String(formData.get("name")).trim().split(/\s+/)[0];
  contactStatus.textContent = `Thanks, ${firstName}. This preview does not send your enquiry; Catalyst's confirmed contact details will be added before launch.`;
  contactForm.reset();
});

function renderPortal() {
  const content = document.querySelector("#portal-content");
  if (activePortalScreen === "signin") {
    content.innerHTML = `
      <span class="portal-kicker">Catalyst / student space</span>
      <h2 id="portal-title">Your next step,<br /><span>all in one place.</span></h2>
      <p class="dialog-intro">Choose a course, review payment options, and keep track of your enrolment.</p>
      <button class="button button-dark dialog-submit" type="button" id="demo-google">Continue with Google <span aria-hidden="true">↗</span></button>
      <p class="portal-preview-note">Student sign-in preview only. Google authentication is not connected yet.</p>`;
    content.querySelector("#demo-google").addEventListener("click", () => {
      activePortalScreen = "dashboard";
      renderPortal();
    });
    return;
  }

  const courseNames = [
    "AI for work & business",
    "Forex & market foundations",
    "Crypto & digital assets",
    "AI-powered content creation",
  ];
  const selectedSummary = selectedCourses.size
    ? [...selectedCourses].join(", ")
    : "No courses selected yet.";
  content.innerHTML = `
    <span class="portal-kicker">Catalyst / student preview</span>
    <h2 id="portal-title">Choose your<br /><span>learning path.</span></h2>
    <p class="dialog-intro">Select a course to preview enrolment. Course details are examples and will be confirmed by Catalyst.</p>
    <div class="portal-course-list">
      ${courseNames.map((name) => `
        <button class="portal-course-option ${selectedCourses.has(name) ? "is-selected" : ""}" type="button" data-portal-course="${name}">
          <span>${name}</span><span>${selectedCourses.has(name) ? "Selected ✓" : "Select +"}</span>
        </button>`).join("")}
    </div>
    <div class="portal-summary">
      <h3>Your selection</h3>
      <p>${selectedSummary}</p>
      <p>Payment options: details to be confirmed for local and international students.</p>
      <span class="portal-status">Payment status: not started</span>
    </div>
    <button class="button button-dark dialog-submit" type="button" id="payment-preview" ${selectedCourses.size ? "" : "disabled"}>
      Continue to payment options <span aria-hidden="true">↗</span>
    </button>
    <p class="portal-preview-note" id="portal-message" role="status">Frontend demo only—no account, enrolment, payment, or personal data is saved.</p>`;
  content.querySelectorAll("[data-portal-course]").forEach((button) => {
    button.addEventListener("click", () => {
      const course = button.dataset.portalCourse;
      selectedCourses.has(course) ? selectedCourses.delete(course) : selectedCourses.add(course);
      renderPortal();
    });
  });
  content.querySelector("#payment-preview").addEventListener("click", () => {
    content.querySelector("#portal-message").textContent =
      "Payment step preview: verified payment methods and a secure checkout will appear here once Catalyst selects a payment provider.";
  });
}

document.querySelectorAll("[data-open-portal]").forEach((button) => {
  button.addEventListener("click", () => {
    activePortalScreen = "signin";
    renderPortal();
    openDialog(portalDialog);
  });
});

document.querySelectorAll("[data-select-course]").forEach((button) => {
  button.addEventListener("click", () => {
    searchInput.value = button.dataset.selectCourse;
    runSearch(searchInput.value);
    document.querySelector("#admissions").scrollIntoView({ behavior: "smooth" });
    window.setTimeout(() => {
      contactStatus.textContent = "";
      openDialog(contactDialog);
      const course = button.dataset.selectCourse;
      const interest = course.includes("content creation")
        ? "AI content creation"
        : course.startsWith("AI")
          ? "AI & SaaS"
          : course.startsWith("Forex")
            ? "Forex"
            : "Crypto";
      document.querySelector("#contact-form select[name='interest']").value = interest;
    }, 400);
  });
});
