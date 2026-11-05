import { loadCv } from "./cv.js";
import { loadProjects } from "./projects.js";
import { initThemeToggle } from "./theme.js";

initThemeToggle();

// CV och projekt hämtas samtidigt, ingen av dem väntar på den andra.
loadCv();
loadProjects();
