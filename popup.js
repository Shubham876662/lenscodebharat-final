document.addEventListener("DOMContentLoaded", function () {
  const codeInput = document.getElementById("codeInput");
  const analyzeBtn = document.getElementById("analyzeBtn");
  const loader = document.getElementById("loader");
  const results = document.getElementById("results");
  const errorDiv = document.getElementById("error");
  const tabBtns = document.querySelectorAll(".tab-btn");
  const fileInput = document.getElementById("fileInput");

  const explanationContent = document.getElementById("explanationContent");
  const bugsContent = document.getElementById("bugsContent");
  const flowContent = document.getElementById("flowContent");

  analyzeBtn.addEventListener("click", analyzeCode);
  fileInput.addEventListener("change", extractFromFile);

  /* -------------------- TAB SWITCHING -------------------- */

  tabBtns.forEach(btn => {
    btn.addEventListener("click", function () {
      switchTab(this.dataset.tab);
    });
  });

  function switchTab(tabName) {
    document.querySelectorAll(".tab-btn").forEach(btn =>
      btn.classList.remove("active")
    );
    document.querySelectorAll(".tab-content").forEach(c =>
      c.classList.remove("active")
    );

    const activeTabBtn = document.querySelector(`[data-tab="${tabName}"]`);
    const activeTabContent = document.getElementById(tabName);

    if (activeTabBtn) activeTabBtn.classList.add("active");
    if (activeTabContent) activeTabContent.classList.add("active");
  }

  function resetTabsToExplanation() {
    switchTab("explanation");
  }

  /* ================= OCR.SPACE INTEGRATION ================= */

  async function extractFromFile() {
    const file = fileInput.files[0];
    if (!file) return;

    hideError();
    clearResults();
    hideResults();
    setLoaderText("Extracting text using OCR...");
    showLoader();

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:3000/ocr", {
        method: "POST",
        body: formData
      });

      if (!response.ok) throw new Error("OCR failed");

      const data = await response.json();

      if (!data.text || data.text.trim().length === 0) {
        throw new Error("No readable text found");
      }

      codeInput.value = data.text;
      setLoaderText("Analyzing extracted code...");
      setTimeout(analyzeCode, 500);

    } catch (err) {
      showError(err.message || "Text extraction failed");
      hideLoader();
    }
  }

  /* ================= MAIN ANALYZE ================= */

  async function analyzeCode() {
    const code = codeInput.value.trim();

    if (!code || code.length < 5) {
      showError("Please enter valid source code.");
      clearResults();
      hideLoader();
      return;
    }

    hideError();
    clearResults();
    hideResults();
    setLoaderText("Analyzing code...");
    showLoader();

    try {
      const analysis = await getAIAnalysis(code);

      /* 🔐 HARD STRUCTURE GUARANTEE */
      const safeAnalysis = {
        explanation:
          typeof analysis.explanation === "string"
            ? analysis.explanation
            : "No explanation available.",

        bugs: Array.isArray(analysis.bugs) ? analysis.bugs : [],

        flow: Array.isArray(analysis.flow) ? analysis.flow : []
      };

      displayResults(safeAnalysis);
      resetTabsToExplanation();
      showResults();
    } catch (err) {
      showError(err.message || "Analysis failed");
      clearResults();
    } finally {
      hideLoader();
    }
  }

  async function getAIAnalysis(code) {
    const res = await fetch("http://localhost:3000/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code })
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Backend error");
    }

    return await res.json();
  }

  /* ================= DISPLAY RESULTS ================= */

  function displayResults(analysis) {
    /* -------- EXPLANATION -------- */
    explanationContent.textContent = analysis.explanation;

    /* -------- BUGS -------- */
    bugsContent.innerHTML = "";
    if (analysis.bugs.length > 0) {
      analysis.bugs.forEach((bug, index) => {
        const div = document.createElement("div");
        div.className = "bug-item";
        div.innerHTML = `
          <strong>Bug ${index + 1}: ${bug.issue}</strong>
          <div><b>Reason:</b> ${bug.reason}</div>
          <div><b>Fix:</b> ${bug.fix}</div>
        `;
        bugsContent.appendChild(div);
      });
    } else {
      bugsContent.textContent = "✔ No bugs or errors found.";
    }

    /* -------- FLOW -------- */
    flowContent.innerHTML = "";
    if (analysis.flow.length > 0) {
      analysis.flow.forEach((step, i) => {
        const div = document.createElement("div");
        div.textContent = `${i + 1}. ${step}`;
        flowContent.appendChild(div);
      });
    } else {
      flowContent.textContent = "No flow steps available.";
    }
  }

  /* ================= UI HELPERS ================= */

  function clearResults() {
    explanationContent.textContent = "";
    bugsContent.textContent = "";
    flowContent.textContent = "";
  }

  function setLoaderText(text) {
    loader.textContent = text;
  }

  function showLoader() {
    loader.classList.remove("hidden");
  }

  function hideLoader() {
    loader.classList.add("hidden");
  }

  function showResults() {
    results.classList.remove("hidden");
  }

  function hideResults() {
    results.classList.add("hidden");
  }

  function showError(msg) {
    errorDiv.textContent = msg;
    errorDiv.classList.remove("hidden");
  }

  function hideError() {
    errorDiv.classList.add("hidden");
  }
});
