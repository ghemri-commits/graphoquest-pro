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
        // CYCLE 1 : Phonics & Simple Words (Ages 5-8)
        // ==========================================
        {
            id: 1, cycle: 1, cycleName: '1st Cycle - Phonics', miniGame: 'match', items: [
                { target: 'A', correct: 'a', options: ['a', 'e', 'o', 'u'], sound: 'a' },
                { target: 'E', correct: 'e', options: ['a', 'e', 'i', 'u'], sound: 'e' },
                { target: 'I', correct: 'i', options: ['e', 'i', 'a', 'o'], sound: 'i' }
            ]
        },
        {
            id: 2, cycle: 1, cycleName: '1st Cycle - Simple Words', miniGame: 'complete', items: [
                { target: 'C_T', missing: 1, correct: 'A', options: ['A', 'O', 'E', 'I'], hint: 'Cat' },
                { target: 'D_G', missing: 1, correct: 'O', options: ['A', 'O', 'U', 'E'], hint: 'Dog' }
            ]
        },
        {
            id: 3, cycle: 1, cycleName: '1st Cycle - Syllables', miniGame: 'syllable', items: [
                { target: 'ap-ple', parts: ['ap', 'ple', 'ab', 'pe'], word: 'Apple' },
                { target: 'ig-loo', parts: ['ig', 'loo', 'ic', 'lou'], word: 'Igloo' }
            ]
        },
        {
            id: 4, cycle: 1, cycleName: '1st Cycle - Pronounce', miniGame: 'pronounce', items: [
                { target: 'sun', word: 'sun', hint: 'It shines bright' },
                { target: 'fish', word: 'fish', hint: 'It swims in water' }
            ]
        },

        // ==========================================
        // CYCLE 2 : Grammar & Medium Words (Ages 8-10)
        // ==========================================
        {
            id: 5, cycle: 2, cycleName: '2nd Cycle - Spelling', miniGame: 'dictation', items: [
                { target: 'house', word: 'house', hint: 'Where we live' },
                { target: 'friend', word: 'friend', hint: 'Someone you play with' }
            ]
        },
        {
            id: 6, cycle: 2, cycleName: '2nd Cycle - Grammar', miniGame: 'accord', items: [
                { sentence: 'The happy dogs ___ in the yard.', correct: 'run', options: ['run', 'runs'], hint: 'Plural subject agreement' },
                { sentence: 'She ___ her homework every day.', correct: 'does', options: ['do', 'does'], hint: 'Third person singular verb' }
            ]
        },

        // ==========================================
        // CYCLE 3 : Mastery & Advanced Vocabulary (Ages 10-12)
        // ==========================================
        {
            id: 7, cycle: 3, cycleName: '3rd Cycle - Complex Dictation', miniGame: 'dictation', items: [
                { target: 'beautiful', word: 'beautiful', hint: 'Very pretty' },
                { target: 'government', word: 'government', hint: 'The leadership of a country' }
            ]
        },
        {
            id: 8, cycle: 3, cycleName: '3rd Cycle - Pronunciation', miniGame: 'pronounce', items: [
                { target: 'vocabulary', word: 'vocabulary', hint: 'The words of a language' },
                { target: 'understanding', word: 'understanding', hint: 'The ability to comprehend' }
            ]
        },

        // ----- Advanced mini-games (Morphology, Comprehension, Typos, Vocabulary) -----
        {
            id: 9, cycle: 2, cycleName: '2nd Cycle - Morphology', miniGame: 'morpho', items: [
                { word: 'unhappy', segments: [{ text: 'un', type: 'prefix' }, { text: 'happy', type: 'radical' }], hint: 'The opposite of happy' },
                { word: 'teacher', segments: [{ text: 'teach', type: 'radical' }, { text: 'er', type: 'suffix' }], hint: 'A person who teaches' },
                { word: 'replaying', segments: [{ text: 're', type: 'prefix' }, { text: 'play', type: 'radical' }, { text: 'ing', type: 'suffix' }], hint: 'Playing again' }
            ]
        },
        {
            id: 10, cycle: 3, cycleName: '3rd Cycle - Comprehension', miniGame: 'comprehension', items: [
                {
                    text: 'Tom lives on a small farm. Every morning he feeds the chickens and collects fresh eggs. His favourite animal is a brown horse named Coco.',
                    questions: [
                        { q: 'Where does Tom live?', options: ['In a city', 'On a farm', 'At the beach'], correct: 'On a farm' },
                        { q: 'What does he collect?', options: ['Eggs', 'Apples', 'Flowers'], correct: 'Eggs' },
                        { q: "What is his horse's name?", options: ['Coco', 'Filou', 'Spot'], correct: 'Coco' }
                    ]
                }
            ]
        },
        {
            id: 11, cycle: 3, cycleName: '3rd Cycle - Typo Hunt', miniGame: 'coquille', items: [
                { words: ['She', 'have', 'two', 'cats.'], errorIndex: 1, correct: 'has', hint: 'Verb agreement with « she »' },
                { words: ['The', 'childs', 'are', 'playing.'], errorIndex: 1, correct: 'children', hint: 'Irregular plural' },
                { words: ['I', 'like', 'to', 'eat', 'appel.'], errorIndex: 4, correct: 'apple', hint: 'Spelling of the fruit' }
            ]
        },
        {
            id: 12, cycle: 3, cycleName: '3rd Cycle - Vocabulary', miniGame: 'vocab', items: [
                { prompt: 'Synonym of « big »', options: ['small', 'large', 'tiny', 'thin'], correct: 'large' },
                { prompt: 'Opposite of « happy »', options: ['glad', 'sad', 'kind', 'fast'], correct: 'sad' },
                { prompt: 'What does « quick » mean?', options: ['slow', 'fast', 'heavy', 'quiet'], correct: 'fast' }
            ]
        }
    ];

    return { levels: lang === 'en' ? dataEN : dataFR };
}
