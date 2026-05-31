/* Utilitaire d'échappement HTML pour les données saisies par l'utilisateur */
function safeHtml(str) {
    const div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
}

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

    /* ===== HELPERS NIVEAUX (dynamiques selon les données réelles) ===== */
    _levelIdsForLang(lang) {
        const l = lang === 'en' ? 'en' : 'fr';
        return getGameData(l).levels.map(level => level.id);
    },

    _totalForLang(lang) {
        return this._levelIdsForLang(lang === 'both' ? 'fr' : lang).length;
    },

    /* ===== PROGRESSION — tous appareils via Firestore ===== */
    renderProgress() {
        const container = document.getElementById('parent-progress-list');
        container.innerHTML = '<p style="text-align:center;color:#666;padding:20px">⏳ Chargement...</p>';

        try {
            db.collection('profiles').onSnapshot(snapshot => {
                if (snapshot.empty) {
                    container.innerHTML = '<p style="text-align:center;color:#666;padding:20px">Aucun profil enregistré</p>';
                    return;
                }
                const profiles = snapshot.docs.map(d => d.data());
                profiles.sort((a, b) => a.name.localeCompare(b.name));
                container.innerHTML = '';
                profiles.forEach(p => {
                    const completed = Object.keys(p.progress || {}).length;
                    const totalLevels = this._totalForLang(p.lang);
                    const percent = Math.round((completed / totalLevels) * 100);
                    const lastKey = Object.keys(p.progress || {}).pop();
                    const totalAttempts = Object.values(p.progress || {}).reduce((a,b) => a + (b.attempts||0), 0);
                    const totalStars = Object.values(p.progress || {}).reduce((a,b) => a + (b.stars||0), 0);

                    const item = document.createElement('div');
                    item.className = 'progress-item';

                    const header = document.createElement('div');
                    header.className = 'progress-item-header';

                    const nameSpan = document.createElement('span');
                    nameSpan.className = 'progress-item-name';
                    nameSpan.textContent = `${p.avatar} ${p.name} (${p.age} ans)`;

                    const scoreSpan = document.createElement('span');
                    scoreSpan.textContent = `⭐ ${p.totalScore || 0}`;

                    header.appendChild(nameSpan);
                    header.appendChild(scoreSpan);

                    const stats = document.createElement('div');
                    stats.className = 'progress-item-stats';
                    stats.innerHTML = `<span>🎯 ${completed}/${totalLevels} niveaux</span><span>🔥 ${totalAttempts} essais</span><span>🏆 ${totalStars} étoiles</span>`;

                    const barBg = document.createElement('div');
                    barBg.className = 'progress-bar-bg';
                    const barFill = document.createElement('div');
                    barFill.className = 'progress-bar-fill';
                    barFill.style.width = `${percent}%`;
                    barBg.appendChild(barFill);

                    const lastP = document.createElement('p');
                    lastP.style.cssText = 'margin-top:8px;font-size:14px;color:#666';
                    lastP.textContent = `Dernier niveau : ${lastKey ? 'Niveau ' + lastKey : 'Aucun'}`;

                    item.appendChild(header);
                    item.appendChild(stats);
                    item.appendChild(barBg);
                    item.appendChild(lastP);
                    container.appendChild(item);
                });
            }, () => {
                // Fallback local si Firestore inaccessible
                const local = ProfileManager.getAll();
                container.innerHTML = '';
                if (!local.length) {
                    const msg = document.createElement('p');
                    msg.style.cssText = 'text-align:center;color:#666;padding:20px';
                    msg.textContent = 'Aucun profil (hors ligne)';
                    container.appendChild(msg);
                    return;
                }
                local.forEach(p => {
                    const completed = Object.keys(p.progress||{}).length;
                    const percent = Math.round((completed/this._totalForLang(p.lang))*100);
                    const item = document.createElement('div');
                    item.className = 'progress-item';
                    const header = document.createElement('div');
                    header.className = 'progress-item-header';
                    const nameSpan = document.createElement('span');
                    nameSpan.className = 'progress-item-name';
                    nameSpan.textContent = `${p.avatar} ${p.name} (${p.age} ans)`;
                    const scoreSpan = document.createElement('span');
                    scoreSpan.textContent = `⭐ ${p.totalScore||0}`;
                    header.appendChild(nameSpan);
                    header.appendChild(scoreSpan);
                    const barBg = document.createElement('div');
                    barBg.className = 'progress-bar-bg';
                    const barFill = document.createElement('div');
                    barFill.className = 'progress-bar-fill';
                    barFill.style.width = `${percent}%`;
                    barBg.appendChild(barFill);
                    item.appendChild(header);
                    item.appendChild(barBg);
                    container.appendChild(item);
                });
            });
        } catch(e) {
            container.innerHTML = '<p style="text-align:center;color:#ef4444;padding:20px">Erreur de connexion Firestore</p>';
        }
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
        const ids = this._levelIdsForLang(lang);
        ids.forEach(i => {
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
        });
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
        const levels = this._levelIdsForLang(lang);
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
        select.innerHTML = '';

        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = '-- Choisir un profil --';
        select.appendChild(placeholder);

        profiles.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = `${p.avatar} ${p.name}`; // textContent échappe le HTML
            select.appendChild(opt);
        });

        const container = document.getElementById('level-manager');
        container.innerHTML = '';
        const msg = document.createElement('p');
        msg.style.cssText = 'color:#666;padding:10px 0';
        msg.textContent = 'Sélectionne un profil';
        container.appendChild(msg);
    },

    /* ===== GESTION DES PROFILS (onglet protégé par PIN) ===== */
    renderProfileManager() {
        const container = document.getElementById('parent-profile-list');
        container.innerHTML = '';
        const profiles = ProfileManager.getAll();

        if (!profiles.length) {
            const msg = document.createElement('p');
            msg.style.cssText = 'text-align:center;color:#666;padding:20px';
            msg.textContent = 'Aucun profil créé';
            container.appendChild(msg);
            return;
        }

        profiles.forEach(p => {
            const item = document.createElement('div');
            item.className = 'parent-profile-item';

            const info = document.createElement('div');
            info.className = 'parent-profile-info';

            const nameDiv = document.createElement('div');
            nameDiv.className = 'parent-profile-name';
            nameDiv.textContent = `${p.avatar} ${p.name}`;

            const metaDiv = document.createElement('div');
            metaDiv.className = 'parent-profile-meta';
            metaDiv.textContent = `${p.age} ans · ${Object.keys(p.progress||{}).length}/${this._totalForLang(p.lang)} niveaux · ⭐ ${p.totalScore||0}`;

            info.appendChild(nameDiv);
            info.appendChild(metaDiv);

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn-danger';
            deleteBtn.style.cssText = 'font-size:16px;padding:12px 20px;white-space:nowrap;flex-shrink:0';
            deleteBtn.textContent = '🗑️ Supprimer';
            deleteBtn.onclick = () => this._confirmDeleteProfile(p.id, p.name);

            item.appendChild(info);
            item.appendChild(deleteBtn);
            container.appendChild(item);
        });
    },

    _confirmDeleteProfile(id, name) {
        const zone = document.getElementById('parent-delete-confirm-zone');
        zone.innerHTML = '';
        zone.classList.remove('hidden');

        const msg = document.createElement('p');
        msg.style.cssText = 'font-weight:700;color:#ef4444;margin-bottom:16px;font-size:17px';
        msg.textContent = `Supprimer "${name}" ? Toute la progression sera définitivement perdue.`;

        const btnRow = document.createElement('div');
        btnRow.style.cssText = 'display:flex;gap:12px;justify-content:center';

        const yesBtn = document.createElement('button');
        yesBtn.className = 'btn-danger';
        yesBtn.textContent = '🗑️ Oui, supprimer';
        yesBtn.onclick = () => {
            // Nettoyer le profil courant si c'est lui qui est supprimé
            const current = ProfileManager.getCurrent();
            if (current && current.id === id) ProfileManager.clearCurrent();
            ProfileManager.delete(id);
            zone.innerHTML = '';
            zone.classList.add('hidden');
            this.renderProfileManager();
        };

        const noBtn = document.createElement('button');
        noBtn.className = 'btn-secondary';
        noBtn.textContent = 'Annuler';
        noBtn.onclick = () => {
            zone.innerHTML = '';
            zone.classList.add('hidden');
        };

        btnRow.appendChild(yesBtn);
        btnRow.appendChild(noBtn);
        zone.appendChild(msg);
        zone.appendChild(btnRow);
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
    if (tabName === 'profiles') ParentPortal.renderProfileManager();
}

