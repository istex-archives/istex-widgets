var istexConfigDefault = {
  // l'adresse de l'API de l'Istex
  // pour une ezproxyfication, réglez ici l'adresse ezproxyfiée
  // ex à l'UL: https://api-istex-fr.bases-doc.univ-lorraine.fr 
  istexApi: 'https://api.istex.fr',
  
  // pour lancer une recherche au chargement de la page
  // indiquer les mots à rechercher (argument de ?q= au niveau de l'api istex)
  query: "",

  // le nombre max de caractères du résumé à afficher
  abstractLength: 250,

  // le nombre max de caractères du titre à afficher
  titleLength: 100,

  // le format qu'on souhaite voir s'ouvrir quand on clique sur le titre
  fullTextOnTitle: 'pdf',
  
  // le nom de l'évènement émit au moment de l'authentification réussie
  connectedEventName: "istex-connected",

  // le nom de l'évènement émit au moment d'une recherche    
  resultsEventName: "istex-results"
};

// create a empty istexConfig variable
if (!istexConfig) {
  var istexConfig = {};
}
