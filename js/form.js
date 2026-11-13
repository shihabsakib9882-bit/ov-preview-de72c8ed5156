(function(){
/* Contact form: same code as contact-form.html. Paste the Apps Script link into FORM_ENDPOINT (see form/FORM-SETUP.md). */

// Paste your Google Apps Script web app URL here (see form/FORM-SETUP.md).
const FORM_ENDPOINT = "https://script.google.com/macros/s/AKfycbwSj3yGYcUodJ7GY3Zol7_JPPwr92z-DjPWwwyD-r3HIM8NfqwinqDy5gwWlStzGFpyHQ/exec";
const TO = "orivane.studio9882@gmail.com";
const TIMEOUT_MS = 10000;

const $ = id => document.getElementById(id);
const f = $("f"), send = $("send");
let tz = "";
try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch (e) {}
$("tz").value = tz;

// Brief panel
$("briefToggle").addEventListener("click", () => {
  const p = $("briefPanel"), open = p.hidden;
  p.hidden = !open; $("briefToggle").setAttribute("aria-expanded", String(open));
});

async function copyText(text, btn, label) {
  try { await navigator.clipboard.writeText(text); }
  catch (e) {
    const t = document.createElement("textarea"); t.value = text; document.body.appendChild(t); t.select();
    try { document.execCommand("copy"); } catch (_) {} t.remove();
  }
  btn.textContent = "Copied";
  setTimeout(() => btn.textContent = label, 1800);
}
$("copyPrompt").addEventListener("click", e => copyText($("promptText").textContent, e.target, "Copy prompt"));

// Validation: inline text next to each field
function setErr(id, msg) { $(id + "-err").textContent = msg; $(id).classList.add("invalid"); $(id).setAttribute("aria-invalid", "true"); }
function clearErr(id) { $(id + "-err").textContent = ""; $(id).classList.remove("invalid"); $(id).removeAttribute("aria-invalid"); }
["name","email","idea"].forEach(id => $(id).addEventListener("input", () => clearErr(id)));

function validate() {
  let first = null;
  const bad = (id, m) => { setErr(id, m); first = first || $(id); };
  const v = id => $(id).value.trim();
  ["name","email","idea"].forEach(clearErr);
  if (!v("name")) bad("name", "Please enter your name.");
  if (!v("email")) bad("email", "Please enter your email so we can write back.");
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v("email"))) bad("email", "This email does not look right. Check for a missing @ or dot.");
  if (!v("idea")) bad("idea", "Tell us a little about what you want to build.");
  if (first) first.focus();
  return !first;
}

function data() {
  return {
    name: $("name").value.trim(), email: $("email").value.trim(), idea: $("idea").value.trim(),
    timezone: tz, preferredTime: $("when").value, brief: $("brief").value.trim(),
    company: $("company").value
  };
}

function messageText(d) {
  return [
    "Name: " + d.name, "Email: " + d.email, "",
    "What I want to build:", d.idea, "",
    "Preferred meeting time: " + (d.preferredTime ? d.preferredTime + " (" + d.timezone + ")" : "not given"),
    "", "Brief:", d.brief || "none"
  ].join("\n");
}

function showFallback(d) {
  const body = messageText(d);
  $("mailFallback").href = "mailto:" + TO + "?subject=" + encodeURIComponent("A project for Orivane") + "&body=" + encodeURIComponent(body);
  $("mailFallback").textContent = "Email " + TO;
  $("copyMsg").onclick = e => copyText(body, e.target, "Copy message");
  $("fallback").hidden = false;
  send.disabled = false; send.textContent = "Send my request";
}

function showSuccess(d) {
  const card = $("formCard");
  card.innerHTML = "";
  const w = document.createElement("div"); w.className = "done";
  const h = document.createElement("h2"); h.textContent = "Request received";
  const p = document.createElement("p");
  p.append("Thanks, ");
  p.append(d.name);
  p.append(". We received your request and will email you at ");
  const b = document.createElement("b"); b.textContent = d.email; p.append(b);
  p.append(".");
  w.append(h, p); card.append(w);
}

f.addEventListener("submit", async ev => {
  ev.preventDefault();
  $("fallback").hidden = true;
  const d = data();
  if (d.company) { showSuccess(d); return; }          // honeypot: pretend success, send nothing
  if (!validate()) return;
  send.disabled = true; send.textContent = "Sending...";
  if (!FORM_ENDPOINT) { showFallback(d); return; }
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), TIMEOUT_MS);
  try {
    await fetch(FORM_ENDPOINT, { method: "POST", mode: "no-cors", signal: ctl.signal,
      headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(d) });
    clearTimeout(timer);
    showSuccess(d);
  } catch (e) {
    clearTimeout(timer);
    showFallback(d);
  }
});
})();