/* Fonction globale appelée par onchange dans le HTML */
function renderLevelManager() {
    ParentPortal.renderLevelManager();
}

/* ===== PARAMÈTRES — Tuteur IA « Léo » ===== */

// Aperçu de la voix de Léo (sans lancer un jeu). Utilise la voix dédiée de Léo
// via TutorEngine ; si aucune clé ElevenLabs n'est saisie, la synthèse du
// navigateur prend le relais.
function testLeoVoice(lang) {
    const el = document.getElementById('leo-voice-status');
    const en = lang === 'en';
    const sample = en
        ? 'Hi! I am Léo, your reading buddy. Let us learn together!'
        : 'Salut ! Je suis Léo, ton ami des mots. On apprend ensemble !';
    if (el) {
        if (typeof ElevenLabsEngine !== 'undefined' && ElevenLabsEngine.getApiKey()) {
            el.textContent = '🔊 Voix ElevenLabs de Léo…';
            el.style.color = '#10b981';
        } else {
            el.textContent = '🔊 Voix du navigateur (pas de clé ElevenLabs)';
            el.style.color = '#94a3b8';
        }
    }
    if (typeof TutorEngine !== 'undefined') {
        TutorEngine.say(sample, en ? 'en' : 'fr');
    } else if (typeof AudioEngine !== 'undefined') {
        AudioEngine.play(sample, false, en ? 'en' : 'fr', 'NW7MRm1Ibz4gwivTc7oV');
    }
}

