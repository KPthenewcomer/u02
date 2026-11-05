/*
  Körs i <head> innan sidan ritas, så att ett sparat mörkt läge
  inte blinkar till ljust först. Resten av temalogiken finns i theme.js.
*/
try {
  const savedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  if (savedTheme === "dark" || (savedTheme === null && prefersDark)) {
    document.documentElement.classList.add("dark-theme");
  }
} catch {
  // Utan localStorage (t.ex. blockerad lagring) visas ljust läge.
}
