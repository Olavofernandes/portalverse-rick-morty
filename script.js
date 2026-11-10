const API_URL = "https://rickandmortyapi.com/api/character";

const grid = document.querySelector("#character-grid");
const searchInput = document.querySelector("#search-input");
const statusFilter = document.querySelector("#status-filter");
const speciesFilter = document.querySelector("#species-filter");
const filterForm = document.querySelector("#filter-form");
const loadMoreButton = document.querySelector("#load-more");
const emptyState = document.querySelector("#empty-state");
const favoritesToggle = document.querySelector("#favorites-toggle");
const modal = document.querySelector("#character-modal");
const modalContent = document.querySelector("#modal-content");

let currentPage = 1;
let nextPageUrl = API_URL;
let characters = [];
let allLoadedCharacters = [];
let isShowingFavorites = false;
let isLoading = false;
let activeRequest = null;
let favorites = JSON.parse(localStorage.getItem("portalverse-favorites") || "[]");

const statusLabels = { Alive: "Vivo", Dead: "Morto", unknown: "Desconhecido" };

function updateCounters(total = null) {
  if (total !== null) document.querySelector("#total-count").textContent = total.toLocaleString("pt-BR");
  document.querySelector("#shown-count").textContent = characters.length.toLocaleString("pt-BR");
  document.querySelector("#favorite-count").textContent = favorites.length.toLocaleString("pt-BR");
}

function setApiStatus(message, online = true) {
  const status = document.querySelector("#api-status-text");
  status.textContent = message;
  status.previousElementSibling.style.background = online ? "var(--green)" : "#ff7272";
}

function showLoading() {
  grid.innerHTML = '<div class="loading-state"><div class="loader"></div><p>Estabelecendo conexão interdimensional...</p></div>';
}

function createCharacterCard(character) {
  // Cada card é criado via JavaScript a partir dos dados recebidos da API.
  const card = document.createElement("article");
  card.className = "character-card";
  card.tabIndex = 0;
  card.setAttribute("aria-label", `Ver detalhes de ${character.name}`);

  const imageWrap = document.createElement("div");
  imageWrap.className = "card-image-wrap";

  const image = document.createElement("img");
  image.className = "card-image";
  image.src = character.image;
  image.alt = `Imagem de ${character.name}`;
  image.loading = "lazy";
  imageWrap.appendChild(image);

  const status = document.createElement("span");
  status.className = `status-pill status-${character.status.toLowerCase()}`;
  const statusDot = document.createElement("span");
  statusDot.className = "status-dot";
  status.append(statusDot, document.createTextNode(statusLabels[character.status] || character.status));
  imageWrap.appendChild(status);

  const favoriteButton = document.createElement("button");
  favoriteButton.type = "button";
  favoriteButton.className = `favorite-button ${favorites.includes(character.id) ? "selected" : ""}`;
  favoriteButton.innerHTML = favorites.includes(character.id) ? "♥" : "♡";
  favoriteButton.setAttribute("aria-label", favorites.includes(character.id) ? "Remover dos favoritos" : "Adicionar aos favoritos");
  favoriteButton.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleFavorite(character.id);
    favoriteButton.classList.toggle("selected", favorites.includes(character.id));
    favoriteButton.innerHTML = favorites.includes(character.id) ? "♥" : "♡";
    favoriteButton.setAttribute("aria-label", favorites.includes(character.id) ? "Remover dos favoritos" : "Adicionar aos favoritos");
  });
  imageWrap.appendChild(favoriteButton);

  const info = document.createElement("div");
  info.className = "card-info";
  const id = document.createElement("span");
  id.className = "card-id";
  id.textContent = `ARQUIVO Nº ${String(character.id).padStart(3, "0")}`;
  const name = document.createElement("h3");
  name.textContent = character.name;
  const meta = document.createElement("div");
  meta.className = "card-meta";
  const species = document.createElement("span");
  species.textContent = character.species;
  const origin = document.createElement("span");
  origin.textContent = character.origin.name;
  meta.append(species, origin);
  info.append(id, name, meta);
  card.append(imageWrap, info);

  card.addEventListener("click", () => openCharacterDetails(character));
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openCharacterDetails(character);
    }
  });
  return card;
}

function renderCharacters(list, append = false) {
  if (!append) grid.innerHTML = "";
  list.forEach((character) => {
    const card = createCharacterCard(character);
    grid.appendChild(card); // Insere o card criado no DOM.
  });
  document.querySelector("#result-label").textContent =
    `${characters.length} personagem(ns) carregado(s)`;
  document.querySelector("#active-filter-label").textContent =
    isShowingFavorites ? "Exibindo sua seleção de favoritos" : "Mostrando personagens do multiverso";
  emptyState.classList.toggle("hidden", list.length > 0 || append);
  grid.classList.toggle("hidden", list.length === 0 && !append);
  loadMoreButton.classList.toggle("hidden", isShowingFavorites || !nextPageUrl || list.length === 0);
  updateCounters();
}

function toggleFavorite(id) {
  favorites = favorites.includes(id) ? favorites.filter((item) => item !== id) : [...favorites, id];
  localStorage.setItem("portalverse-favorites", JSON.stringify(favorites));
  updateCounters();
  if (isShowingFavorites) showFavorites();
}

function showFavorites() {
  const favoriteCharacters = allLoadedCharacters.filter((character) => favorites.includes(character.id));
  characters = favoriteCharacters;
  renderCharacters(favoriteCharacters);
}

