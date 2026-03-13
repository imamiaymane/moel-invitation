import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://rdnauhyhjiefgitgddoa.supabase.co";
const supabaseKey = "sb_publishable_v6kaA7-t_iwAE72sIO8QWw_SLmfdCYR";

const supabase = createClient(supabaseUrl, supabaseKey);

const form = document.getElementById("inviteForm");
const formCard = document.getElementById("formCard");
const submitButton = document.getElementById("submitButton");
const formStatus = document.getElementById("formStatus");
const successMessage = document.getElementById("successMessage");
const successMeta = document.getElementById("successMeta");
const revealNodes = document.querySelectorAll(".hero-panel, .form-panel");
const heroPanel = document.getElementById("heroPanel");
const formPanel = document.getElementById("formPanel");

const fields = {
  name: document.getElementById("name"),
  email: document.getElementById("email"),
  phone: document.getElementById("phone"),
  company: document.getElementById("company")
};

let isSubmitting = false;

requestAnimationFrame(() => {
  revealNodes.forEach((node) => node.classList.add("reveal-on-load"));

  requestAnimationFrame(() => {
    document.body.classList.add("is-ready");
  });
});

function attachParallax(node, intensityX = 10, intensityY = 10) {
  if (!node || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  const reset = () => {
    node.style.transform = "";
  };

  node.addEventListener("mousemove", (event) => {
    const rect = node.getBoundingClientRect();
    const offsetX = (event.clientX - rect.left) / rect.width - 0.5;
    const offsetY = (event.clientY - rect.top) / rect.height - 0.5;
    const rotateY = offsetX * intensityX;
    const rotateX = offsetY * -intensityY;

    node.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
  });

  node.addEventListener("mouseleave", reset);
}

attachParallax(heroPanel, 4, 4);
attachParallax(formPanel, 3, 3);

function setStatus(message, type = "") {
  formStatus.textContent = message;
  formStatus.className = "form-status";

  if (type) {
    formStatus.classList.add(`is-${type}`);
  }
}

function setSubmittingState(active) {
  isSubmitting = active;
  submitButton.disabled = active;
  submitButton.classList.toggle("is-submitting", active);
}

function sanitizeValue(value) {
  return value.trim().replace(/\s+/g, " ");
}

function validateForm({ name, email }) {
  if (!name || name.length < 2) {
    return "Bitte geben Sie Ihren vollstandigen Namen ein.";
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Bitte geben Sie eine gultige E-Mail-Adresse ein.";
  }

  return "";
}

async function saveGuest(payload) {
  const { error } = await supabase.from("guests").insert([payload]);

  if (!error) {
    return;
  }

  if (error.code === "23505") {
    throw new Error("Diese E-Mail-Adresse wurde bereits registriert.");
  }

  throw new Error("Ihre Zusage konnte nicht gespeichert werden. Bitte versuchen Sie es erneut.");
}

async function sendInvitationEmail(payload) {
  const response = await fetch("/api/send-email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  let result = {};

  try {
    result = await response.json();
  } catch {
    result = {};
  }

  if (!response.ok || !result.success) {
    throw new Error(result.error || "Die Einladung konnte nicht per E-Mail versendet werden.");
  }
}

function showSuccess({ name, email }) {
  formCard.classList.add("is-hidden");
  successMeta.textContent = `${name} • ${email}`;
  successMessage.classList.add("show");
  successMessage.scrollIntoView({ behavior: "smooth", block: "start" });
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (isSubmitting) {
    return;
  }

  if (fields.company.value) {
    return;
  }

  const payload = {
    name: sanitizeValue(fields.name.value),
    email: sanitizeValue(fields.email.value).toLowerCase(),
    phone: sanitizeValue(fields.phone.value)
  };

  const validationError = validateForm(payload);

  if (validationError) {
    setStatus(validationError, "error");
    return;
  }

  try {
    setSubmittingState(true);
    setStatus("Ihre Einladung wird vorbereitet...");

    await saveGuest(payload);
    await sendInvitationEmail({
      name: payload.name,
      email: payload.email
    });

    setStatus("Ihre Bestatigung war erfolgreich.", "success");
    showSuccess(payload);
  } catch (error) {
    console.error(error);
    setStatus(error.message || "Es ist ein unerwarteter Fehler aufgetreten.", "error");
  } finally {
    setSubmittingState(false);
  }
});
