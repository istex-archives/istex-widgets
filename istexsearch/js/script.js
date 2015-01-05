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
      console.log(istexAuth, istexAuth.istexApiRequester);
      // get and map the api requester
      self.istexApiRequester = istexAuth.istexApiRequester;

      // auth is ok, then load the user interface
      self.loadInputForm();
    });
  };

  /**
   * Load the input query form
   */
  Plugin.prototype.loadInputForm = function () {
    var self = this;

    /*jshint ignore:start*/
    // insert the form search into the DOM
    $(self.elt).empty();
    $(self.elt).append(
      '<form class="istex-search-form">' +
        '<div class="istex-search-bar-wrapper">' +
          '<input class="istex-search-submit" type="submit" value="Rechercher" />' +
          '<span>' +
            '<input class="istex-search-input" type="text" value="" placeholder="Votre requête ici ..." />' +
          '</span>' +
        '</div>' +
        '<p class="istex-search-error"></p>' +
      '</form>'
    );
    /*jshint ignore:end*/

    // initialize query parameter
    $(self.elt).find('.istex-search-input').val(self.settings.query);

    // connect the submit action
    $(self.elt).find('.istex-search-form').submit(function () {

      var query = $(self.elt).find('input.istex-search-input').val().trim();
      query = query ? query : '*';

      // send the request to the istex api
      self.istexApiRequester({
        url: self.settings.istexApi + '/document/',
        data: { q: query, output: '*' },
        //callbackParameter: "callback",
        success: function(items) {
          // hide the error box
          $(self.elt).find('.istex-search-error').hide();
          // forward the results as a global event
          $.event.trigger(self.settings.resultsEventName, [ items, self ]);
        },
        error: function (opt, err) {
          $(self.elt).find('.istex-search-error').html(
            '<a href="https://api.istex.fr/corpus/">API Istex</a> non joignable.'
          );
          $(self.elt).find('.istex-search-error').show();
        }
      });

      return false;
    });

    // execute a search if query parameter is not blank
    if (self.settings.query) {
      $(self.elt).find('.istex-search-form').trigger('submit');
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