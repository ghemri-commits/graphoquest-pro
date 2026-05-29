function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

// Générateur d'identifiant unique d'appareil si non-géré par l'iPad
function getDeviceId() {
    let id = localStorage.getItem('gq_device_id');
    if (!id) {
        id = 'ipad_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
        localStorage.setItem('gq_device_id', id);
    }
    return id;
}

window.onload = () => {
    // Initialise l'API Key ElevenLabs dans le champ d'input au chargement si présent
    const key = ElevenLabsEngine.getApiKey();
    const keyField = document.getElementById('elevenlabs-key');
    if (keyField) keyField.value = key;

    setTimeout(() => {
        ProfileManager.syncFromCloud(() => {
            showScreen('profile-screen');
            renderProfiles();
        });
    }, 1500);
};

/* ===== GESTION DES PROFILS ===== */

function renderProfiles() {
    const container = document.getElementById('profiles-list');
    const profiles = ProfileManager.getAll();
    container.innerHTML = '';

    for (let i = 0; i < 3; i++) {
        const p = profiles[i];
        const card = document.createElement('div');

        if (p) {
            card.className = 'profile-card';

            const avatarDiv = document.createElement('div');
            avatarDiv.className = 'profile-avatar';
            avatarDiv.textContent = p.avatar;

            const nameDiv = document.createElement('div');
            nameDiv.className = 'profile-name';
            nameDiv.textContent = p.name;

            const langFlag = p.lang === 'fr' ? '🇫🇷' : p.lang === 'en' ? '🇬🇧' : '🌍';
            const metaDiv1 = document.createElement('div');
            metaDiv1.className = 'profile-meta';
            metaDiv1.textContent = `${p.age} ans · ${langFlag}`;

            const metaDiv2 = document.createElement('div');
            metaDiv2.className = 'profile-meta';
            metaDiv2.textContent = `⭐ ${p.totalScore} · 🎯 ${Object.keys(p.progress).length}`;

            card.appendChild(avatarDiv);
            card.appendChild(nameDiv);
            card.appendChild(metaDiv1);
            card.appendChild(metaDiv2);

            card.onclick = () => selectProfile(p.id);

        } else {
            card.className = 'profile-card add-profile';

            const avatarDiv = document.createElement('div');
            avatarDiv.className = 'profile-avatar';
            avatarDiv.textContent = '➕';

            const nameDiv = document.createElement('div');
            nameDiv.className = 'profile-name';
            nameDiv.textContent = 'Ajouter';

            card.appendChild(avatarDiv);
            card.appendChild(nameDiv);
            card.onclick = showEditProfile;
        }

        container.appendChild(card);
    }
}

let selectedAvatar = AVATARS[0];

function showEditProfile() {
    showScreen('edit-profile-screen');
    const picker = document.getElementById('avatar-picker');
    picker.innerHTML = '';

    AVATARS.forEach(a => {
        const div = document.createElement('div');
        div.className = 'avatar-option';
        div.textContent = a;
        div.onclick = () => {
            document.querySelectorAll('.avatar-option').forEach(x => x.classList.remove('selected'));
            div.classList.add('selected');
            selectedAvatar = a;
        };
        if (a === selectedAvatar) div.classList.add('selected');
        picker.appendChild(div);
    });

    document.getElementById('profile-name').value = '';
    const errorEl = document.getElementById('profile-name-error');
    if (errorEl) errorEl.textContent = '';
}

function saveProfile() {
    const name = document.getElementById('profile-name').value.trim();
    const age = document.getElementById('profile-age').value;
    const lang = document.getElementById('profile-lang').value;
    const errorEl = document.getElementById('profile-name-error');

    if (!name) {
        if (errorEl) errorEl.textContent = '⚠️ Entre un prénom !';
        return;
    }
    if (errorEl) errorEl.textContent = '';

    const profile = ProfileManager.create({ name, age, lang, avatar: selectedAvatar });

    if (!profile) {
        if (errorEl) errorEl.textContent = '⚠️ Maximum 3 profils atteint !';
        return;
    }

    renderProfiles();
    showScreen('profile-screen');
}

function selectProfile(id) {
    ProfileManager.setCurrent(id);
    showDashboard();
}

function logout() {
    ProfileManager.clearCurrent();
    showScreen('profile-screen');
    renderProfiles();
}

/* ===== TABLEAU DE BORD (CARTE PAR CYCLES DU PRIMAIRE) ===== */

