/* jshint -W117 */
'use strict';

/**
 * Widget istexFacets
 */
;(function ($, window, document, undefined) {

  var pluginName  = "istexFacets";
  var defaults    = istexConfigDefault;

  // The actual plugin constructor
  function Plugin(element, options) {
    this.elt = element;
    this.settings = $.extend({}, defaults, istexConfig, options);
    this._defaults = defaults;
    this._name = pluginName;

    // no corpus facet selected by default
    this.selectedCorpus = [];

    this.init();
  }

  /**
   * Wait for any results event
   * then load the facets HTML in the DOM
   */
  Plugin.prototype.init = function () {
    var self = this;

    // bind received results (do not show facets if no results are returned)
    $(document).bind(self.settings.resultsEventName, function (event, results, istexSearch) {
      // try {
        self.updateFacetsInTheDom(results, istexSearch);
      // } catch (err) {
      //   self.displayErrorInDom(
      //     'Erreur car le format de l\'API Istex a probablement changé. <br/>' +
      //     'Merci de le signaler par mail à istex@inist.fr (copie d\'écran appréciée)',
      //     err
      //   );
      // }
    });

    // bind waiting for result event
    $(document).bind(self.settings.waitingForResultsEventName, function (event) {
      // fade effect on the old result page
      // to tell the user a query is in process
      $(self.elt).css({ opacity: 0.5 });
    });

    // bind new search event
    $(document).bind(self.settings.newSearchEventName, function (event) {
      // reset the selected corpus facet
      self.selectedCorpus = [];
    });
  };

  /**
   * Update the DOM with the received facets values
   */
  Plugin.prototype.updateFacetsInTheDom = function (results, istexSearch) {
    var self = this;

    // not not fill anything in the facets list
    // if results are empty
    if (!results) {
      $(self.elt).empty();
      return;
    }

    var facets = $(
      '<div class="istex-facets">' +
        '<h3 class="istex-facets-title">' + self.settings.labels.facets.title + '</h3>' +
      '</div>'
    ).hide();

    // build and add the corpus facet DOM element
    var facetCorpus = self.getCorpusFacetDom(results, istexSearch);
    if (facetCorpus) {
      facets.append(facetCorpus);
    }

    // cleanup the result list in the DOM
    $(self.elt).empty();
    $(self.elt).css({ opacity: 1.0 });

    // insert the facets list into the DOM
    $(self.elt).append(facets);
    facets.fadeIn();
  };

  /**
   * Returns the corpus facet DOM element
   */
  Plugin.prototype.getCorpusFacetDom = function (results, istexSearch) {
    var self = this;

    // check if we can return a corpus facet
    if (!results ||
        !results.aggregations ||
        !results.aggregations.corpusName ||
        !results.aggregations.corpusName.buckets) {
      return null;
    }

    var facetCorpus = $(
      /*jshint ignore:start*/
      '<div class="istex-facet">' +
        '<h4 class="istex-facet-name">' + self.settings.labels.facets.corpus + '</h4>' +
        '<ul class="istex-facet-corpus"></ul>' +
      '</div>'
      /*jshint ignore:end*/
    );

    // get corpus facets from the results
    results.aggregations.corpusName.buckets.forEach(function (corpus) {
      var corpusCheckbox = $(
        '<li>' +
          '<label>' +
            '<input type="checkbox" value="' + corpus.key + '" />' +
            corpus.key +
            '<span class="istex-facet-corpus-badge">' + corpus.docCount + '</span>' +
          '</label>' +
        '</li>'
      );
      if (self.selectedCorpus.indexOf(corpus.key) !== -1) {
        corpusCheckbox.find('input').attr('checked', 'checked');
      } else {
        corpusCheckbox.find('input').removeAttr('checked');
      }
      facetCorpus.find('ul.istex-facet-corpus').append(corpusCheckbox);
    });

    // react when a checkbox is clicked
    facetCorpus.find('.istex-facet-corpus input').click(function () {
      var clickedCorpus = $(this).val();
      self.toggleCorpusFacet(clickedCorpus);

      // execute a new query with the selected corpus as an argument
      istexSearch.execQuery({
        corpus: self.selectedCorpus.join(',')
      });
    });

    return facetCorpus;
  };

  /**
   * Activate or unactivate a corpus facet
   */
  Plugin.prototype.toggleCorpusFacet = function (corpus) {
    var self = this;

    // remove or add a corpus from the list
    var corpusIdx = self.selectedCorpus.indexOf(corpus);
    if (corpusIdx !== -1) {
      self.selectedCorpus.splice(corpusIdx, 1);
    } else {
      self.selectedCorpus.push(corpus);
    }
  };

  // A really lightweight plugin wrapper around the constructor,
  // preventing against multiple instantiations
  $.fn[ pluginName ] = function (options) {
    this.each(function () {
      if (!$.data(this, "plugin_" + pluginName)) {
        $.data(this, "plugin_" + pluginName, new Plugin(this, options));
      }
    });
    return this;
  };

})(jQuery, window, document);