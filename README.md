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
    
    <script type="text/javascript" src="http://istex.github.io/search/js/script.min.js"></script>
    <link rel="stylesheet" href="http://istex.github.io/search/themes/default/style.min.css" />
    
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

## Développeurs

### Installation d'un environnement de développement

Voici les étapes permettant de mettre en place une environnement de développement :

Installer NodeJS et npm (exemple sous Linux avec l'outil [nvm](https://github.com/creationix/nvm)) :
```bash
curl https://raw.githubusercontent.com/creationix/nvm/v0.20.0/install.sh | bash
nvm install 0.10
nvm use 0.10
```

Récupérer le dépôt git des widgets Istex :
```bash
git clone git@github.com:istex/widget.istex.fr.git
```

Initialiser les dépendances (gulp est l'outil de build) :
```bash
cd widget.istex.fr/
npm install
npm install -g gulp
gulp init
```

Vous êtes alors opérationels pour développer votre contribution.

### Tester, compiler et déployer

Les tests unitaires se trouvent dans le répertoire ''./test/'', pour les exécuter, tapez :
```bash
gulp mocha
```

Pour compiler les widgets vers le répertoire ''./dist/'', tapez :
```bash
gulp build
```
Pour déployer les widgets sur le site [istex.github.io](http://istex.github.io/) ([dépôt git](https://github.com/istex/istex.github.io)), tapez :
```bash
gulp deploy
```
