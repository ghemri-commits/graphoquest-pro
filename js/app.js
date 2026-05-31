function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

// Générateur d'identifiant unique d'appareil si non-géré par l'iPad.
// Protégé contre un localStorage indisponible (navigation privée stricte).
function getDeviceId() {
    try {
        let id = localStorage.getItem('gq_device_id');
        if (!id) {
            id = 'ipad_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
            localStorage.setItem('gq_device_id', id);
        }
        return id;
    } catch (e) {
        return 'ipad_temp_' + Date.now().toString(36);
    }
}

window.onload = () => {
    // Purge des anciens caches audio (mots stockés avant le correctif de voix/
    // langue). On garde uniquement le format courant gq_tts3_.
    try {
        Object.keys(localStorage).forEach(k => {
            if (k.startsWith('gq_audio_') || k.startsWith('gq_tts_')) localStorage.removeItem(k);
        });
    } catch (e) {}

    // Initialise l'API Key ElevenLabs dans le champ d'input au chargement si présent
    const key = ElevenLabsEngine.getApiKey();
    const keyField = document.getElementById('elevenlabs-key');
    if (keyField) keyField.value = key;

    // Clés IA de Léo (tuteur virtuel) : Gemini et/ou OpenAI.
    if (typeof AITutor !== 'undefined') {
        const gem = document.getElementById('gemini-key');
        if (gem) gem.value = AITutor.getGeminiKey();
        const oai = document.getElementById('openai-key');
        if (oai) oai.value = AITutor.getOpenAIKey();
        if (typeof refreshTutorKeyStatus === 'function') refreshTutorKeyStatus();
        if (typeof syncTutorToggles === 'function') syncTutorToggles();
    }

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
            avatarDiv.textContent = avatarWithAccessory(p);

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
    // Nouvelle session enfant : Léo doit resaluer et oublier la conversation
    // précédente (sinon le 2e enfant hérite du chat du 1er et n'est pas salué).
    if (typeof AITutor !== 'undefined') AITutor.resetSession();
    if (typeof TutorEngine !== 'undefined') {
        TutorEngine.greetedThisSession = false;
        TutorEngine.resetChatPanel();
    }
    showDashboard();
}

function logout() {
    ProfileManager.clearCurrent();
    if (typeof AITutor !== 'undefined') AITutor.resetSession();
    if (typeof TutorEngine !== 'undefined') {
        TutorEngine.greetedThisSession = false;
        TutorEngine.hideButton();
        TutorEngine.resetChatPanel();
    }
    showScreen('profile-screen');
    renderProfiles();
}

/* ===== PANNEAU TUTEUR (mascotte + progression motivante) ===== */

