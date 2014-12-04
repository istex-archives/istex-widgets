# widget.istex.fr

Widgets ISTEX (search, results, facets) permettant de créer rapidement des interface Web d'interrogation des ressources ISTEX.

[![Build Status](https://travis-ci.org/istex/widget.istex.fr.svg?branch=master)](https://travis-ci.org/istex/widget.istex.fr)

## Widget search

Ce widget permet d'insérer dans la page HTML une zone de saisie ainsi qu'un bouton de recherche. Lorsqu'une suite de mots sont tapés puis que le bouton rechercher est pressé, l'API Istex est interrogée à travers des requêtes AJAX. Une fois les résultats reçus, ils sont propagés aux widgets results et facets mais également à l'ensemble du DOM sous la forme d'un événement javascript.

Exemple d'utilisation du widget :

```html
<html>
  <head>
    
    <!-- ... -->
    
    <script type="text/javascript" src="http://istex.github.io/search/js/script.js"></script>
    <link rel="stylesheet" href="http://istex.github.io/search/themes/default/style.css" />
    
    <!-- ... -->

  </head>
  <body>

    <div id="istex-widget-search"></div>
    <script type="text/javascript">
        $('#istex-widget-search').istexSearch({ query: 'brain' });
    </script>

  </body>
</html>
```

