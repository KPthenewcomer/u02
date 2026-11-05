import { createDataSection } from "./data-section.js";
import { DataError, fetchJson } from "./fetch-json.js";

const CV_URL = "./data/cv.json";

const workList = document.querySelector("#work-list");
const educationList = document.querySelector("#education-list");

// Samma funktion används för både arbeten och utbildningar.
function renderCvList(entries, container, emptyMessage) {
  if (entries.length === 0) {
    const message = document.createElement("li");
    message.textContent = emptyMessage;
    container.replaceChildren(message);
    return;
  }

  const listItems = entries.map(({ title, organization, description }) => {
    const listItem = document.createElement("li");
    const article = document.createElement("article");
    const heading = document.createElement("h4");
    const organizationText = document.createElement("p");

    article.className = "experience-item";
    heading.textContent = title;
    organizationText.textContent = organization;
    article.append(heading, organizationText);

    if (description.trim() !== "") {
      const descriptionText = document.createElement("p");
      descriptionText.textContent = description;
      article.append(descriptionText);
    }

    listItem.append(article);
    return listItem;
  });

  // Ett anrop i stället för ett per post, så sidan bara ritas om en gång.
  container.replaceChildren(...listItems);
}

// Kontrollera att datan har de fält som renderingen behöver.
function isValidCvList(entries) {
  return (
    Array.isArray(entries) &&
    entries.every(
      (entry) =>
        typeof entry?.title === "string" &&
        typeof entry.organization === "string" &&
        typeof entry.description === "string",
    )
  );
}

async function loadAndRenderCv() {
  const data = await fetchJson(CV_URL);

  if (!isValidCvList(data?.work) || !isValidCvList(data?.education)) {
    throw new DataError("Invalid CV data");
  }

  renderCvList(data.work, workList, "No work experience has been added yet.");
  renderCvList(data.education, educationList, "No education has been added yet.");

  return "CV loaded.";
}

export const loadCv = createDataSection({
  statusElement: document.querySelector("#cv-status"),
  retryButton: document.querySelector("#cv-retry"),
  busyElement: document.querySelector("#cv-content"),
  subject: "the CV",
  load: loadAndRenderCv,
});