function buildTutorPanel(profile, lang, data, unlockedLevels) {
    const en = profile.lang === 'en';
    const rank = ProfileManager.getRank(profile.totalScore);
    const streak = profile.streakDays || 0;
    const badges = (profile.badges || [])
        .map(id => ProfileManager.BADGES.find(b => b.id === id))
        .filter(Boolean);

    // Prochain niveau à jouer (débloqué, non complété).
    const nextLevel = data.levels.find(l => unlockedLevels.includes(l.id) && !profile.progress[l.id]);

    const panel = document.createElement('div');
    panel.className = 'tutor-panel';
    panel.style.cssText = 'background:linear-gradient(135deg,#6366f1,#4f46e5);border-radius:24px;padding:20px;margin-bottom:24px;color:#fff;box-shadow:0 12px 30px rgba(79,70,229,0.25);';

    // Ligne mascotte + message
    const head = document.createElement('div');
    head.style.cssText = 'display:flex;align-items:center;gap:14px;';
    const face = document.createElement('div');
    face.textContent = '🦊';
    face.style.cssText = 'font-size:46px;line-height:1;filter:drop-shadow(0 4px 6px rgba(0,0,0,0.2));';
    const msg = document.createElement('div');
    const completedCount = Object.keys(profile.progress || {}).length;
    const hello = en ? `Hi ${profile.name}!` : `Salut ${profile.name} !`;
    const sub = nextLevel
        ? (en ? "Let's continue your quest!" : 'On continue ta quête !')
        : (en ? 'You finished everything — amazing!' : 'Tu as tout terminé — bravo !');
    msg.innerHTML = `<div style="font-size:20px;font-weight:800">${hello}</div><div style="font-size:14px;opacity:0.9">${sub}</div>`;
    head.appendChild(face);
    head.appendChild(msg);
    panel.appendChild(head);

    // Rang de héros + barre de progression
    const rankRow = document.createElement('div');
    rankRow.style.cssText = 'margin-top:16px;';
    const rankLabel = document.createElement('div');
    rankLabel.style.cssText = 'display:flex;justify-content:space-between;font-size:14px;font-weight:700;margin-bottom:6px;';
    const rankName = en ? rank.nameEn : rank.name;
    let nextTxt = '';
    let pct = 100;
    if (!rank.isMax && rank.nextMin) {
        pct = Math.max(0, Math.min(100, Math.round(((profile.totalScore - rank.min) / (rank.nextMin - rank.min)) * 100)));
        const remaining = rank.nextMin - profile.totalScore;
        nextTxt = en ? `${remaining} pts to next` : `${remaining} pts au suivant`;
    } else {
        nextTxt = en ? 'Max rank!' : 'Rang max !';
    }
    rankLabel.innerHTML = `<span>${rank.emoji} ${rankName}</span><span style="opacity:0.85">${nextTxt}</span>`;
    rankRow.appendChild(rankLabel);
    const barBg = document.createElement('div');
    barBg.style.cssText = 'height:12px;background:rgba(255,255,255,0.25);border-radius:8px;overflow:hidden;';
    const barFill = document.createElement('div');
    barFill.style.cssText = `height:100%;width:${pct}%;background:#fcd34d;border-radius:8px;transition:width 0.6s;`;
    barBg.appendChild(barFill);
    rankRow.appendChild(barBg);
    panel.appendChild(rankRow);

    // Stats : série de jours + niveaux réussis
    const stats = document.createElement('div');
    stats.style.cssText = 'display:flex;gap:10px;margin-top:14px;flex-wrap:wrap;';
    const chip = (txt) => {
        const c = document.createElement('span');
        c.style.cssText = 'background:rgba(255,255,255,0.2);border-radius:12px;padding:6px 12px;font-size:14px;font-weight:700;';
        c.textContent = txt;
        return c;
    };
    stats.appendChild(chip(`🔥 ${streak} ${en ? (streak > 1 ? 'days' : 'day') : (streak > 1 ? 'jours' : 'jour')}`));
    stats.appendChild(chip(`⭐ ${profile.totalScore}`));
    stats.appendChild(chip(`🪙 ${profile.coins || 0}`));
    stats.appendChild(chip(`🎯 ${completedCount}`));
    panel.appendChild(stats);

    // Badges gagnés
    if (badges.length) {
        const badgeRow = document.createElement('div');
        badgeRow.style.cssText = 'display:flex;gap:8px;margin-top:14px;flex-wrap:wrap;';
        badges.forEach(b => {
            const bd = document.createElement('span');
            bd.title = en ? b.nameEn : b.nameFr;
            bd.textContent = b.emoji;
            bd.style.cssText = 'font-size:24px;background:rgba(255,255,255,0.18);border-radius:12px;width:42px;height:42px;display:inline-flex;align-items:center;justify-content:center;';
            badgeRow.appendChild(bd);
        });
        panel.appendChild(badgeRow);
    }

    // Bouton « Continuer / Rejouer »
    const cta = document.createElement('button');
    cta.style.cssText = 'margin-top:18px;width:100%;background:#fff;color:#4f46e5;border:none;border-radius:16px;padding:14px;font-size:18px;font-weight:800;cursor:pointer;box-shadow:0 6px 16px rgba(0,0,0,0.15);';
    if (nextLevel) {
        cta.textContent = en ? `▶ Continue (Level ${nextLevel.id})` : `▶ Continuer (Niveau ${nextLevel.id})`;
        cta.onclick = () => launchLevel(nextLevel.id);
    } else {
        const firstLevel = data.levels[0];
        cta.textContent = en ? '🔁 Play again' : '🔁 Rejouer';
        cta.onclick = () => firstLevel && launchLevel(firstLevel.id);
    }
    panel.appendChild(cta);

    // Rangée d'actions : Défi du jour + Boutique
    const actions = document.createElement('div');
    actions.style.cssText = 'display:flex;gap:10px;margin-top:12px;';
    const today = ProfileManager._todayStr();
    const challengeDone = profile.lastChallenge === today;

    const challengeBtn = document.createElement('button');
    challengeBtn.style.cssText = `flex:1;border:none;border-radius:14px;padding:12px;font-size:15px;font-weight:800;cursor:pointer;${challengeDone ? 'background:rgba(255,255,255,0.25);color:#fff' : 'background:#fcd34d;color:#7c2d12'}`;
    challengeBtn.textContent = challengeDone
        ? (en ? '✅ Daily done' : '✅ Défi réussi')
        : (en ? '🎲 Daily challenge' : '🎲 Défi du jour');
    if (!challengeDone) challengeBtn.onclick = () => launchDailyChallenge();
    actions.appendChild(challengeBtn);

    const shopBtn = document.createElement('button');
    shopBtn.style.cssText = 'flex:1;border:none;border-radius:14px;padding:12px;font-size:15px;font-weight:800;cursor:pointer;background:rgba(255,255,255,0.95);color:#4f46e5;';
    shopBtn.textContent = en ? '🛍️ Shop' : '🛍️ Boutique';
    shopBtn.onclick = () => openShop();
    actions.appendChild(shopBtn);

    panel.appendChild(actions);

    return panel;
}

