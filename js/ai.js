// ============================================================
// AITutor — Le cerveau IA de Léo le renard.
// Relie la mascotte à un vrai modèle de langage (Google Gemini
// ou OpenAI). La clé API est saisie par le parent dans l'espace
// parents ; rien ne fonctionne sans clé (Léo retombe alors sur
// ses phrases fixes). Tout est pensé pour le primaire : réponses
// courtes, gentilles, sûres, lues à voix haute.
// ============================================================
const AITutor = {
    // ---- Clés API (gérées depuis le portail parental) ----
    getGeminiKey() { return (localStorage.getItem('gq_gemini_key') || '').trim(); },
    setGeminiKey(k) { localStorage.setItem('gq_gemini_key', (k || '').trim()); },
    getOpenAIKey() { return (localStorage.getItem('gq_openai_key') || '').trim(); },
    setOpenAIKey(k) { localStorage.setItem('gq_openai_key', (k || '').trim()); },

    isEnabled() { return !!(this.getGeminiKey() || this.getOpenAIKey()); },
    // Gemini est préféré (niveau gratuit) ; sinon OpenAI.
    provider() {
        if (this.getGeminiKey()) return 'gemini';
        if (this.getOpenAIKey()) return 'openai';
        return null;
    },

    _busy: false,
    _history: [],
    resetSession() { this._history = []; },

    // ---- Contexte enfant pour personnaliser le tuteur ----
    _profile() { try { return ProfileManager.getCurrent(); } catch (e) { return null; } },
    _childContext(lang) {
        const p = this._profile() || {};
        const en = lang === 'en';
        const name = p.name || (en ? 'the child' : "l'enfant");
        const age = p.age || 7;
        return en
            ? `The child's first name is ${name}, age ${age}.`
            : `Le prénom de l'enfant est ${name}, âge ${age} ans.`;
    },

    _systemPrompt(lang) {
        const en = lang === 'en';
        return en
            ? `You are Léo, a kind little fox who tutors a primary-school child learning to read and spell. `
              + `Speak warmly, simply and VERY briefly (1 to 3 short sentences) because your words are read aloud. `
              + `Always be encouraging and positive, and VARY your polite phrases (hello, well done, thank you, see you soon…) so you never sound repetitive. `
              + `Only talk about reading, spelling, words, sounds, school and this learning game. `
              + `If asked anything unsafe, scary, personal or off-topic, gently bring the child back to learning. `
              + `Never ask for or repeat personal information. Answer in simple English a child understands.`
            : `Tu es Léo, un gentil petit renard qui aide un enfant du primaire à apprendre à lire et à écrire. `
              + `Parle avec chaleur, simplement et TRÈS brièvement (1 à 3 courtes phrases) car tes mots sont lus à voix haute. `
              + `Sois toujours encourageant et positif, et VARIE tes formules de politesse (bonjour, bravo, merci, à bientôt, s'il te plaît…) pour ne jamais te répéter. `
              + `Parle uniquement de lecture, d'orthographe, de mots, de sons, d'école et de ce jeu éducatif. `
              + `Si on te demande quelque chose de dangereux, effrayant, personnel ou hors sujet, ramène gentiment l'enfant vers l'apprentissage. `
              + `Ne demande jamais et ne répète jamais d'informations personnelles. Réponds en français du Québec, simple pour un enfant.`;
    },

    // ---- Appel bas niveau (routage Gemini / OpenAI) ----
    async _complete(systemText, userText, { json = false, maxTokens = 200 } = {}) {
        const provider = this.provider();
        if (!provider) throw new Error('no-key');
        return provider === 'gemini'
            ? this._gemini(systemText, userText, json, maxTokens)
            : this._openai(systemText, userText, json, maxTokens);
    },

    async _gemini(systemText, userText, json, maxTokens) {
        const key = this.getGeminiKey();
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(key)}`;
        const body = {
            system_instruction: { parts: [{ text: systemText }] },
            contents: [{ role: 'user', parts: [{ text: userText }] }],
            generationConfig: {
                temperature: 0.85,
                maxOutputTokens: maxTokens,
                ...(json ? { responseMimeType: 'application/json' } : {})
            }
        };
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (!res.ok) throw new Error('gemini ' + res.status);
        const data = await res.json();
        const text = (data.candidates && data.candidates[0] && data.candidates[0].content
            && data.candidates[0].content.parts || []).map(p => p.text || '').join('');
        return (text || '').trim();
    },

    async _openai(systemText, userText, json, maxTokens) {
        const key = this.getOpenAIKey();
        const body = {
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemText },
                { role: 'user', content: userText }
            ],
            temperature: 0.85,
            max_tokens: maxTokens,
            ...(json ? { response_format: { type: 'json_object' } } : {})
        };
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key },
            body: JSON.stringify(body)
        });
        if (!res.ok) throw new Error('openai ' + res.status);
        const data = await res.json();
        return ((data.choices && data.choices[0] && data.choices[0].message
            && data.choices[0].message.content) || '').trim();
    },

    // ============================================================
    // FONCTIONS DU TUTEUR
    // ============================================================

    // 1) « Aide-moi » : un indice pour la question en cours, SANS donner
    //    directement la réponse.
    async hint(item, gameType, lang) {
        const answer = this._itemLabel(item);
        const en = lang === 'en';
        const user = this._childContext(lang) + ' '
            + (en
                ? `The child is doing a "${gameType}" exercise. The target word/answer is "${answer}". `
                  + `Give ONE short, playful clue to help them find it WITHOUT saying the full word: hint at the first sound, the number of syllables, or its meaning.`
                : `L'enfant fait un exercice de type « ${gameType} ». Le mot ou la réponse à trouver est « ${answer} ». `
                  + `Donne UN seul indice court et amusant pour l'aider à le trouver SANS dire le mot en entier : suggère le premier son, le nombre de syllabes, ou ce que le mot veut dire.`);
        return this._complete(this._systemPrompt(lang), user, { maxTokens: 120 });
    },

    // 2) Chat libre : l'enfant pose une question, Léo répond (court historique).
    async chat(userText, lang) {
        const clean = (userText || '').toString().slice(0, 300);
        this._history.push({ role: 'child', text: clean });
        const en = lang === 'en';
        const convo = this._history.slice(-6)
            .map(m => (m.role === 'child' ? (en ? 'Child: ' : 'Enfant : ') : 'Léo : ') + m.text)
            .join('\n');
        const user = this._childContext(lang) + '\n' + convo + '\nLéo :';
        const reply = await this._complete(this._systemPrompt(lang), user, { maxTokens: 200 });
        this._history.push({ role: 'leo', text: reply });
        return reply;
    },

    // 3) Encouragements intelligents : on pré-génère un petit lot de phrases
    //    personnalisées au début du niveau (1 seul appel), pour ne pas
    //    ralentir chaque réponse. Léo puise ensuite dedans.
    async warmupEncouragements(lang) {
        if (!this.isEnabled()) return;
        const en = lang === 'en';
        const user = this._childContext(lang) + ' '
            + (en
                ? `Generate playful, VARIED short lines for THIS child, using their first name sometimes. `
                  + `Return ONLY JSON: {"praise":[6 cheerful lines for a correct answer, max 6 words each],"encourage":[4 gentle lines after a mistake, max 8 words each]}.`
                : `Génère des phrases courtes, amusantes et VARIÉES pour CET enfant, en utilisant parfois son prénom. `
                  + `Renvoie UNIQUEMENT du JSON : {"praise":[6 phrases joyeuses pour une bonne réponse, max 6 mots chacune],"encourage":[4 phrases douces après une erreur, max 8 mots chacune]}.`);
        try {
            const raw = await this._complete(this._systemPrompt(lang), user, { json: true, maxTokens: 320 });
            const data = JSON.parse(this._stripJson(raw));
            if (typeof TutorEngine !== 'undefined' && data && (data.praise || data.encourage)) {
                TutorEngine.setDynamicPhrases(data.praise, data.encourage, lang);
            }
        } catch (e) { /* on garde les phrases fixes */ }
    },

    // 4) Bilan parlé de fin de niveau.
    async levelSummary(stats, lang) {
        const en = lang === 'en';
        const errs = (stats.errorWords || []).slice(0, 6).join(', ');
        const user = this._childContext(lang) + ' '
            + (en
                ? `They just finished a level: ${stats.correct}/${stats.total} correct (${stats.percent}%), ${stats.stars} stars. `
                  + `Tricky words: ${errs || 'none'}. Give a warm 2-sentence spoken recap: praise the effort, then gently name 1-2 words or sounds to practice next time. Speak directly to the child.`
                : `Il ou elle vient de finir un niveau : ${stats.correct}/${stats.total} bonnes réponses (${stats.percent}%), ${stats.stars} étoiles. `
                  + `Mots difficiles : ${errs || 'aucun'}. Fais un bilan parlé de 2 phrases : félicite l'effort, puis nomme gentiment 1 ou 2 mots ou sons à retravailler la prochaine fois. Parle directement à l'enfant.`);
        return this._complete(this._systemPrompt(lang), user, { maxTokens: 180 });
    },

    // Petit test de connexion pour le portail parental.
    async testConnection(lang) {
        const en = lang === 'en';
        const user = en ? 'Say hello to the child in one short sentence.' : "Dis bonjour à l'enfant en une courte phrase.";
        return this._complete(this._systemPrompt(lang), user, { maxTokens: 60 });
    },

    // ---- Utilitaires ----
    _itemLabel(item) {
        if (!item) return '';
        if (item.word) return item.word;
        if (item.correct !== undefined && item.correct !== null) return item.correct;
        if (item.target !== undefined && item.target !== null) {
            if (typeof item.target === 'string') return item.target;
            if (item.missing !== undefined && item.target[item.missing] !== undefined) return item.target[item.missing];
        }
        if (item.text) return item.text;
        if (item.sentence) return item.sentence;
        return '';
    },

    // Gemini/OpenAI peuvent emballer le JSON dans ```json ... ``` ; on nettoie.
    _stripJson(raw) {
        return (raw || '').replace(/^```(?:json)?/i, '').replace(/```$/,'').trim();
    }
};
