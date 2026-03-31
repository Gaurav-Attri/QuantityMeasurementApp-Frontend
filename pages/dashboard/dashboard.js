// ── Auth guard ───────────────────────────────────────────
const token = localStorage.getItem("token");
if (!token) window.location.href = "../../pages/auth/auth.html";

// ── Unit map ─────────────────────────────────────────────
const UNITS = {
  Length:      ["Inches", "Feet", "Yards", "Centimeters"],
  Weight:      ["Grams", "Kilograms", "Pound"],
  Volume:      ["Litre", "MilliLiter", "Gallon"],
  Temperature: ["Celsius", "Fahrenheit", "Kelvin"],
};

// ── Tab switching ────────────────────────────────────────
function switchTab(tab) {
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.tab === tab);
  });
  document.querySelectorAll(".tab-panel").forEach(panel => {
    panel.classList.toggle("active", panel.id === `panel-${tab}`);
  });
  if (tab === "history") loadHistory();
}

// ── Populate unit dropdowns based on quantity type ───────
function populateUnits(selectEl, qtyType) {
  const units = UNITS[qtyType] || [];
  selectEl.innerHTML = units.length
    ? units.map(u => `<option value="${u}">${u}</option>`).join("")
    : `<option value="">— select type first —</option>`;
}

function onQtyTypeChange(prefix) {
  const qtyType = document.getElementById(`${prefix}-qty-type`).value;

  const selectors = {
    add: ["add-unit1", "add-unit2"],
    sub: ["sub-unit1", "sub-unit2", "sub-result-unit"],
    div: ["div-unit1", "div-unit2"],
    cmp: ["cmp-unit1", "cmp-unit2"],
    cvt: ["cvt-source", "cvt-target"],
  };

  (selectors[prefix] || []).forEach(id => {
    populateUnits(document.getElementById(id), qtyType);
  });

  // clear any previous result/alert
  hideResult(`${prefix}-result`);
  hideAlert(`${prefix}-alert`);
}

// ── UI helpers ───────────────────────────────────────────
function showAlert(id, type, msg) {
  const el = document.getElementById(id);
  el.className = `alert alert-${type}`;
  el.textContent = msg;
}

function hideAlert(id) {
  const el = document.getElementById(id);
  el.className = "alert hidden";
  el.textContent = "";
}

function showResult(id, html) {
  const el = document.getElementById(id);
  el.innerHTML = html;
  el.classList.remove("hidden");
}

function hideResult(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add("hidden");
}

function setLoading(btnEl, loading) {
  btnEl.disabled = loading;
  btnEl.querySelector(".btn-text").classList.toggle("hidden", loading);
  btnEl.querySelector(".btn-spinner").classList.toggle("hidden", !loading);
}

function quantityResultHTML(value, unitSymbol) {
  return `
    <div class="result-label">Result</div>
    <div class="result-value">${value}<span class="result-unit">${unitSymbol}</span></div>
  `;
}

// ── Validate shared fields ───────────────────────────────
function validateBasic(prefix, fields) {
  for (const { id, label } of fields) {
    const el = document.getElementById(id);
    if (!el.value || el.value === "") {
      showAlert(`${prefix}-alert`, "error", `Please fill in: ${label}`);
      return false;
    }
  }
  hideAlert(`${prefix}-alert`);
  return true;
}

