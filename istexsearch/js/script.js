/* jshint -W117 */
'use strict';

/**
 * Widget istexSearch
 */
;(function ($, window, document, undefined) {

  var pluginName  = "istexSearch";
  var defaults    = istexConfigDefault;

  // The actual plugin constructor
  function Plugin(element, options) {
    this.elt = element;
    this.settings = $.extend({}, defaults, istexConfig, options);
    this._defaults = defaults;
    this._name = pluginName;
    this.init();
  }

  /**
   * Try to authenticate with a cookie if needed
   * then load the input query form
   */
  Plugin.prototype.init = function () {
    var self = this;

    // listen connected event (auth widget tells auth is ok)
    $(document).bind(self.settings.connectedEventName, function (event, istexAuth) {
      // get and map the api requester
      self.istexApiRequester = istexAuth.istexApiRequester;

      // auth is ok, then load the user interface
      self.loadInputForm();
    });

    // listen istex-gotopage event
    $(document).bind(self.settings.gotoPageEventName, function (event, pageIdx) {
      self.execQuery({}, pageIdx);
    });

  };

  /**
   * Load the input query form
   */
  Plugin.prototype.loadInputForm = function () {
    var self = this;

    // insert the form search into the DOM
    $(self.elt).empty();
    var searchFormHtml = $(
      /*jshint ignore:start*/
      '<form class="istex-search-form">' +
        '<div class="istex-search-bar-wrapper">' +
          '<input class="istex-search-submit" type="submit" value="Rechercher" />' +
          '<span>' +
            '<input class="istex-search-input" type="search" value="" placeholder="Votre requête ici ..." />' +
          '</span>' +
        '</div>' +
        '<p class="istex-search-error"></p>' +
        '<div class="istex-search-loading" title="Recherche en cours"></div>' +
      '</form>'
      /*jshint ignore:end*/
    ).hide();

    $(self.elt).append(searchFormHtml);
    searchFormHtml.fadeIn();

    // initialize query parameter
    $(self.elt).find('.istex-search-input').val(self.settings.query);

    // connect the submit action
    $(self.elt).find('.istex-search-form').submit(function () {
      var query = $(self.elt).find('input.istex-search-input').val().trim();
      query = query ? query : '*';

      // send the event telling a new search is sent
      $.event.trigger(self.settings.newSearchEventName, [ self ]);

      self.execQuery({ q: query });

      return false;
    }); // end of ('.istex-search-form').submit(

    // adjust styles comming for example from ENT
    // to avoid a small search button:
    // https://trello-attachments.s3.amazonaws.com/547753d55c854b80778562d6/725x667/51dcbf7933acc93c8cb85a642c321a4d/upload_2015-01-12_at_6.10.52_pm.png
    $(self.elt).find('.istex-search-submit').css(
      'font-size',
      $(self.elt).find('.istex-search-input').css('font-size')
    );
    $(self.elt).find('.istex-search-submit').css(
      'padding',
      $(self.elt).find('.istex-search-input').css('padding')
    );

    // execute a search if query parameter is not blank
    if (self.settings.query) {
      $(self.elt).find('.istex-search-form').trigger('submit');
    }

  };

  /**
   * Execute a query
   */
  Plugin.prototype.execQuery = function (queryOptions, pageIdx) {
    var self = this;

    // default vaules
    pageIdx      = pageIdx || 1;
    queryOptions = queryOptions || {};

    // if no query selected try to take the latest one
    if (queryOptions.q) {
      self.query = queryOptions.q;
    } else {
      queryOptions.q = self.query;
    }

    // set the timer to know when the query has been done (ex: to have the query time)
    self.queryStartTime = new Date();

    // send the event telling a new query is sent
    $.event.trigger(self.settings.waitingForResultsEventName, [ self ]);

    // show the loading bar and hide the errors
    $(self.elt).find('.istex-search-loading').show();
    $(self.elt).find('.istex-search-error').hide();

    // prepare the request parameters
    var queryString = {
      q: queryOptions.q,
      output: '*',
      size: self.settings.pageSize,
      from: ((pageIdx-1) * self.settings.pageSize)
    };
    queryString = $.extend(queryOptions, queryString);
    if (self.settings.showQuerySpeed) {
      queryString.stats = 1;
    }
    if (self.settings.facetsToLoad && self.settings.facetsToLoad.length > 0) {
      queryString.facet = self.settings.facetsToLoad.join(',');
    }

    // send the request to the istex api
    self.istexApiRequester({
      url: self.settings.istexApi + '/document/',
      data: queryString,
      success: function(items) {
        // hide the error box and the loading box
        $(self.elt).find('.istex-search-error').hide();
        $(self.elt).find('.istex-search-loading').fadeOut();
        // forward the results as a global event
        $.event.trigger(self.settings.resultsEventName, [ items, self ]);
      },
      error: function (opt, err) {
        $(self.elt).find('.istex-search-error').html(
          '<a href="https://api.istex.fr/corpus/">API Istex</a> non joignable.'
        );
        $(self.elt).find('.istex-search-error').fadeIn();
        $(self.elt).find('.istex-search-loading').fadeOut();

        // forward the empty results as a global event
        $.event.trigger(self.settings.resultsEventName, [ null, self ]);
      }
    });
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