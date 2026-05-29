function getGameData(lang) {
    // ALIGNEMENT PROGRAMME QUÉBÉCOIS (PFEQ) & LISTE ORTHOGRAPHIQUE DU MINISTÈRE (MEQ)
    const dataFR = [
        // ==========================================
        // CYCLE 1 : Éveiller et décoder (5 à 8 ans - 1re et 2e année)
        // Focus : Correspondance graphème-phonème, syllabes simples, vocabulaire de base.
        // ==========================================
        {
            id: 1, cycle: 1, cycleName: '1er Cycle - Niveau A', miniGame: 'match', items: [
                { target: 'A', correct: 'a', options: ['a', 'o', 'e', 'u'], sound: 'a' },
                { target: 'O', correct: 'o', options: ['a', 'o', 'u', 'i'], sound: 'o' },
                { target: 'I', correct: 'i', options: ['e', 'i', 'a', 'y'], sound: 'i' },
                { target: 'U', correct: 'u', options: ['u', 'o', 'e', 'a'], sound: 'u' },
                { target: 'É', correct: 'é', options: ['e', 'é', 'a', 'i'], sound: 'é' }
            ]
        },
        {
            id: 2, cycle: 1, cycleName: '1er Cycle - Niveau A', miniGame: 'complete', items: [
                { target: 'M_TO', missing: 1, correct: 'O', options: ['O', 'A', 'I', 'U'], hint: 'Moto' },
                { target: 'V_LO', missing: 1, correct: 'É', options: ['E', 'É', 'A', 'I'], hint: 'Vélo' },
                { target: 'L_T', missing: 1, correct: 'I', options: ['A', 'O', 'I', 'U'], hint: 'Lit' },
                { target: 'J_S', missing: 1, correct: 'U', options: ['O', 'U', 'I', 'A'], hint: 'Jus' }
            ]
        },
        {
            id: 3, cycle: 1, cycleName: '1er Cycle - Niveau B', miniGame: 'syllable', items: [
                { target: 'a-mi', parts: ['a', 'mi', 'ma', 'li'], word: 'Ami' },
                { target: 'lu-ne', parts: ['lu', 'ne', 'le', 'nu'], word: 'Lune' },
                { target: 'ro-be', parts: ['ro', 'be', 'ra', 'de'], word: 'Robe' }
            ]
        },
        {
            id: 4, cycle: 1, cycleName: '1er Cycle - Niveau B', miniGame: 'pronounce', items: [
                { target: 'maman', word: 'maman', hint: 'La maman' },
                { target: 'chat', word: 'chat', hint: 'Un petit chat' },
                { target: 'ballon', word: 'ballon', hint: 'Le ballon rond' }
            ]
        },
        {
            id: 5, cycle: 1, cycleName: '1er Cycle - Niveau C', miniGame: 'complete', items: [
                { target: '_OURIS', missing: 0, correct: 'S', options: ['S', 'C', 'F', 'M'], hint: 'Souris' },
                { target: '_ION', missing: 0, correct: 'L', options: ['R', 'L', 'M', 'N'], hint: 'Lion' },
                { target: 'PO_ME', missing: 2, correct: 'M', options: ['N', 'M', 'P', 'L'], hint: 'Pomme' }
            ]
        },
        {
            id: 6, cycle: 1, cycleName: '1er Cycle - Niveau C', miniGame: 'dictation', items: [
                { target: 'école', word: 'école', hint: 'Lieu où on apprend' },
                { target: 'livre', word: 'livre', hint: 'On le lit le soir' },
                { target: 'table', word: 'table', hint: 'Pour poser son cahier' }
            ]
        },

        // ==========================================
        // CYCLE 2 : Consolider et Structurer (8 à 10 ans - 3e et 4e année)
        // Focus : Accords de base, sons complexes, dictées de mots du MEQ, morphologie.
        // ==========================================
        {
            id: 7, cycle: 2, cycleName: '2e Cycle - Niveau A', miniGame: 'complete', items: [
                { target: 'M_TON', missing: 1, correct: 'OU', options: ['ON', 'OU', 'OI', 'AU'], hint: 'Mouton' },
                { target: 'P_DA', missing: 1, correct: 'AN', options: ['EN', 'ON', 'AN', 'IN'], hint: 'Panda' },
                { target: 'L_PIN', missing: 1, correct: 'A', options: ['A', 'E', 'O', 'I'], hint: 'Lapin' }
            ]
        },
        {
            id: 8, cycle: 2, cycleName: '2e Cycle - Niveau A', miniGame: 'accord', items: [
                { sentence: 'Les petits chiens ___ dans le parc.', correct: 'jouent', options: ['joue', 'jouent'], hint: 'Accord du verbe au pluriel (ils)' },
                { sentence: 'Une pomme ___ est sur la table.', correct: 'verte', options: ['vert', 'verte'], hint: 'Accord de l\'adjectif féminin singulier' },
                { sentence: 'Ils ___ faim aujourd\'hui.', correct: 'ont', options: ['ont', 'on'], hint: 'Homophones ont/on' }
            ]
        },
        {
            id: 9, cycle: 2, cycleName: '2e Cycle - Niveau B', miniGame: 'dictation', items: [
                { target: 'maison', word: 'maison', hint: 'Notre lieu de vie' },
                { target: 'garçon', word: 'garçon', hint: 'Un jeune enfant masculin' },
                { target: 'soleil', word: 'soleil', hint: 'Il brille dans le ciel' }
            ]
        },
        {
            id: 10, cycle: 2, cycleName: '2e Cycle - Niveau B', miniGame: 'pronounce', items: [
                { target: 'oiseau', word: 'oiseau', hint: 'Il vole haut' },
                { target: 'grenouille', word: 'grenouille', hint: 'Elle saute dans l\'eau' },
                { target: 'campagne', word: 'campagne', hint: 'Loin de la ville' }
            ]
        },
        {
            id: 11, cycle: 2, cycleName: '2e Cycle - Niveau C', miniGame: 'accord', items: [
                { sentence: 'Ma ___ sœur aime lire des contes.', correct: 'grande', options: ['grand', 'grande', 'grandes'], hint: 'Adjectif modifiant sœur' },
                { sentence: 'Les voitures ___ roulent vite.', correct: 'bleues', options: ['bleu', 'bleue', 'bleues'], hint: 'Accord de l\'adjectif au pluriel' },
                { sentence: 'Tu ___ un beau dessin.', correct: 'fais', options: ['fait', 'fais', 'faire'], hint: 'Verbe faire avec tu' }
            ]
        },

        // ==========================================
        // CYCLE 3 : Maîtriser et Préparer le Ministère (10 à 12 ans - 5e et 6e année)
        // Focus : Accords complexes, homophones grammaticaux, vocabulaire avancé, fluidité.
        // ==========================================
        {
            id: 12, cycle: 3, cycleName: '3e Cycle - Niveau A', miniGame: 'accord', items: [
                { sentence: 'Ces histoires ___ sont passionnantes.', correct: 'écrites', options: ['écrit', 'écrite', 'écrites'], hint: 'Accord du participe passé employé comme adjectif' },
                { sentence: 'Le chat et le chien ___ ensemble.', correct: 'dorment', options: ['dort', 'dorment'], hint: 'Sujet pluriel composé' },
                { sentence: '___ gentils enfants écoutent bien.', correct: 'Ces', options: ['Ses', 'Ces', 'C\'est'], hint: 'Homophones ses/ces/c\'est' }
            ]
        },
        {
            id: 13, cycle: 3, cycleName: '3e Cycle - Niveau A', miniGame: 'dictation', items: [
                { target: 'gouvernement', word: 'gouvernement', hint: 'Structure dirigeant le Québec' },
                { target: 'bibliothèque', word: 'bibliothèque', hint: 'Lieu rempli de livres' },
                { target: 'apprentissage', word: 'apprentissage', hint: 'Action d\'apprendre' }
            ]
        },
        {
            id: 14, cycle: 3, cycleName: '3e Cycle - Niveau B', miniGame: 'pronounce', items: [
                { target: 'extraordinaire', word: 'extraordinaire', hint: 'Quelque chose de fantastique' },
                { target: 'philosophie', word: 'philosophie', hint: 'L\'amour de la sagesse' },
                { target: 'développement', word: 'développement', hint: 'La croissance de quelque chose' }
            ]
        },
        {
            id: 15, cycle: 3, cycleName: '3e Cycle - Niveau B', miniGame: 'accord', items: [
                { sentence: 'La clé de mes réussites ___ le travail.', correct: 'est', options: ['est', 'sont'], hint: 'Le sujet est "la clé", singulier' },
                { sentence: 'Des feuilles ___ par le vent volent loin.', correct: 'emportées', options: ['emporté', 'emportée', 'emportées'], hint: 'Accord avec "des feuilles" (féminin pluriel)' }
            ]
        },

        // ----- Mini-jeux avancés (Morphologie, Compréhension, Coquilles, Vocabulaire) -----
        {
            id: 16, cycle: 2, cycleName: '2e Cycle - Morphologie', miniGame: 'morpho', items: [
                { word: 'recommencer', segments: [{ text: 're', type: 'prefix' }, { text: 'commenc', type: 'radical' }, { text: 'er', type: 'suffix' }], hint: 'Préfixe + radical + terminaison' },
                { word: 'malheureux', segments: [{ text: 'mal', type: 'prefix' }, { text: 'heur', type: 'radical' }, { text: 'eux', type: 'suffix' }], hint: 'Le contraire de heureux' },
                { word: 'chanteuse', segments: [{ text: 'chant', type: 'radical' }, { text: 'euse', type: 'suffix' }], hint: 'Celle qui chante' }
            ]
        },
        {
            id: 17, cycle: 3, cycleName: '3e Cycle - Compréhension', miniGame: 'comprehension', items: [
                {
                    text: "Léa habite à Québec. Chaque matin, elle marche jusqu'à l'école avec son chien Filou. En hiver, la neige recouvre les trottoirs et Léa met sa grosse tuque rouge pour rester au chaud.",
                    questions: [
                        { q: 'Où habite Léa ?', options: ['À Montréal', 'À Québec', 'À Gatineau'], correct: 'À Québec' },
                        { q: 'Avec qui marche-t-elle vers l\'école ?', options: ['Son chat', 'Son chien', 'Sa sœur'], correct: 'Son chien' },
                        { q: 'Que met Léa en hiver ?', options: ['Une tuque rouge', 'Un chapeau bleu', 'Des lunettes'], correct: 'Une tuque rouge' }
                    ]
                }
            ]
        },
        {
            id: 18, cycle: 3, cycleName: '3e Cycle - Chasse aux coquilles', miniGame: 'coquille', items: [
                { words: ['Les', 'oiseau', 'chantent', 'dans', 'l\'arbre.'], errorIndex: 1, correct: 'oiseaux', hint: 'Pluriel du nom' },
                { words: ['Elle', 'mange', 'une', 'pome', 'rouge.'], errorIndex: 3, correct: 'pomme', hint: 'Orthographe du fruit' },
                { words: ['Nous', 'allon', 'à', 'la', 'piscine.'], errorIndex: 1, correct: 'allons', hint: 'Terminaison du verbe avec « nous »' }
            ]
        },
        {
            id: 19, cycle: 3, cycleName: '3e Cycle - Vocabulaire', miniGame: 'vocab', items: [
                { prompt: 'Trouve le synonyme de « content »', options: ['triste', 'heureux', 'fâché', 'fatigué'], correct: 'heureux' },
                { prompt: 'Trouve le contraire de « grand »', options: ['petit', 'gros', 'long', 'haut'], correct: 'petit' },
                { prompt: 'Que veut dire « rapide » ?', options: ['lent', 'vite', 'lourd', 'calme'], correct: 'vite' }
            ]
        }
    ];

    const dataEN = [
        // ==========================================
        // ONTARIO LANGUAGE CURRICULUM (Grades 1-6)
        // Cycle 1 = Grades 1-2 · Cycle 2 = Grades 3-4 · Cycle 3 = Grades 5-6
        // Strands: Foundations of Language, Comprehension, Composition.
        // ==========================================

        // ----- CYCLE 1 · Grades 1-2 : Foundations (phonics, decoding, HF words) -----
        {
            id: 1, cycle: 1, cycleName: 'Grades 1-2 · Sounds', miniGame: 'match', items: [
                { target: 'A', correct: 'a', options: ['a', 'e', 'o', 'u'], sound: 'a' },
                { target: 'E', correct: 'e', options: ['a', 'e', 'i', 'u'], sound: 'e' },
                { target: 'I', correct: 'i', options: ['e', 'i', 'a', 'o'], sound: 'i' },
                { target: 'O', correct: 'o', options: ['u', 'o', 'a', 'e'], sound: 'o' },
                { target: 'U', correct: 'u', options: ['o', 'u', 'e', 'a'], sound: 'u' }
            ]
        },
        {
            id: 2, cycle: 1, cycleName: 'Grades 1-2 · Building Words', miniGame: 'complete', items: [
                { target: 'C_T', missing: 1, correct: 'A', options: ['A', 'O', 'E', 'I'], hint: 'Cat' },
                { target: 'D_G', missing: 1, correct: 'O', options: ['A', 'O', 'U', 'E'], hint: 'Dog' },
                { target: 'P_G', missing: 1, correct: 'I', options: ['E', 'I', 'A', 'U'], hint: 'Pig' },
                { target: 'S_N', missing: 1, correct: 'U', options: ['U', 'O', 'A', 'E'], hint: 'Sun' },
                { target: 'B_D', missing: 1, correct: 'E', options: ['E', 'A', 'I', 'O'], hint: 'Bed' }
            ]
        },
        {
            id: 3, cycle: 1, cycleName: 'Grades 1-2 · Syllables', miniGame: 'syllable', items: [
                { target: 'ap-ple', parts: ['ap', 'ple', 'ab', 'pe'], word: 'Apple' },
                { target: 'ig-loo', parts: ['ig', 'loo', 'ic', 'lou'], word: 'Igloo' },
                { target: 'rab-bit', parts: ['rab', 'bit', 'rap', 'bet'], word: 'Rabbit' },
                { target: 'pen-cil', parts: ['pen', 'cil', 'pan', 'sel'], word: 'Pencil' }
            ]
        },
        {
            id: 4, cycle: 1, cycleName: 'Grades 1-2 · Read Aloud', miniGame: 'pronounce', items: [
                { target: 'sun', word: 'sun', hint: 'It shines bright' },
                { target: 'fish', word: 'fish', hint: 'It swims in water' },
                { target: 'cat', word: 'cat', hint: 'A furry pet' },
                { target: 'ball', word: 'ball', hint: 'You throw it' },
                { target: 'dog', word: 'dog', hint: 'It barks' }
            ]
        },
        {
            id: 5, cycle: 1, cycleName: 'Grades 1-2 · Digraphs', miniGame: 'match', items: [
                { target: 'SH', correct: 'sh', options: ['ch', 'sh', 'th', 'wh'], sound: 'sh' },
                { target: 'CH', correct: 'ch', options: ['sh', 'ch', 'tch', 'c'], sound: 'ch' },
                { target: 'TH', correct: 'th', options: ['f', 'th', 'v', 't'], sound: 'th' },
                { target: 'WH', correct: 'wh', options: ['w', 'wh', 'h', 'vh'], sound: 'wh' },
                { target: 'CK', correct: 'ck', options: ['k', 'ck', 'c', 'kc'], sound: 'ck' }
            ]
        },
        {
            id: 6, cycle: 1, cycleName: 'Grades 1-2 · Spelling', miniGame: 'dictation', items: [
                { target: 'cat', word: 'cat', hint: 'A furry pet' },
                { target: 'sun', word: 'sun', hint: 'It lights the day' },
                { target: 'bed', word: 'bed', hint: 'You sleep in it' },
                { target: 'hat', word: 'hat', hint: 'You wear it on your head' },
                { target: 'dog', word: 'dog', hint: 'A loyal pet' }
            ]
        },

        // ----- CYCLE 2 · Grades 3-4 : Word study, blends, grammar, fluency -----
        {
            id: 7, cycle: 2, cycleName: 'Grades 3-4 · Blends', miniGame: 'complete', items: [
                { target: '_LACK', missing: 0, correct: 'BL', options: ['PL', 'BL', 'CL', 'GL'], hint: 'Black' },
                { target: '_LOCK', missing: 0, correct: 'CL', options: ['GL', 'CL', 'FL', 'PL'], hint: 'Clock' },
                { target: '_OG', missing: 0, correct: 'FR', options: ['FR', 'TR', 'BR', 'CR'], hint: 'Frog' },
                { target: '_EE', missing: 0, correct: 'TR', options: ['TR', 'FR', 'DR', 'PR'], hint: 'Tree' },
                { target: '_AR', missing: 0, correct: 'ST', options: ['ST', 'SP', 'SC', 'SM'], hint: 'Star' }
            ]
        },
        {
            id: 8, cycle: 2, cycleName: 'Grades 3-4 · Grammar', miniGame: 'accord', items: [
                { sentence: 'The happy dogs ___ in the yard.', correct: 'run', options: ['run', 'runs'], hint: 'Plural subject agreement' },
                { sentence: 'She ___ her homework every day.', correct: 'does', options: ['do', 'does'], hint: 'Third person singular' },
                { sentence: 'They ___ playing outside.', correct: 'are', options: ['is', 'are'], hint: 'Plural of the verb « be »' },
                { sentence: 'Yesterday we ___ to the park.', correct: 'went', options: ['go', 'went'], hint: 'Past tense of « go »' }
            ]
        },
        {
            id: 9, cycle: 2, cycleName: 'Grades 3-4 · Spelling', miniGame: 'dictation', items: [
                { target: 'because', word: 'because', hint: 'It gives a reason' },
                { target: 'friend', word: 'friend', hint: 'Someone you play with' },
                { target: 'school', word: 'school', hint: 'Where you learn' },
                { target: 'water', word: 'water', hint: 'You drink it' },
                { target: 'every', word: 'every', hint: 'Each and all' }
            ]
        },
        {
            id: 10, cycle: 2, cycleName: 'Grades 3-4 · Word Parts', miniGame: 'morpho', items: [
                { word: 'unhappy', segments: [{ text: 'un', type: 'prefix' }, { text: 'happy', type: 'radical' }], hint: 'The opposite of happy' },
                { word: 'teacher', segments: [{ text: 'teach', type: 'radical' }, { text: 'er', type: 'suffix' }], hint: 'A person who teaches' },
                { word: 'replaying', segments: [{ text: 're', type: 'prefix' }, { text: 'play', type: 'radical' }, { text: 'ing', type: 'suffix' }], hint: 'Playing again' },
                { word: 'helpful', segments: [{ text: 'help', type: 'radical' }, { text: 'ful', type: 'suffix' }], hint: 'Full of help' },
                { word: 'redo', segments: [{ text: 're', type: 'prefix' }, { text: 'do', type: 'radical' }], hint: 'Do it again' }
            ]
        },
        {
            id: 11, cycle: 2, cycleName: 'Grades 3-4 · Fluency', miniGame: 'pronounce', items: [
                { target: 'elephant', word: 'elephant', hint: 'A big grey animal' },
                { target: 'butterfly', word: 'butterfly', hint: 'It has colourful wings' },
                { target: 'computer', word: 'computer', hint: 'A machine for typing' },
                { target: 'dinosaur', word: 'dinosaur', hint: 'It lived long ago' }
            ]
        },

        // ----- CYCLE 3 · Grades 5-6 : Comprehension, conventions, vocabulary -----
        {
            id: 12, cycle: 3, cycleName: 'Grades 5-6 · Homophones', miniGame: 'accord', items: [
                { sentence: 'I left ___ book at home.', correct: 'my', options: ['my', 'mine'], hint: 'Possessive before a noun' },
                { sentence: '___ going to win the game!', correct: "They're", options: ['Their', 'There', "They're"], hint: '« They are »' },
                { sentence: 'The dog wagged ___ tail.', correct: 'its', options: ['its', "it's"], hint: 'Possessive, no apostrophe' },
                { sentence: 'You did ___ best today.', correct: 'your', options: ['your', "you're"], hint: 'Possessive form' }
            ]
        },
        {
            id: 13, cycle: 3, cycleName: 'Grades 5-6 · Spelling', miniGame: 'dictation', items: [
                { target: 'government', word: 'government', hint: 'It leads a country' },
                { target: 'beautiful', word: 'beautiful', hint: 'Very pretty' },
                { target: 'separate', word: 'separate', hint: 'To keep apart' },
                { target: 'necessary', word: 'necessary', hint: 'Something you really need' },
                { target: 'environment', word: 'environment', hint: 'The natural world around us' }
            ]
        },
        {
            id: 14, cycle: 3, cycleName: 'Grades 5-6 · Comprehension', miniGame: 'comprehension', items: [
                {
                    text: 'Maya woke up early and looked out the window. The ground was white and the school bus was not moving. She smiled, put on her warmest coat, and ran outside to build a snowman with her brother.',
                    questions: [
                        { q: 'What was the weather like?', options: ['Sunny', 'Snowy', 'Rainy'], correct: 'Snowy' },
                        { q: 'Why was the bus not moving?', options: ['Because of the snow', 'It was broken', 'It was Sunday'], correct: 'Because of the snow' },
                        { q: 'How did Maya feel?', options: ['Sad', 'Happy', 'Angry'], correct: 'Happy' }
                    ]
                }
            ]
        },
        {
            id: 15, cycle: 3, cycleName: 'Grades 5-6 · Editing', miniGame: 'coquille', items: [
                { words: ['She', 'have', 'two', 'cats.'], errorIndex: 1, correct: 'has', hint: 'Verb agreement with « she »' },
                { words: ['The', 'childs', 'are', 'playing.'], errorIndex: 1, correct: 'children', hint: 'Irregular plural' },
                { words: ['We', 'goed', 'to', 'the', 'zoo.'], errorIndex: 1, correct: 'went', hint: 'Irregular past tense' },
                { words: ['He', 'dont', 'like', 'peas.'], errorIndex: 1, correct: "doesn't", hint: 'Contraction + agreement' }
            ]
        },
        {
            id: 16, cycle: 3, cycleName: 'Grades 5-6 · Vocabulary', miniGame: 'vocab', items: [
                { prompt: 'Synonym of « big »', options: ['small', 'large', 'tiny', 'thin'], correct: 'large' },
                { prompt: 'Opposite of « happy »', options: ['glad', 'sad', 'kind', 'fast'], correct: 'sad' },
                { prompt: 'What does « quick » mean?', options: ['slow', 'fast', 'heavy', 'quiet'], correct: 'fast' },
                { prompt: 'Synonym of « brave »', options: ['scared', 'courageous', 'weak', 'tired'], correct: 'courageous' }
            ]
        },
        {
            id: 17, cycle: 3, cycleName: 'Grades 5-6 · Vocabulary Aloud', miniGame: 'pronounce', items: [
                { target: 'vocabulary', word: 'vocabulary', hint: 'The words of a language' },
                { target: 'understanding', word: 'understanding', hint: 'The ability to comprehend' },
                { target: 'responsibility', word: 'responsibility', hint: 'A duty you take care of' },
                { target: 'communication', word: 'communication', hint: 'Sharing information' }
            ]
        }
    ];

    // --- Niveaux de dictée générés depuis la banque MEQ complète ---
    // Marqués "alwaysUnlocked" : ce sont des niveaux d'entraînement bonus,
    // accessibles dès que l'enfant atteint le cycle correspondant.
    function appendMeqDictation(levels, words, startId, isEn) {
        if (typeof MEQ_WORDS === 'undefined' || !words) return;
        let id = startId;
        const grades = { 1: 'Grades 1-2', 2: 'Grades 3-4', 3: 'Grades 5-6' };
        [1, 2, 3].forEach(cycleNum => {
            const bank = words['cycle' + cycleNum] || [];
            const frPrefix = cycleNum === 1 ? '1er' : cycleNum + 'e';
            for (let n = 0; n < 2; n++) {
                const slice = bank.slice(n * 5, n * 5 + 5);
                if (slice.length < 3) continue;
                levels.push({
                    id: id++,
                    cycle: cycleNum,
                    cycleName: isEn ? (grades[cycleNum] + ' · Word Practice') : (frPrefix + ' Cycle - Mots MEQ'),
                    miniGame: 'dictation',
                    alwaysUnlocked: true,
                    items: slice.map(w => ({ target: w, word: w }))
                });
            }
        });
    }
    if (lang === 'en') appendMeqDictation(dataEN, MEQ_WORDS && MEQ_WORDS.en, 18, true);
    else appendMeqDictation(dataFR, MEQ_WORDS && MEQ_WORDS.fr, 20, false);

    return { levels: lang === 'en' ? dataEN : dataFR };
}