// ── ADD ──────────────────────────────────────────────────
async function handleAdd() {
  const btn = document.querySelector("#panel-add .submit-btn");
  const valid = validateBasic("add", [
    { id: "add-qty-type", label: "Quantity Type" },
    { id: "add-val1",    label: "Value 1" },
    { id: "add-unit1",   label: "Unit 1" },
    { id: "add-val2",    label: "Value 2" },
    { id: "add-unit2",   label: "Unit 2" },
  ]);
  if (!valid) return;

  const body = {
    QuantityType: document.getElementById("add-qty-type").value,
    Value1:       parseFloat(document.getElementById("add-val1").value),
    Value2:       parseFloat(document.getElementById("add-val2").value),
    Unit1:        document.getElementById("add-unit1").value,
    Unit2:        document.getElementById("add-unit2").value,
  };

  setLoading(btn, true);
  hideResult("add-result");

  try {
    const res = await apiFetch("/api/quantitymeasurement/add", {
      method: "POST",
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => null);

    if (res.ok) {
      showResult("add-result", quantityResultHTML(data.value, data.unitSymbol));
    } else {
      showAlert("add-alert", "error", data || "Something went wrong.");
    }
  } catch {
    showAlert("add-alert", "error", "Unable to reach the server.");
  } finally {
    setLoading(btn, false);
  }
}

// ── SUBTRACT ─────────────────────────────────────────────
async function handleSubtract() {
  const btn = document.querySelector("#panel-subtract .submit-btn");
  const valid = validateBasic("sub", [
    { id: "sub-qty-type",     label: "Quantity Type" },
    { id: "sub-val1",         label: "Value 1" },
    { id: "sub-unit1",        label: "Unit 1" },
    { id: "sub-val2",         label: "Value 2" },
    { id: "sub-unit2",        label: "Unit 2" },
    { id: "sub-result-unit",  label: "Result Unit" },
  ]);
  if (!valid) return;

  const body = {
    QuantityType: document.getElementById("sub-qty-type").value,
    Value1:       parseFloat(document.getElementById("sub-val1").value),
    Value2:       parseFloat(document.getElementById("sub-val2").value),
    Unit1:        document.getElementById("sub-unit1").value,
    Unit2:        document.getElementById("sub-unit2").value,
    ResultUnit:   document.getElementById("sub-result-unit").value,
  };

  setLoading(btn, true);
  hideResult("sub-result");

  try {
    const res = await apiFetch("/api/quantitymeasurement/subtract", {
      method: "POST",
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => null);

    if (res.ok) {
      showResult("sub-result", quantityResultHTML(data.value, data.unitSymbol));
    } else {
      showAlert("sub-alert", "error", data || "Something went wrong.");
    }
  } catch {
    showAlert("sub-alert", "error", "Unable to reach the server.");
  } finally {
    setLoading(btn, false);
  }
}

// ── DIVIDE ───────────────────────────────────────────────
async function handleDivide() {
  const btn = document.querySelector("#panel-divide .submit-btn");
  const valid = validateBasic("div", [
    { id: "div-qty-type", label: "Quantity Type" },
    { id: "div-val1",    label: "Value 1" },
    { id: "div-unit1",   label: "Unit 1" },
    { id: "div-val2",    label: "Value 2" },
    { id: "div-unit2",   label: "Unit 2" },
  ]);
  if (!valid) return;

  const body = {
    QuantityType: document.getElementById("div-qty-type").value,
    Value1:       parseFloat(document.getElementById("div-val1").value),
    Value2:       parseFloat(document.getElementById("div-val2").value),
    Unit1:        document.getElementById("div-unit1").value,
    Unit2:        document.getElementById("div-unit2").value,
  };

  setLoading(btn, true);
  hideResult("div-result");

  try {
    const res = await apiFetch("/api/quantitymeasurement/divide", {
      method: "POST",
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => null);

    if (res.ok) {
      showResult("div-result", `
        <div class="result-label">Ratio</div>
        <div class="result-value">${data.ratio}</div>
      `);
    } else {
      showAlert("div-alert", "error", data || "Something went wrong.");
    }
  } catch {
    showAlert("div-alert", "error", "Unable to reach the server.");
  } finally {
    setLoading(btn, false);
  }
}

// ── COMPARE ──────────────────────────────────────────────
async function handleCompare() {
  const btn = document.querySelector("#panel-compare .submit-btn");
  const valid = validateBasic("cmp", [
    { id: "cmp-qty-type", label: "Quantity Type" },
    { id: "cmp-val1",    label: "Value 1" },
    { id: "cmp-unit1",   label: "Unit 1" },
    { id: "cmp-val2",    label: "Value 2" },
    { id: "cmp-unit2",   label: "Unit 2" },
  ]);
  if (!valid) return;

  const body = {
    QuantityType: document.getElementById("cmp-qty-type").value,
    Value1:       parseFloat(document.getElementById("cmp-val1").value),
    Value2:       parseFloat(document.getElementById("cmp-val2").value),
    Unit1:        document.getElementById("cmp-unit1").value,
    Unit2:        document.getElementById("cmp-unit2").value,
  };

  setLoading(btn, true);
  hideResult("cmp-result");

  try {
    const res = await apiFetch("/api/quantitymeasurement/compare", {
      method: "POST",
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => null);

    if (res.ok) {
      const areEqual = data.areEqual;
      showResult("cmp-result", `
        <div class="result-label">Result</div>
        <div class="${areEqual ? "result-equal" : "result-unequal"}">
          ${areEqual ? "✓ The two quantities are equal" : "✗ The two quantities are not equal"}
        </div>
      `);
    } else {
      showAlert("cmp-alert", "error", data || "Something went wrong.");
    }
  } catch {
    showAlert("cmp-alert", "error", "Unable to reach the server.");
  } finally {
    setLoading(btn, false);
  }
}

// ── CONVERT ──────────────────────────────────────────────
async function handleConvert() {
  const btn = document.querySelector("#panel-convert .submit-btn");
  const valid = validateBasic("cvt", [
    { id: "cvt-qty-type", label: "Quantity Type" },
    { id: "cvt-val",      label: "Value" },
    { id: "cvt-source",   label: "From unit" },
    { id: "cvt-target",   label: "To unit" },
  ]);
  if (!valid) return;

  const body = {
    QuantityType: document.getElementById("cvt-qty-type").value,
    Value:        parseFloat(document.getElementById("cvt-val").value),
    SourceUnit:   document.getElementById("cvt-source").value,
    TargetUnit:   document.getElementById("cvt-target").value,
  };

  setLoading(btn, true);
  hideResult("cvt-result");

  try {
    const res = await apiFetch("/api/quantitymeasurement/convert", {
      method: "POST",
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => null);

    if (res.ok) {
      showResult("cvt-result", quantityResultHTML(data.value, data.unitSymbol));
    } else {
      showAlert("cvt-alert", "error", data || "Something went wrong.");
    }
  } catch {
    showAlert("cvt-alert", "error", "Unable to reach the server.");
  } finally {
    setLoading(btn, false);
  }
}

// ── HISTORY ──────────────────────────────────────────────
async function loadHistory() {
  hideAlert("history-alert");
  document.getElementById("history-loading").classList.remove("hidden");
  document.getElementById("history-empty").classList.add("hidden");
  document.getElementById("history-table-wrap").classList.add("hidden");

  try {
    const res = await apiFetch("/api/quantitymeasurement/history", {
      method: "POST",
    });
    const data = await res.json().catch(() => null);

    if (res.ok) {
      const measurements = data?.measurements ?? [];
      document.getElementById("history-loading").classList.add("hidden");

      if (measurements.length === 0) {
        document.getElementById("history-empty").classList.remove("hidden");
        return;
      }

      const tbody = document.getElementById("history-tbody");
      tbody.innerHTML = measurements.map((m, i) => `
        <tr>
          <td>${i + 1}</td>
          <td><span class="badge">${m.operation}</span></td>
          <td>${m.category}</td>
          <td>${m.value1} ${m.unit1}</td>
          <td>${m.value2 != null ? `${m.value2} ${m.unit2 ?? ""}` : "—"}</td>
          <td><strong>${m.resultValue}</strong> ${m.resultUnit}</td>
          <td>${new Date(m.createdAt).toLocaleString()}</td>
        </tr>
      `).join("");

      document.getElementById("history-table-wrap").classList.remove("hidden");
    } else {
      document.getElementById("history-loading").classList.add("hidden");
      showAlert("history-alert", "error", data || "Failed to load history.");
    }
  } catch {
    document.getElementById("history-loading").classList.add("hidden");
    showAlert("history-alert", "error", "Unable to reach the server.");
  }
}

// ── LOGOUT ───────────────────────────────────────────────
function handleLogout() {
  localStorage.removeItem("token");
  window.location.href = "../../pages/auth/auth.html";
}

// ── Init: redirect to Add tab on load ────────────────────
switchTab("add");
