var istexConfigDefault = {
  // l'adresse de l'API de l'Istex
  istexApi: 'https://api.istex.fr',
  
  // pour lancer une recherche au chargement de la page
  // positionner les mots à rechercher
  query: "",
  
  // le nom de l'évènement émit au moment de l'authentification réussie
  connectedEventName: "istex-connected",

  // le nom de l'évènement émit au moment d'une recherche    
  resultsEventName: "istex-results",

  // la taille max en nombre de caractères du résumé
  abstractLength: 250,

  // la taille max en nombre de caractères du titre
  titleLength: 100,

  // quel est le format clickable au niveau du titre
  fullTextOnTitle: 'pdf'
};

// create a empty istexConfig variable
if (!istexConfig) {
  var istexConfig = {};
}