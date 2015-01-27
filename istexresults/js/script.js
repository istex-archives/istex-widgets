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

    self.tpl.pagination = $(
      '<div class="istex-results-pagination">' +
        '<button class="istex-results-pagination-prec" title="Page précédente">Page précédente</button>' +
        '<ul class="istex-results-pagination-plist">' +
          '<li class="istex-results-pagination-page-selected">1</li>' +
          '<li>2</li>' +
          '<li>3</li>' +
          '<li>4</li>' +
          '<li>5</li>' +
          '<li>6</li>' +
          '<li>7</li>' +
          '<li>8</li>' +
          '<li>9</li>' +
          '<li>10</li>' +
        '</ul>' +
        '<button class="istex-results-pagination-next" title="Page suivante">Page suivante</button>' +
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
      try {
        self.updateResultsInTheDom(results, istexSearch);
      } catch (err) {
        self.displayErrorInDom(
          'Erreur car le format de l\'API Istex a probablement changé. <br/>' + 
          'Merci de le signaler par mail à istex@inist.fr (copie d\'écran appréciée)',
          err
        );
      }
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

    // not not fill anything in the results list
    // if results are empty
    if (!results) {
      $(self.elt).empty();
      return;
    }

    // calculate the query time
    var queryElapsedTime = new Date() - istexSearch.queryStartTime;

    // build the results statistics element
    var stats = self.tpl.stats.clone();
    if (results.total > 0) {
      var querySpeedHtml, queryElapsedTime, queryElasticSearchTime = '';
      var queryTotalTime = (queryElapsedTime/1000).toFixed(2);
      if (results.stats) {
          queryElasticSearchTime = 'Réseau : ' 
            + ((queryElapsedTime -
                results.stats.elasticsearch.took -
                results.stats['istex-data'].took -
                results.stats['istex-rp'].took)/1000).toFixed(2) + ' sec'
            + ', Moteur de recherche : ' + (results.stats.elasticsearch.took/1000).toFixed(2) + ' sec'
            + ', Traitements de l\'API : '
            + ((results.stats['istex-data'].took + results.stats['istex-rp'].took)/1000).toFixed(2) + ' sec';
        } else {
          queryElasticSearchTime = 'Statistiques détaillées non disponibles';
        }
        querySpeedHtml = '<span title="'
          + queryElasticSearchTime
          + '">('
          + queryTotalTime
          + ' secondes)</span>';

      if (self.selectedPage > 1) {
        stats.html('Page ' + self.selectedPage + ' sur environ '
          + niceNumber(results.total)
          + ' résultats ' + querySpeedHtml);
      } else {
        stats.html('Environ '
          + niceNumber(results.total)
          + ' résultats ' + querySpeedHtml);
      }
    } else {
      stats.text('Aucun résultat');      
    }
    
    // build the result list
    var items = self.tpl.items.clone().hide();
    $.each(results.hits, function (idx, item) {
      var itemElt = self.tpl.item.clone();

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

    // handle the pagination element
    if (results.total > 0) {
      self.updatePaginationInTheDom(
        self.selectedPage || 1,
        Math.ceil(results.total / self.settings.pageSize)
      );
    }
  };

  /**
   * Update the pagination element in the DOM
   */
  Plugin.prototype.updatePaginationInTheDom = function (selectedPage, numberOfPage) {
    var self = this;

    // skip the pagination zone if not wanted
    if (!self.settings.showPagination) {
      return;
    }

    // calculate the pageStart and pageEnd
    var pageStart, pageEnd;
    var maxPagesInPagination = self.settings.maxPagesInPagination;

    // try to put the selectedPage in the middle
    pageStart = selectedPage - Math.round(maxPagesInPagination/2) + 1;
    pageEnd   = selectedPage + Math.round(maxPagesInPagination/2);
    // manage the border case
    if (pageStart < 1) {
      pageStart = 1;
    }
    if (pageEnd > numberOfPage) {
      pageEnd = numberOfPage;
    }
    // if less page to show than maxPagesInPagination
    if (pageEnd - pageStart < maxPagesInPagination - 1) {
      if (pageEnd - selectedPage < selectedPage - pageStart) {
        pageStart = pageEnd - maxPagesInPagination + 1;
      } else {
        pageEnd = pageStart + maxPagesInPagination - 1;
      }
    }

    // build the pagination HTML
    var pagination = self.tpl.pagination.clone().hide();
   
    // do not show "précédent" link if the first page is selected
    if (selectedPage == 1) {
      pagination.find('.istex-results-pagination-prec').hide();
    } else {
      // when the prec page is clicked, goto selectedPage - 1
      pagination.find('.istex-results-pagination-prec').click(function () {
        self.gotoPage(selectedPage - 1);
      });
    }
    // do not show "suivant" link if the last page is selected
    if (selectedPage == numberOfPage) {
      pagination.find('.istex-results-pagination-next').hide();
    } else {
      // when the next page is clicked, goto selectedPage + 1
      pagination.find('.istex-results-pagination-next').click(function () {
        self.gotoPage(selectedPage + 1);
      });
    }

    // fill the pagination zone with pages
    pagination.find('ul.istex-results-pagination-plist').empty();
    for (var pageIdx = pageStart; pageIdx <= pageEnd; pageIdx++) {
      var pageElt = $('<li><a>' + pageIdx + '</a></li>').data('page-idx', pageIdx);
      if (pageIdx == selectedPage) {
        pageElt.addClass('istex-results-pagination-page-selected');
      } else {
        // when the page is clicked, goto pageIdx
        pageElt.click(function () {
          self.gotoPage($(this).data('page-idx'));
        });
      }
      //console.log(pageElt, pagination.find('.istex-results-pagination ul'))
      pagination.find('ul.istex-results-pagination-plist').append(pageElt);
    }

    // insert the pagination zone into the DOM
    $(self.elt).append(pagination);
    pagination.fadeIn();
  };

  /**
   * When a pagination link is clicked
   * goto the specified page
   */
  Plugin.prototype.gotoPage = function (pageIdx) {
    var self = this;
    
    // remember the selected page
    self.selectedPage = pageIdx;

    // send the event telling which page is requested
    $.event.trigger(self.settings.gotoPageEventName, [ pageIdx ]);
  };

  /**
   * Update the DOM with the received results
   */
  Plugin.prototype.displayErrorInDom = function (message, err) {
    var self = this;

    $(self.elt).css({ opacity: 1.0 });
    $(self.elt).fadeOut({
      complete: function () {
        $(self.elt).empty();
        $(self.elt).append(
          '<p class="istex-results-error">' +
            '<span class="istex-results-error-msg">' + message + '</span>' +
            '<br/>' +
            '<span class="istex-results-error-raw">' + err + '</span>' +
          '</p>'
        );
        $(self.elt).fadeIn();
        throw err;
      }
    });

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