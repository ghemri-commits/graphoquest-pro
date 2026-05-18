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

    init(profile, levelId, gameType) {
        this.currentProfile = profile;
        this.currentLang = profile.lang === 'both' ? 'fr' : profile.lang;
        const data = getGameData(this.currentLang);
        this.currentLevel = data.levels.find(l => l.id === levelId);
        this.currentGame = gameType || this.currentLevel.miniGame;
        this.currentItemIndex = 0;
        this.score = 0;
        this.stars = 0;
        this.streak = 0;
        this.isProcessing = false;
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

        if (this.currentGame === 'complete') {
            area.classList.add('mg-complete');
            this.renderComplete(item);
        } else if (this.currentGame === 'match') {
            area.classList.add('mg-match');
            this.renderMatch(item);
        } else if (this.currentGame === 'syllable') {
            area.classList.add('mg-syllable');
            this.renderSyllable(item);
        }
    },

    renderComplete(item) {
        const area = document.getElementById('game-area');

        // correctAnswer may be multi-char (e.g. "PH", "UN")
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
                slot.textContent = '?';
                slot.id = 'missing-slot';
                wordDiv.appendChild(slot);
                i += missingLen; // skip multi-char answer
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
        audioBtn.className = 'btn-icon';
        audioBtn.style.cssText = 'width:70px;height:70px;font-size:32px;margin-bottom:20px;';
        audioBtn.textContent = '🔊';
        audioBtn.onclick = () => this.speak(item.hint || item.target);
        area.appendChild(audioBtn);

        const choicesDiv = document.createElement('div');
        choicesDiv.className = 'choices-row';

        const shuffled = [...item.options].sort(() => Math.random() - 0.5);
        shuffled.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            btn.textContent = opt;
            btn.onclick = () => this.handleCompleteChoice(opt, btn);
            choicesDiv.appendChild(btn);
        });
        area.appendChild(choicesDiv);
    },

    handleCompleteChoice(choice, btn) {
        if (this.isProcessing) return;
        this.isProcessing = true;

        const item = this.currentLevel.items[this.currentItemIndex];
        // Support explicit correct field for multi-char answers (digraphs, prefixes)
        const expected = item.correct !== undefined ? item.correct : item.target[item.missing];
        const slot = document.getElementById('missing-slot');
        const isCorrect = choice === expected;

        if (isCorrect) {
            slot.textContent = choice;
            slot.classList.remove('missing');
            slot.classList.add('filled');
            btn.classList.add('correct');

            this.streak++;
            const points = 10 + (this.streak * 2);
            this.score += points;
            this.showFeedback('✅');
            this.speak('Bravo !');
            this.createParticles(btn);

            setTimeout(() => this.nextItem(), 1200);
        } else {
            btn.classList.add('wrong');
            slot.classList.add('error');
            this.streak = 0;
            this.showFeedback('❌');
            this.speak('Essaie encore');

            setTimeout(() => {
                btn.classList.remove('wrong');
                slot.classList.remove('error');
                this.isProcessing = false;
            }, 800);
        }

        document.getElementById('current-score').textContent = this.score;
    },

    renderMatch(item) {
        const area = document.getElementById('game-area');

        const container = document.createElement('div');
        container.className = 'match-container';

        const target = document.createElement('div');
        target.className = 'match-target';
        target.textContent = item.target;
        container.appendChild(target);

        const audioBtn = document.createElement('button');
        audioBtn.className = 'btn-icon';
        audioBtn.style.cssText = 'width:70px;height:70px;font-size:32px;';
        audioBtn.textContent = '🔊';
        audioBtn.onclick = () => this.speak(item.sound || item.correct);
        container.appendChild(audioBtn);

        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'match-options';

        const shuffled = [...item.options].sort(() => Math.random() - 0.5);
        shuffled.forEach(opt => {
            const card = document.createElement('button');
            card.className = 'match-card';
            card.innerHTML = `<div class="match-word">${opt}</div>`;
            card.onclick = () => this.handleMatchChoice(opt, card, item.correct);
            optionsDiv.appendChild(card);
        });
        container.appendChild(optionsDiv);

        area.appendChild(container);
    },

    handleMatchChoice(choice, card, correct) {
        if (this.isProcessing) return;
        this.isProcessing = true;

        if (choice === correct) {
            card.classList.add('correct');
            this.streak++;
            this.score += 10 + (this.streak * 2);
            this.showFeedback('✅');
            this.speak('Excellent !');
            this.createParticles(card);
            setTimeout(() => this.nextItem(), 1200);
        } else {
            card.classList.add('wrong');
            this.streak = 0;
            this.showFeedback('❌');
            this.speak('Non, réessaie');
            setTimeout(() => {
                card.classList.remove('wrong');
                this.isProcessing = false;
            }, 800);
        }

        document.getElementById('current-score').textContent = this.score;
    },

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
        wordDiv.textContent = '...';
        container.appendChild(wordDiv);

        const audioBtn = document.createElement('button');
        audioBtn.className = 'btn-icon';
        audioBtn.style.cssText = 'width:60px;height:60px;font-size:28px;';
        audioBtn.textContent = '🔊';
        audioBtn.onclick = () => this.speak(item.word);
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
            btn.onclick = () => this.handleSyllableChoice(part, btn);
            partsDiv.appendChild(btn);
        });
        container.appendChild(partsDiv);

        area.appendChild(container);
    },

    handleSyllableChoice(part, btn) {
        if (this.isProcessing) return;

        const expected = this.syllableSequence[this.currentSyllableIndex];

        if (part === expected) {
            btn.classList.add('selected');
            btn.disabled = true;

            const built = this.syllableSequence.slice(0, this.currentSyllableIndex + 1).join('');
            document.getElementById('built-word').textContent = built;

            this.currentSyllableIndex++;

            if (this.currentSyllableIndex >= this.syllableSequence.length) {
                this.isProcessing = true;
                this.streak++;
                this.score += 15 + (this.streak * 3);
                this.showFeedback('🌟');
                this.speak('Génial !');

                document.querySelectorAll('.syllable-btn').forEach(b => {
                    if (!b.disabled) b.classList.add('correct');
                });

                setTimeout(() => this.nextItem(), 1500);
            }
        } else {
            btn.classList.add('wrong');
            this.streak = 0;
            this.showFeedback('❌');
            this.speak('Presque !');
            setTimeout(() => btn.classList.remove('wrong'), 600);
        }

        document.getElementById('current-score').textContent = this.score;
    },

    nextItem() {
        this.currentItemIndex++;
        this.isProcessing = false;

        if (this.currentItemIndex >= this.currentLevel.items.length) {
            this.endLevel();
        } else {
            this.render();
        }
    },

    endLevel() {
        const maxScore = this.currentLevel.items.length * 20;
        const ratio = this.score / maxScore;
        let stars = 1;
        if (ratio > 0.5) stars = 2;
        if (ratio > 0.8) stars = 3;

        ProfileManager.recordLevelComplete(
            this.currentProfile.id,
            this.currentLevel.id,
            this.score,
            stars,
            this.currentLang
        );

        const area = document.getElementById('game-area');
        area.innerHTML = `
            <div style="text-align:center;animation:pop 0.5s">
                <div style="font-size:100px;margin-bottom:20px">🏆</div>
                <h2 style="font-size:32px;margin-bottom:10px">Niveau terminé !</h2>
                <div style="font-size:50px;margin:20px 0">${'⭐'.repeat(stars)}${'☆'.repeat(3 - stars)}</div>
                <p style="font-size:24px;color:#666">Score : ${this.score}</p>
                <button class="btn-primary" style="margin-top:30px" onclick="exitGame()">Continuer ➡</button>
            </div>
        `;
        this.createConfetti();
    },

    showFeedback(emoji) {
        const overlay = document.getElementById('feedback-overlay');
        overlay.innerHTML = `<div class="feedback-emoji">${emoji}</div>`;
        setTimeout(() => overlay.innerHTML = '', 1000);
    },

    speak(text) {
        if (!window.speechSynthesis) return;
        // Cancel any pending speech before queuing a new one
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = this.currentProfile.lang === 'en' ? 'en-GB' : 'fr-FR';
        utter.rate = 0.8;
        window.speechSynthesis.speak(utter);
    },

    createParticles(element) {
        const elemRect = element.getBoundingClientRect();
        const gameArea = document.getElementById('game-area');
        const gameRect = gameArea.getBoundingClientRect();

        // Use coordinates relative to game-area (which is position:relative)
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
