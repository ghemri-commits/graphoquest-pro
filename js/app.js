function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

window.onload = () => {
    setTimeout(() => {
        showScreen('profile-screen');
        renderProfiles();
    }, 1500);
};

/* ===== PROFILS ===== */

function renderProfiles() {
    const container = document.getElementById('profiles-list');
    const profiles = ProfileManager.getAll();
    container.innerHTML = '';

    // Toujours afficher exactement 3 slots
    for (let i = 0; i < 3; i++) {
        const p = profiles[i];
        const card = document.createElement('div');

        if (p) {
            card.className = 'profile-card';
            card.innerHTML = `
                <div class="profile-avatar">${p.avatar}</div>
                <div class="profile-name">${p.name}</div>
                <div class="profile-meta">${p.age} ans · ${p.lang === 'fr' ? '🇫🇷' : p.lang === 'en' ? '🇬🇧' : '🌍'}</div>
                <div class="profile-meta">⭐ ${p.totalScore} · 🎯 ${Object.keys(p.progress).length}</div>
                <button class="profile-delete" data-id="${p.id}" aria-label="Supprimer">×</button>
                <div class="delete-confirm hidden">
                    <span>Supprimer ?</span>
                    <button class="btn-confirm-yes" data-id="${p.id}">Oui</button>
                    <button class="btn-confirm-no">Non</button>
                </div>
            `;
            card.onclick = (e) => {
                if (e.target.closest('.profile-delete') || e.target.closest('.delete-confirm')) return;
                selectProfile(p.id);
            };
            card.querySelector('.profile-delete').addEventListener('click', (e) => {
                e.stopPropagation();
                card.querySelector('.delete-confirm').classList.remove('hidden');
                card.querySelector('.profile-delete').classList.add('hidden');
            });
            card.querySelector('.btn-confirm-yes').addEventListener('click', (e) => {
                e.stopPropagation();
                ProfileManager.delete(p.id);
                renderProfiles();
            });
            card.querySelector('.btn-confirm-no').addEventListener('click', (e) => {
                e.stopPropagation();
                card.querySelector('.delete-confirm').classList.add('hidden');
                card.querySelector('.profile-delete').classList.remove('hidden');
            });

        } else {
            card.className = 'profile-card add-profile';
            card.innerHTML = `
                <div class="profile-avatar">➕</div>
                <div class="profile-name">Ajouter</div>
            `;
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

/* ===== DASHBOARD ===== */

function showDashboard() {
    const profile = ProfileManager.getCurrent();
    if (!profile) return;

    document.getElementById('dash-avatar').textContent = profile.avatar;
    document.getElementById('dash-name').textContent = profile.name;
    document.getElementById('dash-level').textContent =
        `⭐ ${profile.totalScore} · 🎯 ${Object.keys(profile.progress).length}/25`;

    const map = document.getElementById('world-map');
    map.innerHTML = '';

    const data = getGameData(profile.lang === 'both' ? 'fr' : profile.lang);
    const lang = profile.lang === 'both' ? 'fr' : profile.lang;
    const unlockedLevels = lang === 'en'
        ? (profile.unlockedLevelsEn || [1])
        : (profile.unlockedLevelsFr || [1]);

    for (let i = 1; i <= 25; i++) {
        const isUnlocked = unlockedLevels.includes(i);
        const isCompleted = profile.progress[i];
        const isCurrent = isUnlocked && !isCompleted;

        const node = document.createElement('div');
        node.className = `world-node ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''} ${!isUnlocked ? 'locked' : ''}`;

        let icon = '🔒';
        if (isCompleted) icon = '⭐';
        else if (isCurrent) icon = '🎯';
        else if (isUnlocked) icon = '○';

        node.innerHTML = `
            <div class="node-num">${i}</div>
            <div class="node-icon">${icon}</div>
            <div class="node-stars">${isCompleted ? '⭐'.repeat(profile.progress[i].stars) : ''}</div>
        `;

        if (isUnlocked) node.onclick = () => launchLevel(i);
        map.appendChild(node);
    }

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
    const data = getGameData(profile.lang === 'both' ? 'fr' : profile.lang);

    const level = data.levels.find(l =>
        l.miniGame === gameType && profile.unlockedLevels.includes(l.id)
    );

    if (level) {
        GameEngine.init(profile, level.id, gameType);
        showScreen('game-screen');
    } else {
        const msg = document.getElementById('dashboard-msg');
        if (msg) {
            msg.textContent = "Termine d'abord les niveaux précédents !";
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

/* ===== SECURITE TACTILE ===== */
document.addEventListener('gesturestart', e => e.preventDefault());
document.addEventListener('touchmove', e => {
    if (e.scale !== 1) e.preventDefault();
}, { passive: false });
