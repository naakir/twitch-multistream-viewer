// === État de l'application ===
const state = {
    selectedStreamers: [],
    players: [],          // Liste des objets Twitch.Player actifs
    activePseudo: null    // Pseudo du stream actuellement audible
};

const MAX_STREAMERS = 4;

// === Références DOM ===
const selectionScreen = document.getElementById('selection-screen');
const viewerScreen = document.getElementById('viewer-screen');

const input = document.getElementById('streamer-input');
const addButton = document.getElementById('add-button');
const startButton = document.getElementById('start-button');
const backButton = document.getElementById('back-button');
const streamersList = document.getElementById('streamers-list');
const counter = document.getElementById('counter');
const errorMessage = document.getElementById('error-message');
const streamsGrid = document.getElementById('streams-grid');

// === Fonctions UI === //

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
    setTimeout(() => {
        errorMessage.classList.add('hidden');
    }, 3000);
}

function renderSelection() {
    counter.textContent = state.selectedStreamers.length;
    startButton.disabled = state.selectedStreamers.length === 0;

    streamersList.innerHTML = '';
    state.selectedStreamers.forEach(pseudo => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${pseudo}</span>
            <button class="remove-button" data-pseudo="${pseudo}">Retirer</button>
        `;
        streamersList.appendChild(li);
    });
}

// === Fonctions logique sélection === //

function addStreamer() {
    const pseudo = input.value.trim().toLowerCase();

    if (pseudo === '') {
        showError('Veuillez entrer un pseudo Twitch.');
        return;
    }
    if (!/^[a-z0-9_]{4,25}$/.test(pseudo)) {
        showError('Pseudo invalide (4-25 caractères : lettres, chiffres, underscore).');
        return;
    }
    if (state.selectedStreamers.includes(pseudo)) {
        showError(`${pseudo} est déjà dans la sélection.`);
        return;
    }
    if (state.selectedStreamers.length >= MAX_STREAMERS) {
        showError(`Maximum ${MAX_STREAMERS} streamers.`);
        return;
    }

    state.selectedStreamers.push(pseudo);
    input.value = '';
    renderSelection();
}

function removeStreamer(pseudo) {
    state.selectedStreamers = state.selectedStreamers.filter(p => p !== pseudo);
    renderSelection();
}

// === Fonctions navigation entre écrans === //

function showViewer() {
    selectionScreen.classList.add('hidden');
    viewerScreen.classList.remove('hidden');

    // Attendre le prochain "frame" pour garantir que le DOM est rendu
    // avant d'instancier les players Twitch (sinon erreur "style visibility")
    requestAnimationFrame(() => {
        buildGrid();
    });
}

function showSelection() {
    viewerScreen.classList.add('hidden');
    selectionScreen.classList.remove('hidden');
    clearGrid();
}

// === Fonctions grille de streams === //
/**
 * Construit la grille de streams avec overlay cliquable
 */
function buildGrid() {
    // Reset
    streamsGrid.innerHTML = '';
    streamsGrid.className = '';
    state.players = [];
    state.activePseudo = null;

    // Layout
    const count = state.selectedStreamers.length;
    streamsGrid.classList.add(`count-${count}`);

    // Création des iframes
    state.selectedStreamers.forEach(pseudo => {
        const container = document.createElement('div');
        container.className = 'stream-container';
        container.dataset.pseudo = pseudo;

        const label = document.createElement('span');
        label.className = 'stream-label';
        label.textContent = pseudo;

        // Iframe Twitch native
        const iframe = document.createElement('iframe');
        iframe.src = `https://player.twitch.tv/?channel=${pseudo}&parent=localhost&parent=127.0.0.1&autoplay=true`;
        iframe.allow = 'autoplay; fullscreen; encrypted-media; picture-in-picture';

        // Overlay transparent qui capte les clics (l'iframe n'intercepte plus)
        const overlay = document.createElement('div');
        overlay.className = 'stream-overlay';

        container.appendChild(iframe);
        container.appendChild(overlay);
        container.appendChild(label);
        streamsGrid.appendChild(container);

        state.players.push({ pseudo, iframe, container });

        // Le clic est capté par l'overlay, plus par le container
        overlay.addEventListener('click', () => {
            setActiveStream(pseudo);
        });
    });
}

/**
 * Active visuellement un stream (bordure violette)
 * Note V1 : pas de contrôle audio programmé — limitation technique des iframes Twitch.
 * V2 : prévue avec backend Node.js pour piloter les players via Twitch.Player API.
 */
function setActiveStream(pseudo) {
    state.activePseudo = pseudo;

    state.players.forEach(({ pseudo: p, container }) => {
        if (p === pseudo) {
            container.classList.add('active');
        } else {
            container.classList.remove('active');
        }
    });
}

/**
 * Vide la grille (libère les ressources)
 */
function clearGrid() {
    streamsGrid.innerHTML = '';
    streamsGrid.className = '';
    state.players = [];
    state.activePseudo = null;
}

// === Event listeners === //

addButton.addEventListener('click', addStreamer);

input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        addStreamer();
    }
});

streamersList.addEventListener('click', (event) => {
    if (event.target.classList.contains('remove-button')) {
        const pseudo = event.target.dataset.pseudo;
        removeStreamer(pseudo);
    }
});


startButton.addEventListener('click', showViewer);
backButton.addEventListener('click', showSelection);

// === Init === //
renderSelection();