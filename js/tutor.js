// ============================================================
// TutorEngine — La mascotte "Léo le renard"
// Donne à l'app une présence de tuteur virtuel : encouragements
// parlés VARIÉS (anti-lassitude), bulles de dialogue, accueil
// personnalisé. S'appuie sur AudioEngine (voix ElevenLabs ou TTS).
// ============================================================
const TutorEngine = {
    mascot: '🦊',
    greetedThisSession: false,
    _hideTimer: null,

    // Phrases tournantes pour ne jamais répéter le même mot deux fois de suite.
    PRAISE: {
        fr: ['Bravo !', 'Super !', 'Excellent !', 'Magnifique !', 'Wow, génial !',
             'Tu es doué !', 'Continue comme ça !', 'Fantastique !', 'Quel champion !', 'Trop fort !'],
        en: ['Great!', 'Awesome!', 'Excellent!', 'Wonderful!', 'Wow, amazing!',
             'You rock!', 'Keep it up!', 'Fantastic!', 'Champion!', 'So good!']
    },
    ENCOURAGE: {
        fr: ["Ce n'est pas grave, essaie encore !", 'Tu y es presque !', 'Respire et recommence !',
             "Chaque erreur t'aide à apprendre !", 'Allez, tu peux le faire !'],
        en: ['No worries, try again!', 'You are almost there!', 'Take a breath and retry!',
             'Mistakes help you learn!', 'Come on, you can do it!']
    },

    _lastPraise: null,
    _pick(arr) {
        let v = arr[Math.floor(Math.random() * arr.length)];
        // Évite de répéter exactement la dernière phrase.
        if (v === this._lastPraise && arr.length > 1) {
            v = arr[(arr.indexOf(v) + 1) % arr.length];
        }
        this._lastPraise = v;
        return v;
    },

    _ensureBubble() {
        let b = document.getElementById('tutor-bubble');
        if (!b) {
            b = document.createElement('div');
            b.id = 'tutor-bubble';
            b.className = 'tutor-bubble';
            const face = document.createElement('span');
            face.className = 'tutor-face';
            const text = document.createElement('span');
            text.className = 'tutor-text';
            b.appendChild(face);
            b.appendChild(text);
            document.body.appendChild(b);
        }
        return b;
    },

    show(text) {
        const b = this._ensureBubble();
        b.querySelector('.tutor-face').textContent = this.mascot;
        b.querySelector('.tutor-text').textContent = text;
        b.classList.add('show');
        clearTimeout(this._hideTimer);
        this._hideTimer = setTimeout(() => b.classList.remove('show'), 3500);
    },

    _voice(text, lang) {
        if (typeof AudioEngine !== 'undefined' && !AudioEngine.isMuted) {
            AudioEngine.play(text, false, lang === 'en' ? 'en' : 'fr');
        }
    },

    say(text, lang) {
        this.show(text);
        this._voice(text, lang);
    },

    cheer(lang) {
        const l = lang === 'en' ? 'en' : 'fr';
        const phrase = this._pick(this.PRAISE[l]);
        this.say(phrase, l);
    },

    encourage(lang) {
        const l = lang === 'en' ? 'en' : 'fr';
        const phrase = this._pick(this.ENCOURAGE[l]);
        this.say(phrase, l);
    },

    greet(profile) {
        if (this.greetedThisSession || !profile) return;
        this.greetedThisSession = true;
        const en = profile.lang === 'en';
        const name = profile.name || '';
        const msg = en
            ? `Hi ${name}! Ready to learn and have fun?`
            : `Salut ${name} ! Prêt à apprendre en t'amusant ?`;
        setTimeout(() => this.say(msg, en ? 'en' : 'fr'), 700);
    }
};
