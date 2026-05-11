// === État de l'application ===
const state = {
    selectedStreamers: [],
    players: [],          // Liste des objets Twitch.Player actifs
    activePseudo: null    // Pseudo du stream actuellement audible
};
// On fait jouer un son au lancement du multistream (pour la vanne)
const launchSound = new Audio('assets/launch-sound.mp3');
launchSound.volume = 0.25; // Volume modéré 

const MAX_STREAMERS = 8;

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
const perfWarning = document.getElementById('perf-warning');
const interactToggle = document.getElementById('interact-toggle');
const chatToggle = document.getElementById('chat-toggle');
const chatPanel = document.getElementById('chat-panel');
const chatContainer = document.getElementById('chat-container');
const chatTitle = document.getElementById('chat-title');

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

    // Avertissement perf si on dépasse 4 streams
    if (state.selectedStreamers.length > 4) {
        perfWarning.classList.remove('hidden');
    } else {
        perfWarning.classList.add('hidden');
    }

    streamersList.innerHTML = '';

    if (state.selectedStreamers.length === 0) {
        const emptyState = document.createElement('li');
        emptyState.className = 'empty-state';
        emptyState.textContent = 'Aucun streamer ajouté. Commencez par taper un pseudo ci-dessus.';
        streamersList.appendChild(emptyState);
        return;
    }

    state.selectedStreamers.forEach(pseudo => {
        const li = document.createElement('li');
        li.dataset.pseudo = pseudo;  // utile pour SortableJS
        li.innerHTML = `
            <span>${pseudo}</span>
            <button class="remove-button" data-pseudo="${pseudo}">Retirer</button>
        `;
        streamersList.appendChild(li);
    });

    // Initialiser SortableJS sur la liste (une fois les li créés)
    initSortableSelection();
}
/**
 * pour activer le drag & drop sur la liste de sélection
 */
let sortableSelectionInstance = null;
function initSortableSelection() {
    // Détruit l'instance précédente si elle existe (pour éviter les doublons)
    if (sortableSelectionInstance) {
        sortableSelectionInstance.destroy();
    }

    sortableSelectionInstance = Sortable.create(streamersList, {
        animation: 150,
        filter: '.empty-state, .remove-button',  // exclure ces éléments du drag
        preventOnFilter: false,                  // permettre les clics sur .remove-button
        onEnd: (event) => {
            // Synchroniser le state avec le nouvel ordre du DOM
            const newOrder = Array.from(streamersList.querySelectorAll('li[data-pseudo]'))
                .map(li => li.dataset.pseudo);
            state.selectedStreamers = newOrder;
            console.log('[DRAG] Nouvel ordre :', state.selectedStreamers);
        }
    });
}

    state.selectedStreamers.forEach(pseudo => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${pseudo}</span>
            <button class="remove-button" data-pseudo="${pseudo}">Retirer</button>
        `;
        streamersList.appendChild(li);
    });

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

    // Reset du mode interaction
    document.body.classList.remove('interact-mode');
    interactToggle.textContent = '🖱️ Mode interaction : OFF';
    interactToggle.classList.remove('active');
}

// === Fonctions grille de streams === //
/**
 * Grille de streams avec overlay cliquable
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

    // Création des iframes pour les streams 
    state.selectedStreamers.forEach(pseudo => {
        const container = document.createElement('div');
        container.className = 'stream-container';
        container.dataset.pseudo = pseudo;

       const label = document.createElement('span');
        label.className = 'stream-label';
        label.title = 'Glissez pour réorganiser';
        label.innerHTML = `<span class="drag-icon">⠿</span> ${pseudo}`;


        const iframe = document.createElement('iframe');
        iframe.src = `https://player.twitch.tv/?channel=${pseudo}&parent=localhost&parent=127.0.0.1&parent=naakir.github.io&autoplay=true`;
        iframe.allow = 'autoplay; fullscreen; encrypted-media; picture-in-picture';

        const overlay = document.createElement('div');
        overlay.className = 'stream-overlay';

        container.appendChild(iframe);
        container.appendChild(overlay);
        container.appendChild(label);
        streamsGrid.appendChild(container);

        state.players.push({ pseudo, iframe, container });

        overlay.addEventListener('click', () => {
            setActiveStream(pseudo);
        });
    });

    // Permet d'activer  le drag & drop sur la grille
    initSortableGrid();
}

