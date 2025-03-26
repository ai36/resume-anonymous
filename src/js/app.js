/* Рендер кнопок переключения между данными + кнопки генерации PDF из html */
function buttonsRender() {
    const buttons = [
        {
            text: "Frontend-разработчк",
            path: "data-ru.json",
            onclick: "",
        },
        {
            text: "Skilled Frontend developer",
            path: "data-o3.json",
            onclick: "",
        },
        {
            text: "template",
            path: "data-template.json",
            onclick: "",
        },
        {
            text: "convert to PDF (html2pdf)",
            path: "",
            onclick: "html2pdf().from(document.querySelector('.resume')).save('resume Andrei Fedorov 971-430-5535.pdf')",
        },
        {
            text: "print to PDF",
            path: "",
            onclick: "window.print()",
        },
    ];
    let buttonsBox = document.querySelector(".buttons-box");
    if (buttonsBox) {
        buttonsBox.innerHTML = "";
    } else {
        buttonsBox = document.createElement("div");
        buttonsBox.classList.add("buttons-box");
        document.body.appendChild(buttonsBox);
    }
    buttons.forEach((button) => {
        let buttonItem = document.createElement("button");
        buttonItem.classList.add("buttons-box__item");
        buttonItem.textContent = button.text;
        if (button.path) buttonItem.dataset.path = button.path;
        if (button.onclick) buttonItem.setAttribute("onclick", button.onclick);
        buttonsBox.appendChild(buttonItem);
    });
}

/* Рендер внутреннего содержимого залоговка */
function headerAdd() {
    let header = document.createElement("header");
    header.classList.add("header");
    header.innerHTML = "";
    document.querySelector(".resume").appendChild(header);
    let box = document.querySelector(".header");
    box.innerHTML = `
    <h1 class="name">${base.fullName}</h1>
    <h2 class="major">(${base.major})</h2>
    <div class="contact">
        <p>${base.phone}</p>
        <p><a href="mailto:${base.email}">${base.email}</a></p>
        <p><a href="${base.links.linkedIn.href}">${base.links.linkedIn.content}</a></p>
        <p>${base.address}</p>
    </div>
    `;
}

/* Генератор списка html из строки с разделителями */
function listAdd(str) {
    return `<ul><li>${str.split(", ").join("</li><li>")}</ul>`;
}

/* Рендер внутреннего содержимого раздела */
function contentAdd(section) {
    let box = document.querySelector("." + section);

console.log(base.sections[section][0].titleMod);

    let content = `<h2 class="title">${section == "experience" ? ( base.sections[section][0].titleMod ? base.sections[section][0].titleMod : "Professional Experience") : ( base.sections[section][0].titleMod ? base.sections[section][0].titleMod : section[0].toUpperCase() + section.slice(1))}</h2>`;
    base.sections[section].forEach((item) => {
        content += `
            ${item.companyName ? `<h3>${[item.companyName, item.major, item.location].filter((item) => item !== null).join(", ")}</h3>` : ""}
            ${item.timeRange ? `<span class="dates">${item.timeRange.start} - ${item.timeRange.end}</span>` : ""}

            ${Array.isArray(item.details) ? `<ul><li>${item.details.join(`</li><li>`)}</li></ul>` : ""}

            ${
                Array.isArray(item.items)
                    ? `${section == "skills" ? "" : "<p>"}
                    ${item.items
                        .map((i) => {
                            return (
                                (i.title && !i.url ? `<h3>${i.title}</h3> ` : "") +
                                (i.url ? `<a href="${i.url}">${i.title}</a>` : "") +
                                (i.title == "Technologies" || i.title == "Other" ? `${listAdd(i.desc)}` : i.desc ? (i.url ? ` (${i.desc})` : `${i.desc}`) : "")
                            );
                        })
                        .join(`${section == "skills" ? "" : "</p><p>"}`)}
                ${section == "skills" ? "" : "</p>"}`
                    : ""
            }
        `;
    });
    box.innerHTML = content;
}

/* Рендер раздела */
function sectionAdd(section) {
    let cur = document.createElement("section");
    cur.classList.add(section);
    cur.innerHTML = section;
    document.querySelector(".resume").appendChild(cur);
    contentAdd(section);
}

/* Рендер html внутри контейнера */
function pageAdd() {
    /* рендер заголовка */
    headerAdd();
    /* рендер разделов */
    const sections = Object.keys(base.sections);
    sections.forEach(sectionAdd);
}

/* Точка входа в приложение */
let base = {};
let isDataLoaded = false;
const TIMEOUT = 5000;

// Определяем путь к данным в зависимости от среды
const BASE_PATH = import.meta.env.BASE_URL;

async function loadData(path) {
    try {
      // Универсальный путь для всех окружений
      const apiUrl = import.meta.env.DEV 
        ? `/${path}`  // В разработке берем напрямую из public
        : `/api/data?file=${path}`;  // В продакшене через API роут
      
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      
      base = await response.json();
      isDataLoaded = true;
      startRendering();
    } catch (error) {
      console.error('Data loading error:', error);
      // Fallback на локальный файл если API не сработал
      if (!import.meta.env.DEV) {
        try {
          const localResponse = await fetch(`/${path}`);
          if (!localResponse.ok) throw new Error('Fallback failed');
          base = await localResponse.json();
          isDataLoaded = true;
          startRendering();
        } catch (fallbackError) {
          console.error('Fallback loading failed:', fallbackError);
        }
      }
    }
  }

async function fetchWithFallback(serverUrl, localUrl) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

        // Пробуем загрузить данные с сервера
        const response = await fetch(serverUrl, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (response.ok) return await response.json();
        throw new Error(`HTTP error! Status: ${response.status}`);
    } catch (error) {
        console.warn(`Server request failed (${serverUrl}), trying local file...`, error);
        return fetchLocalFile(localUrl);
    }
}

async function fetchLocalFile(localUrl) {
    try {
        const response = await fetch(localUrl);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error(`Local file loading failed: ${localUrl}`, error);
        throw error;
    }
}

/* Удаление контейнера перед генерацией */
function clearTree() {
    document.querySelector(".resume").innerHTML = "";
}

/* Генерация */
function startRendering() {
    /* генерировать только если данные загружены */
    if (!isDataLoaded) {
        console.error("Error: Data not loading or not available");
        return;
    }
    /* очистка контейнера */
    clearTree();
    /* запуск генерации */
    pageAdd();
}

/* Рендер и обработка кнопок */
window.addEventListener("DOMContentLoaded", () => {
    buttonsRender();
    let currentPath = "data-ru.json";
    loadData(currentPath);

    window.addEventListener("click", (event) => {
        let e = event.target;
        if (e.classList.contains("buttons-box__item") && e.dataset.path != currentPath && e !== document.querySelector("buttons-box__item:last-child")) {
            loadData(e.dataset.path);
            currentPath = e.dataset.path;
        }
    });
});