// Construit un niveau de dictée DYNAMIQUE pour le Défi du jour, à partir de la
// banque MEQ. Le tirage est déterministe selon la date (mêmes mots toute la
// journée) et adapté à l'âge de l'enfant.
function buildDailyChallenge(profile, dateStr) {
    const lang = profile.lang === 'en' ? 'en' : 'fr';
    if (typeof MEQ_WORDS === 'undefined' || !MEQ_WORDS[lang]) return null;

    const age = parseInt(profile.age) || 8;
    let cycles = ['cycle1'];
    if (age >= 9) cycles.push('cycle2');
    if (age >= 11) cycles.push('cycle3');

    const pool = [];
    cycles.forEach(c => (MEQ_WORDS[lang][c] || []).forEach(w => pool.push(w)));
    if (!pool.length) return null;

    // Générateur pseudo-aléatoire déterministe (seed = date).
    let seed = 0;
    for (let i = 0; i < dateStr.length; i++) seed = (seed * 31 + dateStr.charCodeAt(i)) >>> 0;
    const rng = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 0xffffffff; };

    const chosen = [];
    const used = new Set();
    while (chosen.length < 5 && used.size < pool.length) {
        const idx = Math.floor(rng() * pool.length);
        if (used.has(idx)) continue;
        used.add(idx);
        chosen.push(pool[idx]);
    }

    return {
        id: 'daily',
        cycle: 0,
        cycleName: lang === 'en' ? 'Daily Challenge' : 'Défi du jour',
        miniGame: 'dictation',
        isChallenge: true,
        items: chosen.map(w => ({ target: w, word: w }))
    };
}