/* ===== ACCESSOIRE ÉQUIPÉ SUR L'AVATAR ===== */
function avatarWithAccessory(profile) {
    const acc = profile.equipped ? ProfileManager.getAccessory(profile.equipped) : null;
    return profile.avatar + (acc ? acc.emoji : '');
}

/* ===== DÉFI DU JOUR ===== */
function launchDailyChallenge() {
    const profile = ProfileManager.getCurrent();
    if (!profile) return;
    if (typeof buildDailyChallenge !== 'function') return;
    const level = buildDailyChallenge(profile, ProfileManager._todayStr());
    if (!level || !level.items.length) return;
    GameEngine.init(profile, null, level.miniGame, level);
    showScreen('game-screen');
}

/* ===== BOUTIQUE ===== */
function openShop() {
    renderShop();
    showScreen('shop-screen');
}

function renderShop() {
    const profile = ProfileManager.getCurrent();
    if (!profile) return;
    const en = profile.lang === 'en';

    const bal = document.getElementById('shop-balance');
    if (bal) bal.textContent = `🪙 ${profile.coins || 0} ${en ? 'coins' : 'pièces'}`;

    const grid = document.getElementById('shop-grid');
    grid.innerHTML = '';
    const owned = profile.owned || [];

    ProfileManager.ACCESSORIES.forEach(acc => {
        const isOwned = owned.includes(acc.id);
        const isEquipped = profile.equipped === acc.id;

        const card = document.createElement('div');
        card.style.cssText = `background:#fff;border:2px solid ${isEquipped ? '#10b981' : '#e2e8f0'};border-radius:18px;padding:14px;text-align:center;box-shadow:0 4px 12px rgba(0,0,0,0.05);`;

        const emoji = document.createElement('div');
        emoji.textContent = acc.emoji;
        emoji.style.cssText = 'font-size:42px;line-height:1;margin-bottom:8px;';
        card.appendChild(emoji);

        const name = document.createElement('div');
        name.textContent = en ? acc.nameEn : acc.nameFr;
        name.style.cssText = 'font-size:14px;font-weight:700;color:#1e293b;margin-bottom:8px;';
        card.appendChild(name);

        const btn = document.createElement('button');
        btn.style.cssText = 'width:100%;border:none;border-radius:12px;padding:10px;font-size:14px;font-weight:800;cursor:pointer;';
        if (!isOwned) {
            const affordable = (profile.coins || 0) >= acc.cost;
            btn.textContent = `🪙 ${acc.cost}`;
            btn.style.background = affordable ? '#6366f1' : '#cbd5e1';
            btn.style.color = '#fff';
            btn.onclick = () => doBuy(acc.id);
        } else if (isEquipped) {
            btn.textContent = en ? 'Remove' : 'Retirer';
            btn.style.background = '#fee2e2';
            btn.style.color = '#b91c1c';
            btn.onclick = () => { ProfileManager.equipAccessory(profile.id, null); renderShop(); };
        } else {
            btn.textContent = en ? 'Wear' : 'Équiper';
            btn.style.background = '#10b981';
            btn.style.color = '#fff';
            btn.onclick = () => { ProfileManager.equipAccessory(profile.id, acc.id); renderShop(); };
        }
        card.appendChild(btn);
        grid.appendChild(card);
    });
}

