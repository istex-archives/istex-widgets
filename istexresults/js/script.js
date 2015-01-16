/* jshint -W117 */
'use strict';

/**
 * Widget ISTEX
 */
;(function ($, window, document, undefined) {

  var pluginName = "istexResults";
  var defaults = istexConfigDefault;

  // The actual plugin constructor
  function Plugin(element, options) {
    this.elt = element;
    this.settings = $.extend({}, defaults, istexConfig, options);
    this._defaults = defaults;
    this._name = pluginName;
    this.init();
  }

  Plugin.prototype.init = function () {
    var self = this;

    self.tpl = {};
    self.tpl.stats = $(
      '<div class="istex-results-items-stats">' +
        'Environ 783 594 résultats' + 
      '</div>'
    );

    self.tpl.items = $('<ol class="istex-results-items"></ol>');

    /*jshint ignore:start*/
    self.tpl.item = $(
      '<li class="istex-results-item">' +
        '<a class="istex-results-item-title" target="_blank">Biomechanical Simulation of Electrode Migration for Deep Brain Stimulation</a>' +
        '<p class="istex-results-item-abstract">Developing a whole brain simulator, a computer simulation in modeling brain structure and functionality of human, is the ultimate goal of Brain Informatics. Brain simulator helps researchers cross the bridge between the cognitive behavior/decease, and the neurophysiology. Brain simulators development is still in infant stage. Current simulators mostly consider the neuron as the basic functional component. This paper starts with introducing the background and current status of brain simulator. Then, an extensible brain simulator development framework is proposed. From information technology perspective, we adopt overlay and peer-to-peer network to deal with the complexity of brain network. Moreover, layered design with object-oriented brain class hierarchy forms the flexible development framework of the proposed simulator. The proposed brain simulator is evolved in case-based incremental delivery style. The power of the simulator will grow along with more research cases from cognitive and clinical neuroscience.</p>' +
        '<div class="istex-results-item-corpus">springer</div>' +
        '<ul class="istex-results-item-download">' +
          '<li class="istex-results-item-dl">' +
            '<a href="#" class="istex-results-item-dl-pdf" title="Télécharger le PDF"></a>' +
          '</li>' +
          '<li class="istex-results-item-dl">' +
            '<a href="#" class="istex-results-item-dl-mods" title="Télécharger les métadonnées MODS"></a>' +
          '</li>' +
        '</ul>' +
        '<div class="istex-results-item-bottom"></div>' +
      '</li>'
    );
    
    self.tpl.dlItem = {};
    self.tpl.dlItem['default'] = $(
      '<li class="istex-results-item-dl">' +
        '<a href="#" title="Télécharger le fichier (format inconnu)" target="_blank"></a>' +
      '</li>'
    );
    self.tpl.dlItem['mods'] = $(
      '<li class="istex-results-item-dl">' +
        '<a href="#" class="istex-results-item-dl-mods" title="Télécharger les métadonnées MODS" target="_blank"></a>' +
      '</li>'
    );
    self.tpl.dlItem['xml'] = $(
      '<li class="istex-results-item-dl">' +
        '<a href="#" class="istex-results-item-dl-xml" title="Télécharger les métadonnées éditeur (XML)" target="_blank"></a>' +
      '</li>'
    );
    self.tpl.dlItem['zip'] = $(
      '<li class="istex-results-item-dl">' +
        '<a href="#" class="istex-results-item-dl-zip" title="Télécharger le tout au format ZIP" target="_blank"></a>' +
      '</li>'
    );
    self.tpl.dlItem['tiff'] = $(
      '<li class="istex-results-item-dl">' +
        '<a href="#" class="istex-results-item-dl-tiff" title="Télécharger le ou les fichiers TIFF" target="_blank"></a>' +
      '</li>'
    );
    self.tpl.dlItem['tei'] = $(
      '<li class="istex-results-item-dl">' +
        '<a href="#" class="istex-results-item-dl-tei" title="Télécharger le plein-texte TEI" target="_blank"></a>' +
      '</li>'
    );
    self.tpl.dlItem['txt'] = $(
      '<li class="istex-results-item-dl">' +
        '<a href="#" class="istex-results-item-dl-txt" title="Télécharger le plein-texte TXT" target="_blank"></a>' +
      '</li>'
    );
    self.tpl.dlItem['pdf'] = $(
      '<li class="istex-results-item-dl">' +
        '<a href="#" class="istex-results-item-dl-pdf" title="Télécharger le plein-texte PDF" target="_blank"></a>' +
      '</li>'
    );
    /*jshint ignore:end*/

    // bind received results
    $(document).bind(self.settings.resultsEventName, function (event, results, istexSearch) {
      self.updateResultsInTheDom(results, istexSearch);
    });

    // bind waiting for result event
    $(document).bind(self.settings.waitingForResultsEventName, function (event) {
      // fade effect on the old result page
      // to tell the user a query is in process
      $(self.elt).css({ opacity: 0.5 });
    });
  };

  /**
   * Update the DOM with the received results
   */
  Plugin.prototype.updateResultsInTheDom = function (results, istexSearch) {
    var self = this;

    // calculate the query time
    var queryElapsedTime = new Date() - istexSearch.queryStartTime;

    // build the result stats element
    var stats = self.tpl.stats.clone();
    if (results.total > 0) {
      stats.text('Environ '
        + niceNumber(results.total)
        + ' résultats (' + (queryElapsedTime/1000).toFixed(2) + ' secondes)');
    } else {
      stats.text('Aucun résultat');      
    }
    
    // build the result list
    var items = self.tpl.items.clone().hide();
    $.each(results.hits, function (idx, item) {
      var itemElt = self.tpl.item.clone();

      console.log(item);
      itemElt.find('.istex-results-item-title').text(item.title);
      if (item.abstract) {
        itemElt.find('.istex-results-item-abstract').text(item.abstract);  
      } else {
        itemElt.find('.istex-results-item-abstract').text('');
        itemElt.find('.istex-results-item-abstract').attr('title', 'Pas de résumé');
      }
      itemElt.find('.istex-results-item-corpus').text(item.corpusName);

      itemElt.find('.istex-results-item-download').empty();
      // fulltext links
      $.each(item.fulltext, function (idx, ftItem) {
        var dlItem;
        if (self.tpl.dlItem[ftItem.type]) {
          dlItem = self.tpl.dlItem[ftItem.type].clone();
        } else {
          dlItem = self.tpl.dlItem['default'].clone();
        }
        dlItem.find('a').attr('href', self.fixIstexAPILink(ftItem.uri));
        // sepcial case for PDF (link to the title element)
        if (ftItem.type == self.settings.fullTextOnTitle) {
          itemElt.find('.istex-results-item-title').attr('href', self.fixIstexAPILink(ftItem.uri));
        }
        itemElt.find('.istex-results-item-download').append(dlItem);
      });
      // metadata links
      $.each(item.metadata, function (idx, ftItem) {
        var dlItem;
        if (self.tpl.dlItem[ftItem.type]) {
          dlItem = self.tpl.dlItem[ftItem.type].clone();
        } else {
          dlItem = self.tpl.dlItem['default'].clone();
        }
        dlItem.find('a').attr('href', self.fixIstexAPILink(ftItem.uri));
        itemElt.find('.istex-results-item-download').append(dlItem);
      });

      // truncate abstract text
      var abs = itemElt.find('.istex-results-item-abstract').text();
      if (abs.length > self.settings.abstractLength) {
        abs = abs.substring(0, self.settings.abstractLength);
        abs += "…";
        itemElt.find('.istex-results-item-abstract').text(abs);
      }

      // truncate title text
      var title = itemElt.find('.istex-results-item-title').text();
      if (title.length > self.settings.titleLength) {
        title = title.substring(0, self.settings.titleLength);
        title += "…";
        itemElt.find('.istex-results-item-title')
               .attr('title',itemElt.find('.istex-results-item-title').text());
        itemElt.find('.istex-results-item-title').text(title);
      }

      items.append(itemElt);
    });

    // cleanup the result list in the DOM
    $(self.elt).empty();
    $(self.elt).css({ opacity: 1.0 });

    // insert the results stats into the DOM
    $(self.elt).append(stats);

    // insert the result list into the DOM
    $(self.elt).append(items);
    items.fadeIn();
  };


  /**
   * When ezproxy is used, the api link is not api.istex.fr
   * but could be something like https://api-istex-fr.bases-doc.univ-lorraine.fr
   * This function helps to fixe the absolute links returned by the API.
   */
  Plugin.prototype.fixIstexAPILink = function (link) {
    var self = this;
    return link.replace('https://api.istex.fr', self.settings.istexApi);
  };

  /**
   * Helper to convert 2435667 to "2 435 667"
   */
  function niceNumber(nStr) {
    nStr += '';
    var x = nStr.split('.');
    var x1 = x[0];
    var x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
      x1 = x1.replace(rgx, '$1' + ' ' + '$2');
    }
    return x1 + x2;
  }

  // A really lightweight plugin wrapper around the constructor,
  // preventing against multiple instantiations
  $.fn[ pluginName ] = function (options) {
    this.each(function() {
      if (!$.data(this, "plugin_" + pluginName)) {
        $.data(this, "plugin_" + pluginName, new Plugin(this, options));
      }
    });
    return this;
  };

})(jQuery, window, document);