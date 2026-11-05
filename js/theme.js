const DARK_THEME_CLASS = "dark-theme";
const STORAGE_KEY = "theme";

const rootElement = document.documentElement;

function saveTheme(theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Temat fungerar ändå, det sparas bara inte till nästa besök.
  }
}

// JavaScript byter bara en klass. Alla färger finns som variabler i CSS.
function applyTheme(isDark, toggleButton) {
  rootElement.classList.toggle(DARK_THEME_CLASS, isDark);
  toggleButton.setAttribute("aria-pressed", String(isDark));
}

export function initThemeToggle() {
  const toggleButton = document.querySelector("#theme-toggle");

  // theme-init.js har redan valt tema, knappen ska visa samma läge.
  applyTheme(rootElement.classList.contains(DARK_THEME_CLASS), toggleButton);

  toggleButton.addEventListener("click", () => {
    const isDark = !rootElement.classList.contains(DARK_THEME_CLASS);
    applyTheme(isDark, toggleButton);
    saveTheme(isDark ? "dark" : "light");
  });
}