function doBuy(accId) {
    const profile = ProfileManager.getCurrent();
    if (!profile) return;
    const res = ProfileManager.buyAccessory(profile.id, accId);
    if (!res.ok && res.reason === 'coins') {
        const bal = document.getElementById('shop-balance');
        if (bal) {
            const en = profile.lang === 'en';
            bal.textContent = en ? 'Not enough coins 🪙' : 'Pas assez de pièces 🪙';
            bal.style.color = '#ef4444';
            setTimeout(() => { bal.style.color = '#d97706'; renderShop(); }, 1500);
        }
        return;
    }
    if (typeof AudioEngine !== 'undefined') AudioEngine.vibrate('correct');
    renderShop();
}

/* ===== TABLEAU DE BORD (CARTE PAR CYCLES DU PRIMAIRE) ===== */

function showDashboard() {
    const profile = ProfileManager.getCurrent();
    if (!profile) return;

    document.getElementById('dash-avatar').textContent = avatarWithAccessory(profile);
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

    // Panneau "tuteur" en haut du tableau de bord : mascotte, rang de héros,
    // série de jours, badges et bouton « Continuer » (réduit la friction).
    map.appendChild(buildTutorPanel(profile, lang, data, unlockedLevels));

    // La mascotte accueille l'enfant par son prénom (une fois par session).
    if (typeof TutorEngine !== 'undefined') TutorEngine.greet(profile);

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
            const isUnlocked = unlockedLevels.includes(levelId) || level.alwaysUnlocked;
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
            const badgeMap = {
                accord: 'Gram', dictation: 'Dict', pronounce: 'Oral',
                morpho: 'Morph', comprehension: 'Lect', coquille: 'Faute', vocab: 'Voc'
            };
            gameBadge.textContent = badgeMap[level.miniGame] || 'Phon';

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
        l.miniGame === gameType && (unlockedLevels.includes(l.id) || l.alwaysUnlocked)
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
    if (typeof TutorEngine !== 'undefined') TutorEngine.hideButton();
    showDashboard();
}

/* ===== PORTAIL PARENT ===== */

function showParentLogin() {
    currentPin = '';
    updatePinDisplay();
    document.getElementById('parent-login').classList.remove('hidden');
    document.getElementById('parent-dashboard').classList.add('hidden');
    // Reflète l'état du verrouillage anti-force brute à l'ouverture.
    if (typeof ParentPortal !== 'undefined' && ParentPortal.isLocked()) {
        if (typeof showPinLock === 'function') showPinLock();
    } else if (typeof setPinMessage === 'function') {
        setPinMessage('Code par défaut : 1234');
    }
    showScreen('parent-screen');
}

/* ===== SÉCURITÉ TACTILE IPAD ===== */
document.addEventListener('gesturestart', e => e.preventDefault());
document.addEventListener('touchmove', e => {
    if (e.target.closest('#parent-screen') || e.target.closest('#dashboard-screen') || e.target.closest('#game-screen') || e.target.closest('#shop-screen')) return;
    e.preventDefault();
}, { passive: false });
