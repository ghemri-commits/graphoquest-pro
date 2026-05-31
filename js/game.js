// Gestionnaire d'API ElevenLabs (Synthèse vocale réaliste)
const ElevenLabsEngine = {
    getApiKey() {
        return localStorage.getItem('gq_elevenlabs_key') || "";
    },

    setApiKey(key) {
        localStorage.setItem('gq_elevenlabs_key', key);
    },

    getVoiceId(lang) {
        // FR : voix nativement française (corrige l'anglicisation de mots
        // courts comme « table », « grand »). EN : voix anglaise native.
        return lang === 'en'
            ? 'pNInz6obpg7If685it72'  // Adam (anglais)
            : 'NW7MRm1Ibz4gwivTc7oV'; // voix française fournie par l'utilisateur
    },

    blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    },

    async speak(text, lang) {
        const apiKey = this.getApiKey();
        if (!apiKey) {
            throw new Error("Pas de clé API");
        }

        const langCode = lang === 'en' ? 'en' : 'fr';
        // Cache versionné (v3 = nouvelle voix FR) : les anciennes entrées mal
        // prononcées ne sont plus réutilisées.
        const cacheKey = `gq_tts3_${langCode}_${btoa(encodeURIComponent(text.toLowerCase()))}`;
        const cachedAudio = localStorage.getItem(cacheKey);

        if (cachedAudio) {
            this.playBase64(cachedAudio);
            return true;
        }

        const voiceId = this.getVoiceId(lang);
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'xi-api-key': apiKey
            },
            body: JSON.stringify({
                text: text,
                // turbo v2.5 respecte language_code (contrairement à multilingual_v2
                // qui devinait la langue et lisait "table"/"grand" en anglais).
                model_id: 'eleven_turbo_v2_5',
                language_code: langCode,
                voice_settings: {
                    stability: 0.6,
                    similarity_boost: 0.8
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Erreur API: ${response.status}`);
        }

        const blob = await response.blob();
        const base64Data = await this.blobToBase64(blob);

        try {
            localStorage.setItem(cacheKey, base64Data);
        } catch (e) {
            this.clearAudioCache();
            try { localStorage.setItem(cacheKey, base64Data); } catch(err) {}
        }

        this.playBase64(base64Data);
        return true;
    },

    playBase64(base64) {
        const audio = new Audio(base64);
        // On passe par le canal unique d'AudioEngine pour qu'une nouvelle voix
        // coupe la précédente (sinon réponse + félicitation se chevauchent).
        if (typeof AudioEngine !== 'undefined' && AudioEngine._playElement) {
            AudioEngine._playElement(audio);
        } else {
            audio.play().catch(e => console.log("Erreur audio:", e));
        }
    },

    clearAudioCache() {
        Object.keys(localStorage).forEach(key => {
            // Purge le cache courant et tous les anciens formats audio.
            if (key.startsWith('gq_tts3_') || key.startsWith('gq_tts_') || key.startsWith('gq_audio_')) {
                localStorage.removeItem(key);
            }
        });
    }
};

// Gestionnaire de Reconnaissance Vocale (Écoute et correction)
const SpeechEngine = {
    recognition: null,
    isListening: false,
    onResultCallback: null,
    onErrorCallback: null,

    init() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn("Reconnaissance vocale non supportée.");
            return false;
        }
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.maxAlternatives = 1;

        this.recognition.onstart = () => {
            this.isListening = true;
            if (this.onStartCallback) this.onStartCallback();
        };

        this.recognition.onresult = (event) => {
            this.isListening = false;
            const resultText = event.results[0][0].transcript;
            const confidence = event.results[0][0].confidence;
            if (this.onResultCallback) this.onResultCallback(resultText, confidence);
        };

        this.recognition.onerror = (event) => {
            this.isListening = false;
            if (this.onErrorCallback) this.onErrorCallback(event.error);
        };

        this.recognition.onend = () => {
            this.isListening = false;
            if (this.onEndCallback) this.onEndCallback();
        };

        return true;
    },

    startListening(lang = 'fr-CA', onStart, onResult, onError, onEnd) {
        if (!this.recognition) {
            if (!this.init()) {
                if (onError) onError("not_supported");
                return;
            }
        }

        if (this.isListening) {
            this.recognition.stop();
        }

        // ciblage de l'accent canadien / québécois
        this.recognition.lang = lang === 'en' ? 'en-CA' : 'fr-CA';

        this.onStartCallback = onStart;
        this.onResultCallback = onResult;
        this.onErrorCallback = onError;
        this.onEndCallback = onEnd;

        try {
            this.recognition.start();
        } catch (e) {
            if (onError) onError(e.message);
        }
    },

    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
    },

    // La reconnaissance vocale (Web Speech API) n'existe pas sur iPad/Safari.
    // On le détecte pour basculer sur l'enregistrement + auto-validation.
    isSupported() {
        return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
    },

    evaluatePronunciation(spoken, target, lang) {
        const cleanText = (str) => {
            return str.toLowerCase()
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Enlève les accents
                .replace(/[^a-z0-9]/g, "")
                .trim();
        };

        const cleanSpoken = cleanText(spoken);
        const cleanTarget = cleanText(target);

        if (cleanSpoken === cleanTarget) return { success: true, score: 100 };

        const distance = this.levenshteinDistance(cleanSpoken, cleanTarget);
        const maxLength = Math.max(cleanSpoken.length, cleanTarget.length);
        const similarity = ((maxLength - distance) / maxLength) * 100;

        // Seuil d'évaluation indulgent adapté aux enfants du primaire
        const threshold = 70;
        return {
            success: similarity >= threshold,
            score: Math.round(similarity)
        };
    },

    levenshteinDistance(a, b) {
        const matrix = [];
        for (let i = 0; i <= b.length; i++) matrix[i] = [i];
        for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        return matrix[b.length][a.length];
    }
};

// Enregistreur micro (fallback pour iPad/Safari sans reconnaissance vocale).
// L'enfant s'enregistre, se réécoute, puis s'auto-valide. Tout reste local :
// le Blob audio n'est jamais envoyé sur un serveur.
const RecorderEngine = {
    mediaRecorder: null,
    chunks: [],
    stream: null,
    isRecording: false,

    isSupported() {
        return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);
    },

    async start() {
        this.chunks = [];
        this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.mediaRecorder = new MediaRecorder(this.stream);
        this.mediaRecorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) this.chunks.push(e.data);
        };
        this.mediaRecorder.start();
        this.isRecording = true;
    },

    stop() {
        return new Promise((resolve) => {
            const mr = this.mediaRecorder;
            if (!mr) { resolve(null); return; }
            mr.onstop = () => {
                this.isRecording = false;
                if (this.stream) this.stream.getTracks().forEach((t) => t.stop());
                const blob = new Blob(this.chunks, { type: mr.mimeType || 'audio/webm' });
                resolve(URL.createObjectURL(blob));
            };
            try { mr.stop(); } catch (e) { this.isRecording = false; resolve(null); }
        });
    }
};

// Gestionnaire d'Audio Hybride (Sons locaux + ElevenLabs + TTS Système)
const AudioEngine = {
    audioCache: {},
    isMuted: false,
    // Canal vocal unique : une seule voix à la fois. Toute nouvelle lecture
    // coupe la précédente, qu'elle vienne d'ElevenLabs, d'un phonème local
    // ou de la synthèse système.
    currentVoice: null,

    // Stoppe la voix en cours (audio HTML + synthèse système).
    stopVoice() {
        if (this.currentVoice) {
            try { this.currentVoice.pause(); this.currentVoice.currentTime = 0; } catch (e) {}
            this.currentVoice = null;
        }
        if (window.speechSynthesis) {
            try { window.speechSynthesis.cancel(); } catch (e) {}
        }
    },

    // Joue un élément <audio> après avoir coupé la voix précédente.
    _playElement(audio) {
        this.stopVoice();
        this.currentVoice = audio;
        audio.play().catch(e => console.log("Erreur audio:", e));
    },

    preload(sounds) {
        sounds.forEach(src => {
            if (!this.audioCache[src]) {
                const audio = new Audio(src);
                audio.load();
                this.audioCache[src] = audio;
            }
        });
    },

    play(textOrUrl, isPhoneme = false, lang = 'fr') {
        if (this.isMuted) return;

        if (isPhoneme) {
            const safeName = textOrUrl.toLowerCase().replace(/[^a-z0-9]/g, '');
            const url = `sounds/${lang}_${safeName}.mp3`;

            let audio = this.audioCache[url];
            if (!audio) {
                audio = new Audio(url);
                this.audioCache[url] = audio;
            }

            audio.onerror = () => this.speakBest(textOrUrl, lang);
            audio.currentTime = 0;
            this.stopVoice();
            this.currentVoice = audio;
            audio.play().catch(() => this.speakBest(textOrUrl, lang));
        } else {
            this.speakBest(textOrUrl, lang);
        }
    },

    async speakBest(text, lang) {
        try {
            await ElevenLabsEngine.speak(text, lang);
        } catch (e) {
            this.speakTTS(text, lang);
        }
    },

    speakTTS(text, langCode, rate) {
        const synth = window.speechSynthesis;
        if (!synth) return;

        // Coupe toute voix en cours (ElevenLabs/phonème) avant de parler.
        this.stopVoice();
        if (synth.paused) synth.resume();
        synth.cancel();

        setTimeout(() => {
            const utter = new SpeechSynthesisUtterance(text);
            const want = langCode === 'en' ? 'en' : 'fr';
            // Choisir une vraie voix de la bonne langue (sinon iOS peut lire en
            // anglais par défaut). Priorité fr-CA, puis fr-FR, puis toute voix fr.
            const voices = synth.getVoices() || [];
            const pick =
                (want === 'fr' && voices.find(v => /^fr-CA/i.test(v.lang))) ||
                (want === 'fr' && voices.find(v => /^fr-FR/i.test(v.lang))) ||
                voices.find(v => v.lang && v.lang.toLowerCase().startsWith(want));
            if (pick) utter.voice = pick;
            utter.lang = pick ? pick.lang : (want === 'en' ? 'en-US' : 'fr-CA');
            utter.rate = rate || 0.75;
            utter.pitch = 1.05;
            synth.speak(utter);
        }, 50);
    },

    // Prononciation ralentie et bien articulée pour les indices (différenciation).
    speakSlow(text, lang) {
        if (this.isMuted) return;
        this.speakTTS(text, lang, 0.5);
    },

    vibrate(type) {
        if (navigator.vibrate) {
            if (type === 'correct') {
                navigator.vibrate([40]);
            } else if (type === 'error') {
                navigator.vibrate([80, 50, 80]);
            }
        }
    }
};

const GameEngine = {
    currentProfile: null,
    currentLevel: null,
    currentLang: null,
    currentGame: null,
    currentItemIndex: 0,
    score: 0,
    stars: 0,
    streak: 0,
    isProcessing: false,
    syllableSequence: [],
    currentSyllableIndex: 0,
    correctFirstTry: 0,
    itemHasError: false,
    errorItems: [],
    reviewRound: false,

    init(profile, levelId, gameType, levelObj) {
        this.currentProfile = profile;
        this.currentLang = profile.lang === 'both' ? 'fr' : profile.lang;
        if (levelObj) {
            this.currentLevel = levelObj;
        } else {
            const data = getGameData(this.currentLang);
            this.currentLevel = data.levels.find(l => l.id === levelId);
        }
        this.challengeMode = !!(this.currentLevel && this.currentLevel.isChallenge);

        this.currentGame = gameType || this.currentLevel.miniGame;
        this.currentItemIndex = 0;
        this.originalTotal = this.currentLevel.items.length;
        this.score = 0;
        this.stars = 0;
        this.streak = 0;
        this.isProcessing = false;
        this.correctFirstTry = 0;
        this.itemHasError = false;
        this.errorItems = [];
        this.missedWords = [];
        this.reviewRound = false;

        // Léo (tuteur IA) : bouton flottant + pré-génération d'encouragements
        // personnalisés pour ce niveau (non bloquant).
        if (typeof TutorEngine !== 'undefined') TutorEngine.showButton();
        if (typeof AITutor !== 'undefined') {
            AITutor.resetSession();
            AITutor.warmupEncouragements(this.currentLang);
        }

        this.render();
    },

    render() {
        const area = document.getElementById('game-area');
        area.className = '';
        area.innerHTML = '';

        const item = this.currentLevel.items[this.currentItemIndex];
        const total = this.currentLevel.items.length;

        document.getElementById('game-counter').textContent = `${this.currentItemIndex + 1}/${total}`;
        document.getElementById('game-progress-fill').style.width = `${(this.currentItemIndex / total) * 100}%`;
        document.getElementById('current-score').textContent = this.score;
        this.itemHasError = false;
        this.itemErrorCount = 0;
        this.assisted = false;

        // Routage des mini-jeux
        if (this.currentGame === 'complete') {
            area.classList.add('mg-complete');
            this.renderComplete(item);
        } else if (this.currentGame === 'match') {
            area.classList.add('mg-match');
            this.renderMatch(item);
        } else if (this.currentGame === 'syllable') {
            area.classList.add('mg-syllable');
            this.renderSyllable(item);
        } else if (this.currentGame === 'pronounce') {
            area.classList.add('mg-pronounce');
            this.renderPronounce(item);
        } else if (this.currentGame === 'dictation') {
            area.classList.add('mg-dictation');
            this.renderDictation(item);
        } else if (this.currentGame === 'accord') {
            area.classList.add('mg-accord');
            this.renderAccord(item);
        } else if (this.currentGame === 'morpho') {
            area.classList.add('mg-morpho');
            this.renderMorpho(item);
        } else if (this.currentGame === 'comprehension') {
            area.classList.add('mg-comprehension');
            this.renderComprehension(item);
        } else if (this.currentGame === 'coquille') {
            area.classList.add('mg-coquille');
            this.renderCoquille(item);
        } else if (this.currentGame === 'vocab') {
            area.classList.add('mg-vocab');
            this.renderVocab(item);
        }
    },

    /* ===== JEU 1 : COMPLÈTE LE MOT ===== */
    renderComplete(item) {
        const area = document.getElementById('game-area');

        const correctAnswer = item.correct !== undefined ? item.correct : item.target[item.missing];
        const missingLen = correctAnswer.length;

        const wordDiv = document.createElement('div');
        wordDiv.className = 'word-display';

        let i = 0;
        while (i < item.target.length) {
            const slot = document.createElement('div');

            if (i === item.missing) {
                slot.className = 'letter-slot missing';
                if (missingLen > 3) slot.classList.add('extra-wide');
                else if (missingLen > 1) slot.classList.add('wide');
                slot.textContent = '';
                slot.id = 'missing-slot';
                wordDiv.appendChild(slot);
                i += missingLen;
            } else if (item.target[i] === '_') {
                slot.className = 'letter-slot';
                slot.style.cssText = 'width:20px;border:none;background:transparent;';
                slot.textContent = ' ';
                wordDiv.appendChild(slot);
                i++;
            } else {
                slot.className = 'letter-slot';
                slot.textContent = item.target[i];
                wordDiv.appendChild(slot);
                i++;
            }
        }
        area.appendChild(wordDiv);

        const audioBtn = document.createElement('button');
        audioBtn.className = 'btn-audio-large';
        audioBtn.innerHTML = '🔊 <span>Écouter</span>';
        audioBtn.onclick = () => AudioEngine.play(item.hint || item.target, false, this.currentLang);
        area.appendChild(audioBtn);

        const choicesDiv = document.createElement('div');
        choicesDiv.className = 'choices-row';

        const shuffled = [...item.options].sort(() => Math.random() - 0.5);
        shuffled.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            btn.textContent = opt;
            btn.onclick = () => {
                AudioEngine.play(opt, true, this.currentLang);
                this.handleCompleteChoice(opt, btn);
            };
            choicesDiv.appendChild(btn);
        });
        area.appendChild(choicesDiv);
    },

    handleCompleteChoice(choice, btn) {
        if (this.isProcessing) return;
        this.isProcessing = true;

        const item = this.currentLevel.items[this.currentItemIndex];
        const expected = item.correct !== undefined ? item.correct : item.target[item.missing];
        const slot = document.getElementById('missing-slot');
        const isCorrect = choice === expected;

        if (isCorrect) {
            AudioEngine.vibrate('correct');
            slot.textContent = choice;
            slot.classList.remove('missing');
            slot.classList.add('filled');
            btn.classList.add('correct');

            if (!this.itemHasError) this.correctFirstTry++;
            this.streak++;
            const points = 10 + (this.streak * 2);
            this.score += points;
            this.showFeedback('✅');
            setTimeout(() => this.praiseVoice(), 500);
            this.createParticles(btn);

            const total = this.currentLevel.items.length;
            document.getElementById('game-progress-fill').style.width = `${((this.currentItemIndex + 1) / total) * 100}%`;
            setTimeout(() => this.nextItem(), 1500);
        } else {
            AudioEngine.vibrate('error');
            btn.classList.add('wrong');
            slot.classList.add('error');
            this.streak = 0;
            this.itemHasError = true;
            this.itemErrorCount = (this.itemErrorCount || 0) + 1;
            this._autoAssist();
            this.showFeedback('❌');
            setTimeout(() => {
                btn.classList.remove('wrong');
                slot.classList.remove('error');
                this.isProcessing = false;
            }, 800);
        }

        document.getElementById('current-score').textContent = this.score;
    },

    /* ===== JEU 2 : SON & IMAGE ===== */
    renderMatch(item) {
        const area = document.getElementById('game-area');

        const container = document.createElement('div');
        container.className = 'match-container';

        const target = document.createElement('div');
        target.className = 'match-target';
        target.textContent = item.target;
        container.appendChild(target);

        const audioBtn = document.createElement('button');
        audioBtn.className = 'btn-audio-large';
        audioBtn.innerHTML = '🔊';
        audioBtn.onclick = () => AudioEngine.play(item.sound || item.correct, true, this.currentLang);
        container.appendChild(audioBtn);

        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'match-options';

        const shuffled = [...item.options].sort(() => Math.random() - 0.5);
        shuffled.forEach(opt => {
            const card = document.createElement('button');
            card.className = 'match-card';
            const wordDiv = document.createElement('div');
            wordDiv.className = 'match-word';
            wordDiv.textContent = opt;
            card.appendChild(wordDiv);
            card.onclick = () => {
                AudioEngine.play(opt, false, this.currentLang);
                this.handleMatchChoice(opt, card, item.correct);
            };
            optionsDiv.appendChild(card);
        });
        container.appendChild(optionsDiv);

        area.appendChild(container);
    },

    handleMatchChoice(choice, card, correct) {
        if (this.isProcessing) return;
        this.isProcessing = true;

        if (choice === correct) {
            AudioEngine.vibrate('correct');
            card.classList.add('correct');
            if (!this.itemHasError) this.correctFirstTry++;
            this.streak++;
            this.score += 10 + (this.streak * 2);
            this.showFeedback('✅');
            setTimeout(() => this.praiseVoice(), 500);
            this.createParticles(card);
            const total = this.currentLevel.items.length;
            document.getElementById('game-progress-fill').style.width = `${((this.currentItemIndex + 1) / total) * 100}%`;
            setTimeout(() => this.nextItem(), 1500);
        } else {
            AudioEngine.vibrate('error');
            card.classList.add('wrong');
            this.streak = 0;
            this.itemHasError = true;
            this.itemErrorCount = (this.itemErrorCount || 0) + 1;
            this._autoAssist();
            this.showFeedback('❌');
            setTimeout(() => {
                card.classList.remove('wrong');
                this.isProcessing = false;
            }, 800);
        }

        document.getElementById('current-score').textContent = this.score;
    },

    /* ===== JEU 3 : SYLLABES ===== */
    renderSyllable(item) {
        const area = document.getElementById('game-area');

        const container = document.createElement('div');
        container.className = 'syllable-container';

        const targetDiv = document.createElement('div');
        targetDiv.className = 'syllable-target';
        targetDiv.textContent = 'Trouve : ' + item.target;
        container.appendChild(targetDiv);

        const wordDiv = document.createElement('div');
        wordDiv.className = 'syllable-word';
        wordDiv.id = 'built-word';
        wordDiv.textContent = '';
        container.appendChild(wordDiv);

        const audioBtn = document.createElement('button');
        audioBtn.className = 'btn-audio-large';
        audioBtn.innerHTML = '🔊';
        audioBtn.onclick = () => AudioEngine.play(item.word, false, this.currentLang);
        container.appendChild(audioBtn);

        const partsDiv = document.createElement('div');
        partsDiv.className = 'syllable-parts';

        const shuffled = [...item.parts].sort(() => Math.random() - 0.5);
        this.syllableSequence = item.target.split('-');
        this.currentSyllableIndex = 0;

        shuffled.forEach(part => {
            const btn = document.createElement('button');
            btn.className = 'syllable-btn';
            btn.textContent = part;
            btn.onclick = () => {
                AudioEngine.play(part, true, this.currentLang);
                this.handleSyllableChoice(part, btn);
            };
            partsDiv.appendChild(btn);
        });
        container.appendChild(partsDiv);

        area.appendChild(container);
    },

    handleSyllableChoice(part, btn) {
        if (this.isProcessing) return;

        const expected = this.syllableSequence[this.currentSyllableIndex];

        if (part === expected) {
            AudioEngine.vibrate('correct');
            btn.classList.add('selected');
            btn.disabled = true;

            const built = this.syllableSequence.slice(0, this.currentSyllableIndex + 1).join('');
            document.getElementById('built-word').textContent = built;

            this.currentSyllableIndex++;

            const stillNeeded = this.syllableSequence.slice(this.currentSyllableIndex).includes(part);
            if (stillNeeded) {
                setTimeout(() => {
                    btn.classList.remove('selected');
                    btn.disabled = false;
                }, 400);
            }

            if (this.currentSyllableIndex >= this.syllableSequence.length) {
                this.isProcessing = true;
                if (!this.itemHasError) this.correctFirstTry++;
                this.streak++;
                this.score += 15 + (this.streak * 3);
                this.showFeedback('🌟');
                setTimeout(() => this.praiseVoice(), 600);

                document.querySelectorAll('.syllable-btn').forEach(b => {
                    if (!b.disabled) b.classList.add('correct');
                });

                const total = this.currentLevel.items.length;
                document.getElementById('game-progress-fill').style.width = `${((this.currentItemIndex + 1) / total) * 100}%`;
                setTimeout(() => this.nextItem(), 1800);
            }
        } else {
            AudioEngine.vibrate('error');
            btn.classList.add('wrong');
            this.streak = 0;
            this.itemHasError = true;
            this.itemErrorCount = (this.itemErrorCount || 0) + 1;
            this._autoAssist();
            this.showFeedback('❌');
            setTimeout(() => btn.classList.remove('wrong'), 600);
        }

        document.getElementById('current-score').textContent = this.score;
    },

    /* ===== JEU 4 : PRONONCIATION (ÉCOUTE ET CORRIGE) ===== */
    renderPronounce(item) {
        const area = document.getElementById('game-area');

        const container = document.createElement('div');
        container.className = 'pronounce-container';
        container.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:24px;width:100%;max-width:480px;margin:0 auto;';

        const title = document.createElement('h3');
        title.textContent = this.currentLang === 'en' ? 'Read aloud:' : 'Lis à haute voix :';
        title.style.cssText = 'font-size:20px;color:#475569;margin:0;font-weight:700;';
        container.appendChild(title);

        const wordCard = document.createElement('div');
        wordCard.className = 'pronounce-word-card';
        wordCard.textContent = item.word || item.target;
        wordCard.style.cssText = 'font-size:46px;font-weight:700;background:#ffffff;padding:20px 40px;border-radius:20px;box-shadow:0 8px 30px rgba(0,0,0,0.06);color:#1e293b;letter-spacing:1px;width:100%;text-align:center;border:2px solid #e2e8f0;';
        container.appendChild(wordCard);

        // Mode reconnaissance (Chrome/Android) vs mode enregistrement (iPad/Safari)
        const recordMode = !SpeechEngine.isSupported() && RecorderEngine.isSupported();
        const en = this.currentLang === 'en';

        const subText = document.createElement('p');
        subText.id = 'speech-status';
        if (recordMode) {
            subText.textContent = en ? 'Tap the mic, read, tap to stop' : 'Appuie sur le micro, lis le mot, puis arrête';
        } else {
            subText.textContent = en ? 'Tap the mic and speak' : 'Appuie sur le micro et parle';
        }
        subText.style.cssText = 'font-size:16px;color:#64748b;margin:0;font-weight:600;text-align:center;';
        container.appendChild(subText);

        const micBtn = document.createElement('button');
        micBtn.id = 'mic-button';
        micBtn.className = 'btn-mic-ios';
        micBtn.innerHTML = `
            <svg viewBox="0 0 24 24" style="width:36px;height:36px;fill:none;stroke:currentColor;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                <path d="M19 10v1a7 7 0 0 1-14 0v-1"></path>
                <line x1="12" x2="12" y1="19" y2="22"></line>
            </svg>
        `;
        micBtn.style.cssText = 'background:#007aff;color:white;width:80px;height:80px;border-radius:50%;border:none;display:flex;justify-content:center;align-items:center;cursor:pointer;box-shadow:0 8px 24px rgba(0,122,255,0.3);transition:all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);';

        const styleSheet = document.getElementById('gq-mic-style') || document.createElement('style');
        styleSheet.id = 'gq-mic-style';
        styleSheet.textContent = `
            @keyframes micPulse {
                0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.5); transform: scale(1); }
                70% { box-shadow: 0 0 0 15px rgba(239, 68, 68, 0); transform: scale(1.06); }
                100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); transform: scale(1); }
            }
            .mic-active {
                background: #ef4444 !important;
                animation: micPulse 1.2s infinite;
                box-shadow: 0 8px 24px rgba(239, 68, 68, 0.4) !important;
            }
        `;
        if (!styleSheet.isConnected) document.head.appendChild(styleSheet);

        micBtn.onclick = () => {
            if (this.isProcessing) return;
            if (recordMode) {
                this.toggleRecording(item, micBtn, subText, container);
            } else {
                this.toggleSpeechListening(item, micBtn, subText);
            }
        };

        container.appendChild(micBtn);

        const listenOption = document.createElement('button');
        listenOption.style.cssText = 'background:none;border:none;color:#007aff;font-size:16px;font-weight:700;cursor:pointer;';
        listenOption.innerHTML = '🔊 <span>Écouter le modèle</span>';
        listenOption.onclick = () => AudioEngine.play(item.word || item.target, false, this.currentLang);
        container.appendChild(listenOption);

        area.appendChild(container);
    },

    toggleSpeechListening(item, micBtn, subText) {
        if (micBtn.classList.contains('mic-active')) {
            SpeechEngine.stopListening();
            return;
        }

        const targetWord = item.word || item.target;

        SpeechEngine.startListening(
            this.currentLang,
            () => {
                micBtn.classList.add('mic-active');
                subText.textContent = this.currentLang === 'en' ? 'Listening...' : 'Je t\'écoute...';
                subText.style.color = '#ef4444';
            },
            (result, confidence) => {
                micBtn.classList.remove('mic-active');
                this.handlePronunciationResult(result, targetWord, subText, micBtn);
            },
            (err) => {
                micBtn.classList.remove('mic-active');
                subText.style.color = '#ef4444';
                if (err === 'not-allowed') {
                    subText.textContent = "🎙️ Micro bloqué. Active-le dans tes réglages !";
                } else {
                    subText.textContent = "Réessaie de parler !";
                }
                setTimeout(() => {
                    subText.style.color = '#64748b';
                    subText.textContent = this.currentLang === 'en' ? 'Tap the mic and speak' : 'Appuie sur le micro et parle';
                }, 3000);
            },
            () => {
                micBtn.classList.remove('mic-active');
            }
        );
    },

    handlePronunciationResult(spokenText, targetWord, subText, micBtn) {
        if (this.isProcessing) return;
        this.isProcessing = true;

        const evalResult = SpeechEngine.evaluatePronunciation(spokenText, targetWord, this.currentLang);

        if (evalResult.success) {
            AudioEngine.vibrate('correct');
            subText.style.color = '#10b981';
            subText.textContent = `🗣️ "${spokenText}" (${evalResult.score}%)`;

            if (!this.itemHasError) this.correctFirstTry++;
            this.streak++;
            this.score += 15 + (this.streak * 2);
            this.showFeedback('🎉');

            setTimeout(() => {
                this.praiseVoice();
                this.createParticles(micBtn);
            }, 300);

            const total = this.currentLevel.items.length;
            document.getElementById('game-progress-fill').style.width = `${((this.currentItemIndex + 1) / total) * 100}%`;
            setTimeout(() => this.nextItem(), 2000);
        } else {
            AudioEngine.vibrate('error');
            subText.style.color = '#ef4444';
            subText.textContent = spokenText ? `Tu as dit : "${spokenText}"` : "Je n'ai pas compris...";
            this.streak = 0;
            this.itemHasError = true;
            this.itemErrorCount = (this.itemErrorCount || 0) + 1;
            this._autoAssist();
            this.showFeedback('❌');

            setTimeout(() => {
                subText.style.color = '#64748b';
                subText.textContent = this.currentLang === 'en' ? 'Try again!' : 'Essaie encore !';
                this.isProcessing = false;
            }, 2000);
        }

        document.getElementById('current-score').textContent = this.score;
    },

    // ===== Mode enregistrement + auto-validation (iPad / Safari) =====
    // Tap 1 : démarre l'enregistrement. Tap 2 : arrête, réécoute, et propose
    // à l'enfant de s'auto-évaluer (✅ / 🔁).
    toggleRecording(item, micBtn, subText, container) {
        if (this.isProcessing) return;
        const en = this.currentLang === 'en';

        if (RecorderEngine.isRecording) {
            micBtn.classList.remove('mic-active');
            subText.style.color = '#64748b';
            subText.textContent = en ? 'One moment…' : 'Un instant…';
            RecorderEngine.stop().then((url) => this._afterRecording(url, item, micBtn, subText, container));
            return;
        }

        RecorderEngine.start().then(() => {
            // On retire un éventuel panneau d'auto-évaluation d'un essai précédent.
            const old = document.getElementById('pronounce-assess');
            if (old) old.remove();
            micBtn.classList.add('mic-active');
            subText.style.color = '#ef4444';
            subText.textContent = en ? 'Recording… tap to stop' : "J'enregistre… appuie pour arrêter";
        }).catch(() => {
            micBtn.classList.remove('mic-active');
            subText.style.color = '#ef4444';
            subText.textContent = en ? '🎙️ Allow the microphone in Settings' : '🎙️ Autorise le micro dans les réglages';
            setTimeout(() => {
                subText.style.color = '#64748b';
                subText.textContent = en ? 'Tap the mic, read, tap to stop' : 'Appuie sur le micro, lis le mot, puis arrête';
            }, 3000);
        });
    },

    _afterRecording(url, item, micBtn, subText, container) {
        const en = this.currentLang === 'en';

        if (!url) {
            subText.style.color = '#ef4444';
            subText.textContent = en ? "Hmm, that didn't record. Try again!" : "Hmm, ça n'a pas marché. Réessaie !";
            setTimeout(() => {
                subText.style.color = '#64748b';
                subText.textContent = en ? 'Tap the mic, read, tap to stop' : 'Appuie sur le micro, lis le mot, puis arrête';
            }, 2500);
            return;
        }

        subText.style.color = '#475569';
        subText.textContent = en ? 'Listen to yourself 👂' : 'Réécoute-toi 👂';

        const myVoice = new Audio(url);
        myVoice.play().catch(() => {});

        const assess = document.createElement('div');
        assess.id = 'pronounce-assess';
        assess.style.cssText = 'display:flex;flex-direction:column;gap:12px;width:100%;align-items:center;';

        // Ligne de réécoute : ma voix vs le modèle
        const replayRow = document.createElement('div');
        replayRow.style.cssText = 'display:flex;gap:12px;flex-wrap:wrap;justify-content:center;';

        const replayMine = document.createElement('button');
        replayMine.innerHTML = en ? '🔁 My voice' : '🔁 Ma voix';
        replayMine.style.cssText = 'background:#eef2ff;color:#4338ca;border:none;border-radius:14px;padding:12px 18px;font-size:16px;font-weight:700;cursor:pointer;';
        replayMine.onclick = () => { myVoice.currentTime = 0; myVoice.play().catch(() => {}); };

        const replayModel = document.createElement('button');
        replayModel.innerHTML = en ? '🔊 Model' : '🔊 Modèle';
        replayModel.style.cssText = 'background:#eef2ff;color:#4338ca;border:none;border-radius:14px;padding:12px 18px;font-size:16px;font-weight:700;cursor:pointer;';
        replayModel.onclick = () => AudioEngine.play(item.word || item.target, false, this.currentLang);

        replayRow.appendChild(replayMine);
        replayRow.appendChild(replayModel);

        // Ligne d'auto-évaluation : bien lu / réessayer
        const verdictRow = document.createElement('div');
        verdictRow.style.cssText = 'display:flex;gap:12px;flex-wrap:wrap;justify-content:center;';

        const okBtn = document.createElement('button');
        okBtn.innerHTML = en ? '✅ I said it well!' : '✅ Bien lu !';
        okBtn.style.cssText = 'background:#10b981;color:white;border:none;border-radius:16px;padding:14px 22px;font-size:17px;font-weight:800;cursor:pointer;box-shadow:0 8px 20px rgba(16,185,129,0.3);';
        okBtn.onclick = () => {
            URL.revokeObjectURL(url);
            this._pronounceSelfSuccess(micBtn, subText);
        };

        const retryBtn = document.createElement('button');
        retryBtn.innerHTML = en ? '🔁 Try again' : '🔁 Réessayer';
        retryBtn.style.cssText = 'background:#fff;color:#ef4444;border:2px solid #fecaca;border-radius:16px;padding:14px 22px;font-size:17px;font-weight:800;cursor:pointer;';
        retryBtn.onclick = () => {
            URL.revokeObjectURL(url);
            assess.remove();
            subText.style.color = '#64748b';
            subText.textContent = en ? 'Tap the mic, read, tap to stop' : 'Appuie sur le micro, lis le mot, puis arrête';
        };

        verdictRow.appendChild(okBtn);
        verdictRow.appendChild(retryBtn);

        assess.appendChild(replayRow);
        assess.appendChild(verdictRow);
        container.appendChild(assess);
    },

    _pronounceSelfSuccess(micBtn, subText) {
        if (this.isProcessing) return;
        this.isProcessing = true;

        const assess = document.getElementById('pronounce-assess');
        if (assess) assess.remove();

        AudioEngine.vibrate('correct');
        subText.style.color = '#10b981';
        subText.textContent = this.currentLang === 'en' ? 'Great reading!' : 'Bravo, belle lecture !';

        if (!this.itemHasError) this.correctFirstTry++;
        this.streak++;
        this.score += 15 + (this.streak * 2);
        this.showFeedback('🎉');

        setTimeout(() => {
            this.praiseVoice();
            this.createParticles(micBtn);
        }, 300);

        const total = this.currentLevel.items.length;
        document.getElementById('game-progress-fill').style.width = `${((this.currentItemIndex + 1) / total) * 100}%`;
        document.getElementById('current-score').textContent = this.score;
        setTimeout(() => this.nextItem(), 1800);
    },

    /* ===== JEU 5 : LA DICTÉE ===== */
    renderDictation(item) {
        const area = document.getElementById('game-area');

        const container = document.createElement('div');
        container.className = 'dictation-container';
        container.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:20px;width:100%;max-width:440px;margin:0 auto;';

        const title = document.createElement('h3');
        title.textContent = this.currentLang === 'en' ? 'Listen and write:' : 'Écoute et écris le mot :';
        title.style.cssText = 'font-size:20px;color:#475569;margin:0;font-weight:700;';
        container.appendChild(title);

        const soundBtn = document.createElement('button');
        soundBtn.className = 'btn-audio-dictation';
        soundBtn.innerHTML = `
            <svg viewBox="0 0 24 24" style="width:28px;height:28px;fill:none;stroke:currentColor;stroke-width:2.5">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            </svg>
            <span>Écouter le mot</span>
        `;
        soundBtn.style.cssText = 'background:#6366f1;color:white;border:none;border-radius:18px;padding:14px 24px;font-size:18px;font-weight:700;display:flex;align-items:center;gap:10px;cursor:pointer;box-shadow:0 8px 24px rgba(99,102,241,0.2);width:100%;justify-content:center;';
        soundBtn.onclick = () => AudioEngine.play(item.word || item.target, false, this.currentLang);
        container.appendChild(soundBtn);

        const en = this.currentLang === 'en';

        // Consigne : écriture manuscrite d'abord (Apple Pencil → Scribble convertit
        // l'écriture en texte), clavier en secours d'un simple tap.
        const writeHint = document.createElement('p');
        writeHint.innerHTML = en
            ? '✍️ Write the word with your pencil <span style="opacity:.65">— or tap to type</span>'
            : '✍️ Écris le mot avec ton crayon <span style="opacity:.65">— ou tape pour le clavier</span>';
        writeHint.style.cssText = 'font-size:15px;color:#64748b;margin:0;font-weight:600;text-align:center;';
        container.appendChild(writeHint);

        // Grande « ardoise » : c'est un VRAI champ texte éditable (indispensable
        // pour que Scribble d'iPadOS reconnaisse l'écriture), stylé comme un cahier.
        const input = document.createElement('input');
        input.type = 'text';
        input.id = 'dictation-input';
        input.lang = en ? 'en' : 'fr-CA';            // langue de reconnaissance Scribble
        input.placeholder = '✍️';
        input.autocomplete = 'off';
        input.autocorrect = 'off';
        input.autocapitalize = 'none';
        input.spellcheck = false;
        input.setAttribute('inputmode', 'text');
        input.setAttribute('enterkeyhint', 'done');
        input.style.cssText = 'width:100%;height:120px;font-size:44px;line-height:120px;padding:0 18px;border-radius:20px;border:2px dashed #94a3b8;text-align:center;font-weight:700;outline:none;background:#ffffff;color:#1e293b;background-image:linear-gradient(#e2e8f0 1px, transparent 1px);background-size:100% 50%;background-position:0 62%;letter-spacing:2px;';
        container.appendChild(input);

        const penStatus = document.createElement('p');
        penStatus.style.cssText = 'font-size:13px;color:#94a3b8;margin:0;font-weight:600;min-height:16px;';
        container.appendChild(penStatus);

        // Retour visuel crayon/doigt (Scribble et clavier s'activent
        // automatiquement selon l'outil — aucune bascule manuelle nécessaire).
        input.addEventListener('pointerdown', (e) => {
            if (e.pointerType === 'pen') {
                penStatus.textContent = en ? '✏️ Pencil mode' : '✏️ Mode crayon';
                penStatus.style.color = '#6366f1';
            } else {
                penStatus.textContent = en ? '⌨️ Keyboard' : '⌨️ Clavier';
                penStatus.style.color = '#94a3b8';
            }
        });


        const submitBtn = document.createElement('button');
        submitBtn.textContent = this.currentLang === 'en' ? 'Check ✓' : 'Valider ✓';
        submitBtn.style.cssText = 'width:100%;background:#10b981;color:white;border:none;border-radius:16px;padding:14px;font-size:18px;font-weight:700;cursor:pointer;box-shadow:0 8px 20px rgba(16,185,129,0.15);';

        submitBtn.onclick = () => {
            const answer = input.value.trim();
            this.handleDictationSubmit(answer, item, input, submitBtn);
        };

        input.onkeydown = (e) => {
            if (e.key === 'Enter') {
                const answer = input.value.trim();
                this.handleDictationSubmit(answer, item, input, submitBtn);
            }
        };

        container.appendChild(submitBtn);

        if (item.hint) {
            const hintText = document.createElement('p');
            hintText.innerHTML = `💡 ${en ? 'Hint' : 'Indice'} : <em>${item.hint}</em>`;
            hintText.style.cssText = 'font-size:15px;color:#64748b;margin-top:8px;';
            container.appendChild(hintText);
        }

        area.appendChild(container);

        // On joue le mot, mais SANS focus auto : sinon le clavier s'ouvre et
        // masque l'ardoise. L'enfant écrit au crayon (Scribble) ou tape lui-même.
        setTimeout(() => {
            AudioEngine.play(item.word || item.target, false, this.currentLang);
        }, 400);
    },

    handleDictationSubmit(answer, item, input, btn) {
        if (this.isProcessing || !answer) return;
        this.isProcessing = true;

        const targetWord = (item.word || item.target).trim();
        const cleanStr = (str) => str.toLowerCase().replace(/\s+/g, ' ').trim();
        const isCorrect = cleanStr(answer) === cleanStr(targetWord);

        if (isCorrect) {
            AudioEngine.vibrate('correct');
            input.style.borderColor = '#10b981';
            input.style.background = '#ecfdf5';
            input.style.color = '#10b981';

            if (!this.itemHasError) this.correctFirstTry++;
            this.streak++;
            const points = 15 + (this.streak * 2);
            this.score += points;
            this.showFeedback('🎉');
            setTimeout(() => this.praiseVoice(), 500);
            this.createParticles(input);

            const total = this.currentLevel.items.length;
            document.getElementById('game-progress-fill').style.width = `${((this.currentItemIndex + 1) / total) * 100}%`;
            setTimeout(() => this.nextItem(), 1800);
        } else {
            AudioEngine.vibrate('error');
            input.style.borderColor = '#ef4444';
            input.style.background = '#fef2f2';
            input.style.color = '#ef4444';
            input.classList.add('shake-animation');

            const style = document.getElementById('gq-shake-style') || document.createElement('style');
            style.id = 'gq-shake-style';
            style.textContent = `
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-6px); }
                    75% { transform: translateX(6px); }
                }
                .shake-animation { animation: shake 0.25s ease-in-out; }
            `;
            if (!style.isConnected) document.head.appendChild(style);

            this.streak = 0;
            this.itemHasError = true;
            this.itemErrorCount = (this.itemErrorCount || 0) + 1;
            this._autoAssist();
            this.showFeedback('❌');

            setTimeout(() => {
                // Restaure l'apparence « ardoise » (sans forcer le focus, pour ne
                // pas ouvrir le clavier : l'enfant réessaie au crayon).
                input.value = '';
                input.style.borderColor = '#94a3b8';
                input.style.color = '#1e293b';
                input.style.background = '#ffffff';
                input.style.backgroundImage = 'linear-gradient(#e2e8f0 1px, transparent 1px)';
                input.style.backgroundSize = '100% 50%';
                input.style.backgroundPosition = '0 62%';
                input.classList.remove('shake-animation');
                this.isProcessing = false;
            }, 1200);
        }

        document.getElementById('current-score').textContent = this.score;
    },

    /* ===== JEU 6 : ACCORD-EXPRESS (PFEQ GRAMMAIRE) ===== */
    renderAccord(item) {
        const area = document.getElementById('game-area');

        const container = document.createElement('div');
        container.className = 'accord-container';
        container.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:24px;width:100%;max-width:480px;margin:0 auto;';

        const title = document.createElement('h3');
        title.textContent = this.currentLang === 'en' ? 'Choose the correct agreement:' : 'Choisis la bonne forme :';
        title.style.cssText = 'font-size:20px;color:#475569;margin:0;font-weight:700;';
        container.appendChild(title);

        const sentenceDiv = document.createElement('div');
        sentenceDiv.className = 'accord-sentence';
        const displaySentence = item.sentence.replace('___', '<span id="accord-slot" class="letter-slot missing" style="display:inline-block;width:120px;height:38px;vertical-align:middle;margin:0 10px;line-height:34px;text-align:center;font-size:20px;border-bottom:3px dashed #6366f1;"></span>');
        sentenceDiv.innerHTML = displaySentence;
        sentenceDiv.style.cssText = 'font-size:22px;font-weight:600;line-height:1.6;text-align:center;color:#1e293b;padding:20px;background:#f8fafc;border-radius:18px;border:1px solid #e2e8f0;width:100%;';
        container.appendChild(sentenceDiv);

        const audioBtn = document.createElement('button');
        audioBtn.className = 'btn-audio-large';
        audioBtn.innerHTML = '🔊 <span>Écouter la phrase</span>';
        audioBtn.onclick = () => AudioEngine.play(item.sentence.replace('___', item.correct), false, this.currentLang);
        container.appendChild(audioBtn);

        const choicesDiv = document.createElement('div');
        choicesDiv.className = 'choices-row';
        choicesDiv.style.cssText = 'display:flex;gap:12px;width:100%;justify-content:center;margin-top:10px;flex-wrap:wrap;';

        const shuffled = [...item.options].sort(() => Math.random() - 0.5);
        shuffled.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            btn.textContent = opt;
            btn.style.cssText = 'min-width:110px;padding:10px 20px;font-size:18px;';
            btn.onclick = () => this.handleAccordChoice(opt, btn, item);
            choicesDiv.appendChild(btn);
        });
        container.appendChild(choicesDiv);

        if (item.hint) {
            const hintText = document.createElement('p');
            hintText.innerHTML = `💡 Règle : <em>${item.hint}</em>`;
            hintText.style.cssText = 'font-size:14px;color:#64748b;margin-top:10px;';
            container.appendChild(hintText);
        }

        area.appendChild(container);
    },

    handleAccordChoice(choice, btn, item) {
        if (this.isProcessing) return;
        this.isProcessing = true;

        const slot = document.getElementById('accord-slot');
        const isCorrect = choice === item.correct;

        if (isCorrect) {
            AudioEngine.vibrate('correct');
            if (slot) {
                slot.textContent = choice;
                slot.style.borderBottom = '3px solid #10b981';
                slot.style.color = '#10b981';
            }
            btn.classList.add('correct');

            if (!this.itemHasError) this.correctFirstTry++;
            this.streak++;
            this.score += 15 + (this.streak * 2);
            this.showFeedback('✅');
            setTimeout(() => this.praiseVoice(), 500);
            this.createParticles(btn);

            const total = this.currentLevel.items.length;
            document.getElementById('game-progress-fill').style.width = `${((this.currentItemIndex + 1) / total) * 100}%`;
            setTimeout(() => this.nextItem(), 1800);
        } else {
            AudioEngine.vibrate('error');
            btn.classList.add('wrong');
            if (slot) {
                slot.textContent = choice;
                slot.style.borderBottom = '3px solid #ef4444';
                slot.style.color = '#ef4444';
            }
            this.streak = 0;
            this.itemHasError = true;
            this.itemErrorCount = (this.itemErrorCount || 0) + 1;
            this._autoAssist();
            this.showFeedback('❌');
            setTimeout(() => {
                btn.classList.remove('wrong');
                if (slot) {
                    slot.textContent = '';
                    slot.style.borderBottom = '3px dashed #6366f1';
                    slot.style.color = '';
                }
                this.isProcessing = false;
            }, 1000);
        }

        document.getElementById('current-score').textContent = this.score;
    },

    /* ===== JEU 7 : MORPHO-TRI (RADICAL / PRÉFIXE / SUFFIXE) ===== */
    renderMorpho(item) {
        const area = document.getElementById('game-area');
        const en = this.currentLang === 'en';

        const container = document.createElement('div');
        container.className = 'morpho-container';
        container.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:18px;width:100%;max-width:520px;margin:0 auto;';

        const title = document.createElement('h3');
        title.textContent = en ? 'Classify each word part:' : 'Classe chaque partie du mot :';
        title.style.cssText = 'font-size:20px;color:#475569;margin:0;font-weight:700;';
        container.appendChild(title);

        const wordCard = document.createElement('div');
        wordCard.textContent = item.word;
        wordCard.style.cssText = 'font-size:34px;font-weight:700;color:#1e293b;background:#ffffff;padding:14px 32px;border-radius:18px;border:2px solid #e2e8f0;box-shadow:0 6px 20px rgba(0,0,0,0.05);';
        container.appendChild(wordCard);

        const audioBtn = document.createElement('button');
        audioBtn.className = 'btn-audio-large';
        audioBtn.innerHTML = '🔊 <span>' + (en ? 'Listen' : 'Écouter') + '</span>';
        audioBtn.onclick = () => AudioEngine.play(item.word, false, this.currentLang);
        container.appendChild(audioBtn);

        // Bandeau des parties à classer (dans l'ordre du mot)
        const chipsRow = document.createElement('div');
        chipsRow.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin:6px 0;';
        this.morphoSegments = item.segments;
        this.morphoIndex = 0;
        this.morphoChips = [];

        const colors = { prefix: '#f59e0b', radical: '#6366f1', suffix: '#10b981' };
        item.segments.forEach((seg, i) => {
            const chip = document.createElement('div');
            chip.textContent = seg.text;
            chip.style.cssText = 'font-size:22px;font-weight:700;padding:10px 18px;border-radius:14px;background:#f1f5f9;border:2px dashed #cbd5e1;color:#334155;transition:all 0.25s;';
            if (i === 0) chip.style.boxShadow = '0 0 0 4px rgba(99,102,241,0.25)';
            chipsRow.appendChild(chip);
            this.morphoChips.push(chip);
        });
        container.appendChild(chipsRow);

        // Boutons de catégorie
        const labels = en
            ? { prefix: 'Prefix', radical: 'Root', suffix: 'Suffix' }
            : { prefix: 'Préfixe', radical: 'Radical', suffix: 'Suffixe' };
        const catRow = document.createElement('div');
        catRow.style.cssText = 'display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-top:6px;';
        ['prefix', 'radical', 'suffix'].forEach(type => {
            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            btn.textContent = labels[type];
            btn.style.cssText = `min-width:120px;padding:12px 16px;font-size:17px;border-radius:14px;border:2px solid ${colors[type]};color:${colors[type]};background:#fff;font-weight:700;`;
            btn.onclick = () => this.handleMorphoChoice(type, btn, colors, labels);
            catRow.appendChild(btn);
        });
        container.appendChild(catRow);

        if (item.hint) {
            const hintText = document.createElement('p');
            hintText.innerHTML = `💡 <em>${item.hint}</em>`;
            hintText.style.cssText = 'font-size:14px;color:#64748b;margin-top:6px;';
            container.appendChild(hintText);
        }

        area.appendChild(container);
    },

    handleMorphoChoice(type, btn, colors) {
        if (this.isProcessing) return;

        const seg = this.morphoSegments[this.morphoIndex];
        const chip = this.morphoChips[this.morphoIndex];

        if (type === seg.type) {
            AudioEngine.vibrate('correct');
            chip.style.background = colors[seg.type];
            chip.style.borderColor = colors[seg.type];
            chip.style.borderStyle = 'solid';
            chip.style.color = '#fff';
            chip.style.boxShadow = 'none';

            this.morphoIndex++;
            const next = this.morphoChips[this.morphoIndex];
            if (next) next.style.boxShadow = '0 0 0 4px rgba(99,102,241,0.25)';

            if (this.morphoIndex >= this.morphoSegments.length) {
                this.isProcessing = true;
                if (!this.itemHasError) this.correctFirstTry++;
                this.streak++;
                this.score += 15 + (this.streak * 2);
                this.showFeedback('🌟');
                setTimeout(() => this.praiseVoice(), 500);
                this.createParticles(btn);
                const total = this.currentLevel.items.length;
                document.getElementById('game-progress-fill').style.width = `${((this.currentItemIndex + 1) / total) * 100}%`;
                setTimeout(() => this.nextItem(), 1600);
            }
        } else {
            AudioEngine.vibrate('error');
            btn.classList.add('wrong');
            this.streak = 0;
            this.itemHasError = true;
            this.itemErrorCount = (this.itemErrorCount || 0) + 1;
            this._autoAssist();
            this.showFeedback('❌');
            setTimeout(() => btn.classList.remove('wrong'), 600);
        }

        document.getElementById('current-score').textContent = this.score;
    },

    /* ===== JEU 8 : COMPRÉHENSION-FLASH (TEXTE + QCM) ===== */
    renderComprehension(item) {
        const area = document.getElementById('game-area');
        const en = this.currentLang === 'en';

        const container = document.createElement('div');
        container.className = 'comprehension-container';
        container.style.cssText = 'display:flex;flex-direction:column;align-items:stretch;gap:16px;width:100%;max-width:560px;margin:0 auto;';

        const title = document.createElement('h3');
        title.textContent = en ? 'Read, then answer:' : 'Lis le texte, puis réponds :';
        title.style.cssText = 'font-size:20px;color:#475569;margin:0;font-weight:700;text-align:center;';
        container.appendChild(title);

        const textCard = document.createElement('div');
        textCard.textContent = item.text;
        textCard.style.cssText = 'font-size:18px;line-height:1.7;color:#1e293b;background:#ffffff;padding:18px 20px;border-radius:18px;border:1px solid #e2e8f0;box-shadow:0 6px 20px rgba(0,0,0,0.05);';
        container.appendChild(textCard);

        const audioBtn = document.createElement('button');
        audioBtn.className = 'btn-audio-large';
        audioBtn.style.cssText = 'align-self:center;';
        audioBtn.innerHTML = '🔊 <span>' + (en ? 'Listen to the text' : 'Écouter le texte') + '</span>';
        audioBtn.onclick = () => AudioEngine.play(item.text, false, this.currentLang);
        container.appendChild(audioBtn);

        const qZone = document.createElement('div');
        qZone.id = 'comp-question-zone';
        qZone.style.cssText = 'display:flex;flex-direction:column;gap:12px;margin-top:6px;';
        container.appendChild(qZone);

        area.appendChild(container);

        this.compQuestions = item.questions;
        this.compIndex = 0;
        this._renderCompQuestion();
    },

    _renderCompQuestion() {
        const zone = document.getElementById('comp-question-zone');
        if (!zone) return;
        zone.innerHTML = '';
        // L'aide se réévalue par question.
        this.itemErrorCount = 0;
        this.assisted = false;

        const q = this.compQuestions[this.compIndex];
        const total = this.compQuestions.length;

        const counter = document.createElement('div');
        counter.textContent = `${this.currentLang === 'en' ? 'Question' : 'Question'} ${this.compIndex + 1}/${total}`;
        counter.style.cssText = 'font-size:14px;color:#94a3b8;font-weight:700;text-align:center;';
        zone.appendChild(counter);

        const qText = document.createElement('div');
        qText.textContent = q.q;
        qText.style.cssText = 'font-size:19px;font-weight:700;color:#1e293b;text-align:center;';
        zone.appendChild(qText);

        const shuffled = [...q.options].sort(() => Math.random() - 0.5);
        shuffled.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            btn.textContent = opt;
            btn.style.cssText = 'width:100%;padding:14px 16px;font-size:17px;border-radius:14px;';
            btn.onclick = () => this.handleCompChoice(opt, btn, q.correct);
            zone.appendChild(btn);
        });
    },

    handleCompChoice(choice, btn, correct) {
        if (this.isProcessing) return;

        if (choice === correct) {
            AudioEngine.vibrate('correct');
            btn.classList.add('correct');
            this.streak++;
            this.score += 10 + (this.streak * 2);
            this.showFeedback('✅');
            this.compIndex++;

            if (this.compIndex >= this.compQuestions.length) {
                this.isProcessing = true;
                if (!this.itemHasError) this.correctFirstTry++;
                setTimeout(() => this.praiseVoice(), 400);
                this.createParticles(btn);
                const total = this.currentLevel.items.length;
                document.getElementById('game-progress-fill').style.width = `${((this.currentItemIndex + 1) / total) * 100}%`;
                setTimeout(() => this.nextItem(), 1500);
            } else {
                // On verrouille pendant la transition pour éviter un double-clic.
                this.isProcessing = true;
                setTimeout(() => {
                    this.isProcessing = false;
                    this._renderCompQuestion();
                }, 700);
            }
        } else {
            AudioEngine.vibrate('error');
            btn.classList.add('wrong');
            this.streak = 0;
            this.itemHasError = true;
            this.itemErrorCount = (this.itemErrorCount || 0) + 1;
            this._autoAssist();
            this.showFeedback('❌');
            setTimeout(() => btn.classList.remove('wrong'), 700);
        }

        document.getElementById('current-score').textContent = this.score;
    },

    /* ===== JEU 9 : CHASSE AUX COQUILLES (TROUVE L'ERREUR) ===== */
    renderCoquille(item) {
        const area = document.getElementById('game-area');
        const en = this.currentLang === 'en';

        const container = document.createElement('div');
        container.className = 'coquille-container';
        container.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:20px;width:100%;max-width:520px;margin:0 auto;';

        const title = document.createElement('h3');
        title.textContent = en ? 'Tap the word with the mistake:' : 'Touche le mot qui contient une erreur :';
        title.style.cssText = 'font-size:20px;color:#475569;margin:0;font-weight:700;text-align:center;';
        container.appendChild(title);

        const sentenceDiv = document.createElement('div');
        sentenceDiv.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;justify-content:center;align-items:center;background:#f8fafc;border:1px solid #e2e8f0;border-radius:18px;padding:20px;';

        item.words.forEach((word, i) => {
            const chip = document.createElement('button');
            chip.textContent = word;
            chip.dataset.idx = i;
            chip.style.cssText = 'font-size:22px;font-weight:600;color:#1e293b;background:#ffffff;border:2px solid #e2e8f0;border-radius:12px;padding:8px 14px;cursor:pointer;transition:all 0.2s;';
            chip.onclick = () => this.handleCoquilleChoice(i, chip, item);
            sentenceDiv.appendChild(chip);
        });
        container.appendChild(sentenceDiv);

        if (item.hint) {
            const hintText = document.createElement('p');
            hintText.innerHTML = `💡 <em>${item.hint}</em>`;
            hintText.style.cssText = 'font-size:14px;color:#64748b;';
            container.appendChild(hintText);
        }

        area.appendChild(container);
    },

    handleCoquilleChoice(index, chip, item) {
        if (this.isProcessing) return;

        if (index === item.errorIndex) {
            this.isProcessing = true;
            AudioEngine.vibrate('correct');
            chip.textContent = item.correct;
            chip.style.background = '#10b981';
            chip.style.borderColor = '#10b981';
            chip.style.color = '#fff';

            if (!this.itemHasError) this.correctFirstTry++;
            this.streak++;
            this.score += 15 + (this.streak * 2);
            this.showFeedback('✅');
            setTimeout(() => this.praiseVoice(), 500);
            this.createParticles(chip);
            const total = this.currentLevel.items.length;
            document.getElementById('game-progress-fill').style.width = `${((this.currentItemIndex + 1) / total) * 100}%`;
            setTimeout(() => this.nextItem(), 1700);
        } else {
            AudioEngine.vibrate('error');
            chip.style.background = '#fef2f2';
            chip.style.borderColor = '#ef4444';
            chip.style.color = '#ef4444';
            this.streak = 0;
            this.itemHasError = true;
            this.itemErrorCount = (this.itemErrorCount || 0) + 1;
            this._autoAssist();
            this.showFeedback('❌');
            setTimeout(() => {
                chip.style.background = '#ffffff';
                chip.style.borderColor = '#e2e8f0';
                chip.style.color = '#1e293b';
            }, 800);
        }

        document.getElementById('current-score').textContent = this.score;
    },

    /* ===== JEU 10 : VOCABULAIRE EN CONTEXTE (SYNONYMES / DÉFINITIONS) ===== */
    renderVocab(item) {
        const area = document.getElementById('game-area');
        const en = this.currentLang === 'en';

        const container = document.createElement('div');
        container.className = 'vocab-container';
        container.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:20px;width:100%;max-width:480px;margin:0 auto;';

        const promptCard = document.createElement('div');
        promptCard.textContent = item.prompt;
        promptCard.style.cssText = 'font-size:24px;font-weight:700;color:#1e293b;background:#ffffff;padding:20px 24px;border-radius:18px;border:2px solid #e2e8f0;box-shadow:0 6px 20px rgba(0,0,0,0.05);text-align:center;width:100%;';
        container.appendChild(promptCard);

        const audioBtn = document.createElement('button');
        audioBtn.className = 'btn-audio-large';
        audioBtn.innerHTML = '🔊 <span>' + (en ? 'Listen' : 'Écouter') + '</span>';
        audioBtn.onclick = () => AudioEngine.play(item.prompt, false, this.currentLang);
        container.appendChild(audioBtn);

        const choicesDiv = document.createElement('div');
        choicesDiv.style.cssText = 'display:flex;flex-direction:column;gap:12px;width:100%;';

        const shuffled = [...item.options].sort(() => Math.random() - 0.5);
        shuffled.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            btn.textContent = opt;
            btn.style.cssText = 'width:100%;padding:14px 16px;font-size:18px;border-radius:14px;';
            btn.onclick = () => {
                AudioEngine.play(opt, false, this.currentLang);
                this.handleVocabChoice(opt, btn, item.correct);
            };
            choicesDiv.appendChild(btn);
        });
        container.appendChild(choicesDiv);

        area.appendChild(container);
    },

    handleVocabChoice(choice, btn, correct) {
        if (this.isProcessing) return;
        this.isProcessing = true;

        if (choice === correct) {
            AudioEngine.vibrate('correct');
            btn.classList.add('correct');
            if (!this.itemHasError) this.correctFirstTry++;
            this.streak++;
            this.score += 12 + (this.streak * 2);
            this.showFeedback('✅');
            setTimeout(() => this.praiseVoice(), 500);
            this.createParticles(btn);
            const total = this.currentLevel.items.length;
            document.getElementById('game-progress-fill').style.width = `${((this.currentItemIndex + 1) / total) * 100}%`;
            setTimeout(() => this.nextItem(), 1600);
        } else {
            AudioEngine.vibrate('error');
            btn.classList.add('wrong');
            this.streak = 0;
            this.itemHasError = true;
            this.itemErrorCount = (this.itemErrorCount || 0) + 1;
            this._autoAssist();
            this.showFeedback('❌');
            setTimeout(() => {
                btn.classList.remove('wrong');
                this.isProcessing = false;
            }, 800);
        }

        document.getElementById('current-score').textContent = this.score;
    },

    /* ===== TRANSITIONS ET RÉSULTATS ===== */
    nextItem() {
        const currentItem = this.currentLevel.items[this.currentItemIndex];
        if (this.itemHasError && currentItem) {
            this.errorItems.push(currentItem);
            // Mémorise les mots ratés (jamais effacé par les rondes de révision)
            // pour le bilan parlé de fin de niveau.
            if (typeof AITutor !== 'undefined') {
                const label = AITutor._itemLabel(currentItem);
                if (label && this.missedWords.indexOf(label) === -1) this.missedWords.push(label);
            }
        }

        this.currentItemIndex++;
        this.isProcessing = false;

        if (this.currentItemIndex >= this.currentLevel.items.length) {
            if (this.errorItems.length > 0 && !this.reviewRound) {
                this._startReviewRound();
            } else {
                this.endLevel();
            }
        } else {
            this.render();
        }
    },

    _startReviewRound() {
        this.reviewRound = true;
        const reviewItems = [...this.errorItems];
        this.errorItems = [];
        this.currentLevel = { ...this.currentLevel, items: reviewItems };
        this.currentItemIndex = 0;
        this.itemHasError = false;

        const area = document.getElementById('game-area');
        area.className = '';
        area.innerHTML = '';

        const banner = document.createElement('div');
        banner.style.cssText = 'text-align:center;animation:pop 0.5s;padding:40px';
        banner.innerHTML = `
            <div style="font-size:80px;margin-bottom:16px">🔁</div>
            <h2 style="font-size:28px;margin-bottom:8px">Révision !</h2>
            <p style="font-size:18px;color:#64748b">On s'exerce sur les plus difficiles !</p>
        `;
        area.appendChild(banner);
        if (typeof TutorEngine !== 'undefined') {
            TutorEngine.encourage(this.currentLang);
        } else {
            AudioEngine.play(this.currentLang === 'en' ? "Let's review!" : "On révise !", false, this.currentLang);
        }

        setTimeout(() => this.render(), 2500);
    },

    endLevel() {
        const en = this.currentLang === 'en';
        // On note la maîtrise sur le nombre de questions D'ORIGINE (les rondes de
        // révision ne doivent jamais faire dépasser 100 %).
        const total = this.originalTotal || this.currentLevel.items.length;
        const ratio = Math.min(1, this.correctFirstTry / total);
        let stars = 1;
        if (ratio >= 0.7) stars = 2;
        if (ratio >= 1.0) stars = 3;

        document.getElementById('game-progress-fill').style.width = '100%';

        const reward = (this.challengeMode
            ? ProfileManager.recordChallenge(this.currentProfile.id, this.score, stars, this.currentLang)
            : ProfileManager.recordLevelComplete(this.currentProfile.id, this.currentLevel.id, this.score, stars, this.currentLang)
        ) || {};

        const correct = Math.min(this.correctFirstTry, total);
        const percent = Math.round(ratio * 100);
        const area = document.getElementById('game-area');

        // Bandeaux de récompense (série de jours, nouveau rang, badges) pour
        // entretenir la motivation à long terme.
        let bonusHtml = '';
        if (reward.rankUp && reward.rank) {
            bonusHtml += `<div style="margin-top:14px;font-size:18px;font-weight:700;color:#6366f1">${reward.rank.emoji} ${en ? 'New rank' : 'Nouveau rang'} : ${reward.rank.name} !</div>`;
        }
        if (reward.streakDays && reward.streakDays > 1) {
            bonusHtml += `<div style="margin-top:8px;font-size:17px;font-weight:600;color:#f59e0b">🔥 ${reward.streakDays} ${en ? 'days in a row!' : 'jours d\'affilée !'}</div>`;
        }
        if (reward.newBadges && reward.newBadges.length) {
            const chips = reward.newBadges.map(b => `<span style="display:inline-flex;align-items:center;gap:4px;background:#fff;border:2px solid #fcd34d;border-radius:14px;padding:6px 12px;font-size:15px;font-weight:700;color:#92400e">${b.emoji} ${en ? b.nameEn : b.nameFr}</span>`).join(' ');
            bonusHtml += `<div style="margin-top:14px;font-size:15px;color:#475569;font-weight:700">${en ? 'New badge!' : 'Nouveau badge !'}</div><div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap;justify-content:center">${chips}</div>`;
        }
        if (this.challengeMode && reward.challengeBonus) {
            bonusHtml += `<div style="margin-top:12px;font-size:17px;font-weight:700;color:#10b981">🎁 ${en ? 'Daily bonus' : 'Bonus du jour'} : +${reward.challengeBonus} 🪙</div>`;
        }

        const titleTxt = this.challengeMode
            ? (en ? 'Daily challenge done!' : 'Défi du jour réussi !')
            : (en ? 'Level complete!' : 'Niveau complété !');
        const headEmoji = this.challengeMode ? '🎲' : '🏆';
        area.innerHTML = `
            <div style="text-align:center;animation:pop 0.5s">
                <div style="font-size:100px;margin-bottom:12px">${headEmoji}</div>
                <h2 style="font-size:32px;margin-bottom:10px">${titleTxt}</h2>
                <div style="font-size:50px;margin:16px 0">${'⭐'.repeat(stars)}${'☆'.repeat(3 - stars)}</div>
                <p style="font-size:22px;color:#475569">${correct}/${total} (${percent}%)</p>
                <p style="font-size:20px;color:#64748b;margin-top:8px">Score : ${this.score}</p>
                ${bonusHtml}
                <button class="btn-primary" style="margin-top:28px;font-size:24px;padding:14px 40px" onclick="exitGame()">${en ? 'Continue ➡' : 'Continuer ➡'}</button>
            </div>
        `;

        // La mascotte félicite l'enfant de vive voix. Si l'IA est activée, Léo
        // fait un vrai bilan personnalisé (points forts + mots à retravailler) ;
        // sinon, phrase fixe.
        if (typeof TutorEngine !== 'undefined') {
            const fixed = stars === 3
                ? (en ? 'Perfect! You are a true champion!' : 'Parfait ! Tu es un vrai champion !')
                : (en ? 'Well done, keep it up!' : 'Bien joué, continue comme ça !');
            const lang = this.currentLang;
            if (typeof AITutor !== 'undefined' && AITutor.isEnabled()) {
                const stats = { correct, total, percent, stars, errorWords: this.missedWords || [] };
                AITutor.levelSummary(stats, lang)
                    .then(txt => setTimeout(() => TutorEngine.say(txt || fixed, lang), 600))
                    .catch(() => setTimeout(() => TutorEngine.say(fixed, lang), 600));
            } else {
                setTimeout(() => TutorEngine.say(fixed, lang), 700);
            }
        }

        this.createConfetti();
    },

    // Différenciation : après 2 erreurs sur le même item, le tuteur propose
    // automatiquement un coup de pouce adapté au mini-jeu (surbrillance de la
    // bonne réponse, prononciation ralentie, amorce de mot...).
    _autoAssist() {
        if (this.assisted || (this.itemErrorCount || 0) < 2) return;
        this.assisted = true;
        const lang = this.currentLang;
        const item = this.currentLevel.items[this.currentItemIndex];
        const glow = (predicate) => {
            document.querySelectorAll('#game-area .choice-btn, #game-area .match-card, #game-area .syllable-btn')
                .forEach(b => { if (predicate((b.textContent || '').trim())) b.classList.add('hint-glow'); });
        };

        switch (this.currentGame) {
            case 'complete': {
                const exp = item.correct !== undefined ? item.correct : item.target[item.missing];
                glow(t => t === exp);
                AudioEngine.speakSlow(item.hint || item.target, lang);
                break;
            }
            case 'match':
                glow(t => t === item.correct);
                AudioEngine.speakSlow(item.correct, lang);
                break;
            case 'vocab':
            case 'accord':
                glow(t => t === item.correct);
                break;
            case 'comprehension': {
                const q = this.compQuestions && this.compQuestions[this.compIndex];
                if (q) glow(t => t === q.correct);
                break;
            }
            case 'syllable': {
                const next = this.syllableSequence[this.currentSyllableIndex];
                glow(t => t === next);
                break;
            }
            case 'pronounce':
                AudioEngine.speakSlow(item.word || item.target, lang);
                break;
            case 'dictation': {
                const inp = document.getElementById('dictation-input');
                const word = String(item.word || item.target || '');
                if (inp) inp.placeholder = word.slice(0, Math.ceil(word.length / 3)) + '…';
                AudioEngine.speakSlow(word, lang);
                break;
            }
            case 'morpho': {
                const seg = this.morphoSegments[this.morphoIndex];
                const labels = lang === 'en'
                    ? { prefix: 'Prefix', radical: 'Root', suffix: 'Suffix' }
                    : { prefix: 'Préfixe', radical: 'Radical', suffix: 'Suffixe' };
                if (seg) glow(t => t === labels[seg.type]);
                break;
            }
            case 'coquille': {
                const chip = document.querySelector('#game-area [data-idx="' + item.errorIndex + '"]');
                if (chip) chip.classList.add('hint-glow');
                break;
            }
        }

        if (typeof TutorEngine !== 'undefined') {
            TutorEngine.show(lang === 'en' ? 'Here is a little hint! 💡' : 'Voici un petit indice ! 💡');
        }
    },

    // Félicitation parlée VARIÉE (anti-lassitude) via la mascotte.
    praiseVoice() {
        if (typeof TutorEngine !== 'undefined') {
            TutorEngine.cheer(this.currentLang);
        } else {
            AudioEngine.play(this.currentLang === 'en' ? 'Great!' : 'Super !', false, this.currentLang);
        }
    },

    showFeedback(emoji) {
        const overlay = document.getElementById('feedback-overlay');
        overlay.innerHTML = `<div class="feedback-emoji">${emoji}</div>`;
        setTimeout(() => overlay.innerHTML = '', 1000);
    },

    createParticles(element) {
        const elemRect = element.getBoundingClientRect();
        const gameArea = document.getElementById('game-area');
        const gameRect = gameArea.getBoundingClientRect();

        const cx = elemRect.left + elemRect.width / 2 - gameRect.left;
        const cy = elemRect.top + elemRect.height / 2 - gameRect.top;

        for (let i = 0; i < 10; i++) {
            const p = document.createElement('div');
            p.style.cssText = `
                position:absolute;
                width:12px;height:12px;
                border-radius:50%;
                background:hsl(${Math.random() * 360},80%,60%);
                left:${cx}px;
                top:${cy}px;
                pointer-events:none;
                z-index:200;
            `;
            gameArea.appendChild(p);

            const angle = (Math.PI * 2 * i) / 10;
            const dist = 80 + Math.random() * 60;
            p.animate([
                { transform: 'translate(0,0) scale(1)', opacity: 1 },
                { transform: `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px) scale(0)`, opacity: 0 }
            ], { duration: 800, easing: 'ease-out' }).onfinish = () => p.remove();
        }
    },

    createConfetti() {
        for (let i = 0; i < 40; i++) {
            const c = document.createElement('div');
            c.className = 'confetti';
            c.style.left = Math.random() * 100 + '%';
            c.style.background = `hsl(${Math.random() * 360},80%,60%)`;
            c.style.animationDelay = Math.random() * 2 + 's';
            c.style.animationDuration = (Math.random() * 2 + 2) + 's';
            document.body.appendChild(c);
            setTimeout(() => c.remove(), 5000);
        }
    }
};