function setGeminiKey(value) {
    if (typeof AITutor !== 'undefined') AITutor.setGeminiKey(value);
    refreshTutorKeyStatus();
}

function setOpenAIKey(value) {
    if (typeof AITutor !== 'undefined') AITutor.setOpenAIKey(value);
    refreshTutorKeyStatus();
}

function refreshTutorKeyStatus() {
    const el = document.getElementById('tutor-key-status');
    if (!el || typeof AITutor === 'undefined') return;
    if (AITutor.isEnabled()) {
        const prov = AITutor.provider() === 'gemini' ? 'Gemini' : 'OpenAI';
        el.textContent = `✅ Léo IA activé (${prov})`;
        el.style.color = '#10b981';
    } else {
        el.textContent = '○ Léo utilise ses phrases de base';
        el.style.color = '#94a3b8';
    }
}

function testTutorConnection() {
    const el = document.getElementById('tutor-key-status');
    if (!el || typeof AITutor === 'undefined') return;
    if (!AITutor.isEnabled()) {
        el.textContent = '⚠️ Ajoute d\'abord une clé API';
        el.style.color = '#f59e0b';
        return;
    }
    el.textContent = '⏳ Test en cours…';
    el.style.color = '#64748b';
    const prof = (typeof ProfileManager !== 'undefined') ? ProfileManager.getCurrent() : null;
    const lang = (prof && prof.lang === 'en') ? 'en' : 'fr';
    AITutor.testConnection(lang)
        .then(txt => {
            el.textContent = '✅ Léo répond : « ' + (txt || '...').slice(0, 80) + ' »';
            el.style.color = '#10b981';
        })
        .catch(err => {
            el.textContent = '❌ Échec : vérifie la clé (' + (err && err.message ? err.message : 'erreur') + ')';
            el.style.color = '#ef4444';
        });
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
