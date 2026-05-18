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
            unlockedLevelsEn: [1]
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
        if (!profile) return;

        if (!profile.progress[levelId]) {
            profile.progress[levelId] = { bestScore: 0, stars: 0, attempts: 0 };
        }
        const prog = profile.progress[levelId];
        prog.attempts++;
        if (score > prog.bestScore) prog.bestScore = score;
        if (stars > prog.stars) prog.stars = stars;
        profile.totalScore += score;

        const nextLevel = levelId + 1;
        if (nextLevel <= 25) {
            const key = lang === 'en' ? 'unlockedLevelsEn' : 'unlockedLevelsFr';
            if (!profile[key]) profile[key] = [1];
            if (!profile[key].includes(nextLevel)) {
                profile[key].push(nextLevel);
                profile[key].sort((a, b) => a - b);
            }
        }

        this.update(profileId, profile);
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
