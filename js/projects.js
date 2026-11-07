import { createDataSection } from "./data-section.js";
import { DataError, fetchJson } from "./fetch-json.js";

const GITHUB_USERNAME = "KPthenewcomer";
const GITHUB_PROFILE_URL = `https://github.com/${GITHUB_USERNAME}`;
const REPOS_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`;
const PROJECT_DETAILS_URL = "./data/projects.json";

const ALL_TECHNOLOGIES = "Alla";
const FALLBACK_DESCRIPTION = "Ingen beskrivning har lagts till ännu.";

const projectList = document.querySelector("#project-list");
const projectsStatus = document.querySelector("#projects-status");
const filterGroup = document.querySelector("#project-filter");

/*
  Egna beskrivningar och tekniker per repo. GitHubs fält "language" visar
  bara huvudspråket, så tekniklistan skrivs för hand i projects.json.
  Filen är ett tillägg: går den inte att läsa visas projekten ändå.
*/
async function fetchProjectDetails() {
  try {
    const data = await fetchJson(PROJECT_DETAILS_URL);
    const validDetails = (data?.projects ?? []).filter(
      (detail) =>
        typeof detail?.repo === "string" &&
        typeof detail.description === "string" &&
        Array.isArray(detail.technologies),
    );

    return new Map(validDetails.map((detail) => [detail.repo, detail]));
  } catch {
    return new Map();
  }
}

// Slår ihop GitHubs svar med egna detaljer till de fält sidan behöver.
function toProject(repo, details) {
  const detail = details.get(repo.name);
  const githubTechnologies = repo.language ? [repo.language] : [];

  return {
    name: repo.name,
    description: detail?.description || repo.description?.trim() || FALLBACK_DESCRIPTION,
    technologies: detail?.technologies ?? githubTechnologies,
    codeUrl: repo.html_url,
    liveUrl: getLiveUrl(repo),
  };
}

function isValidRepo(repo) {
  return typeof repo?.name === "string" && typeof repo.html_url === "string";
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

// Länktexten blir t.ex. "Visa koden" men skärmläsare hör "Visa koden för u02".
function createProjectLink(text, url, projectName) {
  const link = document.createElement("a");
  const hiddenText = document.createElement("span");

  link.href = url;
  hiddenText.className = "visually-hidden";
  hiddenText.textContent = ` för ${projectName}`;
  link.append(text, hiddenText);

  return link;
}

function createTechnologyList(technologies) {
  const list = document.createElement("ul");

  list.className = "project-technologies";
  list.setAttribute("aria-label", "Tekniker");
  list.append(
    ...technologies.map((technology) => {
      const listItem = document.createElement("li");
      listItem.textContent = technology;
      return listItem;
    }),
  );

  return list;
}

// Teknikerna sparas på kortet så att filtret kan läsa dem.
const projectTechnologies = new WeakMap();

function createProjectCard({ name, description, technologies, codeUrl, liveUrl }) {
  const listItem = document.createElement("li");
  const article = document.createElement("article");
  const heading = document.createElement("h3");
  const descriptionText = document.createElement("p");
  const links = document.createElement("div");

  projectTechnologies.set(listItem, technologies);
  article.className = "project-card";
  heading.textContent = name;
  descriptionText.textContent = description;
  links.className = "project-links";

  if (liveUrl) {
    links.append(createProjectLink("Se live", liveUrl, name));
  }
  links.append(createProjectLink("Visa koden", codeUrl, name));

  article.append(heading, descriptionText);

  if (technologies.length > 0) {
    article.append(createTechnologyList(technologies));
  }

  article.append(links);
  listItem.append(article);

  return listItem;
}

function createEmptyMessage() {
  const listItem = document.createElement("li");
  const link = document.createElement("a");

  listItem.className = "project-empty";
  link.href = GITHUB_PROFILE_URL;
  link.textContent = "min GitHub-profil";
  listItem.append("Det finns inga publika projekt att visa ännu. Besök ", link, " för uppdateringar.");

  return listItem;
}

async function loadAndRenderProjects() {
  // Båda hämtningarna startar samtidigt i stället för efter varandra.
  const [repos, details] = await Promise.all([
    fetchJson(REPOS_URL, { headers: { Accept: "application/vnd.github+json" } }),
    fetchProjectDetails(),
  ]);

  if (!Array.isArray(repos)) {
    throw new DataError("Expected a list of repositories");
  }

  // Forkar är andras kod, så de visas inte som egna projekt.
  const projects = repos
    .filter((repo) => isValidRepo(repo) && !repo.fork)
    .map((repo) => toProject(repo, details));

  if (projects.length === 0) {
    projectList.replaceChildren(createEmptyMessage());
    filterGroup.hidden = true;
    return "";
  }

  projectList.replaceChildren(...projects.map(createProjectCard));
  renderFilterButtons(projects);

  return `Visar ${projects.length} projekt från GitHub.`;
}

// Ett filter per teknik som finns bland projekten, plus "Alla".
function renderFilterButtons(projects) {
  const technologies = [...new Set(projects.flatMap((project) => project.technologies))].sort();

  // Filtrering är meningslös om det bara finns en teknik.
  if (technologies.length < 2) {
    filterGroup.hidden = true;
    return;
  }

  const buttons = [ALL_TECHNOLOGIES, ...technologies].map((technology) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "filter-button";
    button.dataset.technology = technology;
    button.textContent = technology;
    button.setAttribute("aria-pressed", String(technology === ALL_TECHNOLOGIES));
    return button;
  });

  filterGroup.replaceChildren(...buttons);
  filterGroup.hidden = false;
}

function filterProjects(selectedTechnology) {
  const cards = [...projectList.children];
  let visibleCount = 0;

  for (const card of cards) {
    const isVisible =
      selectedTechnology === ALL_TECHNOLOGIES ||
      (projectTechnologies.get(card)?.includes(selectedTechnology) ?? false);
    card.hidden = !isVisible;
    if (isVisible) visibleCount += 1;
  }

  for (const button of filterGroup.querySelectorAll(".filter-button")) {
    button.setAttribute("aria-pressed", String(button.dataset.technology === selectedTechnology));
  }

  projectsStatus.textContent =
    selectedTechnology === ALL_TECHNOLOGIES
      ? `Visar ${cards.length} projekt från GitHub.`
      : `Visar ${visibleCount} av ${cards.length} projekt byggda med ${selectedTechnology}.`;
}

/*
  En lyssnare på gruppen i stället för en per knapp. Knapparna byggs om
  vid varje hämtning, men gruppen finns kvar och behöver bara kopplas en gång.
*/
filterGroup.addEventListener("click", (event) => {
  const button = event.target.closest(".filter-button");

  if (button) {
    filterProjects(button.dataset.technology);
  }
});

export const loadProjects = createDataSection({
  statusElement: projectsStatus,
  retryButton: document.querySelector("#projects-retry"),
  busyElement: projectList,
  subject: "projekten från GitHub",
  load: loadAndRenderProjects,
});
