# Twitch Multistream Viewer

> 🇬🇧 Watch up to 8 Twitch streams simultaneously with focused stream selection.
> 🇫🇷 Regardez jusqu'à 8 streams Twitch simultanément avec sélection de focus.

![Demo](docs/demo.gif)

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Twitch](https://img.shields.io/badge/Twitch-9146FF?style=flat&logo=twitch&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green.svg)

---

## 🇬🇧 English

### About

**Twitch Multistream Viewer** is a lightweight web app that lets you watch up to 8 Twitch streams simultaneously on a single page. Originally built to replicate the experience of multiplex broadcasting for esports tournaments, drops events, or watching multiple streamer perspectives in parallel.

The project intentionally stays as a **pure frontend static app** (HTML, CSS, JavaScript only — no backend, no framework) to remain lightweight, fast, and easily deployable on any static host.

### Features

- 🎯 **Add up to 8 streams** by typing Twitch usernames directly
- 🛡️ **Robust input validation**: format check (regex), duplicates, empty fields, max limit
- 📐 **Adaptive grid layout** that automatically reorganizes for X streams
- 🎬 **Native Twitch player embed** with full official controls (play, pause, volume, fullscreen, quality)
- 🟣 **Visual focus selection**: click any stream to highlight it with a purple border
- 🔄 **Two-screen navigation**: selection screen ↔ multistream viewer
- 🎨 **Twitch-themed dark UI** matching the platform's official color palette

### Tech Stack

| Layer | Technology |
|-------|------------|
| Structure | HTML5 |
| Styling | CSS3 (Flexbox + Grid) |
| Logic | Vanilla JavaScript (ES6+) |
| Embed | Twitch native iframe player |
| Hosting | Static (GitHub Pages compatible) |

**No frameworks, no build step, no dependencies.** This is a deliberate choice for simplicity and learning purposes.

### Local Setup

1. Clone the repository:
```bash
   git clone https://github.com/naakir/twitch-multistream-viewer.git
   cd twitch-multistream-viewer
```

2. Serve locally with any static server. Recommended: VS Code Live Server extension, or Python's built-in server:
```bash
   python3 -m http.server 5500
```

3. Open `http://localhost:5500` in your browser.

> ⚠️ **Important**: the app must be served via `http://localhost` or `http://127.0.0.1` (not `file://`), because Twitch's embed requires a valid `parent` domain to authorize playback.

### Roadmap (V2)

Planned improvements for the next iteration:

- 🔍 **Live search via Twitch Helix API** — find streamers and check their live status before adding them to the selection
- 🎧 **Exclusive audio focus** — clicking a stream automatically mutes the others (requires backend Node.js to bypass iframe API limitations)
- 💾 **localStorage for favorites** — save preferred streamers across sessions
- 🔗 **Shareable URL** — encode the current selection in a query string (`?streamers=alice,bob,charlie`)
- 📱 **Improved mobile layout** for portrait orientation

### Technical Notes

This project intentionally illustrates **real engineering trade-offs** encountered when working with third-party embeds:

- **Twitch Player JS API vs native iframe**: After testing both approaches, the native iframe was chosen for reliability — the JS API failed in certain browser/setup combinations due to permissions policy and visibility detection.
- **Click capture overlay**: A transparent `<div>` overlay is layered above the iframe (except over the bottom controls bar) to capture click events for stream selection. Without this, clicks would be intercepted by the iframe and never reach our code.
- **Audio control deferred to V2**: Programmatically muting/unmuting cross-origin iframes is not reliably supported. The honest decision was to ship a working MVP with manual audio control rather than a buggy automated one.

### License

[MIT](LICENSE)

### Author

Built by [@naakir](https://github.com/naakir).

---

## 🇫🇷 Français

### À propos

**Twitch Multistream Viewer** est une application web légère permettant de regarder jusqu'à 8 streams Twitch simultanément sur une même page. Construit à l'origine pour répliquer l'expérience de diffusion multiplex pour les tournois esport, les événements drops, ou pour suivre plusieurs perspectives de streamers en parallèle.

Le projet reste volontairement une **application 100% frontend statique** (HTML, CSS, JavaScript uniquement — sans backend, sans framework) pour rester léger, rapide, et facilement déployable sur n'importe quel hébergement statique.

### Fonctionnalités

- 🎯 **Ajout jusqu'à 8 streams** en tapant directement les pseudos Twitch
- 🛡️ **Validations robustes** : format (regex), doublons, champ vide, limite max
- 📐 **Grille adaptative** qui se réorganise automatiquement pour X streams
- 🎬 **Embed Twitch natif** avec contrôles officiels complets (play, pause, volume, plein écran, qualité)
- 🟣 **Sélection visuelle de focus** : clique sur un stream pour le mettre en avant avec une bordure violette
- 🔄 **Navigation à deux écrans** : sélection ↔ visualisation multistream
- 🎨 **UI dark thème Twitch** reprenant la palette officielle de la plateforme

### Stack technique

| Couche | Technologie |
|--------|-------------|
| Structure | HTML5 |
| Style | CSS3 (Flexbox + Grid) |
| Logique | JavaScript vanilla (ES6+) |
| Embed | Iframe player Twitch natif |
| Hébergement | Statique (compatible GitHub Pages) |

**Pas de framework, pas de build, pas de dépendances.** Choix volontaire pour la simplicité et l'apprentissage.

### Installation locale

1. Cloner le dépôt :
```bash
   git clone https://github.com/naakir/twitch-multistream-viewer.git
   cd twitch-multistream-viewer
```

2. Servir en local avec n'importe quel serveur statique. Recommandé : l'extension Live Server de VS Code, ou le serveur intégré Python :
```bash
   python3 -m http.server 5500
```

3. Ouvrir `http://localhost:5500` dans le navigateur.

> ⚠️ **Important** : l'application doit tourner via `http://localhost` ou `http://127.0.0.1` (pas de chemin `file://`), car l'embed Twitch exige un domaine `parent` valide pour autoriser la lecture.

### Roadmap (V2)

Améliorations prévues à venir  :

- 🔍 **Recherche live via l'API Twitch Helix** — trouver des streamers et vérifier leur statut live avant ajout à la sélection
- 🎧 **Focus audio exclusif** — cliquer sur un stream mute automatiquement les autres
- 💾 **localStorage pour favoris** — sauvegarder les streamers préférés entre sessions 
- 🔗 **URL partageable** — encoder la sélection actuelle en query string (`?streamers=john,doe,tango`)

### Notes techniques

- **API JS Twitch.Player vs iframe native** : après avoir testé les deux approches, l'iframe native a été retenue pour la fiabilité — l'API JS échouait sur certaines combinaisons navigateur/setup à cause des politiques de permissions et de la détection de visibilité.
- **Couche de capture de clics (overlay)** : un `<div>` transparent est superposé au-dessus de l'iframe (sauf sur la barre de contrôles du bas) pour capter les événements de clic pour la sélection. Sans cela, les clics seraient interceptés par l'iframe et n'atteindraient jamais notre code.
- **Contrôle audio reporté en V2** : muter/démuter par programme des iframes cross-origin n'est pas supporté de façon fiable. La décision honnête a été de livrer un MVP fonctionnel avec contrôle audio manuel plutôt qu'un système automatique buggé.

### Licence

[MIT](LICENSE)

### Auteur

Réalisé par [@naakir](https://github.com/naakir).