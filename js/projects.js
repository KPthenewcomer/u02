import { createDataSection } from "./data-section.js";
import { DataError, fetchJson } from "./fetch-json.js";

const GITHUB_USERNAME = "KPthenewcomer";
const GITHUB_PROFILE_URL = `https://github.com/${GITHUB_USERNAME}`;
const REPOS_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`;

const projectList = document.querySelector("#project-list");

// Plockar ut de fält sidan behöver, så resten av koden slipper GitHubs format.
function toProject(repo) {
  return {
    name: repo.name,
    description: repo.description?.trim() || "No description has been added yet.",
    language: repo.language ?? "Other",
    codeUrl: repo.html_url,
    liveUrl: repo.homepage?.trim() || null,
  };
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
    return "";
  }

  projectList.replaceChildren(...projects.map(createProjectCard));

  return `Showing ${formatProjectCount(projects.length)} from GitHub.`;
}

function formatProjectCount(count) {
  return `${count} ${count === 1 ? "project" : "projects"}`;
}

export const loadProjects = createDataSection({
  statusElement: document.querySelector("#projects-status"),
  retryButton: document.querySelector("#projects-retry"),
  busyElement: projectList,
  subject: "the projects from GitHub",
  load: loadAndRenderProjects,
});
