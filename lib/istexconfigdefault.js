var istexConfigDefault = {
  // l'adresse de l'API de l'Istex
  istexApi: 'https://api.istex.fr',
  
  // pour lancer une recherche au chargement de la page
  // positionner les mots à rechercher
  query: "",
  
  // le nom de l'évènement émit au moment d'une recherche    
  resultsEventName: "istex-results",

  // la taille en nombre de caractères du résumé
  abstractLength: 250,

  // quel est le format clickable au niveau du titre
  fullTextOnTitle: 'pdf',
};

// create a empty istexConfig variable
if (!istexConfig) {
  var istexConfig = {};
}