(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) return;
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) processPreload(link);
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") continue;
      for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
    }
  }).observe(document, {
    childList: true,
    subtree: true
  });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep) return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
document.addEventListener("DOMContentLoaded", function() {
  document.querySelectorAll("[data-select]").forEach((select) => {
    const trigger = select.querySelector(".custom-select__trigger");
    const text = select.querySelector(".custom-select__text");
    const triggerFlag = trigger.querySelector(".custom-select__flag");
    const input = select.querySelector("input");
    const options = select.querySelectorAll(".custom-select__option");
    trigger.addEventListener("click", () => {
      select.classList.toggle("open");
    });
    options.forEach((option) => {
      option.addEventListener("click", () => {
        const optionText = option.textContent.trim();
        const optionFlag = option.querySelector(".custom-select__flag");
        text.textContent = optionText;
        input.value = option.dataset.value;
        triggerFlag.className = optionFlag.className;
        select.classList.remove("open");
      });
    });
    document.addEventListener("click", (event) => {
      if (!select.contains(event.target)) {
        select.classList.remove("open");
      }
    });
  });
  document.querySelectorAll("[data-exchange-select]").forEach((select) => {
    const trigger = select.querySelector(".exchange__city-trigger");
    const value = select.querySelector(".exchange__city-value");
    const options = select.querySelectorAll(".exchange__city-option");
    trigger.addEventListener("click", () => {
      select.classList.toggle("open");
    });
    options.forEach((option) => {
      option.addEventListener("click", () => {
        value.textContent = option.textContent.trim();
        select.classList.remove("open");
      });
    });
    document.addEventListener("click", (e) => {
      if (!select.contains(e.target)) select.classList.remove("open");
    });
  });
  const exchangeSteps = document.querySelectorAll(".exchange__step");
  const exchangeConnectors = document.querySelectorAll(".exchange__connector");

  // Pre-set --path-delay on every connector path for staggered animation
  exchangeConnectors.forEach((connector) => {
    connector.querySelectorAll(".exchange__connector-svg").forEach((svg) => {
      svg.querySelectorAll("path").forEach((path, i) => {
        path.style.setProperty("--path-delay", `${i * 0.022}s`);
      });
    });
  });
  const exchangePanels = document.querySelectorAll(".exchange__step-panel");
  const exchangeBackBtn = document.querySelector(".exchange__back-btn");
  const exchangeHintText = document.querySelector(".exchange__hint-text");

  const hintTexts = [
    "Выберите регион выдачи денежных средств. Если вашего региона",
    "Выберите сумму и валюту обмена.",
    "При нажатии на кнопку «Обменять», вы будете переведены в чат оператора.",
  ];

  function getActiveIdx() {
    return [...exchangeSteps].findIndex((s) => s.classList.contains("exchange__step--active"));
  }

  function showPanel(idx) {
    exchangePanels.forEach((p, i) => {
      p.classList.toggle("exchange__step-panel--active", i === idx);
    });
  }

  function syncUI(stepIdx) {
    if (exchangeBackBtn) {
      exchangeBackBtn.classList.toggle("exchange__back-btn--visible", stepIdx > 0);
    }
    if (exchangeHintText && hintTexts[stepIdx]) {
      exchangeHintText.textContent = hintTexts[stepIdx];
    }
    showPanel(stepIdx);
  }

  document.querySelectorAll(".exchange__btn-wrap .hero__info-link").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const activeIdx = getActiveIdx();
      if (activeIdx >= 0 && activeIdx < exchangeSteps.length - 1) {
        e.preventDefault();
        exchangeSteps[activeIdx].classList.remove("exchange__step--active");
        exchangeSteps[activeIdx].classList.add("exchange__step--done");
        exchangeConnectors[activeIdx].classList.add("exchange__connector--filled");
        exchangeSteps[activeIdx + 1].classList.add("exchange__step--active");
        syncUI(activeIdx + 1);
      }
    });
  });

  if (exchangeBackBtn) {
    exchangeBackBtn.addEventListener("click", () => {
      const activeIdx = getActiveIdx();
      if (activeIdx > 0) {
        exchangeSteps[activeIdx].classList.remove("exchange__step--active");
        exchangeConnectors[activeIdx - 1].classList.remove("exchange__connector--filled");
        exchangeSteps[activeIdx - 1].classList.remove("exchange__step--done");
        exchangeSteps[activeIdx - 1].classList.add("exchange__step--active");
        syncUI(activeIdx - 1);
      }
    });
  }

  document.querySelectorAll(".hero__rates-track").forEach((track) => {
    if (track.dataset.tickerReady) return;
    Array.from(track.children).forEach((item) => {
      const clone = item.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      track.appendChild(clone);
    });
    track.dataset.tickerReady = "true";
  });
});