async function loadCharacters(url = API_URL, append = false) {
  if (isLoading) return;
  isLoading = true;
  loadMoreButton.disabled = true;
  loadMoreButton.textContent = "Carregando...";
  if (!append) showLoading();

  if (activeRequest) activeRequest.abort();
  activeRequest = new AbortController();

  try {
    // fetch() faz a requisição HTTP à API pública.
    const response = await fetch(url, { signal: activeRequest.signal });
    if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
    const data = await response.json(); // Converte a resposta para objeto JavaScript.

    nextPageUrl = data.info.next;
    currentPage = url.includes("page=") ? Number(new URL(url).searchParams.get("page")) : 1;
    const received = data.results || [];

    if (append) {
      characters = [...characters, ...received];
      allLoadedCharacters = [...allLoadedCharacters, ...received.filter(
        (item) => !allLoadedCharacters.some((loaded) => loaded.id === item.id)
      )];
    } else {
      characters = received;
      allLoadedCharacters = [...received];
    }

    renderCharacters(received, append);
    updateCounters(data.info.count);
    setApiStatus("API conectada • dados recebidos");
  } catch (error) {
    if (error.name !== "AbortError") {
      console.error("Falha ao consultar a API:", error);
      grid.innerHTML = "";
      emptyState.classList.remove("hidden");
      emptyState.querySelector("h3").textContent = "Não foi possível acessar o portal";
      emptyState.querySelector("p").textContent = "Verifique sua conexão e tente novamente.";
      setApiStatus("Falha na conexão", false);
    }
  } finally {
    isLoading = false;
    loadMoreButton.disabled = false;
    loadMoreButton.innerHTML = 'Carregar mais personagens <span>＋</span>';
  }
}

function buildApiUrl() {
  const params = new URLSearchParams();
  const name = searchInput.value.trim();
  if (name) params.set("name", name);
  if (statusFilter.value) params.set("status", statusFilter.value);
  if (speciesFilter.value) params.set("species", speciesFilter.value);
  return params.toString() ? `${API_URL}/?${params.toString()}` : API_URL;
}

function applyFilters() {
  isShowingFavorites = false;
  favoritesToggle.classList.remove("active");
  favoritesToggle.setAttribute("aria-pressed", "false");
  nextPageUrl = buildApiUrl();
  characters = [];
  allLoadedCharacters = [];
  loadCharacters(nextPageUrl, false);
}

function openCharacterDetails(character) {
  modalContent.innerHTML = "";
  const wrapper = document.createElement("div");
  wrapper.className = "modal-character";
  const image = document.createElement("img");
  image.src = character.image;
  image.alt = `Imagem de ${character.name}`;
  const info = document.createElement("div");
  const eyebrow = document.createElement("p");
  eyebrow.className = "eyebrow";
  eyebrow.textContent = `ARQUIVO Nº ${character.id}`;
  const title = document.createElement("h2");
  title.id = "modal-name";
  title.textContent = character.name;
  const details = document.createElement("div");
  details.className = "modal-details";
  const fields = [
    ["STATUS", statusLabels[character.status] || character.status],
    ["ESPÉCIE", character.species],
    ["GÊNERO", character.gender],
    ["ORIGEM", character.origin.name],
    ["ÚLTIMA LOCALIZAÇÃO", character.location.name],
    ["APARIÇÕES", String(character.episode.length)]
  ];
  fields.forEach(([label, value]) => {
    const item = document.createElement("div");
    item.className = "modal-detail";
    const strong = document.createElement("strong");
    strong.textContent = label;
    item.append(strong, document.createTextNode(value));
    details.appendChild(item);
  });
  info.append(eyebrow, title, details);
  wrapper.append(image, info);
  modalContent.appendChild(wrapper);
  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  modal.classList.add("hidden");
  document.body.style.overflow = "";
}

let searchTimer;
searchInput.addEventListener("input", () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(applyFilters, 450);
});
statusFilter.addEventListener("change", applyFilters);
speciesFilter.addEventListener("change", applyFilters);
filterForm.addEventListener("submit", (event) => event.preventDefault());

loadMoreButton.addEventListener("click", () => {
  if (nextPageUrl) loadCharacters(nextPageUrl, true);
});

function clearFilters() {
  searchInput.value = "";
  statusFilter.value = "";
  speciesFilter.value = "";
  isShowingFavorites = false;
  favoritesToggle.classList.remove("active");
  favoritesToggle.setAttribute("aria-pressed", "false");
  applyFilters();
}
document.querySelector("#clear-filters").addEventListener("click", clearFilters);
document.querySelector("#empty-clear").addEventListener("click", clearFilters);

favoritesToggle.addEventListener("click", () => {
  isShowingFavorites = !isShowingFavorites;
  favoritesToggle.classList.toggle("active", isShowingFavorites);
  favoritesToggle.setAttribute("aria-pressed", String(isShowingFavorites));
  favoritesToggle.querySelector("span").textContent = isShowingFavorites ? "Ver todos" : "Ver favoritos";
  if (isShowingFavorites) showFavorites();
  else applyFilters();
});

modal.addEventListener("click", (event) => {
  if (event.target.hasAttribute("data-close-modal")) closeModal();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeModal();
});

// Primeira consulta: carrega os personagens assim que a página abre.
loadCharacters();
