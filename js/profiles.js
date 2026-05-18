const ProfileManager = {
    MAX_PROFILES: 3,
    STORAGE_KEY: 'gq_profiles',
    CURRENT_KEY: 'gq_current',

    getAll() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            if (!data) return [];
            const profiles = JSON.parse(data);
            // Migration : ajouter unlockedLevelsFr/En si absents (anciens profils)
            let needsSave = false;
            profiles.forEach(p => {
                if (!p.unlockedLevelsFr) {
                    p.unlockedLevelsFr = [...(p.unlockedLevels || [1])];
                    needsSave = true;
                }
                if (!p.unlockedLevelsEn) {
                    p.unlockedLevelsEn = [...(p.unlockedLevels || [1])];
                    needsSave = true;
                }
            });
            if (needsSave) this.save(profiles);
            return profiles;
        } catch(e) {
            return [];
        }
    },

    save(profiles) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(profiles));
        } catch(e) {}
    },

    create(profile) {
        const profiles = this.getAll();
        if (profiles.length >= this.MAX_PROFILES) return false;

        const newProfile = {
            id: Date.now(),
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
        this.save(profiles);
        return newProfile;
    },

    update(id, updates) {
        const profiles = this.getAll();
        const idx = profiles.findIndex(p => p.id === id);
        if (idx === -1) return null;
        profiles[idx] = { ...profiles[idx], ...updates };
        this.save(profiles);
        return profiles[idx];
    },

    delete(id) {
        let profiles = this.getAll();
        profiles = profiles.filter(p => p.id !== id);
        this.save(profiles);
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

        // Débloquer le niveau suivant dans la bonne langue
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
