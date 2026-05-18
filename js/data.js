const GAME_DATA = {
    fr: {
        ageGroups: [
            { age: 5, label: "CP", levels: [1,2,3,4,5] },
            { age: 6, label: "CE1", levels: [6,7,8] },
            { age: 7, label: "CE2", levels: [9,10,11] },
            { age: 8, label: "CM1", levels: [12,13,14] },
            { age: 9, label: "CM2", levels: [15,16,17] },
            { age: 10, label: "6ème", levels: [18,19,20] },
            { age: 11, label: "5ème", levels: [21,22,23] },
            { age: 12, label: "4ème", levels: [24,25] }
        ],
        levels: [
            // CP (5 ans) - Niveaux 1-5
            { id: 1, name: "Voyelles", miniGame: "complete", items: [
                // FIX: CHAT[2]='A' ✓ (était missing:1 → target[1]='H', absent des options)
                { target: "CHAT", missing: 2, options: ["A","E","I"], hint: "L'animal qui miaule" },
                // FIX: CHIEN[2]='I' ✓ (était missing:1 → target[1]='H', absent des options)
                { target: "CHIEN", missing: 2, options: ["I","A","O"], hint: "Il aboie" },
                { target: "LUNE", missing: 1, options: ["U","A","O"], hint: "Dans le ciel la nuit" },
                // FIX: SOLEIL[1]='O' ✓ (était missing:2 → target[2]='L', absent des options)
                { target: "SOLEIL", missing: 1, options: ["O","E","I"], hint: "Il brille le jour" },
                { target: "MAISON", missing: 1, options: ["A","E","I"], hint: "On y habite" }
            ]},
            { id: 2, name: "Consonnes", miniGame: "complete", items: [
                { target: "BALLE", missing: 0, options: ["B","P","D"], hint: "On joue avec" },
                { target: "POMME", missing: 0, options: ["P","B","T"], hint: "Fruit rouge" },
                { target: "DENT", missing: 0, options: ["D","T","B"], hint: "Dans la bouche" },
                { target: "TIGRE", missing: 0, options: ["T","D","P"], hint: "Gros chat rayé" },
                { target: "GATEAU", missing: 0, options: ["G","C","Q"], hint: "Dessert d'anniversaire" }
            ]},
            { id: 3, name: "Son & Image", miniGame: "match", items: [
                { target: "🐱", correct: "CHAT", options: ["CHAT","CHIEN","SOURIS"], sound: "chat" },
                { target: "🐶", correct: "CHIEN", options: ["CHAT","CHIEN","LAPIN"], sound: "chien" },
                { target: "🚗", correct: "VOITURE", options: ["VOITURE","AVION","BATEAU"], sound: "voiture" },
                { target: "🍎", correct: "POMME", options: ["POIRE","POMME","BANANE"], sound: "pomme" },
                { target: "🏠", correct: "MAISON", options: ["MAISON","ECOLE","PARC"], sound: "maison" }
            ]},
            { id: 4, name: "Syllabes simples", miniGame: "syllable", items: [
                { target: "TA-BLE", parts: ["TA","BLE","LA","BO"], word: "TABLE" },
                { target: "CA-FE", parts: ["CA","FE","FA","CO"], word: "CAFE" },
                { target: "LI-VRE", parts: ["LI","VRE","RE","LA"], word: "LIVRE" },
                { target: "PE-TIT", parts: ["PE","TIT","TI","PA"], word: "PETIT" },
                { target: "RA-SOIR", parts: ["RA","SOIR","ROI","SO"], word: "RASOIR" }
            ]},
            { id: 5, name: "Révision CP", miniGame: "complete", items: [
                { target: "FLEUR", missing: 2, options: ["E","A","I"], hint: "Elle pousse dans le jardin" },
                // FIX: ARBRE[0]='A' ✓ (était missing:2 → target[2]='B', absent des options)
                { target: "ARBRE", missing: 0, options: ["A","E","I"], hint: "Il a des feuilles" },
                // FIX: OISEAU[2]='S' ✓ (était missing:3 → target[3]='E', absent des options ["S","Z","C"])
                { target: "OISEAU", missing: 2, options: ["S","Z","C"], hint: "Il vole dans le ciel" },
                { target: "ECOLE", missing: 1, options: ["C","S","K"], hint: "On y apprend" },
                { target: "TABLE", missing: 3, options: ["L","R","V"], hint: "On mange dessus" }
            ]},

            // CE1 (6 ans) - Niveaux 6-8
            // FIX: add 'correct' field for multi-char digraph options
            { id: 6, name: "Sons complexes", miniGame: "complete", items: [
                { target: "PHOTO", missing: 0, correct: "PH", options: ["P","F","PH"], hint: "On prend avec un appareil" },
                { target: "CHAMPIGNON", missing: 0, correct: "CH", options: ["CH","C","SH"], hint: "Dans la forêt" },
                { target: "GNOME", missing: 0, correct: "GN", options: ["GN","N","NG"], hint: "Petit bonhomme" },
                { target: "THE", missing: 0, correct: "TH", options: ["TH","T","TE"], hint: "Boisson chaude" },
                { target: "SCEAU", missing: 0, correct: "SC", options: ["SC","C","S"], hint: "Pour l'eau" }
            ]},
            { id: 7, name: "Images avancées", miniGame: "match", items: [
                { target: "🦋", correct: "PAPILLON", options: ["PAPILLON","MOUCHE","ABEILLE"], sound: "papillon" },
                { target: "🦒", correct: "GIRAFE", options: ["GIRAFE","ZEBRE","LION"], sound: "girafe" },
                { target: "🎸", correct: "GUITARE", options: ["GUITARE","PIANO","VIOLON"], sound: "guitare" },
                { target: "🌋", correct: "VOLCAN", options: ["VOLCAN","MONTAGNE","COLLINE"], sound: "volcan" },
                { target: "🔭", correct: "TELESCOPE", options: ["TELESCOPE","MICROSCOPE","LUNETTE"], sound: "télescope" }
            ]},
            { id: 8, name: "Syllabes moyennes", miniGame: "syllable", items: [
                { target: "BA-NA-NE", parts: ["BA","NA","NE","NI"], word: "BANANE" },
                { target: "E-LE-PHANT", parts: ["E","LE","PHANT","FA"], word: "ELEPHANT" },
                // FIX: "CIROUILLE" n'existe pas → CITROUILLE; parts corrigées
                { target: "CI-TROUIL-LE", parts: ["CI","TROUIL","LE","CRO"], word: "CITROUILLE" },
                { target: "MA-GA-ZINE", parts: ["MA","GA","ZINE","ZA"], word: "MAGAZINE" },
                { target: "OR-DI-NA-TEUR", parts: ["OR","DI","NA","TEUR"], word: "ORDINATEUR" }
            ]},

            // CE2 (7 ans) - Niveaux 9-11
            { id: 9, name: "Orthographe", miniGame: "complete", items: [
                // BIBLIOTHEQUE[5]='O' ✓
                { target: "BIBLIOTHEQUE", missing: 5, options: ["O","A","E"], hint: "Endroit avec beaucoup de livres" },
                // FIX: CROISSANT — son "OI" multi-caractères; missing:2 (début du OI), correct:"OI"
                { target: "CROISSANT", missing: 2, correct: "OI", options: ["OI","AI","EI"], hint: "Viennoiserie" },
                // MYSTERE[1]='Y' ✓
                { target: "MYSTERE", missing: 1, options: ["Y","I","E"], hint: "On ne sait pas" },
                // XYLOPHONE[0]='X' ✓
                { target: "XYLOPHONE", missing: 0, options: ["X","Z","S"], hint: "Instrument de musique" },
                // FIX: PSYCHOLOGIE — "PS" multi-caractères
                { target: "PSYCHOLOGIE", missing: 0, correct: "PS", options: ["PS","S","C"], hint: "Science de l'esprit" }
            ]},
            { id: 10, name: "Définitions", miniGame: "match", items: [
                { target: "Qui soigne les animaux ?", correct: "VETERINAIRE", options: ["VETERINAIRE","MEDECIN","INFIRMIER"], sound: "vétérinaire" },
                { target: "Le contraire de 'chaud'", correct: "FROID", options: ["FROID","DOUX","TIEDE"], sound: "froid" },
                { target: "Un synonyme de 'rapide'", correct: "VELOCE", options: ["VELOCE","LENT","CALME"], sound: "véloce" },
                { target: "Qui étudie les étoiles ?", correct: "ASTRONOME", options: ["ASTRONOME","ASTROLOGUE","ASTRONAUTE"], sound: "astronome" },
                { target: "La peur du vide", correct: "ACROPHOBIE", options: ["ACROPHOBIE","CLAUSTROPHOBIE","ARACHNOPHOBIE"], sound: "acrophobie" }
            ]},
            { id: 11, name: "Syllabes complexes", miniGame: "syllable", items: [
                { target: "PHI-LO-SO-PHIE", parts: ["PHI","LO","SO","PHIE"], word: "PHILOSOPHIE" },
                { target: "AR-CHI-TEC-TURE", parts: ["AR","CHI","TEC","TURE"], word: "ARCHITECTURE" },
                { target: "ME-TE-O-RO-LO-GIE", parts: ["ME","TE","O","RO","LO","GIE"], word: "METEOROLOGIE" },
                { target: "BI-O-LO-GIE", parts: ["BI","O","LO","GIE"], word: "BIOLOGIE" },
                { target: "MA-THE-MA-TI-QUES", parts: ["MA","THE","MA","TI","QUES"], word: "MATHEMATIQUES" }
            ]},

            // CM1 (8 ans) - Niveaux 12-14
            { id: 12, name: "Mots invariables", miniGame: "complete", items: [
                // ABORD[0]='A' ✓
                { target: "ABORD", missing: 0, options: ["A","E","I"], hint: "D'abord" },
                // FIX: APRES[1]='P' ✓ (était missing:2 → target[2]='R', absent des options ["P","B","V"])
                { target: "APRES", missing: 1, options: ["P","B","V"], hint: "Ensuite" },
                // BEAUCOUP[3]='U' ✓
                { target: "BEAUCOUP", missing: 3, options: ["U","O","A"], hint: "En grande quantité" },
                // COMMENT[3]='M' ✓
                { target: "COMMENT", missing: 3, options: ["M","N","L"], hint: "De quelle manière" },
                // FIX: PARCE_QUE[3]='C' ✓ (était missing:4 → target[4]='E', absent des options ["C","S","Q"])
                { target: "PARCE_QUE", missing: 3, options: ["C","S","Q"], hint: "Car" }
            ]},
            { id: 13, name: "Homonymes", miniGame: "match", items: [
                { target: "Le sien (possessif)", correct: "SIEN", options: ["SIEN","SCION","CIENT"], sound: "sien" },
                { target: "Cent (nombre)", correct: "CENT", options: ["CENT","SANG","SANS"], sound: "cent" },
                { target: "Sans (prép.)", correct: "SANS", options: ["SANS","CENT","SANG"], sound: "sans" },
                { target: "Ver (insecte)", correct: "VER", options: ["VER","VERS","VERT"], sound: "ver" },
                { target: "Vert (couleur)", correct: "VERT", options: ["VERT","VER","VERS"], sound: "vert" }
            ]},
            { id: 14, name: "Préfixes/Suffixes", miniGame: "syllable", items: [
                { target: "IN-COR-RECT", parts: ["IN","COR","RECT","IR"], word: "INCORRECT" },
                { target: "DE-SSUS", parts: ["DE","SSUS","DES","SU"], word: "DESSUS" },
                { target: "RE-COM-MEN-CER", parts: ["RE","COM","MEN","CER"], word: "RECOMMENCER" },
                { target: "MAL-HEU-REUX", parts: ["MAL","HEU","REUX","HER"], word: "MALHEUREUX" },
                { target: "SUR-PREN-DRE", parts: ["SUR","PREN","DRE","PRE"], word: "SURPRENDRE" }
            ]},

            // CM2 (9 ans) - Niveaux 15-17
            { id: 15, name: "Vocabulaire avancé", miniGame: "complete", items: [
                // FIX: EPHEMERE[0]='E' ✓ (était missing:1 → target[1]='P', absent des options)
                { target: "EPHEMERE", missing: 0, options: ["E","I","A"], hint: "Qui dure peu de temps" },
                // FIX: UBIQUITE[2]='I' ✓ (était missing:3 → target[3]='Q', absent des options)
                { target: "UBIQUITE", missing: 2, options: ["I","E","A"], hint: "Être partout à la fois" },
                // FIX: SERENDIPITE[1]='E' ✓ (était missing:2 → target[2]='R', absent des options)
                { target: "SERENDIPITE", missing: 1, options: ["E","I","A"], hint: "Trouver sans chercher" },
                // PALIMPSESTE[3]='I' ✓
                { target: "PALIMPSESTE", missing: 3, options: ["I","E","A"], hint: "Manuscrit effacé et réécrit" },
                // FIX: OXYMORE[1]='X' ✓ (était missing:0 → target[0]='O', absent des options ["X","S","Z"])
                { target: "OXYMORE", missing: 1, options: ["X","S","Z"], hint: "Figure de style contradictoire" }
            ]},
            { id: 16, name: "Étymologie", miniGame: "match", items: [
                { target: "Qui vient du latin 'aqua' ?", correct: "AQUATIQUE", options: ["AQUATIQUE","TERRESTRE","AERIEN"], sound: "aquatique" },
                { target: "Du grec 'tele' (loin)", correct: "TELEPHONE", options: ["TELEPHONE","MICROPHONE","RADIO"], sound: "téléphone" },
                { target: "Du grec 'bios' (vie)", correct: "BIOLOGIE", options: ["BIOLOGIE","GEOLOGIE","SOCIOLOGIE"], sound: "biologie" },
                { target: "Du latin 'scribere' (écrire)", correct: "SCRIPT", options: ["SCRIPT","LECTURE","PAROLE"], sound: "script" },
                { target: "Du grec 'photos' (lumière)", correct: "PHOTOGRAPHIE", options: ["PHOTOGRAPHIE","TELESCOPE","MICROSCOPE"], sound: "photographie" }
            ]},
            { id: 17, name: "Mots composés", miniGame: "syllable", items: [
                { target: "PORTE-MON-NAIE", parts: ["PORTE","MON","NAIE","MON"], word: "PORTE-MONNAIE" },
                { target: "ARC-EN-CIEL", parts: ["ARC","EN","CIEL","CEL"], word: "ARC-EN-CIEL" },
                // FIX: casse mixte "Sous-MARIN" → tout majuscule; parts corrigées ("SOU" était absent)
                { target: "SOUS-MARIN", parts: ["SOUS","MARIN","MAR","SOU"], word: "SOUS-MARIN" },
                { target: "TROT-TOIR", parts: ["TROT","TOIR","TROC","TOI"], word: "TROTTOIR" },
                // FIX: casse mixte "CHOU-CRoute" → "CHOU-CROUTE"; parts corrigées
                { target: "CHOU-CROUTE", parts: ["CHOU","CROUTE","CHO","CRO"], word: "CHOUCROUTE" }
            ]},

            // 6ème (10 ans) - Niveaux 18-20
            { id: 18, name: "Figures de style", miniGame: "complete", items: [
                // FIX: METAPHORE[3]='A' ✓ (était missing:2 → target[2]='T', absent des options)
                { target: "METAPHORE", missing: 3, options: ["A","E","I"], hint: "Comparaison sans 'comme'" },
                // FIX: PERSONNIFICATION[7]='I' ✓ (était missing:5 → target[5]='N', absent des options)
                { target: "PERSONNIFICATION", missing: 7, options: ["I","E","A"], hint: "Donner des traits humains" },
                // HYPERBOLE[3]='E' ✓
                { target: "HYPERBOLE", missing: 3, options: ["E","I","A"], hint: "Exagération" },
                // FIX: LITOTE[1]='I' ✓ (était missing:2 → target[2]='T', absent des options)
                { target: "LITOTE", missing: 1, options: ["I","E","A"], hint: "Affirmer par la négation" },
                // ANAPHORE[2]='A' ✓
                { target: "ANAPHORE", missing: 2, options: ["A","E","I"], hint: "Répétition en début de vers" }
            ]},
            { id: 19, name: "Latin/Grec", miniGame: "match", items: [
                { target: "Qui signifie 'feu' ?", correct: "PYRO", options: ["PYRO","HYDRO","GEO"], sound: "pyro" },
                { target: "Qui signifie 'eau' ?", correct: "HYDRO", options: ["HYDRO","PYRO","AERO"], sound: "hydro" },
                { target: "Qui signifie 'terre' ?", correct: "GEO", options: ["GEO","AERO","COSMO"], sound: "géo" },
                { target: "Qui signifie 'temps' ?", correct: "CHRONO", options: ["CHRONO","THERMO","BARO"], sound: "chrono" },
                { target: "Qui signifie 'mesurer' ?", correct: "METRE", options: ["METRE","LOGUE","GRAPHIE"], sound: "mètre" }
            ]},
            { id: 20, name: "Syllabes expertes", miniGame: "syllable", items: [
                { target: "AN-THRO-PO-LO-GIE", parts: ["AN","THRO","PO","LO","GIE"], word: "ANTHROPOLOGIE" },
                { target: "PA-RA-PSY-CHO-LO-GIE", parts: ["PA","RA","PSY","CHO","LO","GIE"], word: "PARAPSYCHOLOGIE" },
                { target: "E-LEC-TRO-EN-CE-PHA-LO-GRAM-ME", parts: ["E","LEC","TRO","EN","CE","PHA","LO","GRAM","ME"], word: "ELECTROENCEPHALOGRAMME" },
                // FIX: HEXACOSAICOSAHEDRON n'est pas un mot réel → ICOSAEDRE (solide à 20 faces)
                { target: "I-CO-SA-E-DRE", parts: ["I","CO","SA","E","DRE","OCO"], word: "ICOSAEDRE" },
                // FIX: casse mixte "IN-TER-GOU-Vernemen-TA-LI-SA-TION" → tout majuscule
                { target: "IN-TER-GOU-VER-NE-MEN-TA-LI-SA-TION", parts: ["IN","TER","GOU","VER","NE","MEN","TA","LI","SA","TION"], word: "INTERGOUVERNEMENTALISATION" }
            ]},

            // 5ème (11 ans) - Niveaux 21-23
            { id: 21, name: "Néologismes", miniGame: "complete", items: [
                // FIX: CYBERESPACE[3]='E' ✓ (était missing:2 → target[2]='B', absent des options)
                { target: "CYBERESPACE", missing: 3, options: ["E","I","A"], hint: "Monde virtuel" },
                // NUMERIQUE[3]='E' ✓
                { target: "NUMERIQUE", missing: 3, options: ["E","I","A"], hint: "Relatif aux chiffres" },
                // FIX: ALGORITHME[5]='I' ✓ (était missing:2 → target[2]='G', absent des options)
                { target: "ALGORITHME", missing: 5, options: ["I","E","A"], hint: "Suite d'instructions" },
                // FIX: BLOCKCHAIN[7]='A' ✓ (était missing:3 → target[3]='C', absent des options)
                { target: "BLOCKCHAIN", missing: 7, options: ["A","E","I"], hint: "Chaîne de blocs" },
                // FIX: INTELLIGENCE_ARTIFICIELLE[6]='I' ✓ (était missing:5 → target[5]='L', absent des options)
                { target: "INTELLIGENCE_ARTIFICIELLE", missing: 6, options: ["I","E","A"], hint: "IA" }
            ]},
            { id: 22, name: "Anglicismes", miniGame: "match", items: [
                { target: "Qui signifie 'bureau' ?", correct: "DESK", options: ["DESK","CHAIR","TABLE"], sound: "desk" },
                { target: "Qui signifie 'réunion' ?", correct: "MEETING", options: ["MEETING","CALL","MAIL"], sound: "meeting" },
                { target: "Qui signifie 'délai' ?", correct: "DEADLINE", options: ["DEADLINE","TIMELINE","HEADLINE"], sound: "deadline" },
                { target: "Qui signifie 'aperçu' ?", correct: "OVERVIEW", options: ["OVERVIEW","FEEDBACK","UPDATE"], sound: "overview" },
                { target: "Qui signifie 'partenariat' ?", correct: "PARTNERSHIP", options: ["PARTNERSHIP","LEADERSHIP","OWNERSHIP"], sound: "partnership" }
            ]},
            { id: 23, name: "Syllabes 5ème", miniGame: "syllable", items: [
                { target: "IN-CON-STITU-TION-NEL-LE-MENT", parts: ["IN","CON","STITU","TION","NEL","LE","MENT"], word: "INCONSTITUTIONNELLEMENT" },
                { target: "AN-TI-CON-STITU-TION-NEL-LE-MENT", parts: ["AN","TI","CON","STITU","TION","NEL","LE","MENT"], word: "ANTICONSTITUTIONNELLEMENT" },
                // FIX: parts contenaient "SOUS" au lieu de "SOU" → syllabe correcte absente
                { target: "SOU-TER-RAIN", parts: ["SOU","TER","RAIN","SOUS"], word: "SOUTERRAIN" },
                { target: "EX-TRA-TER-RES-TRE", parts: ["EX","TRA","TER","RES","TRE"], word: "EXTRATERRESTRE" },
                { target: "DES-ODO-RI-SANT", parts: ["DES","ODO","RI","SANT","RA"], word: "DESODORISANT" }
            ]},

            // 4ème (12 ans) - Niveaux 24-25
            { id: 24, name: "Expert", miniGame: "complete", items: [
                // FIX: HECATOMBE[3]='A' ✓ (était missing:2 → target[2]='C', absent des options)
                { target: "HECATOMBE", missing: 3, options: ["A","E","I"], hint: "Grande destruction" },
                // FIX: QUIDAM[4]='A' ✓ (était missing:1 → target[1]='U', absent des options ["I","E","A"])
                { target: "QUIDAM", missing: 4, options: ["I","E","A"], hint: "Personne quelconque" },
                // SIBERIEN[3]='E' ✓
                { target: "SIBERIEN", missing: 3, options: ["E","I","A"], hint: "De Sibérie" },
                // FIX: ZYGOMATIQUE[5]='A' ✓ (était missing:3 → target[3]='O', absent des options)
                { target: "ZYGOMATIQUE", missing: 5, options: ["A","E","I"], hint: "Os de la pommette" },
                // WYVERN[1]='Y' ✓
                { target: "WYVERN", missing: 1, options: ["Y","I","E"], hint: "Dragon bipède" }
            ]},
            { id: 25, name: "Maître", miniGame: "syllable", items: [
                { target: "PNEU-MO-UL-TRA-MI-CRO-SCO-PICS-SI-LI-CO-VOL-CA-NO-CO-NIO-SE", parts: ["PNEU","MO","ULTRA","MI","CRO","SCO","PICS","SI","LI","CO","VOL","CA","NO","CO","NIO","SE"], word: "PNEUMOULTRAMICROSCOPICSILICOVOLCANOCONIOSE" },
                { target: "AN-TI-CON-STITU-TION-NEL-LE-MENT", parts: ["AN","TI","CON","STITU","TION","NEL","LE","MENT"], word: "ANTICONSTITUTIONNELLEMENT" },
                // FIX: casse mixte "IN-TER-Na-tio-na-li-SA-TION" → tout majuscule
                { target: "IN-TER-NA-TIO-NA-LI-SA-TION", parts: ["IN","TER","NA","TIO","NA","LI","SA","TION"], word: "INTERNATIONALISATION" },
                { target: "DE-SOXY-RI-BO-NU-CLE-I-QUE", parts: ["DE","SOXY","RI","BO","NU","CLE","I","QUE"], word: "DESOXYRIBONUCLEIQUE" },
                // FIX: "HEPATICOCHOLEDUOCALCULEUSE" n'est pas un mot réel → ELECTROCARDIOGRAMME
                { target: "E-LEC-TRO-CAR-DI-O-GRAM-ME", parts: ["E","LEC","TRO","CAR","DI","O","GRAM","ME"], word: "ELECTROCARDIOGRAMME" }
            ]}
        ]
    },

    en: {
        ageGroups: [
            { age: 5, label: "Year 1", levels: [1,2,3,4,5] },
            { age: 6, label: "Year 2", levels: [6,7,8] },
            { age: 7, label: "Year 3", levels: [9,10,11] },
            { age: 8, label: "Year 4", levels: [12,13,14] },
            { age: 9, label: "Year 5", levels: [15,16,17] },
            { age: 10, label: "Year 6", levels: [18,19,20] },
            { age: 11, label: "Year 7", levels: [21,22,23] },
            { age: 12, label: "Year 8", levels: [24,25] }
        ],
        levels: [
            { id: 1, name: "Vowels", miniGame: "complete", items: [
                { target: "CAT", missing: 1, options: ["A","E","I"], hint: "It meows" },
                { target: "DOG", missing: 1, options: ["O","A","U"], hint: "It barks" },
                { target: "SUN", missing: 1, options: ["U","A","O"], hint: "In the sky" },
                { target: "BED", missing: 1, options: ["E","A","I"], hint: "You sleep in it" },
                { target: "HAT", missing: 1, options: ["A","E","I"], hint: "On your head" }
            ]},
            { id: 2, name: "Consonants", miniGame: "complete", items: [
                { target: "BALL", missing: 0, options: ["B","P","D"], hint: "You throw it" },
                { target: "PEN", missing: 0, options: ["P","B","T"], hint: "You write with it" },
                { target: "TABLE", missing: 0, options: ["T","D","P"], hint: "You eat on it" },
                { target: "GARDEN", missing: 0, options: ["G","C","K"], hint: "With flowers" },
                { target: "CUP", missing: 0, options: ["C","K","S"], hint: "For drinking" }
            ]},
            { id: 3, name: "Sound & Picture", miniGame: "match", items: [
                { target: "🐱", correct: "CAT", options: ["CAT","DOG","MOUSE"], sound: "cat" },
                { target: "🚗", correct: "CAR", options: ["CAR","BUS","BIKE"], sound: "car" },
                { target: "🍎", correct: "APPLE", options: ["APPLE","PEAR","BANANA"], sound: "apple" },
                { target: "🏠", correct: "HOUSE", options: ["HOUSE","SCHOOL","PARK"], sound: "house" },
                { target: "🌳", correct: "TREE", options: ["TREE","FLOWER","GRASS"], sound: "tree" }
            ]},
            { id: 4, name: "Simple Syllables", miniGame: "syllable", items: [
                { target: "TA-BLE", parts: ["TA","BLE","LE","BA"], word: "TABLE" },
                { target: "AP-PLE", parts: ["AP","PLE","LE","PA"], word: "APPLE" },
                { target: "BA-NA-NA", parts: ["BA","NA","NA","AN"], word: "BANANA" },
                { target: "EL-E-PHANT", parts: ["EL","E","PHANT","FA"], word: "ELEPHANT" },
                { target: "TE-LE-PHONE", parts: ["TE","LE","PHONE","FO"], word: "TELEPHONE" }
            ]},
            { id: 5, name: "Review", miniGame: "complete", items: [
                // FLOWER[2]='O' ✓
                { target: "FLOWER", missing: 2, options: ["O","A","E"], hint: "It grows in garden" },
                // SCHOOL[2]='H' — FIX: SCHOOL[1]='C' ✓ (was missing:2 → 'H', not in options)
                { target: "SCHOOL", missing: 1, options: ["C","K","S"], hint: "You learn there" },
                // FRIEND[2]='I' ✓
                { target: "FRIEND", missing: 2, options: ["I","E","A"], hint: "Not an enemy" },
                // BROTHER[2]='O' ✓
                { target: "BROTHER", missing: 2, options: ["O","A","E"], hint: "Male sibling" },
                // WATER[1]='A' ✓
                { target: "WATER", missing: 1, options: ["A","E","I"], hint: "You drink it" }
            ]},
            { id: 6, name: "Digraphs", miniGame: "complete", items: [
                // FIX: add correct field for multi-char digraph options
                { target: "PHONE", missing: 0, correct: "PH", options: ["P","F","PH"], hint: "You call with it" },
                { target: "SHIP", missing: 0, correct: "SH", options: ["SH","S","CH"], hint: "Boat" },
                { target: "THUMB", missing: 0, correct: "TH", options: ["TH","T","F"], hint: "Finger" },
                { target: "CHAIR", missing: 0, correct: "CH", options: ["CH","C","SH"], hint: "You sit on it" },
                { target: "KNIGHT", missing: 0, correct: "KN", options: ["KN","N","K"], hint: "Medieval warrior" }
            ]},
            { id: 7, name: "Advanced Pictures", miniGame: "match", items: [
                { target: "🦋", correct: "BUTTERFLY", options: ["BUTTERFLY","MOTH","BEE"], sound: "butterfly" },
                { target: "🌋", correct: "VOLCANO", options: ["VOLCANO","MOUNTAIN","HILL"], sound: "volcano" },
                { target: "🔭", correct: "TELESCOPE", options: ["TELESCOPE","MICROSCOPE","BINOCULARS"], sound: "telescope" },
                { target: "🦒", correct: "GIRAFFE", options: ["GIRAFFE","ZEBRA","LION"], sound: "giraffe" },
                { target: "🎸", correct: "GUITAR", options: ["GUITAR","PIANO","VIOLIN"], sound: "guitar" }
            ]},
            { id: 8, name: "Longer Syllables", miniGame: "syllable", items: [
                { target: "COM-PU-TER", parts: ["COM","PU","TER","PO"], word: "COMPUTER" },
                { target: "DI-NO-SAUR", parts: ["DI","NO","SAUR","NAU"], word: "DINOSAUR" },
                { target: "TE-LE-VI-SION", parts: ["TE","LE","VI","SION"], word: "TELEVISION" },
                { target: "RA-DI-O", parts: ["RA","DI","O","DE"], word: "RADIO" },
                { target: "CAL-CU-LA-TOR", parts: ["CAL","CU","LA","TOR"], word: "CALCULATOR" }
            ]},
            { id: 9, name: "Vocabulary", miniGame: "complete", items: [
                // FIX: BEAUTIFUL[2]='A' ✓ (was missing:3 → 'U', not in options ["A","E","I"])
                { target: "BEAUTIFUL", missing: 2, options: ["A","E","I"], hint: "Pretty" },
                // KNOWLEDGE[2]='O' ✓
                { target: "KNOWLEDGE", missing: 2, options: ["O","E","A"], hint: "What you learn" },
                // FIX: MYSTERIOUS[4]='E' ✓ (was missing:3 → 'T', not in options)
                { target: "MYSTERIOUS", missing: 4, options: ["E","I","A"], hint: "Strange and unknown" },
                // EXTRAORDINARY[4]='A' ✓
                { target: "EXTRAORDINARY", missing: 4, options: ["A","E","I"], hint: "Very special" },
                // FIX: PHILOSOPHY[2]='I' — fix options to include I
                { target: "PHILOSOPHY", missing: 2, options: ["I","O","A"], hint: "Study of wisdom" }
            ]},
            { id: 10, name: "Definitions", miniGame: "match", items: [
                { target: "A person who studies stars", correct: "ASTRONOMER", options: ["ASTRONOMER","ASTROLOGER","ASTRONAUT"], sound: "astronomer" },
                { target: "Fear of heights", correct: "ACROPHOBIA", options: ["ACROPHOBIA","CLAUSTROPHOBIA","ARACHNOPHOBIA"], sound: "acrophobia" },
                { target: "A word that sounds like its meaning", correct: "ONOMATOPOEIA", options: ["ONOMATOPOEIA","ALLITERATION","SIMILE"], sound: "onomatopoeia" },
                { target: "The study of life", correct: "BIOLOGY", options: ["BIOLOGY","GEOLOGY","SOCIOLOGY"], sound: "biology" },
                { target: "A shape with 8 sides", correct: "OCTAGON", options: ["OCTAGON","HEXAGON","PENTAGON"], sound: "octagon" }
            ]},
            { id: 11, name: "Complex Syllables", miniGame: "syllable", items: [
                { target: "PHI-LOS-O-PHY", parts: ["PHI","LOS","O","PHY"], word: "PHILOSOPHY" },
                { target: "PSY-CHO-LO-GY", parts: ["PSY","CHO","LO","GY"], word: "PSYCHOLOGY" },
                { target: "AR-CHI-TEC-TURE", parts: ["AR","CHI","TEC","TURE"], word: "ARCHITECTURE" },
                { target: "ME-TE-OR-O-LO-GY", parts: ["ME","TE","OR","O","LO","GY"], word: "METEOROLOGY" },
                { target: "MA-THE-MA-TICS", parts: ["MA","THE","MA","TICS"], word: "MATHEMATICS" }
            ]},
            { id: 12, name: "Prefixes", miniGame: "complete", items: [
                // FIX: add correct field for multi-char prefix options
                { target: "UNHAPPY", missing: 0, correct: "UN", options: ["UN","IN","DIS"], hint: "Not happy" },
                { target: "REWRITE", missing: 0, correct: "RE", options: ["RE","UN","PRE"], hint: "Write again" },
                { target: "IMPOSSIBLE", missing: 0, correct: "IM", options: ["IM","IN","UN"], hint: "Not possible" },
                { target: "OVERCOME", missing: 0, correct: "OVER", options: ["OVER","UNDER","OUT"], hint: "Get past" },
                { target: "MISUNDERSTAND", missing: 0, correct: "MIS", options: ["MIS","DIS","UN"], hint: "Understand wrongly" }
            ]},
            { id: 13, name: "Homophones", miniGame: "match", items: [
                { target: "Sea or ___ ?", correct: "SEE", options: ["SEE","SEA","SI"], sound: "see" },
                { target: "Knight or ___ ?", correct: "NIGHT", options: ["NIGHT","KNIGHT","NITE"], sound: "night" },
                { target: "Right or ___ ?", correct: "WRITE", options: ["WRITE","RIGHT","RITE"], sound: "write" },
                { target: "Flour or ___ ?", correct: "FLOWER", options: ["FLOWER","FLOUR","FLOURE"], sound: "flower" },
                { target: "Piece or ___ ?", correct: "PEACE", options: ["PEACE","PIECE","PEAS"], sound: "peace" }
            ]},
            { id: 14, name: "Word Parts", miniGame: "syllable", items: [
                { target: "IN-COR-RECT", parts: ["IN","COR","RECT","IR"], word: "INCORRECT" },
                { target: "RE-COM-MEND", parts: ["RE","COM","MEND","MEN"], word: "RECOMMEND" },
                { target: "MIS-SPEL-LED", parts: ["MIS","SPEL","LED","SPILL"], word: "MISSPELLED" },
                { target: "UN-FOR-TU-NATE", parts: ["UN","FOR","TU","NATE"], word: "UNFORTUNATE" },
                { target: "PRE-DI-CTA-BLE", parts: ["PRE","DI","CTA","BLE"], word: "PREDICTABLE" }
            ]},
            { id: 15, name: "Advanced Vocab", miniGame: "complete", items: [
                // FIX: EPHEMERAL[3]='E' ✓ (was missing:2 → 'H', not in options)
                { target: "EPHEMERAL", missing: 3, options: ["E","A","I"], hint: "Short-lived" },
                // FIX: UBIQUITOUS[4]='U' ✓ (was missing:3 → 'Q', not in options)
                { target: "UBIQUITOUS", missing: 4, options: ["U","I","O"], hint: "Everywhere" },
                // FIX: SERENDIPITY[3]='E' ✓ (was missing:2 → 'R', not in options)
                { target: "SERENDIPITY", missing: 3, options: ["E","I","A"], hint: "Lucky find" },
                // PALIMPSEST[3]='I' ✓
                { target: "PALIMPSEST", missing: 3, options: ["I","E","A"], hint: "Reused manuscript" },
                // FIX: OXYMORON[4]='O' ✓ (was missing:1 → 'X', not in options ["O","A","E"])
                { target: "OXYMORON", missing: 4, options: ["O","A","E"], hint: "Contradictory phrase" }
            ]},
            { id: 16, name: "Etymology", miniGame: "match", items: [
                { target: "From Latin 'aqua' (water)", correct: "AQUATIC", options: ["AQUATIC","TERRESTRIAL","AERIAL"], sound: "aquatic" },
                { target: "From Greek 'tele' (far)", correct: "TELEPHONE", options: ["TELEPHONE","MICROPHONE","RADIO"], sound: "telephone" },
                { target: "From Greek 'bios' (life)", correct: "BIOLOGY", options: ["BIOLOGY","GEOLOGY","SOCIOLOGY"], sound: "biology" },
                { target: "From Latin 'scribere' (write)", correct: "SCRIPT", options: ["SCRIPT","LECTURE","SPEECH"], sound: "script" },
                { target: "From Greek 'photos' (light)", correct: "PHOTOGRAPHY", options: ["PHOTOGRAPHY","TELESCOPE","MICROSCOPE"], sound: "photography" }
            ]},
            { id: 17, name: "Compound Words", miniGame: "syllable", items: [
                { target: "BUT-TER-FLY", parts: ["BUT","TER","FLY","FLI"], word: "BUTTERFLY" },
                { target: "RAIN-BOW", parts: ["RAIN","BOW","BON","RAN"], word: "RAINBOW" },
                { target: "SUN-FLOW-ER", parts: ["SUN","FLOW","ER","FLY"], word: "SUNFLOWER" },
                { target: "SKATE-BOARD", parts: ["SKATE","BOARD","SKATE","BORE"], word: "SKATEBOARD" },
                { target: "TOOTH-BRUSH", parts: ["TOOTH","BRUSH","TRUTH","BRASH"], word: "TOOTHBRUSH" }
            ]},
            { id: 18, name: "Literary Terms", miniGame: "complete", items: [
                // FIX: METAPHOR[3]='A' ✓ (was missing:2 → 'T', not in options)
                { target: "METAPHOR", missing: 3, options: ["A","E","I"], hint: "Comparison without 'like'" },
                // FIX: PERSONIFICATION[6]='I' ✓ (was missing:5 → 'N', not in options)
                { target: "PERSONIFICATION", missing: 6, options: ["I","E","A"], hint: "Human traits to objects" },
                // HYPERBOLE[3]='E' ✓
                { target: "HYPERBOLE", missing: 3, options: ["E","I","A"], hint: "Exaggeration" },
                // ALLITERATION[3]='I' ✓
                { target: "ALLITERATION", missing: 3, options: ["I","A","E"], hint: "Same sound start" },
                // ANAPHORA[2]='A' ✓
                { target: "ANAPHORA", missing: 2, options: ["A","E","I"], hint: "Repetition at start" }
            ]},
            { id: 19, name: "Greek/Latin Roots", miniGame: "match", items: [
                { target: "Meaning 'fire'", correct: "PYRO", options: ["PYRO","HYDRO","GEO"], sound: "pyro" },
                { target: "Meaning 'water'", correct: "HYDRO", options: ["HYDRO","PYRO","AERO"], sound: "hydro" },
                { target: "Meaning 'earth'", correct: "GEO", options: ["GEO","AERO","COSMO"], sound: "geo" },
                { target: "Meaning 'time'", correct: "CHRONO", options: ["CHRONO","THERMO","BARO"], sound: "chrono" },
                { target: "Meaning 'measure'", correct: "METER", options: ["METER","LOGUE","GRAPH"], sound: "meter" }
            ]},
            { id: 20, name: "Expert Syllables", miniGame: "syllable", items: [
                { target: "AN-THRO-PO-LO-GY", parts: ["AN","THRO","PO","LO","GY"], word: "ANTHROPOLOGY" },
                { target: "PA-RA-PSY-CHO-LO-GY", parts: ["PA","RA","PSY","CHO","LO","GY"], word: "PARAPSYCHOLOGY" },
                { target: "E-LEC-TRO-EN-CE-PHA-LO-GRAM", parts: ["E","LEC","TRO","EN","CE","PHA","LO","GRAM"], word: "ELECTROENCEPHALOGRAM" },
                { target: "HEXA-HE-DRON", parts: ["HEXA","HE","DRON","HEX"], word: "HEXAHEDRON" },
                { target: "IN-TER-NA-TION-AL", parts: ["IN","TER","NA","TION","AL"], word: "INTERNATIONAL" }
            ]},
            { id: 21, name: "Neologisms", miniGame: "complete", items: [
                // FIX: CYBERSPACE[3]='E' ✓ (was missing:2 → 'B', not in options)
                { target: "CYBERSPACE", missing: 3, options: ["E","I","A"], hint: "Virtual world" },
                // FIX: DIGITAL[3]='I' ✓ (was missing:2 → 'G', not in options)
                { target: "DIGITAL", missing: 3, options: ["I","A","E"], hint: "Related to computers" },
                // FIX: ALGORITHM[5]='I' ✓ (was missing:2 → 'G', not in options)
                { target: "ALGORITHM", missing: 5, options: ["I","E","A"], hint: "Set of rules" },
                // FIX: BLOCKCHAIN[7]='A' ✓ (was missing:3 → 'C', not in options)
                { target: "BLOCKCHAIN", missing: 7, options: ["A","E","I"], hint: "Crypto tech" },
                // ARTIFICIAL_INTELLIGENCE[5]='I' ✓
                { target: "ARTIFICIAL_INTELLIGENCE", missing: 5, options: ["I","E","A"], hint: "AI" }
            ]},
            { id: 22, name: "Word Origins", miniGame: "match", items: [
                { target: "From French 'bureau'", correct: "DESK", options: ["DESK","CHAIR","TABLE"], sound: "desk" },
                { target: "From French 'rendez-vous'", correct: "MEETING", options: ["MEETING","CALL","MAIL"], sound: "meeting" },
                { target: "From Dutch 'doodlopend'", correct: "DEADLINE", options: ["DEADLINE","TIMELINE","HEADLINE"], sound: "deadline" },
                { target: "From German 'Weltanschauung'", correct: "WORLDVIEW", options: ["WORLDVIEW","FEEDBACK","UPDATE"], sound: "worldview" },
                { target: "From Latin 'particeps'", correct: "PARTNERSHIP", options: ["PARTNERSHIP","LEADERSHIP","OWNERSHIP"], sound: "partnership" }
            ]},
            { id: 23, name: "Expert Level", miniGame: "syllable", items: [
                { target: "IN-CON-STITU-TION-AL", parts: ["IN","CON","STITU","TION","AL"], word: "INCONSTITUTIONAL" },
                { target: "AN-TI-DIS-ES-TAB-LISH-MENT-AR-IAN-ISM", parts: ["AN","TI","DIS","ES","TAB","LISH","MENT","AR","IAN","ISM"], word: "ANTIDISESTABLISHMENTARIANISM" },
                { target: "SU-PER-CA-LI-FRAG-I-LIS-TIC-EX-PI-AL-I-DO-CIOUS", parts: ["SU","PER","CA","LI","FRAG","I","LIS","TIC","EX","PI","AL","I","DO","CIOUS"], word: "SUPERCALIFRAGILISTICEXPIALIDOCIOUS" },
                { target: "HON-OR-I-FI-CA-BIL-I-TU-DIN-I-TY", parts: ["HON","OR","I","FI","CA","BIL","I","TU","DIN","I","TY"], word: "HONORIFICABILITUDINITY" },
                { target: "PNEU-MO-UL-TRA-MI-CRO-SCOP-IC-SI-LI-CO-VOL-CA-NO-CON-I-O-SIS", parts: ["PNEU","MO","ULTRA","MI","CRO","SCOP","IC","SI","LI","CO","VOL","CA","NO","CON","I","O","SIS"], word: "PNEUMONOULTRAMICROSCOPICSILICOVOLCANOCONIOSIS" }
            ]},
            { id: 24, name: "Master", miniGame: "complete", items: [
                // FIX: HECATOMB[3]='A' ✓ (was missing:2 → 'C', not in options)
                { target: "HECATOMB", missing: 3, options: ["A","E","I"], hint: "Great slaughter" },
                // FIX: QUIDNUNC[2]='I' ✓ (was missing:1 → 'U', not in options ["I","E","A"])
                { target: "QUIDNUNC", missing: 2, options: ["I","E","A"], hint: "Gossip" },
                // SIBERIAN[3]='E' ✓
                { target: "SIBERIAN", missing: 3, options: ["E","I","A"], hint: "From cold region" },
                // FIX: ZYGOMATIC[5]='A' ✓ (was missing:3 → 'O', not in options)
                { target: "ZYGOMATIC", missing: 5, options: ["A","E","I"], hint: "Cheekbone" },
                // WYVERN[1]='Y' ✓
                { target: "WYVERN", missing: 1, options: ["Y","I","E"], hint: "Two-legged dragon" }
            ]},
            { id: 25, name: "Grand Master", miniGame: "syllable", items: [
                { target: "PNEU-MO-UL-TRA-MI-CRO-SCOP-IC-SI-LI-CO-VOL-CA-NO-CON-I-O-SIS", parts: ["PNEU","MO","ULTRA","MI","CRO","SCOP","IC","SI","LI","CO","VOL","CA","NO","CON","I","O","SIS"], word: "PNEUMONOULTRAMICROSCOPICSILICOVOLCANOCONIOSIS" },
                { target: "FLOC-CI-NAU-CI-NI-HIL-I-PIL-I-FI-CA-TION", parts: ["FLOC","CI","NAU","CI","NI","HIL","I","PIL","I","FI","CA","TION"], word: "FLOCCINAUCINIHILIPILIFICATION" },
                { target: "PSEU-DO-AN-THRA-CO-SIS", parts: ["PSEU","DO","AN","THRA","CO","SIS"], word: "PSEUDOANTHRACOSIS" },
                // FIX: "PARTRICIPROCURATION" n'est pas un mot → COUNTERREVOLUTIONARY
                { target: "COUN-TER-REV-O-LU-TION-AR-Y", parts: ["COUN","TER","REV","O","LU","TION","AR","Y"], word: "COUNTERREVOLUTIONARY" },
                // FIX: "SUBDEANGELIFORME" n'est pas un mot → INCOMPREHENSIBILITIES
                { target: "IN-COM-PRE-HEN-SI-BIL-I-TIES", parts: ["IN","COM","PRE","HEN","SI","BIL","I","TIES"], word: "INCOMPREHENSIBILITIES" }
            ]}
        ]
    }
};

function getGameData(lang) {
    return GAME_DATA[lang] || GAME_DATA['fr'];
}
