// ============================================================
// Banque de mots alignée sur la Liste orthographique du
// Ministère de l'Éducation du Québec (MEQ), organisée par
// cycle du primaire. Vocabulaire représentatif et fréquent ;
// pour intégrer le fichier officiel complet, il suffit de
// remplacer/compléter les tableaux ci-dessous.
//
// Utilisée par : les niveaux de dictée générés (data.js) et le
// Défi du jour dynamique (app.js).
// ============================================================
const MEQ_WORDS = {
    fr: {
        // 1er cycle (1re-2e année, 6-8 ans) — mots courts et fréquents
        cycle1: [
            'ami', 'chat', 'chien', 'école', 'livre', 'table', 'maman', 'papa', 'vélo', 'moto',
            'lune', 'robe', 'pomme', 'lion', 'souris', 'jus', 'lit', 'rouge', 'bleu', 'vert',
            'jaune', 'banane', 'gâteau', 'ballon', 'porte', 'jardin', 'fleur', 'arbre', 'oiseau', 'poisson',
            'soleil', 'pluie', 'neige', 'hiver', 'été', 'matin', 'jour', 'nuit', 'eau', 'lait',
            'pain', 'fromage', 'cheval', 'vache', 'mouton', 'lapin', 'canard', 'tortue', 'main', 'pied'
        ],
        // 2e cycle (3e-4e année, 8-10 ans) — mots de longueur moyenne
        cycle2: [
            'maison', 'garçon', 'fille', 'voiture', 'bicyclette', 'montagne', 'rivière', 'forêt', 'village', 'quartier',
            'dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'janvier', 'février', 'automne',
            'printemps', 'professeur', 'histoire', 'lecture', 'écriture', 'nombre', 'addition', 'problème', 'animal', 'dinosaure',
            'éléphant', 'girafe', 'papillon', 'fourmi', 'abeille', 'grenouille', 'château', 'princesse', 'chevalier', 'dragon',
            'trésor', 'aventure', 'courage', 'content', 'heureux', 'malade', 'fatigué', 'rapide', 'famille', 'musique'
        ],
        // 3e cycle (5e-6e année, 10-12 ans) — mots longs, vocabulaire abstrait
        cycle3: [
            'gouvernement', 'bibliothèque', 'apprentissage', 'développement', 'environnement', 'géographie', 'mathématique', 'vocabulaire', 'dictionnaire', 'encyclopédie',
            'expérience', 'scientifique', 'ordinateur', 'téléphone', 'télévision', 'électricité', 'température', 'atmosphère', 'planète', 'univers',
            'citoyen', 'démocratie', 'parlement', 'municipalité', 'responsabilité', 'organisation', 'communication', 'information', 'imagination', 'extraordinaire',
            'magnifique', 'dangereux', 'courageux', 'généreux', 'intelligent', 'différent', 'important', 'nécessaire', 'possible', 'impossible',
            'philosophie', 'architecture', 'agriculture', 'aujourd\'hui', 'beaucoup', 'toujours', 'pourquoi', 'parce que', 'quelquefois', 'maintenant'
        ]
    },
    en: {
        cycle1: [
            'cat', 'dog', 'sun', 'fish', 'book', 'tree', 'milk', 'frog', 'ball', 'star',
            'moon', 'rain', 'snow', 'hand', 'foot', 'bird', 'blue', 'red', 'green', 'apple'
        ],
        cycle2: [
            'house', 'friend', 'school', 'garden', 'flower', 'animal', 'monkey', 'spider', 'winter', 'summer',
            'dragon', 'castle', 'number', 'letter', 'pencil', 'family', 'brother', 'sister', 'mother', 'father'
        ],
        cycle3: [
            'government', 'beautiful', 'vocabulary', 'understanding', 'dictionary', 'environment', 'mathematics', 'geography', 'important', 'dangerous',
            'knowledge', 'adventure', 'electricity', 'temperature', 'scientist', 'communication', 'information', 'imagination', 'responsible', 'experience'
        ]
    }
};
