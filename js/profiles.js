const ProfileManager = {
    MAX_PROFILES: 3,
    STORAGE_KEY: 'gq_profiles',
    CURRENT_KEY: 'gq_current',

    /* ===== LECTURE LOCALE ===== */
    getAll() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            if (!data) return [];
            const profiles = JSON.parse(data);
            let needsSave = false;
            profiles.forEach(p => {
                if (!p.unlockedLevelsFr) { p.unlockedLevelsFr = [...(p.unlockedLevels || [1])]; needsSave = true; }
                if (!p.unlockedLevelsEn) { p.unlockedLevelsEn = [...(p.unlockedLevels || [1])]; needsSave = true; }
                if (!p.deviceId) { p.deviceId = getDeviceId(); needsSave = true; }
                // Champs de gamification (tuteur virtuel)
                if (!Array.isArray(p.badges)) { p.badges = []; needsSave = true; }
                if (typeof p.streakDays !== 'number') { p.streakDays = 0; needsSave = true; }
                if (!('lastPlayed' in p)) { p.lastPlayed = null; needsSave = true; }
                if (typeof p.coins !== 'number') { p.coins = 0; needsSave = true; }
                if (!Array.isArray(p.owned)) { p.owned = []; needsSave = true; }
                if (!('equipped' in p)) { p.equipped = null; needsSave = true; }
                if (!('lastChallenge' in p)) { p.lastChallenge = null; needsSave = true; }
            });
            if (needsSave) this._saveLocal(profiles);
            return profiles;
        } catch(e) { return []; }
    },

    _saveLocal(profiles) {
        try { localStorage.setItem(this.STORAGE_KEY, JSON.stringify(profiles)); } catch(e) {}
    },

    /* ===== SYNC CLOUD ===== */
    _pushToCloud(profile) {
        try {
            db.collection('profiles').doc(String(profile.id)).set(profile);
        } catch(e) {}
    },

    _deleteFromCloud(id) {
        try {
            db.collection('profiles').doc(String(id)).delete();
        } catch(e) {}
    },

    // Appelé au démarrage : importe depuis Firestore les profils de cet appareil
    syncFromCloud(onDone) {
        const deviceId = getDeviceId();
        try {
            db.collection('profiles')
              .where('deviceId', '==', deviceId)
              .get()
              .then(snapshot => {
                  if (snapshot.empty) { if (onDone) onDone(); return; }
                  const cloudProfiles = snapshot.docs.map(d => d.data());
                  const local = this.getAll();
                  // Fusionner : cloud prioritaire sur local si même id
                  const merged = [...local];
                  cloudProfiles.forEach(cp => {
                      const idx = merged.findIndex(p => p.id === cp.id);
                      if (idx >= 0) merged[idx] = cp;
                      else merged.push(cp);
                  });
                  // Garder max 3
                  const trimmed = merged.slice(0, this.MAX_PROFILES);
                  this._saveLocal(trimmed);
                  if (onDone) onDone();
              })
              .catch(() => { if (onDone) onDone(); });
        } catch(e) { if (onDone) onDone(); }
    },

    /* ===== CRUD ===== */
    create(profile) {
        const profiles = this.getAll();
        if (profiles.length >= this.MAX_PROFILES) return false;

        const newProfile = {
            id: Date.now(),
            deviceId: getDeviceId(),
            name: profile.name,
            age: parseInt(profile.age),
            lang: profile.lang,
            avatar: profile.avatar,
            created: new Date().toISOString(),
            progress: {},
            totalScore: 0,
            unlockedLevelsFr: [1],
            unlockedLevelsEn: [1],
            badges: [],
            streakDays: 0,
            lastPlayed: null,
            coins: 0,
            owned: [],
            equipped: null,
            lastChallenge: null
        };

        profiles.push(newProfile);
        this._saveLocal(profiles);
        this._pushToCloud(newProfile);
        return newProfile;
    },

    update(id, updates) {
        const profiles = this.getAll();
        const idx = profiles.findIndex(p => p.id === id);
        if (idx === -1) return null;
        profiles[idx] = { ...profiles[idx], ...updates };
        this._saveLocal(profiles);
        this._pushToCloud(profiles[idx]);
        return profiles[idx];
    },

    delete(id) {
        let profiles = this.getAll();
        profiles = profiles.filter(p => p.id !== id);
        this._saveLocal(profiles);
        this._deleteFromCloud(id);
    },

    getCurrent() {
        try {
            const id = localStorage.getItem(this.CURRENT_KEY);
            if (!id) return null;
            return this.getAll().find(p => p.id == id) || null;
        } catch(e) { return null; }
    },

    setCurrent(id) {
        try { localStorage.setItem(this.CURRENT_KEY, id); } catch(e) {}
    },

    clearCurrent() {
        try { localStorage.removeItem(this.CURRENT_KEY); } catch(e) {}
    },

    recordLevelComplete(profileId, levelId, score, stars, lang) {
        const profiles = this.getAll();
        const profile = profiles.find(p => p.id === profileId);
        if (!profile) return null;

        const prevRank = this.getRank(profile.totalScore);

        if (!profile.progress[levelId]) {
            profile.progress[levelId] = { bestScore: 0, stars: 0, attempts: 0 };
        }
        const prog = profile.progress[levelId];
        prog.attempts++;
        if (score > prog.bestScore) prog.bestScore = score;
        if (stars > prog.stars) prog.stars = stars;
        profile.totalScore += score;

        // Pièces dépensables (boutique) — distinctes du score qui sert aux rangs.
        const coinsEarned = score;
        profile.coins = (profile.coins || 0) + coinsEarned;

        // --- Série de jours consécutifs (motivation à revenir chaque jour) ---
        this._bumpStreak(profile);

        // --- Déblocage du niveau suivant ---
        const nextLevel = levelId + 1;
        const levelExists = getGameData(lang === 'en' ? 'en' : 'fr').levels.some(l => l.id === nextLevel);
        if (levelExists) {
            const key = lang === 'en' ? 'unlockedLevelsEn' : 'unlockedLevelsFr';
            if (!profile[key]) profile[key] = [1];
            if (!profile[key].includes(nextLevel)) {
                profile[key].push(nextLevel);
                profile[key].sort((a, b) => a - b);
            }
        }

        // --- Badges nouvellement gagnés ---
        if (!Array.isArray(profile.badges)) profile.badges = [];
        const qualified = this._qualifiedBadges(profile, stars);
        const newBadgeIds = qualified.filter(id => !profile.badges.includes(id));
        profile.badges.push(...newBadgeIds);

        const newRank = this.getRank(profile.totalScore);

        this.update(profileId, profile);

        return {
            streakDays: profile.streakDays,
            coinsEarned: coinsEarned,
            rank: newRank,
            rankUp: newRank.index > prevRank.index,
            newBadges: newBadgeIds.map(id => this.BADGES.find(b => b.id === id)).filter(Boolean)
        };
    },

    // Série de jours : +1 si on a joué hier, sinon repart à 1.
    _bumpStreak(profile) {
        const today = this._todayStr();
        if (profile.lastPlayed !== today) {
            const yesterday = this._shiftDay(today, -1);
            profile.streakDays = (profile.lastPlayed === yesterday) ? (profile.streakDays || 0) + 1 : 1;
            profile.lastPlayed = today;
        }
        if (!profile.streakDays) profile.streakDays = 1;
    },

    // Défi du jour : récompense bonifiée, ne s'enregistre pas comme un niveau.
    recordChallenge(profileId, score, stars, lang) {
        const profiles = this.getAll();
        const profile = profiles.find(p => p.id === profileId);
        if (!profile) return null;

        const prevRank = this.getRank(profile.totalScore);
        const challengeBonus = 50 + stars * 25;
        const coinsEarned = score + challengeBonus;

        profile.totalScore += score;
        profile.coins = (profile.coins || 0) + coinsEarned;
        this._bumpStreak(profile);
        profile.lastChallenge = this._todayStr();

        if (!Array.isArray(profile.badges)) profile.badges = [];
        const qualified = this._qualifiedBadges(profile, stars);
        const newBadgeIds = qualified.filter(id => !profile.badges.includes(id));
        profile.badges.push(...newBadgeIds);

        const newRank = this.getRank(profile.totalScore);
        this.update(profileId, profile);

        return {
            streakDays: profile.streakDays,
            coinsEarned: coinsEarned,
            challengeBonus: challengeBonus,
            rank: newRank,
            rankUp: newRank.index > prevRank.index,
            newBadges: newBadgeIds.map(id => this.BADGES.find(b => b.id === id)).filter(Boolean)
        };
    },

    /* ===== GAMIFICATION : RANGS, BADGES, SÉRIE ===== */
    RANKS: [
        { name: 'Explorateur', nameEn: 'Explorer', emoji: '🌱', min: 0 },
        { name: 'Aventurier', nameEn: 'Adventurer', emoji: '🧭', min: 200 },
        { name: 'Champion', nameEn: 'Champion', emoji: '⭐', min: 500 },
        { name: 'Expert', nameEn: 'Expert', emoji: '🚀', min: 1000 },
        { name: 'Maître', nameEn: 'Master', emoji: '👑', min: 2000 },
        { name: 'Légende', nameEn: 'Legend', emoji: '🏆', min: 4000 }
    ],

    getRank(score) {
        score = score || 0;
        let idx = 0;
        for (let i = 0; i < this.RANKS.length; i++) {
            if (score >= this.RANKS[i].min) idx = i;
        }
        const rank = this.RANKS[idx];
        const next = this.RANKS[idx + 1] || null;
        return {
            index: idx,
            name: rank.name,
            nameEn: rank.nameEn,
            emoji: rank.emoji,
            min: rank.min,
            nextMin: next ? next.min : null,
            isMax: !next
        };
    },

    BADGES: [
        { id: 'first_level', emoji: '🎫', nameFr: 'Premier pas', nameEn: 'First step' },
        { id: 'five_levels', emoji: '🖐️', nameFr: '5 niveaux', nameEn: '5 levels' },
        { id: 'ten_levels', emoji: '🔟', nameFr: '10 niveaux', nameEn: '10 levels' },
        { id: 'perfect', emoji: '💯', nameFr: 'Sans-faute', nameEn: 'Flawless' },
        { id: 'streak3', emoji: '🔥', nameFr: '3 jours de suite', nameEn: '3-day streak' },
        { id: 'streak7', emoji: '📅', nameFr: 'Une semaine !', nameEn: 'One week!' },
        { id: 'score1000', emoji: '💰', nameFr: '1000 points', nameEn: '1000 points' }
    ],

    _qualifiedBadges(profile, starsThisRound) {
        const completed = Object.keys(profile.progress || {}).length;
        const has3 = (starsThisRound >= 3) || Object.values(profile.progress || {}).some(p => p.stars >= 3);
        const checks = {
            first_level: completed >= 1,
            five_levels: completed >= 5,
            ten_levels: completed >= 10,
            perfect: has3,
            streak3: (profile.streakDays || 0) >= 3,
            streak7: (profile.streakDays || 0) >= 7,
            score1000: (profile.totalScore || 0) >= 1000
        };
        return Object.keys(checks).filter(id => checks[id]);
    },

    /* ===== BOUTIQUE D'ACCESSOIRES (récompenses visuelles) ===== */
    ACCESSORIES: [
        { id: 'hat', emoji: '🎩', nameFr: 'Chapeau', nameEn: 'Top hat', cost: 100 },
        { id: 'glasses', emoji: '🕶️', nameFr: 'Lunettes', nameEn: 'Sunglasses', cost: 150 },
        { id: 'crown', emoji: '👑', nameFr: 'Couronne', nameEn: 'Crown', cost: 400 },
        { id: 'cape', emoji: '🦸', nameFr: 'Cape de héros', nameEn: 'Hero cape', cost: 300 },
        { id: 'star', emoji: '🌟', nameFr: 'Étoile magique', nameEn: 'Magic star', cost: 200 },
        { id: 'rainbow', emoji: '🌈', nameFr: 'Arc-en-ciel', nameEn: 'Rainbow', cost: 250 },
        { id: 'rocket', emoji: '🚀', nameFr: 'Fusée', nameEn: 'Rocket', cost: 500 },
        { id: 'medal', emoji: '🏅', nameFr: 'Médaille', nameEn: 'Medal', cost: 350 }
    ],

    getAccessory(id) {
        return this.ACCESSORIES.find(a => a.id === id) || null;
    },

    buyAccessory(profileId, accId) {
        const profile = this.getAll().find(p => p.id === profileId);
        const acc = this.getAccessory(accId);
        if (!profile || !acc) return { ok: false };
        if (!Array.isArray(profile.owned)) profile.owned = [];
        if (profile.owned.includes(accId)) return { ok: true, already: true };
        if ((profile.coins || 0) < acc.cost) return { ok: false, reason: 'coins' };
        profile.coins -= acc.cost;
        profile.owned.push(accId);
        profile.equipped = accId; // équipe automatiquement le nouvel achat
        this.update(profileId, profile);
        return { ok: true };
    },

    equipAccessory(profileId, accId) {
        const profile = this.getAll().find(p => p.id === profileId);
        if (!profile) return;
        if (accId && (!profile.owned || !profile.owned.includes(accId))) return;
        profile.equipped = accId || null;
        this.update(profileId, profile);
    },

    _todayStr() {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    },

    _shiftDay(dateStr, deltaDays) {
        const [y, m, d] = dateStr.split('-').map(Number);
        const dt = new Date(y, m - 1, d);
        dt.setDate(dt.getDate() + deltaDays);
        return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
    },

    resetProgress(profileId) {
        const profile = this.getAll().find(p => p.id === profileId);
        if (!profile) return;
        profile.progress = {};
        profile.totalScore = 0;
        profile.unlockedLevelsFr = [1];
        profile.unlockedLevelsEn = [1];
        this.update(profileId, profile);
    },

    setUnlockedLevelsByLang(profileId, lang, levels) {
        const key = lang === 'en' ? 'unlockedLevelsEn' : 'unlockedLevelsFr';
        this.update(profileId, { [key]: levels });
    }
};

const AVATARS = ['🦊','🦁','🐼','🐨','🐯','🐷','🐸','🐙','🦄','🐲','👦','👧','🧒','👶','🧑‍🚀','🧙','🦸','🧚'];
