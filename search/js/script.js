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

    // first of all, check which auth system is available
    self.getAuthMode(function (err, needAuth, authMode) {
      if (needAuth == 'none') {
        self.setupGenericRequester(authMode);
        // auth is ok, then load the user interface
        self.loadInputForm();
      } else if (needAuth == 'redirect') {
        // auth with the redirect method
        self.authWithRedirect(function (err) {
          if (!err) {
            self.setupGenericRequester(authMode);
            // auth is ok, then load the user interface
            self.loadInputForm();
          }
        });
      } else if (needAuth == 'http') {
        // auth with the standard http method
        self.authWithHTTP(function (err, options) {
          if (!err) {
            self.setupGenericRequester(authMode, options);
            // auth is ok, then load the user interface
            self.loadInputForm();
          }
        });
      }
    });
  };


  /**
   * Return which auth method is used.
   * 2nd cb parameter value could be
   * - none: if authorized (then 3rd parameter is given)
   * - http: if http basic auth is requested
   * - redirect: if a redirected (ex: ezproxy) auth is requested
   * 3d cb parameter value could be
   * - ajax
   * - jsonp
   */
  Plugin.prototype.getAuthMode = function (cb) {
    var self = this;

   // try to auth on the API with AJAX
    $.ajax({
      url: self.settings.istexApi + '/corpus/',
      success: function () {
        // if success it means auth is ok
        return cb(null, 'none', 'ajax');
      },
      error: function (opt, err) {
        
        // 0 means cross domain security error caused by ezproxy
        // 302 means redirection caused by ezproxy
        if (opt.status == 0 || opt.status == 302) {
          // try to auth on the API with JSONP
          $.jsonp({
            url: self.settings.istexApi + '/corpus/',
            callbackParameter: "callback",
            success: function () {
              cb(null, 'none', 'jsonp');
            },
            error: function () {
              cb(null, 'redirect', 'jsonp');   
            }
          });
        } else {
          // other code are interpreted as 401
          return cb(null, 'http', 'ajax');
        }
      }
    });
  };

  /**
   * Open a new window to authenticate the user
   * through a cookie system (example: ezproxy)
   */
  Plugin.prototype.authWithRedirect = function (cb) {
    var self = this;
    insertNewWinConnectButtonIfNotExists();

    // prepare a connect button and open a the
    // cookie auth window if clicked
    var authPopup = null;
    function insertNewWinConnectButtonIfNotExists() {
      if ($(self.elt).find('.istex-ezproxy-auth-btn').length > 0) return;
      $(self.elt).html(
        '<button class="istex-ezproxy-auth-btn">Se connecter<div></div></button>'
      );
      $(self.elt).find('.istex-ezproxy-auth-btn').click(function () {
        // open the window on the corpus route to request authentication
        authPopup = window.open(self.settings.istexApi + '/ezproxy-auth-and-close.html');

        // check again auth when the user come back on the origin page
        $(window).focus(function () {
          console.log('focus', authPopup);
          authPopup = null;
          self.getAuthMode(function (err, needAuth, authMode) {
            if (needAuth == 'none') {
              cb(null);
            } else {
              cb(new Error("Unable to authenticate"));
            }
          });
        });

      });
    }
  };


  /**
   * Create a self.requester function
   * used to wrap jsonp or ajax query system
   */
  Plugin.prototype.setupGenericRequester = function (authMode, options) {
    var self = this;

    // create a generic requester
    // based on jsonp or ajax
    if (authMode  == 'jsonp') {
      // jsonp
      self.requester = function (options) {
        var reqOpt = $.extend({
          callbackParameter: "callback"
        }, options);
        return $.jsonp(reqOpt);
      };
    } else {
      // ajax
      self.requester = function (options) {
        var reqOpt = $.extend({
          headers: {
            // todo : basic auth <= options
          }
        }, options);
        return $.ajax(reqOpt);
      };
    }
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

      // send the request to the istex api
      self.requester({
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

  /**
   * Check if standard HTTP auth needed
   */
  // Plugin.prototype.tryAuthWithHTTP = function (cb) {
  //   var self = this;

  //   function insertHTTPConnectButtonIfNotExists(cbAuth) {
  //     if ($(self.elt).find('.istex-ezproxy-auth-btn').length > 0) return;
  //     $(self.elt).append(
  //       '<button class="istex-ezproxy-auth-btn">Se connecter<div></div></button>'
  //     );
  //     $(self.elt).find('.istex-ezproxy-auth-btn').click(function () {
  //       // try to popup the HTTP auth dialog
  //       $.jsonp({
  //         url: self.settings.istexApi + '/corpus/',
  //         callbackParameter: "callback",
  //         success: function (corpus) {
  //           cbAuth(null);
  //         },
  //         error: function (opt, err) {
  //           cbAuth(new Error('http auth error'));
  //         }
  //       });
  //     });      
  //   }

  //   // test if API is open
  //   $.ajax({
  //     url: self.settings.istexApi + '/corpus/',
  //     success: function (corpus) {
  //       // auth is ok, it means ne pre-autentication is needed 
  //       cb(null);
  //     },
  //     error: function (opt, err) {
  //       // if not yet auth, insert a connect button
  //       insertConnectButtonIfNotExists(function (err) {

  //       });
  //     }
  //   });

  // };

  /**
   * Open a popup if necessary to authenticate the user
   * through a cookie system (example: ezproxy)
   */
  // Plugin.prototype.tryAuthWithCookie = function (httpAuth, cb) {
  //   var self = this;

  //   // prepare a connect button and open a the
  //   // cookie auth window if clicked
  //   var authPopup = null;
  //   function insertNewWinConnectButtonIfNotExists() {
  //     if ($(self.elt).find('.istex-ezproxy-auth-btn').length > 0) return;
  //     $(self.elt).append(
  //       '<button class="istex-ezproxy-auth-btn">Se connecter<div></div></button>'
  //     );
  //     $(self.elt).find('.istex-ezproxy-auth-btn').click(function () {
  //       if (!httpAuth) {
  //         // open a new window on the corpus route to force authentication
  //         authPopup = window.open(self.settings.istexApi + '/corpus/');          
  //       }
  //       // run the auth checker
  //       authChecker();
  //     });      
  //   }

  //   // request on corpus route in order to
  //   // test if auth is ok or not
  //   function authChecker() {
  //     $.jsonp({
  //       url: self.settings.istexApi + '/corpus/',
  //       callbackParameter: "callback",
  //       success: function (corpus) {
  //         // auth is ok when corpus list can be retrived from the istex api
  //         if (authPopup) authPopup.close();
  //         cb(null);
  //       },
  //       error: function (opt, err) {
  //         // if not yet auth, insert a button
  //         insertNewWinConnectButtonIfNotExists();
          
  //         if (httpAuth) {
  //           // if not yet auth, try again later
  //           setTimeout(authChecker, 100);            
  //         }
  //       }
  //     });
  //   };
  // };

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