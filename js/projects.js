import { createDataSection } from "./data-section.js";
import { DataError, fetchJson } from "./fetch-json.js";

const GITHUB_USERNAME = "KPthenewcomer";
const GITHUB_PROFILE_URL = `https://github.com/${GITHUB_USERNAME}`;
const REPOS_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`;

const ALL_LANGUAGES = "All";

const projectList = document.querySelector("#project-list");
const projectsStatus = document.querySelector("#projects-status");
const filterGroup = document.querySelector("#project-filter");

// Plockar ut de fält sidan behöver, så resten av koden slipper GitHubs format.
function toProject(repo) {
  return {
    name: repo.name,
    description: repo.description?.trim() || "No description has been added yet.",
    language: repo.language ?? "Other",
    codeUrl: repo.html_url,
    liveUrl: getLiveUrl(repo),
  };
}

/*
  En egen webbadress i repots inställningar går först. Annars byggs
  GitHub Pages-adressen om repot är publicerat där (has_pages).
*/
function getLiveUrl(repo) {
  const homepage = repo.homepage?.trim();

  if (homepage) {
    return homepage;
  }

  if (repo.has_pages) {
    return `https://${GITHUB_USERNAME.toLowerCase()}.github.io/${repo.name}/`;
  }

  return null;
}

function isValidRepo(repo) {
  return typeof repo?.name === "string" && typeof repo.html_url === "string";
}

// Länktexten blir t.ex. "View code" men skärmläsare hör "View code for u02".
function createProjectLink(text, url, projectName) {
  const link = document.createElement("a");
  const hiddenText = document.createElement("span");

  link.href = url;
  hiddenText.className = "visually-hidden";
  hiddenText.textContent = ` for ${projectName}`;
  link.append(text, hiddenText);

  return link;
}

function createProjectCard({ name, description, language, codeUrl, liveUrl }) {
  const listItem = document.createElement("li");
  const article = document.createElement("article");
  const heading = document.createElement("h3");
  const descriptionText = document.createElement("p");
  const languageText = document.createElement("p");
  const links = document.createElement("div");

  listItem.dataset.language = language;
  article.className = "project-card";
  heading.textContent = name;
  descriptionText.textContent = description;
  languageText.className = "project-language";
  languageText.textContent = language;
  links.className = "project-links";

  if (liveUrl) {
    links.append(createProjectLink("Live preview", liveUrl, name));
  }
  links.append(createProjectLink("View code", codeUrl, name));

  article.append(heading, descriptionText, languageText, links);
  listItem.append(article);

  return listItem;
}

function createEmptyMessage() {
  const listItem = document.createElement("li");
  const link = document.createElement("a");

  listItem.className = "project-empty";
  link.href = GITHUB_PROFILE_URL;
  link.textContent = "my GitHub profile";
  listItem.append("There are no public projects to show yet. Visit ", link, " for updates.");

  return listItem;
}

async function loadAndRenderProjects() {
  const repos = await fetchJson(REPOS_URL, {
    headers: { Accept: "application/vnd.github+json" },
  });

  if (!Array.isArray(repos)) {
    throw new DataError("Expected a list of repositories");
  }

  // Forkar är andras kod, så de visas inte som egna projekt.
  const projects = repos.filter((repo) => isValidRepo(repo) && !repo.fork).map(toProject);

  if (projects.length === 0) {
    projectList.replaceChildren(createEmptyMessage());
    filterGroup.hidden = true;
    return "";
  }

  projectList.replaceChildren(...projects.map(createProjectCard));
  renderFilterButtons(projects);

  return `Showing ${formatProjectCount(projects.length)} from GitHub.`;
}

function formatProjectCount(count) {
  return `${count} ${count === 1 ? "project" : "projects"}`;
}

// Ett filter per språk som finns bland projekten, plus "All".
function renderFilterButtons(projects) {
  const languages = [...new Set(projects.map((project) => project.language))].sort();

  // Filtrering är meningslös om alla projekt har samma språk.
  if (languages.length < 2) {
    filterGroup.hidden = true;
    return;
  }

  const buttons = [ALL_LANGUAGES, ...languages].map((language) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "filter-button";
    button.dataset.language = language;
    button.textContent = language;
    button.setAttribute("aria-pressed", String(language === ALL_LANGUAGES));
    return button;
  });

  filterGroup.replaceChildren(...buttons);
  filterGroup.hidden = false;
}

function filterProjects(selectedLanguage) {
  const cards = [...projectList.children];
  let visibleCount = 0;

  for (const card of cards) {
    const isVisible = selectedLanguage === ALL_LANGUAGES || card.dataset.language === selectedLanguage;
    card.hidden = !isVisible;
    if (isVisible) visibleCount += 1;
  }

  for (const button of filterGroup.querySelectorAll(".filter-button")) {
    button.setAttribute("aria-pressed", String(button.dataset.language === selectedLanguage));
  }

  projectsStatus.textContent =
    selectedLanguage === ALL_LANGUAGES
      ? `Showing ${formatProjectCount(cards.length)} from GitHub.`
      : `Showing ${visibleCount} of ${formatProjectCount(cards.length)}: ${selectedLanguage}.`;
}

/*
  En lyssnare på gruppen i stället för en per knapp. Knapparna byggs om
  vid varje hämtning, men gruppen finns kvar och behöver bara kopplas en gång.
*/
filterGroup.addEventListener("click", (event) => {
  const button = event.target.closest(".filter-button");

  if (button) {
    filterProjects(button.dataset.language);
  }
});

export const loadProjects = createDataSection({
  statusElement: projectsStatus,
  retryButton: document.querySelector("#projects-retry"),
  busyElement: projectList,
  subject: "the projects from GitHub",
  load: loadAndRenderProjects,
});