function showDashboard() {
    const profile = ProfileManager.getCurrent();
    if (!profile) return;

    document.getElementById('dash-avatar').textContent = profile.avatar;
    document.getElementById('dash-name').textContent = profile.name;
    document.getElementById('dash-level').textContent =
        `⭐ ${profile.totalScore} · 🎯 ${Object.keys(profile.progress).length} réussis`;

    const map = document.getElementById('world-map');
    map.innerHTML = '';

    const lang = profile.lang === 'both' ? 'fr' : profile.lang;
    const data = getGameData(lang);
    const unlockedLevels = lang === 'en'
        ? (profile.unlockedLevelsEn || [1])
        : (profile.unlockedLevelsFr || [1]);

    // Groupement visuel des niveaux par cycle d'apprentissage québécois
    const cyclesData = {};
    data.levels.forEach(level => {
        const cycleNum = level.cycle || 1;
        const cycleTitle = level.cycleName || `Cycle ${cycleNum}`;
        if (!cyclesData[cycleNum]) {
            cyclesData[cycleNum] = { title: cycleTitle, levels: [] };
        }
        cyclesData[cycleNum].levels.push(level);
    });

    // Rendu élégant d'iOS par groupement (Section Cards)
    Object.keys(cyclesData).sort().forEach(cycleId => {
        const cycle = cyclesData[cycleId];

        const section = document.createElement('div');
        section.className = 'cycle-section';
        section.style.cssText = 'background:#f1f5f9; border-radius:24px; padding:20px; margin-bottom:24px; border: 1px solid #e2e8f0;';

        const sTitle = document.createElement('h3');
        sTitle.textContent = cycle.title;
        sTitle.style.cssText = 'font-size:18px; font-weight:700; color:#334155; margin:0 0 16px 4px; display:flex; align-items:center; gap:8px;';

        // Icône visuelle par cycle
        const cycleBadge = document.createElement('span');
        cycleBadge.style.cssText = 'background:#6366f1; color:white; font-size:12px; padding:3px 8px; border-radius:12px;';
        cycleBadge.textContent = `Cycle ${cycleId}`;
        sTitle.appendChild(cycleBadge);
        section.appendChild(sTitle);

        const grid = document.createElement('div');
        grid.style.cssText = 'display:grid; grid-template-columns: repeat(auto-fill, minmax(70px, 1fr)); gap:12px;';

        cycle.levels.forEach(level => {
            const levelId = level.id;
            const isUnlocked = unlockedLevels.includes(levelId);
            const isCompleted = profile.progress[levelId];
            const isCurrent = isUnlocked && !isCompleted;

            const node = document.createElement('div');
            node.className = `world-node ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''} ${!isUnlocked ? 'locked' : ''}`;
            node.style.cssText = 'aspect-ratio:1; display:flex; flex-direction:column; justify-content:center; align-items:center; border-radius:18px; cursor:pointer; font-weight:700; transition: transform 0.2s; position:relative;';

            let icon = '🔒';
            if (isCompleted) {
                icon = '⭐';
                node.style.background = '#e0f2fe';
                node.style.color = '#0369a1';
            } else if (isCurrent) {
                icon = '🎯';
                node.style.background = '#4f46e5';
                node.style.color = 'white';
                node.style.transform = 'scale(1.05)';
            } else if (isUnlocked) {
                icon = '○';
                node.style.background = '#f8fafc';
                node.style.color = '#64748b';
                node.style.border = '2px solid #cbd5e1';
            } else {
                node.style.background = '#cbd5e1';
                node.style.color = '#94a3b8';
                node.style.opacity = '0.7';
            }

            // Affichage du type de mini-jeu sous forme de badge discret
            const gameBadge = document.createElement('span');
            gameBadge.style.cssText = 'font-size:9px; font-weight:600; text-transform:uppercase; margin-top:2px;';
            gameBadge.textContent = level.miniGame === 'accord' ? 'Gram' : level.miniGame === 'dictation' ? 'Dict' : level.miniGame === 'pronounce' ? 'Oral' : 'Phon';

            node.innerHTML = `
                <div class="node-num" style="font-size:16px;">${levelId}</div>
                <div class="node-icon" style="font-size:14px;">${icon}</div>
            `;
            node.appendChild(gameBadge);

            if (isUnlocked) node.onclick = () => launchLevel(levelId);
            grid.appendChild(node);
        });

        section.appendChild(grid);
        map.appendChild(section);
    });

    showScreen('dashboard-screen');
}

function launchLevel(levelId) {
    const profile = ProfileManager.getCurrent();
    if (!profile) return;

    const data = getGameData(profile.lang === 'both' ? 'fr' : profile.lang);
    const level = data.levels.find(l => l.id === levelId);

    GameEngine.init(profile, levelId, level.miniGame);
    showScreen('game-screen');
}

function launchGame(gameType) {
    const profile = ProfileManager.getCurrent();
    const lang = profile.lang === 'both' ? 'fr' : profile.lang;
    const data = getGameData(lang);
    const unlockedLevels = lang === 'en'
        ? (profile.unlockedLevelsEn || [1])
        : (profile.unlockedLevelsFr || [1]);

    const level = data.levels.find(l =>
        l.miniGame === gameType && unlockedLevels.includes(l.id)
    );

    if (level) {
        GameEngine.init(profile, level.id, gameType);
        showScreen('game-screen');
    } else {
        const msg = document.getElementById('dashboard-msg');
        if (msg) {
            msg.textContent = "Termine d'abord les niveaux du cycle en cours !";
            msg.classList.remove('hidden');
            setTimeout(() => msg.classList.add('hidden'), 2500);
        }
    }
}

function exitGame() {
    showDashboard();
}

/* ===== PORTAIL PARENT ===== */

function showParentLogin() {
    currentPin = '';
    updatePinDisplay();
    document.getElementById('parent-login').classList.remove('hidden');
    document.getElementById('parent-dashboard').classList.add('hidden');
    showScreen('parent-screen');
}

/* ===== SÉCURITÉ TACTILE IPAD ===== */
document.addEventListener('gesturestart', e => e.preventDefault());
document.addEventListener('touchmove', e => {
    if (e.target.closest('#parent-screen') || e.target.closest('#dashboard-screen') || e.target.closest('#game-screen')) return;
    e.preventDefault();
}, { passive: false });
