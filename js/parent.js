const ParentPortal = {
    PIN_KEY: 'gq_parent_pin',
    DEFAULT_PIN: '1234',

    getPin() {
        try { return localStorage.getItem(this.PIN_KEY) || this.DEFAULT_PIN; } catch(e) { return this.DEFAULT_PIN; }
    },

    setPin(newPin) {
        if (/^\d{4}$/.test(newPin)) {
            try { localStorage.setItem(this.PIN_KEY, newPin); return true; } catch(e) {}
        }
        return false;
    },

    checkPin(input) { return input === this.getPin(); },

    /* ===== PROGRESSION ===== */
    renderProgress() {
        const container = document.getElementById('parent-progress-list');
        const profiles = ProfileManager.getAll();

        if (profiles.length === 0) {
            container.innerHTML = '<p style="text-align:center;color:#666;padding:20px">Aucun profil enregistré</p>';
            return;
        }

        container.innerHTML = profiles.map(p => {
            const totalLevels = 25;
            const completed = Object.keys(p.progress).length;
            const percent = Math.round((completed / totalLevels) * 100);
            const lastKey = Object.keys(p.progress).pop();

            return `
                <div class="progress-item">
                    <div class="progress-item-header">
                        <span class="progress-item-name">${p.avatar} ${p.name} (${p.age} ans)</span>
                        <span>⭐ ${p.totalScore}</span>
                    </div>
                    <div class="progress-item-stats">
                        <span>🎯 ${completed}/${totalLevels} niveaux</span>
                        <span>🔥 ${Object.values(p.progress).reduce((a,b) => a + b.attempts, 0)} essais</span>
                        <span>🏆 ${Object.values(p.progress).reduce((a,b) => a + b.stars, 0)} étoiles</span>
                    </div>
                    <div class="progress-bar-bg">
                        <div class="progress-bar-fill" style="width:${percent}%"></div>
                    </div>
                    <p style="margin-top:8px;font-size:14px;color:#666">
                        Dernier niveau : ${lastKey ? 'Niveau ' + lastKey : 'Aucun'}
                    </p>
                </div>
            `;
        }).join('');
    },

    /* ===== GESTIONNAIRE DE NIVEAUX ===== */
    renderLevelManager() {
        const select = document.getElementById('parent-profile-select');
        const container = document.getElementById('level-manager');
        const profileId = parseInt(select.value);

        if (!profileId) {
            container.innerHTML = '<p style="color:#666;padding:10px 0">Sélectionne un profil</p>';
            return;
        }

        const profile = ProfileManager.getAll().find(p => p.id === profileId);
        if (!profile) return;

        const unlockedFr = profile.unlockedLevelsFr || [1];
        const unlockedEn = profile.unlockedLevelsEn || [1];

        container.innerHTML = `
            <div class="lang-level-grid">
                <div class="lang-level-col">
                    <div class="lang-level-header">
                        <span>🇫🇷 Français</span>
                        <div class="lang-level-actions">
                            <button class="lvl-action-btn" onclick="ParentPortal.unlockAll(${profileId},'fr')">Tout ouvrir</button>
                            <button class="lvl-action-btn danger" onclick="ParentPortal.lockAll(${profileId},'fr')">Tout fermer</button>
                        </div>
                    </div>
                    <div class="level-grid" id="grid-fr"></div>
                </div>
                <div class="lang-level-col">
                    <div class="lang-level-header">
                        <span>🇬🇧 English</span>
                        <div class="lang-level-actions">
                            <button class="lvl-action-btn" onclick="ParentPortal.unlockAll(${profileId},'en')">Tout ouvrir</button>
                            <button class="lvl-action-btn danger" onclick="ParentPortal.lockAll(${profileId},'en')">Tout fermer</button>
                        </div>
                    </div>
                    <div class="level-grid" id="grid-en"></div>
                </div>
            </div>
        `;

        this._fillGrid('grid-fr', profileId, 'fr', unlockedFr);
        this._fillGrid('grid-en', profileId, 'en', unlockedEn);
    },

    _fillGrid(containerId, profileId, lang, unlocked) {
        const grid = document.getElementById(containerId);
        grid.innerHTML = '';
        for (let i = 1; i <= 25; i++) {
            const isUnlocked = unlocked.includes(i);
            const div = document.createElement('div');
            div.className = `lvl-toggle ${isUnlocked ? 'unlocked' : 'locked'}`;
            div.innerHTML = `<div class="lvl-num">${i}</div><div class="lvl-icon">${isUnlocked ? '🔓' : '🔒'}</div>`;
            if (i === 1) {
                div.title = 'Niveau 1 toujours débloqué';
                div.style.opacity = '0.7';
                div.style.cursor = 'default';
            } else {
                div.onclick = () => this.toggleLevel(profileId, lang, i);
            }
            grid.appendChild(div);
        }
    },

    toggleLevel(profileId, lang, levelId) {
        const profile = ProfileManager.getAll().find(p => p.id === profileId);
        if (!profile) return;
        const key = lang === 'en' ? 'unlockedLevelsEn' : 'unlockedLevelsFr';
        let levels = [...(profile[key] || [1])];

        if (levels.includes(levelId)) {
            levels = levels.filter(l => l !== levelId);
        } else {
            levels.push(levelId);
            levels.sort((a, b) => a - b);
        }

        ProfileManager.setUnlockedLevelsByLang(profileId, lang, levels);
        this.renderLevelManager();
    },

    unlockAll(profileId, lang) {
        const levels = Array.from({length: 25}, (_, i) => i + 1);
        ProfileManager.setUnlockedLevelsByLang(profileId, lang, levels);
        this.renderLevelManager();
    },

    lockAll(profileId, lang) {
        ProfileManager.setUnlockedLevelsByLang(profileId, lang, [1]);
        this.renderLevelManager();
    },

    populateProfileSelect() {
        const select = document.getElementById('parent-profile-select');
        const profiles = ProfileManager.getAll();
        select.innerHTML = '<option value="">-- Choisir un profil --</option>' +
            profiles.map(p => `<option value="${p.id}">${p.avatar} ${p.name}</option>`).join('');
        // Remettre à zéro le gestionnaire
        const container = document.getElementById('level-manager');
        container.innerHTML = '<p style="color:#666;padding:10px 0">Sélectionne un profil</p>';
    }
};

