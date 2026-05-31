// ============================================================
// TutorEngine — La mascotte "Léo le renard"
// Donne à l'app une présence de tuteur virtuel : encouragements
// parlés VARIÉS (anti-lassitude), bulles de dialogue, accueil
// personnalisé. S'appuie sur AudioEngine (voix ElevenLabs ou TTS).
// ============================================================
const TutorEngine = {
    mascot: '🦊',
    // Voix ElevenLabs dédiée à Léo (utilisée si une clé ElevenLabs est
    // configurée ; sinon la voix de synthèse du navigateur prend le relais).
    voiceId: 'NW7MRm1Ibz4gwivTc7oV',
    greetedThisSession: false,
    _hideTimer: null,

    // Phrases personnalisées générées par l'IA en début de niveau (anti-lassitude
    // + prénom de l'enfant). Si absentes, on retombe sur PRAISE/ENCOURAGE fixes.
    _dyn: { fr: { praise: null, encourage: null }, en: { praise: null, encourage: null } },
    setDynamicPhrases(praise, encourage, lang) {
        const l = lang === 'en' ? 'en' : 'fr';
        if (Array.isArray(praise) && praise.length) this._dyn[l].praise = praise.filter(s => typeof s === 'string' && s.trim());
        if (Array.isArray(encourage) && encourage.length) this._dyn[l].encourage = encourage.filter(s => typeof s === 'string' && s.trim());
    },
    _pool(kind, l) {
        const dyn = this._dyn[l] && this._dyn[l][kind];
        if (dyn && dyn.length) return dyn;
        return kind === 'praise' ? this.PRAISE[l] : this.ENCOURAGE[l];
    },

    // Formules de politesse/accueil variées (anti-répétition) quand Léo ouvre
    // le panneau de chat ou salue en début de session.
    GREETINGS: {
        fr: [
            'Bonjour ! Touche « Aide-moi » ou pose-moi ta question 🦊',
            'Coucou ! Je suis là pour t’aider. Que veux-tu savoir ? 😊',
            'Salut, mon ami ! Besoin d’un petit coup de pouce ? 🦊',
            'Bonjour à toi ! Demande-moi tout ce que tu veux sur tes mots.',
            'Hé, content de te voir ! On apprend ensemble ? ✨',
            'Bienvenue ! Je peux te donner un indice quand tu veux 💡'
        ],
        en: [
            'Hello! Tap “Help me” or ask me your question 🦊',
            'Hi there! I’m here to help. What would you like to know? 😊',
            'Hey, my friend! Need a little hint? 🦊',
            'Good to see you! Ask me anything about your words.',
            'Welcome! I can give you a clue whenever you like 💡',
            'Hi! Let’s learn together, shall we? ✨'
        ]
    },

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
            AudioEngine.play(text, false, lang === 'en' ? 'en' : 'fr', this.voiceId);
        }
    },

    say(text, lang) {
        this.show(text);
        this._voice(text, lang);
    },

    cheer(lang) {
        const l = lang === 'en' ? 'en' : 'fr';
        const phrase = this._pick(this._pool('praise', l));
        this.say(phrase, l);
    },

    encourage(lang) {
        const l = lang === 'en' ? 'en' : 'fr';
        const phrase = this._pick(this._pool('encourage', l));
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
    },

    // ============================================================
    // TUTEUR IA INTERACTIF — bouton flottant + panneau (Aide-moi + chat)
    // ============================================================
    _lang() {
        if (typeof GameEngine !== 'undefined' && GameEngine.currentLang) return GameEngine.currentLang === 'en' ? 'en' : 'fr';
        const p = (typeof ProfileManager !== 'undefined') ? ProfileManager.getCurrent() : null;
        return (p && p.lang === 'en') ? 'en' : 'fr';
    },

    _injectStyle() {
        if (document.getElementById('gq-tutor-ui-style')) return;
        const s = document.createElement('style');
        s.id = 'gq-tutor-ui-style';
        s.textContent = `
            .tutor-fab{position:fixed;right:18px;bottom:18px;width:64px;height:64px;border-radius:50%;
                border:none;background:#ffffff;border:3px solid #6366f1;font-size:34px;line-height:1;
                box-shadow:0 8px 24px rgba(99,102,241,.35);cursor:pointer;z-index:9998;display:none;
                align-items:center;justify-content:center;transition:transform .2s;animation:tutorBob 1.6s ease-in-out infinite;}
            .tutor-fab.show{display:flex;}
            .tutor-fab:active{transform:scale(.92);}
            @keyframes tutorBob{0%,100%{transform:translateY(0);}50%{transform:translateY(-5px);}}
            .tutor-panel{position:fixed;right:18px;bottom:92px;width:min(360px,92vw);max-height:70vh;
                background:#fff;border:2px solid #6366f1;border-radius:22px;box-shadow:0 18px 48px rgba(0,0,0,.25);
                z-index:9999;display:none;flex-direction:column;overflow:hidden;}
            .tutor-panel.show{display:flex;animation:tutorPop .25s cubic-bezier(.175,.885,.32,1.275);}
            @keyframes tutorPop{from{opacity:0;transform:translateY(20px) scale(.96);}to{opacity:1;transform:none;}}
            .tutor-panel-head{display:flex;align-items:center;justify-content:space-between;
                background:#6366f1;color:#fff;padding:12px 16px;font-weight:800;font-size:18px;}
            .tutor-panel-close{background:rgba(255,255,255,.2);border:none;color:#fff;width:30px;height:30px;
                border-radius:50%;font-size:16px;cursor:pointer;}
            .tutor-chat{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px;min-height:120px;background:#f8fafc;}
            .tutor-msg{max-width:85%;padding:10px 14px;border-radius:16px;font-size:15px;font-weight:600;line-height:1.35;white-space:pre-wrap;}
            .tutor-msg.leo{background:#eef2ff;color:#312e81;align-self:flex-start;border-bottom-left-radius:4px;}
            .tutor-msg.child{background:#6366f1;color:#fff;align-self:flex-end;border-bottom-right-radius:4px;}
            .tutor-msg.note{background:#fff7ed;color:#9a3412;align-self:center;text-align:center;font-size:14px;}
            .tutor-actions{padding:10px 14px 0;}
            .tutor-hint{width:100%;background:#fcd34d;color:#7c2d12;border:none;border-radius:14px;padding:12px;
                font-size:16px;font-weight:800;cursor:pointer;}
            .tutor-input-row{display:flex;gap:8px;padding:12px 14px;align-items:center;}
            .tutor-input{flex:1;border:2px solid #cbd5e1;border-radius:14px;padding:12px;font-size:15px;font-weight:600;}
            .tutor-send{background:#6366f1;color:#fff;border:none;border-radius:14px;width:46px;height:46px;font-size:18px;cursor:pointer;}
            .tutor-send:disabled,.tutor-mic:disabled{opacity:.5;cursor:default;}
            .tutor-mic{background:#fff;border:2px solid #6366f1;border-radius:14px;width:46px;height:46px;font-size:20px;cursor:pointer;flex:0 0 auto;}
            .tutor-mic.listening{background:#ef4444;border-color:#ef4444;animation:tutorPulse 1s ease-in-out infinite;}
            @keyframes tutorPulse{0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,.5);}50%{box-shadow:0 0 0 8px rgba(239,68,68,0);}}
        `;
        document.head.appendChild(s);
    },

    mountButton() {
        this._injectStyle();
        let fab = document.getElementById('tutor-fab');
        if (!fab) {
            fab = document.createElement('button');
            fab.id = 'tutor-fab';
            fab.className = 'tutor-fab';
            fab.textContent = this.mascot;
            fab.setAttribute('aria-label', 'Léo');
            fab.onclick = () => this.togglePanel();
            document.body.appendChild(fab);
        }
        return fab;
    },

    showButton() { this.mountButton().classList.add('show'); },
    hideButton() {
        const fab = document.getElementById('tutor-fab');
        if (fab) fab.classList.remove('show');
        this.closePanel();
    },

    togglePanel() {
        const p = document.getElementById('tutor-panel');
        if (p && p.classList.contains('show')) this.closePanel();
        else this.openPanel();
    },

    closePanel() {
        const p = document.getElementById('tutor-panel');
        if (p) p.classList.remove('show');
    },

    _buildPanel() {
        let p = document.getElementById('tutor-panel');
        if (p) return p;
        const lang = this._lang();
        const en = lang === 'en';
        p = document.createElement('div');
        p.id = 'tutor-panel';
        p.className = 'tutor-panel';
        p.innerHTML = `
            <div class="tutor-panel-head">
                <span>🦊 Léo</span>
                <button class="tutor-panel-close" aria-label="Fermer">✕</button>
            </div>
            <div id="tutor-chat" class="tutor-chat"></div>
            <div class="tutor-actions">
                <button id="tutor-hint-btn" class="tutor-hint">💡 ${en ? 'Help me' : 'Aide-moi'}</button>
            </div>
            <div class="tutor-input-row">
                <button id="tutor-mic" class="tutor-mic" aria-label="${en ? 'Speak' : 'Parler'}" title="${en ? 'Speak to Léo' : 'Parle à Léo'}">🎤</button>
                <input id="tutor-input" class="tutor-input" placeholder="${en ? 'Ask Léo…' : 'Pose ta question…'}" maxlength="200">
                <button id="tutor-send" class="tutor-send" aria-label="Envoyer">➤</button>
            </div>
        `;
        document.body.appendChild(p);
        p.querySelector('.tutor-panel-close').onclick = () => this.closePanel();
        p.querySelector('#tutor-hint-btn').onclick = () => this._askHint();
        p.querySelector('#tutor-send').onclick = () => this._sendChat();
        p.querySelector('#tutor-input').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this._sendChat();
        });
        // Saisie vocale : l'enfant peut parler au lieu d'écrire. Le bouton micro
        // n'apparaît que si le navigateur supporte la reconnaissance vocale.
        const mic = p.querySelector('#tutor-mic');
        if (this._speechSupported()) {
            mic.onclick = () => this._startVoiceInput();
        } else {
            mic.style.display = 'none';
        }
        return p;
    },

    openPanel() {
        const p = this._buildPanel();
        p.classList.add('show');
        const lang = this._lang();
        const en = lang === 'en';
        const chat = p.querySelector('#tutor-chat');
        const aiOn = (typeof AITutor !== 'undefined') && AITutor.isEnabled();

        // Premier affichage : message d'accueil ou note « non activé ».
        if (!chat.dataset.greeted) {
            chat.dataset.greeted = '1';
            if (aiOn) {
                this._appendMsg('leo', this._pick(this.GREETINGS[en ? 'en' : 'fr']));
            } else {
                this._appendMsg('note', en
                    ? '🔒 Léo’s AI brain is off. A grown-up can turn it on in the Parents area.'
                    : "🔒 Le cerveau IA de Léo est éteint. Un parent peut l'activer dans l'espace parents.");
            }
        }
        const disabled = !aiOn;
        p.querySelector('#tutor-send').disabled = disabled;
        p.querySelector('#tutor-input').disabled = disabled;
        p.querySelector('#tutor-hint-btn').disabled = disabled;
        const mic = p.querySelector('#tutor-mic');
        if (mic) mic.disabled = disabled;
    },

    _speechSupported() {
        return typeof window !== 'undefined' &&
            !!(window.SpeechRecognition || window.webkitSpeechRecognition);
    },

    // Saisie vocale du chat : on écoute l'enfant, on remplit le champ puis on
    // envoie automatiquement la question à Léo.
    _startVoiceInput() {
        if (typeof AITutor === 'undefined' || !AITutor.isEnabled() || AITutor._busy) return;
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) return;
        // Évite deux écoutes en parallèle.
        if (this._recognizing) { try { this._rec.stop(); } catch (e) {} return; }

        const lang = this._lang();
        const mic = document.getElementById('tutor-mic');
        const rec = new SR();
        this._rec = rec;
        rec.lang = lang === 'en' ? 'en-US' : 'fr-CA';
        rec.interimResults = false;
        rec.maxAlternatives = 1;

        rec.onstart = () => { this._recognizing = true; if (mic) mic.classList.add('listening'); };
        const stop = () => { this._recognizing = false; if (mic) mic.classList.remove('listening'); };
        rec.onerror = stop;
        rec.onend = stop;
        rec.onresult = (e) => {
            const said = (e.results && e.results[0] && e.results[0][0] && e.results[0][0].transcript || '').trim();
            if (said) {
                const input = document.getElementById('tutor-input');
                if (input) input.value = said;
                this._sendChat();
            }
        };
        try { rec.start(); } catch (e) { stop(); }
    },

    _appendMsg(role, text) {
        const chat = document.getElementById('tutor-chat');
        if (!chat) return null;
        const m = document.createElement('div');
        m.className = 'tutor-msg ' + role;
        m.textContent = text;
        chat.appendChild(m);
        chat.scrollTop = chat.scrollHeight;
        return m;
    },

    _thinking(en) {
        return this._appendMsg('leo', en ? '…' : '…');
    },

    async _askHint() {
        if (typeof AITutor === 'undefined' || !AITutor.isEnabled() || AITutor._busy) return;
        const lang = this._lang();
        const en = lang === 'en';
        const ge = (typeof GameEngine !== 'undefined') ? GameEngine : null;
        if (!ge || !ge.currentLevel) {
            this._appendMsg('leo', en ? 'Start a game and I’ll help you!' : 'Commence un jeu et je t’aiderai !');
            return;
        }
        const item = ge.currentLevel.items[ge.currentItemIndex];
        AITutor._busy = true;
        const bubble = this._thinking(en);
        try {
            const txt = await AITutor.hint(item, ge.currentGame, lang);
            bubble.textContent = txt || (en ? 'Look closely at the first letter!' : 'Regarde bien la première lettre !');
            this._voice(bubble.textContent, lang);
        } catch (e) {
            bubble.textContent = en ? 'Oops, I can’t think right now. Try again!' : 'Oups, je réfléchis mal là. Réessaie !';
        } finally {
            AITutor._busy = false;
            const c = document.getElementById('tutor-chat'); if (c) c.scrollTop = c.scrollHeight;
        }
    },

    async _sendChat() {
        if (typeof AITutor === 'undefined' || !AITutor.isEnabled() || AITutor._busy) return;
        const input = document.getElementById('tutor-input');
        const text = (input.value || '').trim();
        if (!text) return;
        input.value = '';
        const lang = this._lang();
        const en = lang === 'en';
        this._appendMsg('child', text);
        AITutor._busy = true;
        const bubble = this._thinking(en);
        try {
            const reply = await AITutor.chat(text, lang);
            bubble.textContent = reply || (en ? 'Tell me more!' : 'Dis-m’en plus !');
            this._voice(bubble.textContent, lang);
        } catch (e) {
            bubble.textContent = en ? 'Oops, I can’t answer right now.' : 'Oups, je ne peux pas répondre là.';
        } finally {
            AITutor._busy = false;
            const c = document.getElementById('tutor-chat'); if (c) c.scrollTop = c.scrollHeight;
        }
    }
};
