/* jshint -W117 */
'use strict';

/**
 * Widget istexAuth
 */
;(function ($, window, document, undefined) {

  var pluginName  = "istexAuth";
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
        self.removeConnectBtn();
        // auth is ok, then load the user interface
        $.event.trigger(self.settings.connectedEventName, [ self ]);
      } else if (needAuth == 'redirect') {
        // auth with the redirect method
        self.authWithRedirect(function (err) {
          if (!err) {
            self.setupGenericRequester(authMode);
            self.removeConnectBtn();
            // auth is ok, then load the user interface
            $.event.trigger(self.settings.connectedEventName, [ self ]);
          }
        });
      } else if (needAuth == 'http') {
        // auth with the standard http method
        self.authWithHTTP(function (err, options) {
          if (!err) {
            self.setupGenericRequester(authMode, options);
            self.removeConnectBtn();
            // auth is ok, then load the user interface
            $.event.trigger(self.settings.connectedEventName, [ self ]);
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

    // prepare a connect button and open a the
    // cookie auth window if clicked
    self.insertConnectBtnIfNotExists(function () {
      // open the window on the corpus route to request authentication
      window.open(self.settings.istexApi + '/ezproxy-auth-and-close.html');

      // check again auth when the user come back on the origin page
      $(window).focus(function () {
        self.getAuthMode(function (err, needAuth, authMode) {
          if (needAuth == 'none') {
            cb(null);
          } else {
            cb(new Error("Unable to authenticate"));
          }
        });
      });

    });
  };

  /**
   * Insert a connect button in the page if it not exists yet
   * - cb is called when the button is clicked
   */
  Plugin.prototype.insertConnectBtnIfNotExists = function (cb) {
    var self = this;
    if ($(self.elt).find('.istex-ezproxy-auth-btn').length > 0) return;
    $(self.elt).append(
      '<button class="istex-ezproxy-auth-btn">Se connecter<div></div></button>'
    );
    $(self.elt).find('.istex-ezproxy-auth-btn').click(cb);
  };

  /**
   * Cleanup the connect button
   */
  Plugin.prototype.removeConnectBtn = function (cb) {
    var self = this;
    $(self.elt).find('.istex-ezproxy-auth-btn').remove();
  };

  /**
   * Authenticate with the standard HTTP basic auth
   * - shows a HTML popup to ask login and password
   * - when submitted, try to login through AJAX
   * - if auth ok, then close the popup and return credentials to cb
   * - if auth ok, then show an error message
   */
  Plugin.prototype.authWithHTTP = function (cb) {
    var self = this;

    // first of all insert the connect button and when
    // it is clicked, then show the login/password popup
    self.insertConnectBtnIfNotExists(function () {
      if ($(self.elt).find('.istex-auth-popup').length > 0) return;

      // append a simple login/password popup
      $(self.elt).append(
      '<form class="istex-auth-popup">' +
        '<div class="istex-auth-popup-wrapper">' +
          '<input class="istex-auth-popup-login" type="text" value="" placeholder="Votre login ..." />' +
          '<input class="istex-auth-popup-password" type="password" value="" placeholder="Votre mot de passe ..." />' +
          '<input class="istex-auth-popup-cancel" type="submit" value="Annuler" />' +
          '<input class="istex-auth-popup-submit" type="submit" value="Se connecter" />' +
        '</div>' +
        '<p class="istex-auth-popup-error"></p>' +
      '</form>'
      );

      $(self.elt).find('.istex-auth-popup').submit(function () {
        var clicked = $(self.elt).find(".istex-auth-popup input[type=submit]:focus")
                                 .attr('class');
        if (clicked == 'istex-auth-popup-submit') {
          // if "Se connecter" is clicked, then try to auth through AJAX
          // with the given login/password
          var httpOptions = {
            username: $(self.elt).find('istex-auth-popup-login').val(),
            password: $(self.elt).find('istex-auth-popup-password').val(),
          };
          $.ajax({
            url: self.settings.istexApi + '/corpus/',
            username: httpOptions.username,
            password: httpOptions.password,
            success: function () {
              // auth ok, then cleanup and respond ok
              $(self.elt).find('.istex-auth-popup').remove();
              return cb(null, httpOptions);
            },
            error: function (opt, err) {
              $(self.elt).find('.istex-auth-popup-error')
                         .text("Le nom d'utilisateur ou le mot de passe saisi est incorrect.")
            }
          });
        } else if (clicked == 'istex-auth-popup-cancel') {
          // if "Annuler" button is clicked, then cleanup
          $(self.elt).find('.istex-auth-popup').remove();
          cb(new Error('HTTP auth canceled'));
        }
        return false;
      });
    
    });

  };


  /**
   * Create a self.istexApiRequester function
   * used to wrap jsonp or ajax query system
   */
  Plugin.prototype.setupGenericRequester = function (authMode, options) {
    var self = this;

    // create a generic requester
    // based on jsonp or ajax
    if (authMode  == 'jsonp') {
      // jsonp
      self.istexApiRequester = function (options) {
        var reqOpt = $.extend({
          callbackParameter: "callback"
        }, options);
        return $.jsonp(reqOpt);
      };
    } else {
      // ajax
      self.istexApiRequester = function (options) {
        var reqOpt = $.extend({
          headers: {
            // todo : basic auth <= options
          }
        }, options);
        return $.ajax(reqOpt);
      };
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