/* ===== PIN ===== */
let currentPin = '';

function enterPin(num) {
    if (currentPin.length < 4) {
        currentPin += num;
        updatePinDisplay();
        if (currentPin.length === 4) {
            setTimeout(checkPin, 200);
        }
    }
}

function clearPin() {
    currentPin = '';
    updatePinDisplay();
}

function updatePinDisplay() {
    const display = document.getElementById('pin-display');
    display.textContent = '●'.repeat(currentPin.length) + '•'.repeat(4 - currentPin.length);
}

function checkPin() {
    if (ParentPortal.checkPin(currentPin)) {
        document.getElementById('parent-login').classList.add('hidden');
        document.getElementById('parent-dashboard').classList.remove('hidden');
        ParentPortal.renderProgress();
        ParentPortal.populateProfileSelect();
    } else {
        const display = document.getElementById('pin-display');
        display.style.color = 'var(--danger)';
        setTimeout(() => {
            display.style.color = '';
            clearPin();
        }, 800);
    }
}

/* ===== TABS ===== */
function showParentTab(tabName, btn) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(`tab-${tabName}`).classList.add('active');
    if (tabName === 'levels') ParentPortal.populateProfileSelect();
    if (tabName === 'progress') ParentPortal.renderProgress();
}

/* Fonction globale appelée par onchange dans le HTML */
function renderLevelManager() {
    ParentPortal.renderLevelManager();
}

/* ===== PARAMÈTRES ===== */
function changePin() {
    const input = document.getElementById('new-pin');
    const msg = document.getElementById('pin-msg');
    const newPin = input.value.trim();

    if (ParentPortal.setPin(newPin)) {
        msg.textContent = '✅ Code PIN mis à jour !';
        msg.style.color = 'var(--success)';
        input.value = '';
    } else {
        msg.textContent = '⚠️ Le PIN doit contenir exactement 4 chiffres';
        msg.style.color = 'var(--danger)';
    }
    msg.classList.remove('hidden');
    setTimeout(() => msg.classList.add('hidden'), 3000);
}

function resetAllData() {
    const confirmZone = document.getElementById('reset-confirm-zone');
    confirmZone.classList.remove('hidden');
}

function confirmReset() {
    try { localStorage.clear(); } catch(e) {}
    location.reload();
}

function cancelReset() {
    document.getElementById('reset-confirm-zone').classList.add('hidden');
}
