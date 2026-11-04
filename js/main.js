const workList = document.querySelector("#work-list");
const educationList = document.querySelector("#education-list");
const cvStatus = document.querySelector("#cv-status");
const retryButton = document.querySelector("#cv-retry");

// Samma funktion används för både arbeten och utbildningar.
function renderCvList(entries, container, emptyMessage) {
  container.replaceChildren();

  if (entries.length === 0) {
    const message = document.createElement("li");
    message.textContent = emptyMessage;
    container.append(message);
    return;
  }

  const fragment = document.createDocumentFragment();

  entries.forEach(({ title, organization, description }) => {
    const listItem = document.createElement("li");
    const article = document.createElement("article");
    const content = document.createElement("div");
    const heading = document.createElement("h4");
    const organizationText = document.createElement("p");

    article.className = "experience-item";

    heading.textContent = title;
    organizationText.textContent = organization;

    content.append(heading, organizationText);

    if (description.trim() !== "") {
      const descriptionText = document.createElement("p");
      descriptionText.textContent = description;
      content.append(descriptionText);
    }

    article.append(content);
    listItem.append(article);
    fragment.append(listItem);
  });

  container.append(fragment);
}

// Kontrollera att datan har de fält som renderingen behöver.
function isValidCvList(entries) {
  return (
    Array.isArray(entries) &&
    entries.every(
      (entry) =>
        entry !== null &&
        typeof entry === "object" &&
        typeof entry.title === "string" &&
        typeof entry.organization === "string" &&
        typeof entry.description === "string",
    )
  );
}

async function loadCv() {
  cvStatus.textContent = "Loading CV...";
  retryButton.disabled = true;

  workList.setAttribute("aria-busy", "true");
  educationList.setAttribute("aria-busy", "true");

  const controller = new AbortController();

  // Avbryt om hämtningen tar längre än tio sekunder.
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 10000);

  try {
    const response = await fetch("./data/cv.json", {
      signal: controller.signal,
    });

    // Fetch kastar inte automatiskt ett fel vid exempelvis HTTP 404.
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();

    if (!data || !isValidCvList(data.work) || !isValidCvList(data.education)) {
      throw new Error("Invalid CV data");
    }

    renderCvList(data.work, workList, "No work experience has been added yet.");

    renderCvList(
      data.education,
      educationList,
      "No education has been added yet.",
    );

    cvStatus.textContent = "CV loaded.";

    // Om återförsöksknappen har fokus flyttas det innan den döljs.
    if (document.activeElement === retryButton) {
      cvStatus.setAttribute("tabindex", "-1");
      cvStatus.focus();
    }

    retryButton.hidden = true;
  } catch (error) {
    cvStatus.textContent =
      error.name === "AbortError"
        ? "Loading the CV took too long. Please try again."
        : "The CV could not be loaded. Please try again.";

    retryButton.hidden = false;
  } finally {
    clearTimeout(timeoutId);
    retryButton.disabled = false;

    workList.setAttribute("aria-busy", "false");
    educationList.setAttribute("aria-busy", "false");
  }
}

retryButton.addEventListener("click", loadCv);

// Hämta CV:t direkt när skriptet körs.
loadCv();
