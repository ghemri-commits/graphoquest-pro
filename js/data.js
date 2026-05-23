function getGameData(lang) {
    const dataFR = [
        // ÉTAPE 1 : Voyelles simples
        {
            id: 1, miniGame: 'match', items: [
                { target: 'A', correct: 'a', options: ['a', 'o', 'e', 'u'], sound: 'a' },
                { target: 'O', correct: 'o', options: ['a', 'o', 'u', 'i'], sound: 'o' },
                { target: 'I', correct: 'i', options: ['e', 'i', 'a', 'y'], sound: 'i' },
                { target: 'U', correct: 'u', options: ['u', 'o', 'e', 'a'], sound: 'u' },
                { target: 'É', correct: 'é', options: ['e', 'é', 'a', 'i'], sound: 'é' }
            ]
        },
        {
            id: 2, miniGame: 'match', items: [
                { target: 'E', correct: 'e', options: ['e', 'a', 'o', 'u'], sound: 'e' },
                { target: 'Y', correct: 'y', options: ['i', 'y', 'u', 'a'], sound: 'y' },
                { target: 'OU', correct: 'ou', options: ['on', 'ou', 'oi', 'un'], sound: 'ou' },
                { target: 'ON', correct: 'on', options: ['ou', 'an', 'on', 'in'], sound: 'on' }
            ]
        },
        {
            id: 3, miniGame: 'complete', items: [
                { target: 'M_TO', missing: 1, correct: 'O', options: ['O', 'A', 'I', 'U'], hint: 'Moto' },
                { target: 'V_LO', missing: 1, correct: 'É', options: ['E', 'É', 'A', 'I'], hint: 'Vélo' },
                { target: 'L_T', missing: 1, correct: 'I', options: ['A', 'O', 'I', 'U'], hint: 'Lit' },
                { target: 'J_S', missing: 1, correct: 'U', options: ['O', 'U', 'I', 'A'], hint: 'Jus' }
            ]
        },
        {
            id: 4, miniGame: 'syllable', items: [
                { target: 'a-na-nas', parts: ['a', 'na', 'nas', 'ma'], word: 'Ananas' },
                { target: 'é-co-le', parts: ['é', 'co', 'le', 'la'], word: 'École' },
                { target: 'i-guane', parts: ['i', 'guane', 'ga', 'o'], word: 'Iguane' }
            ]
        },
        // ÉTAPE 2 : Consonnes continues (faciles à prononcer longuement)
        {
            id: 5, miniGame: 'match', items: [
                { target: 'M', correct: 'm', options: ['n', 'm', 'p', 'l'], sound: 'm' },
                { target: 'L', correct: 'l', options: ['l', 'i', 't', 'r'], sound: 'l' },
                { target: 'R', correct: 'r', options: ['p', 'r', 'l', 'n'], sound: 'r' },
                { target: 'S', correct: 's', options: ['c', 's', 'z', 'f'], sound: 's' }
            ]
        },
        {
            id: 6, miniGame: 'syllable', items: [
                { target: 'ma-man', parts: ['ma', 'man', 'na', 'pa'], word: 'Maman' },
                { target: 'lu-ne', parts: ['lu', 'ne', 'le', 'nu'], word: 'Lune' },
                { target: 'ro-be', parts: ['ro', 'be', 'ra', 'de'], word: 'Robe' }
            ]
        },
        {
            id: 7, miniGame: 'complete', items: [
                { target: '_OURIS', missing: 0, correct: 'S', options: ['S', 'C', 'F', 'M'], hint: 'Souris' },
                { target: '_ION', missing: 0, correct: 'L', options: ['R', 'L', 'M', 'N'], hint: 'Lion' },
                { target: 'PO_ME', missing: 2, correct: 'M', options: ['N', 'M', 'P', 'L'], hint: 'Pomme' }
            ]
        },
        {
            id: 8, miniGame: 'match', items: [
                { target: 'F', correct: 'f', options: ['v', 'f', 'p', 't'], sound: 'f' },
                { target: 'V', correct: 'v', options: ['f', 'v', 'b', 'w'], sound: 'v' },
                { target: 'CH', correct: 'ch', options: ['sh', 'ch', 'c', 'j'], sound: 'ch' },
                { target: 'J', correct: 'j', options: ['g', 'j', 'ch', 'z'], sound: 'j' }
            ]
        },
        {
            id: 9, miniGame: 'syllable', items: [
                { target: 'va-che', parts: ['va', 'che', 'fa', 'cha'], word: 'Vache' },
                { target: 'fi-lle', parts: ['fi', 'lle', 'vi', 'le'], word: 'Fille' },
                { target: 'ju-pe', parts: ['ju', 'pe', 'je', 'pu'], word: 'Jupe' }
            ]
        },
        {
            id: 10, miniGame: 'complete', items: [
                { target: '_AT', missing: 0, correct: 'CH', options: ['CH', 'SH', 'C', 'J'], hint: 'Chat' },
                { target: 'A_ION', missing: 1, correct: 'V', options: ['F', 'V', 'B', 'P'], hint: 'Avion' },
                { target: '_ROMAGE', missing: 0, correct: 'F', options: ['V', 'F', 'P', 'R'], hint: 'Fromage' }
            ]
        },
        // ÉTAPE 3 : Consonnes occlusives (explosives)
        {
            id: 11, miniGame: 'match', items: [
                { target: 'P', correct: 'p', options: ['b', 'p', 'q', 'd'], sound: 'p' },
                { target: 'T', correct: 't', options: ['d', 't', 'f', 'p'], sound: 't' },
                { target: 'C', correct: 'c', options: ['s', 'c', 'k', 'q'], sound: 'c' },
                { target: 'B', correct: 'b', options: ['d', 'p', 'b', 'q'], sound: 'b' }
            ]
        },
        {
            id: 12, miniGame: 'syllable', items: [
                { target: 'pa-pa', parts: ['pa', 'ta', 'ma', 'da'], word: 'Papa' },
                { target: 'to-ma-te', parts: ['to', 'ma', 'te', 'do'], word: 'Tomate' },
                { target: 'ca-nard', parts: ['ca', 'nard', 'ga', 'mar'], word: 'Canard' }
            ]
        },
        {
            id: 13, miniGame: 'complete', items: [
                { target: '_ALLON', missing: 0, correct: 'B', options: ['D', 'P', 'B', 'V'], hint: 'Ballon' },
                { target: '_ORTE', missing: 0, correct: 'P', options: ['B', 'P', 'T', 'D'], hint: 'Porte' },
                { target: 'GA_EAU', missing: 2, correct: 'T', options: ['D', 'T', 'P', 'C'], hint: 'Gâteau' }
            ]
        },
        {
            id: 14, miniGame: 'match', items: [
                { target: 'D', correct: 'd', options: ['b', 'p', 'd', 'q'], sound: 'd' },
                { target: 'G', correct: 'g', options: ['j', 'g', 'c', 'q'], sound: 'g' },
                { target: 'N', correct: 'n', options: ['m', 'n', 'u', 'r'], sound: 'n' }
            ]
        },
        {
            id: 15, miniGame: 'syllable', items: [
                { target: 'di-no-saure', parts: ['di', 'no', 'saure', 'bi'], word: 'Dinosaure' },
                { target: 'ga-rage', parts: ['ga', 'rage', 'ca', 'ja'], word: 'Garage' },
                { target: 'na-vi-re', parts: ['na', 'vi', 're', 'ma'], word: 'Navire' }
            ]
        },
        // ÉTAPE 4 : Sons complexes et digraphes
        {
            id: 16, miniGame: 'complete', items: [
                { target: 'M_TON', missing: 1, correct: 'OU', options: ['ON', 'OU', 'OI', 'AU'], hint: 'Mouton' },
                { target: 'P_DA', missing: 1, correct: 'AN', options: ['EN', 'ON', 'AN', 'IN'], hint: 'Panda' },
                { target: 'L_PIN', missing: 1, correct: 'A', options: ['A', 'E', 'O', 'I'], hint: 'Lapin' }
            ]
        },
        {
            id: 17, miniGame: 'match', items: [
                { target: 'OI', correct: 'oi', options: ['ou', 'oi', 'io', 'ua'], sound: 'oi' },
                { target: 'IN', correct: 'in', options: ['im', 'in', 'an', 'on'], sound: 'in' },
                { target: 'AU', correct: 'au', options: ['eau', 'ou', 'au', 'o'], sound: 'au' }
            ]
        },
        {
            id: 18, miniGame: 'syllable', items: [
                { target: 'oi-seau', parts: ['oi', 'seau', 'ou', 'so'], word: 'Oiseau' },
                { target: 'sa-pin', parts: ['sa', 'pin', 'za', 'pan'], word: 'Sapin' },
                { target: 'chau-ssure', parts: ['chau', 'ssure', 'cho', 'sure'], word: 'Chaussure' }
            ]
        },
        {
            id: 19, miniGame: 'complete', items: [
                { target: 'B_TEAU', missing: 1, correct: 'A', options: ['A', 'O', 'E', 'I'], hint: 'Bateau' },
                { target: 'TR_N', missing: 2, correct: 'AI', options: ['EI', 'AI', 'IN', 'AN'], hint: 'Train' },
                { target: 'M_SON', missing: 1, correct: 'AI', options: ['EI', 'AI', 'A', 'É'], hint: 'Maison' }
            ]
        },
        {
            id: 20, miniGame: 'match', items: [
                { target: 'PH', correct: 'ph', options: ['f', 'ph', 'v', 'p'], sound: 'ph' },
                { target: 'GN', correct: 'gn', options: ['ni', 'gn', 'nj', 'n'], sound: 'gn' },
                { target: 'EAU', correct: 'eau', options: ['au', 'o', 'eau', 'eu'], sound: 'eau' }
            ]
        },
        // ÉTAPE 5 : Maîtrise et fluidité
        {
            id: 21, miniGame: 'syllable', items: [
                { target: 'é-lé-phant', parts: ['é', 'lé', 'phant', 'fan'], word: 'Éléphant' },
                { target: 'mon-ta-gne', parts: ['mon', 'ta', 'gne', 'nie'], word: 'Montagne' },
                { target: 'cha-peau', parts: ['cha', 'peau', 'po', 'cho'], word: 'Chapeau' }
            ]
        },
        {
            id: 22, miniGame: 'complete', items: [
                { target: '_LAGE', missing: 0, correct: 'P', options: ['P', 'B', 'T', 'D'], hint: 'Plage' },
                { target: '_OIS', missing: 0, correct: 'TR', options: ['PR', 'TR', 'CR', 'DR'], hint: 'Trois' },
                { target: '_EUR', missing: 0, correct: 'FL', options: ['FL', 'VL', 'PL', 'BL'], hint: 'Fleur' }
            ]
        },
        {
            id: 23, miniGame: 'syllable', items: [
                { target: 'cro-co-di-le', parts: ['cro', 'co', 'di', 'le', 'gro'], word: 'Crocodile' },
                { target: 'pa-ra-pluie', parts: ['pa', 'ra', 'pluie', 'plou'], word: 'Parapluie' },
                { target: 'trom-pette', parts: ['trom', 'pette', 'tron', 'bette'], word: 'Trompette' }
            ]
        },
        {
            id: 24, miniGame: 'match', items: [
                { target: 'BR', correct: 'br', options: ['pr', 'br', 'dr', 'vr'], sound: 'br' },
                { target: 'CL', correct: 'cl', options: ['gl', 'cl', 'fl', 'pl'], sound: 'cl' },
                { target: 'FR', correct: 'fr', options: ['vr', 'fr', 'phr', 'fl'], sound: 'fr' }
            ]
        },
        {
            id: 25, miniGame: 'complete', items: [
                { target: '_RAPEAU', missing: 0, correct: 'D', options: ['D', 'B', 'P', 'T'], hint: 'Drapeau' },
                { target: 'DRA_EAU', missing: 3, correct: 'P', options: ['P', 'B', 'T', 'D'], hint: 'Drapeau' },
                { target: 'G_ENOUILLE', missing: 1, correct: 'R', options: ['R', 'L', 'N', 'M'], hint: 'Grenouille' }
            ]
        }
    ];

    const dataEN = [
        // ÉTAPE 1 : Short Vowels
        {
            id: 1, miniGame: 'match', items: [
                { target: 'A', correct: 'a', options: ['a', 'e', 'o', 'u'], sound: 'a' },
                { target: 'E', correct: 'e', options: ['a', 'e', 'i', 'u'], sound: 'e' },
                { target: 'I', correct: 'i', options: ['e', 'i', 'a', 'o'], sound: 'i' },
                { target: 'O', correct: 'o', options: ['u', 'o', 'a', 'e'], sound: 'o' },
                { target: 'U', correct: 'u', options: ['o', 'u', 'e', 'a'], sound: 'u' }
            ]
        },
        {
            id: 2, miniGame: 'complete', items: [
                { target: 'C_T', missing: 1, correct: 'A', options: ['A', 'O', 'E', 'I'], hint: 'Cat' },
                { target: 'D_G', missing: 1, correct: 'O', options: ['A', 'O', 'U', 'E'], hint: 'Dog' },
                { target: 'P_G', missing: 1, correct: 'I', options: ['E', 'I', 'A', 'U'], hint: 'Pig' }
            ]
        },
        {
            id: 3, miniGame: 'syllable', items: [
                { target: 'ap-ple', parts: ['ap', 'ple', 'ab', 'pe'], word: 'Apple' },
                { target: 'el-e-phant', parts: ['el', 'e', 'phant', 'fan'], word: 'Elephant' },
                { target: 'ig-loo', parts: ['ig', 'loo', 'ic', 'lou'], word: 'Igloo' }
            ]
        },
        // ÉTAPE 2 : Continuous Consonants
        {
            id: 4, miniGame: 'match', items: [
                { target: 'M', correct: 'm', options: ['n', 'm', 'w', 'l'], sound: 'm' },
                { target: 'S', correct: 's', options: ['c', 's', 'z', 'f'], sound: 's' },
                { target: 'F', correct: 'f', options: ['v', 'f', 'ph', 't'], sound: 'f' }
            ]
        },
        {
            id: 5, miniGame: 'complete', items: [
                { target: '_UN', missing: 0, correct: 'S', options: ['S', 'C', 'F', 'M'], hint: 'Sun' },
                { target: '_OON', missing: 0, correct: 'M', options: ['N', 'M', 'W', 'L'], hint: 'Moon' },
                { target: '_ISH', missing: 0, correct: 'F', options: ['V', 'F', 'P', 'S'], hint: 'Fish' }
            ]
        },
        {
            id: 6, miniGame: 'syllable', items: [
                { target: 'mon-key', parts: ['mon', 'key', 'man', 'ki'], word: 'Monkey' },
                { target: 'spi-der', parts: ['spi', 'der', 'spa', 'dir'], word: 'Spider' },
                { target: 'flow-er', parts: ['flow', 'er', 'flo', 'ar'], word: 'Flower' }
            ]
        },
        // ÉTAPE 3 : Stop Consonants
        {
            id: 7, miniGame: 'match', items: [
                { target: 'P', correct: 'p', options: ['b', 'p', 'd', 'q'], sound: 'p' },
                { target: 'T', correct: 't', options: ['d', 't', 'f', 'p'], sound: 't' },
                { target: 'C', correct: 'c', options: ['k', 'c', 's', 'q'], sound: 'c' }
            ]
        },
        {
            id: 8, miniGame: 'complete', items: [
                { target: '_EN', missing: 0, correct: 'P', options: ['B', 'P', 'T', 'D'], hint: 'Pen' },
                { target: '_REE', missing: 0, correct: 'T', options: ['D', 'T', 'P', 'F'], hint: 'Tree' },
                { target: '_AR', missing: 0, correct: 'C', options: ['K', 'C', 'S', 'G'], hint: 'Car' }
            ]
        },
        {
            id: 9, miniGame: 'syllable', items: [
                { target: 'pen-cil', parts: ['pen', 'cil', 'pan', 'sel'], word: 'Pencil' },
                { target: 'ti-ger', parts: ['ti', 'ger', 'tai', 'jer'], word: 'Tiger' },
                { target: 'cam-el', parts: ['cam', 'el', 'com', 'al'], word: 'Camel' }
            ]
        },
        // ÉTAPE 4 : Digraphs & Magic E
        {
            id: 10, miniGame: 'match', items: [
                { target: 'SH', correct: 'sh', options: ['ch', 'sh', 'th', 's'], sound: 'sh' },
                { target: 'CH', correct: 'ch', options: ['sh', 'ch', 'c', 'tch'], sound: 'ch' },
                { target: 'TH', correct: 'th', options: ['f', 'th', 'v', 't'], sound: 'th' }
            ]
        },
        {
            id: 11, miniGame: 'complete', items: [
                { target: '_HEEP', missing: 0, correct: 'S', options: ['S', 'C', 'TH', 'F'], hint: 'Sheep' },
                { target: '_HAIR', missing: 0, correct: 'C', options: ['SH', 'CH', 'C', 'T'], hint: 'Chair' },
                { target: '_HREE', missing: 0, correct: 'T', options: ['F', 'TH', 'T', 'S'], hint: 'Three' }
            ]
        },
        {
            id: 12, miniGame: 'syllable', items: [
                { target: 'shep-herd', parts: ['shep', 'herd', 'chep', 'hird'], word: 'Shepherd' },
                { target: 'chick-en', parts: ['chick', 'en', 'shick', 'in'], word: 'Chicken' },
                { target: 'thun-der', parts: ['thun', 'der', 'fun', 'dar'], word: 'Thunder' }
            ]
        },
        {
            id: 13, miniGame: 'complete', items: [
                { target: 'C_KE', missing: 1, correct: 'A', options: ['A', 'O', 'E', 'I'], hint: 'Cake' },
                { target: 'B_KE', missing: 1, correct: 'I', options: ['E', 'I', 'A', 'Y'], hint: 'Bike' },
                { target: 'H_ME', missing: 1, correct: 'O', options: ['A', 'O', 'U', 'E'], hint: 'Home' }
            ]
        },
        {
            id: 14, miniGame: 'match', items: [
                { target: 'EE', correct: 'ee', options: ['ea', 'ee', 'e', 'ie'], sound: 'ee' },
                { target: 'OA', correct: 'oa', options: ['ow', 'oa', 'o', 'oe'], sound: 'oa' },
                { target: 'OO', correct: 'oo', options: ['u', 'oo', 'ou', 'ew'], sound: 'oo' }
            ]
        },
        {
            id: 15, miniGame: 'syllable', items: [
                { target: 'bee-tle', parts: ['bee', 'tle', 'bea', 'tel'], word: 'Beetle' },
                { target: 'boat-man', parts: ['boat', 'man', 'bot', 'men'], word: 'Boatman' },
                { target: 'kan-ga-roo', parts: ['kan', 'ga', 'roo', 'ru'], word: 'Kangaroo' }
            ]
        },
        // ÉTAPE 5 : Blends & Complex Words
        {
            id: 16, miniGame: 'match', items: [
                { target: 'BL', correct: 'bl', options: ['pl', 'bl', 'cl', 'gl'], sound: 'bl' },
                { target: 'CL', correct: 'cl', options: ['gl', 'cl', 'fl', 'pl'], sound: 'cl' },
                { target: 'FL', correct: 'fl', options: ['pl', 'fl', 'bl', 'cl'], sound: 'fl' }
            ]
        },
        {
            id: 17, miniGame: 'complete', items: [
                { target: '_LACK', missing: 0, correct: 'BL', options: ['PL', 'BL', 'CL', 'GL'], hint: 'Black' },
                { target: '_LOCK', missing: 0, correct: 'CL', options: ['GL', 'CL', 'FL', 'PL'], hint: 'Clock' },
                { target: '_OWER', missing: 0, correct: 'FL', options: ['BL', 'FL', 'PL', 'CL'], hint: 'Flower' }
            ]
        },
        {
            id: 18, miniGame: 'syllable', items: [
                { target: 'blan-ket', parts: ['blan', 'ket', 'plan', 'cat'], word: 'Blanket' },
                { target: 'clev-er', parts: ['clev', 'er', 'glev', 'ir'], word: 'Clever' },
                { target: 'fla-min-go', parts: ['fla', 'min', 'go', 'bla'], word: 'Flamingo' }
            ]
        },
        {
            id: 19, miniGame: 'match', items: [
                { target: 'TR', correct: 'tr', options: ['pr', 'tr', 'dr', 'cr'], sound: 'tr' },
                { target: 'DR', correct: 'dr', options: ['br', 'dr', 'tr', 'gr'], sound: 'dr' },
                { target: 'CR', correct: 'cr', options: ['gr', 'cr', 'tr', 'fr'], sound: 'cr' }
            ]
        },
        {
            id: 20, miniGame: 'complete', items: [
                { target: '_RAIN', missing: 0, correct: 'TR', options: ['PR', 'TR', 'DR', 'CR'], hint: 'Train' },
                { target: '_REAM', missing: 0, correct: 'DR', options: ['BR', 'DR', 'TR', 'GR'], hint: 'Dream' },
                { target: '_OWN', missing: 0, correct: 'CR', options: ['GR', 'CR', 'TR', 'FR'], hint: 'Crown' }
            ]
        },
        {
            id: 21, miniGame: 'syllable', items: [
                { target: 'trac-tor', parts: ['trac', 'tor', 'prac', 'ter'], word: 'Tractor' },
                { target: 'drag-on', parts: ['drag', 'on', 'trag', 'an'], word: 'Dragon' },
                { target: 'cro-co-dile', parts: ['cro', 'co', 'dile', 'gro'], word: 'Crocodile' }
            ]
        },
        {
            id: 22, miniGame: 'match', items: [
                { target: 'AR', correct: 'ar', options: ['er', 'ar', 'or', 'ur'], sound: 'ar' },
                { target: 'OR', correct: 'or', options: ['ar', 'or', 'er', 'our'], sound: 'or' },
                { target: 'ER', correct: 'er', options: ['ar', 'ir', 'er', 'ur'], sound: 'er' }
            ]
        },
        {
            id: 23, miniGame: 'complete', items: [
                { target: 'ST_R', missing: 2, correct: 'A', options: ['E', 'A', 'O', 'U'], hint: 'Star' },
                { target: 'F_RK', missing: 1, correct: 'O', options: ['A', 'O', 'E', 'U'], hint: 'Fork' },
                { target: 'WInt_R', missing: 4, correct: 'E', options: ['A', 'E', 'O', 'I'], hint: 'Winter' }
            ]
        },
        {
            id: 24, miniGame: 'syllable', items: [
                { target: 'far-mer', parts: ['far', 'mer', 'fer', 'mar'], word: 'Farmer' },
                { target: 'cor-ner', parts: ['cor', 'ner', 'car', 'nor'], word: 'Corner' },
                { target: 'but-ter-fly', parts: ['but', 'ter', 'fly', 'bet'], word: 'Butterfly' }
            ]
        },
        {
            id: 25, miniGame: 'complete', items: [
                { target: '_PRING', missing: 0, correct: 'S', options: ['S', 'C', 'F', 'T'], hint: 'Spring' },
                { target: 'STR_NG', missing: 3, correct: 'O', options: ['A', 'O', 'E', 'I'], hint: 'Strong' },
                { target: 'SPLE_DOUR', missing: 4, correct: 'N', options: ['M', 'N', 'R', 'L'], hint: 'Splendour' }
            ]
        }
    ];

    return { levels: lang === 'en' ? dataEN : dataFR };
}
