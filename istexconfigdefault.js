var istexConfigDefault = {
  // l'adresse de l'API de l'Istex
  // pour une ezproxyfication, réglez ici l'adresse ezproxyfiée
  // ex à l'UL: https://api-istex-fr.bases-doc.univ-lorraine.fr
  istexApi: 'https://api.istex.fr',

  // pour lancer une recherche au chargement de la page
  // indiquer les mots à rechercher (argument de ?q= au niveau de l'api istex)
  query: "",

  // il est possible de ne charger que certaines facettes
  facetsToLoad: [ 'corpus' ],

  // il est possible de cacher la zone de pagination avec ce paramètre
  showPagination: true,

  // nombre de résultats souhaités par page
  pageSize: 10,

  // nombre max de pages à montrer dans la zone de pagination
  maxPagesInPagination: 10,

  // le nombre max de caractères du résumé à afficher
  abstractLength: 250,

  // le nombre max de caractères du titre à afficher
  titleLength: 100,

  // le format qu'on souhaite voir s'ouvrir quand on clique sur le titre
  fullTextOnTitle: 'pdf',

  // il est possible de cacher l'affichage de la vitesse de la requête
  // ex: "Environ 8 933 993 résultats (0.24 secondes)"
  //     si showQuerySpeed vaut false, "(0.24 secondes)" ne sera pas affiché
  showQuerySpeed: true,

  // les différents textes paramétrables
  labels: {
    facets: {
      'title' : 'Affiner votre recherche',
      'corpus' : 'Corpus',
    }
  },

  // le nom de l'événement émit au moment de l'authentification réussie
  connectedEventName: "istex-connected",

  // le nom de l'événement émit au moment où une nouvelle recherche est envoyée
  newSearchEventName: "istex-search",

  // le nom de l'événement émit au moment d'une recherche
  resultsEventName: "istex-results",

  // le nom de l'événement émit au moment d'un changement de page
  gotoPageEventName: "istex-gotopage",

  // le nom de l'événement émit a chaque fois qu'une recherche est envoyée
  // et qui donnera probablement (sauf erreur) lieux à un event "istex-results"
  waitingForResultsEventName: "istex-waiting-for-results"
};

// create a empty istexConfig variable
if (!istexConfig) {
  var istexConfig = {};
}
