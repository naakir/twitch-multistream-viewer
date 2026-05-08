// === État de l'application ===
const state = {
    selectedStreamers: []
};

const MAX_STREAMERS = 4;

// === Références DOM ===
const input = document.getElementById('streamer-input');
const addButton = document.getElementById('add-button');
const startButton = document.getElementById('start-button');
const streamersList = document.getElementById('streamers-list');
const counter = document.getElementById('counter');
const errorMessage = document.getElementById('error-message');

// === Fonctions ===

/**
 * Affiche un message d'erreur pendant 3 secondes
 */
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
    setTimeout(() => {
        errorMessage.classList.add('hidden');
    }, 3000);
}

/**
 * Met à jour l'affichage de la liste, du compteur et du bouton "Lancer"
 */
function render() {
    // Mise à jour du compteur
    counter.textContent = state.selectedStreamers.length;

    // Mise à jour du bouton "Lancer"
    startButton.disabled = state.selectedStreamers.length === 0;

    // Reconstruction de la liste
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

/**
 * Ajoute un streamer à la sélection après validation
 */
function addStreamer() {
    const pseudo = input.value.trim().toLowerCase();

    // Validation : champ vide
    if (pseudo === '') {
        showError('Veuillez entrer un pseudo Twitch.');
        return;
    }

    // Validation : caractères Twitch valides (lettres, chiffres, underscore)
    if (!/^[a-z0-9_]{4,25}$/.test(pseudo)) {
        showError('Pseudo invalide.');
        return;
    }

    // Validation : doublon
    if (state.selectedStreamers.includes(pseudo)) {
        showError(`${pseudo} est déjà dans la sélection ! `);
        return;
    }

    // Validation : maximum atteint
    if (state.selectedStreamers.length >= MAX_STREAMERS) {
        showError(`Tu ne peux sélectionner que ${MAX_STREAMERS} streamers pour le moment.`);
        return;
    }

    // Ajout
    state.selectedStreamers.push(pseudo);
    input.value = '';
    render();
}

/**
 * Retire un streamer de la sélection
 */
function removeStreamer(pseudo) {
    state.selectedStreamers = state.selectedStreamers.filter(p => p !== pseudo);
    render();
}

// === Event listeners ===

// Clic sur "Ajouter"
addButton.addEventListener('click', addStreamer);

// Touche Entrée dans l'input = équivalent du bouton Ajouter
input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        addStreamer();
    }
});

// Clic sur un bouton "Retirer" (event delegation)
streamersList.addEventListener('click', (event) => {
    if (event.target.classList.contains('remove-button')) {
        const pseudo = event.target.dataset.pseudo;
        removeStreamer(pseudo);
    }
});

// Clic sur "Lancer le multistream" — pour l'instant juste un log
startButton.addEventListener('click', () => {
    console.log('Lancement avec :', state.selectedStreamers);
    alert(`Multistream à lancer avec : ${state.selectedStreamers.join(', ')}\n(L'écran de visualisation sera codé à l'étape 4)`);
});

// Premier render au chargement
render();