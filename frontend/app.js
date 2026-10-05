const form = document.querySelector("#risk-form");
const submitButton = document.querySelector("#submit-button");
const resultPanel = document.querySelector("#result-panel");
const placeholder = document.querySelector(".result-placeholder");
const resultContent = document.querySelector("#result-content");
const resetButton = document.querySelector("#reset-button");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  for (const key of ["person_age", "person_income", "person_emp_length", "loan_amnt", "loan_int_rate", "loan_percent_income", "cb_person_cred_hist_length"]) {
    data[key] = Number(data[key]);
  }
  submitButton.disabled = true;
  submitButton.querySelector("span:first-child").textContent = "Assessing...";

  try {
    const response = await fetch("/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("The prediction service returned an error.");
    showResult(await response.json());
  } catch (error) {
    showError(error.message);
  } finally {
    submitButton.disabled = false;
    submitButton.querySelector("span:first-child").textContent = "Assess loan risk";
  }
});

function showResult(result) {
  const highRisk = result.prediction === 1;
  const probability = result.probability * 100;
  resultPanel.classList.remove("empty");
  placeholder.hidden = true;
  resultContent.hidden = false;
  document.querySelector("#result-badge").textContent = highRisk ? "High risk" : "Low risk";
  document.querySelector("#result-badge").className = highRisk ? "badge-high" : "badge-low";
  document.querySelector("#result-icon").textContent = highRisk ? "!" : "✓";
  document.querySelector("#result-icon").className = highRisk ? "result-icon high" : "result-icon";
  document.querySelector("#result-title").textContent = highRisk ? "Higher risk detected" : "Low risk detected";
  document.querySelector("#result-description").textContent = highRisk
    ? "This application sits above the model's risk threshold."
    : "This application sits below the model's risk threshold.";
  document.querySelector("#probability").textContent = `${probability.toFixed(1)}%`;
  document.querySelector("#threshold").textContent = `${(result.threshold * 100).toFixed(1)}%`;
  const meter = document.querySelector("#meter-fill");
  meter.style.width = `${Math.max(2, probability)}%`;
  meter.className = highRisk ? "high" : "";
}

function showError(message) {
  resultPanel.classList.remove("empty");
  placeholder.hidden = true;
  resultContent.hidden = false;
  document.querySelector("#result-badge").textContent = "Unavailable";
  document.querySelector("#result-badge").className = "badge-high";
  document.querySelector("#result-icon").textContent = "!";
  document.querySelector("#result-icon").className = "result-icon high";
  document.querySelector("#result-title").textContent = "Couldn't assess";
  document.querySelector("#result-description").textContent = message;
  document.querySelector(".score-block").hidden = true;
  document.querySelector(".result-note").hidden = true;
}

resetButton.addEventListener("click", () => {
  resultPanel.classList.add("empty");
  placeholder.hidden = false;
  resultContent.hidden = true;
  document.querySelector(".score-block").hidden = false;
  document.querySelector(".result-note").hidden = false;
});