/**
 * Activer le drag & drop sur la grille de streams
 */
let sortableGridInstance = null;
function initSortableGrid() {
    if (sortableGridInstance) {
        sortableGridInstance.destroy();
    }

    sortableGridInstance = Sortable.create(streamsGrid, {
        animation: 200,
        // Drag handle : on n'utilise que le label pour drag
        // (sinon conflit avec le clic = focus mode)
        handle: '.stream-label',
        onStart: () => {
            document.body.classList.add('is-dragging');
        },
        onEnd: (event) => {
            document.body.classList.remove('is-dragging');

            // Synchroniser state.selectedStreamers ET state.players avec le nouvel ordre du DOM
            const newOrder = Array.from(streamsGrid.querySelectorAll('.stream-container'))
                .map(c => c.dataset.pseudo);

            state.selectedStreamers = newOrder;
            state.players = newOrder.map(pseudo =>
                state.players.find(p => p.pseudo === pseudo)
            );
            console.log('[DRAG GRID] Nouvel ordre :', state.selectedStreamers);
        }
    });
}

/**
 * Active visuellement un stream (bordure violette)
 * Note V1 : pas de contrôle audio programmé pour le moment — limitation technique des iframes Twitch.
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

    // Si le tchat est ouvert, le mettre à jour sur le nouveau stream actif
    if (!chatPanel.classList.contains('hidden')) {
        loadChat(pseudo);
    }
}

/**
 * Charge le tchat Twitch pour le pseudo donné
 */
function loadChat(pseudo) {
    chatContainer.innerHTML = '';

    const iframe = document.createElement('iframe');
    iframe.src = `https://www.twitch.tv/embed/${pseudo}/chat?parent=localhost&parent=127.0.0.1&parent=naakir.github.io&darkpopout`;
    chatContainer.appendChild(iframe);

    chatTitle.textContent = `💬 Tchat — ${pseudo}`;
}

/**
 * Toggle l'affichage du panneau tchat
 */
function toggleChat() {
    const isHidden = chatPanel.classList.contains('hidden');

    if (isHidden) {
        // Ouverture
        chatPanel.classList.remove('hidden');
        chatToggle.textContent = '💬 Masquer le tchat';
        chatToggle.classList.add('active');

        // Charger le tchat du stream actif (ou du premier si aucun n'est actif)
        const pseudoToLoad = state.activePseudo || state.selectedStreamers[0];
        if (pseudoToLoad) {
            loadChat(pseudoToLoad);
        }
    } else {
        // Fermeture — vider l'iframe pour libérer les ressources
        chatPanel.classList.add('hidden');
        chatToggle.textContent = '💬 Afficher le tchat';
        chatToggle.classList.remove('active');
        chatContainer.innerHTML = '';
    }
}

/**
 * Vide la grille (libère les ressources)
 */
function clearGrid() {
    // Détruire l'instance SortableJS avant de vider la grille
    if (sortableGridInstance) {
        sortableGridInstance.destroy();
        sortableGridInstance = null;
    }

    streamsGrid.innerHTML = '';
    streamsGrid.className = '';
    state.players = [];
    state.activePseudo = null;

    // Reset du tchat
    chatPanel.classList.add('hidden');
    chatToggle.textContent = '💬 Afficher le tchat';
    chatToggle.classList.remove('active');
    chatContainer.innerHTML = '';
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


startButton.addEventListener('click', () => {
    // Joue le son de lancement (ne bloque pas si le navigateur refuse l'autoplay)
    launchSound.currentTime = 0; // remet à zéro au cas où on relance plusieurs fois
    launchSound.play().catch(error => {
        console.warn('Audio playback was prevented:', error);
    });

    showViewer();
});
// Toggle du mode interaction (désactive l'overlay pour interagir avec les contrôles natifs Twitch)
interactToggle.addEventListener('click', () => {
    document.body.classList.toggle('interact-mode');
    const isActive = document.body.classList.contains('interact-mode');
    interactToggle.textContent = isActive
        ? '🖱️ Mode interaction : ON'
        : '🖱️ Mode interaction : OFF';
    interactToggle.classList.toggle('active', isActive);
});
chatToggle.addEventListener('click', toggleChat);
backButton.addEventListener('click', showSelection);

// === Init === //
renderSelection();