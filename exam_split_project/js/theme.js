function initTheme() {
  const savedTheme = localStorage.getItem("theme") || "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);
  el.themeIcon.textContent = savedTheme === "light" ? "☀️" : "🌙";
}

el.themeToggle.addEventListener("click", () => {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "light" ? "dark" : "light";
  
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
  el.themeIcon.textContent = newTheme === "light" ? "☀️" : "🌙";
  
  // 切換主題時重新整理匯入狀態的顏色
  const currentMsg = el.importStatus.textContent;
  const isError = el.importStatus.style.color === (currentTheme === "light" ? "#991b1b" : "#fecaca");
  setImportStatus(currentMsg, isError);
});
