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
    self.checkIsAuthWithCookie(function (err) {
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
        '<p class="istex-search-error">error</p>' +
      '</form>'
    );
    /*jshint ignore:end*/

    // initialize query parameter
    $(self.elt).find('.istex-search-input').val(self.settings.query);

    // connect the submit action
    $(self.elt).find('.istex-search-form').submit(function () {

      var query = $(self.elt).find('input.istex-search-input').val().trim();
      query = query ? query : '*';

      // send the request to the istex api with the
      // jquery-jsonp lib because errors are not
      // handled by the native jquery jsonp function
      $.jsonp({
        url: self.settings.istexApi + '/document/',
        data: { q: query, output: '*' },
        callbackParameter: "callback",
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

  /**
   * Open a popup if necessary to authenticate the user
   * through a cookie system (example: ezproxy)
   */
  Plugin.prototype.checkIsAuthWithCookie = function (cb) {
    var self = this;

    // prepare a connect button and open a the
    // cookie auth window if clicked
    var authPopup = null;
    function insertConnectButtonIfNotExists() {
      if ($(self.elt).find('.istex-ezproxy-auth-btn').length > 0) return;
      $(self.elt).append(
        '<button class="istex-ezproxy-auth-btn">Se connecter<div></div></button>'
      );
      $(self.elt).find('.istex-ezproxy-auth-btn').click(function () {
        // open a new window on the corpus route to force authentication
        authPopup = window.open(self.settings.istexApi + '/corpus/');
      });      
    }

    // request on corpus route in order to
    // test if auth is ok or not
    function authChecker() {
      $.jsonp({
        url: self.settings.istexApi + '/corpus/',
        callbackParameter: "callback",
        success: function(corpus) {
          // auth is ok when corpus list can be retrived from the istex api
          if (authPopup) authPopup.close();
          cb(null);
        },
        error: function (opt, err) {
          // if not yet auth, insert a button
          insertConnectButtonIfNotExists();
          // if not yet auth, try again later
          setTimeout(authChecker, 100);
        }
      });
    };
    authChecker();
  };

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