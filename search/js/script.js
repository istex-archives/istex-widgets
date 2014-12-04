/* jshint -W117 */
'use strict';

/**
 * Widget ISTEX
 */
;(function ($, window, document, undefined) {

  var pluginName = "istexSearch";
  var defaults = {
    istexApi: 'https://api.istex.fr',
    query: ""
  };

  // The actual plugin constructor
  function Plugin(element, options) {
    this.elt = element;
    this.settings = $.extend({}, defaults, options);
    this._defaults = defaults;
    this._name = pluginName;
    this.init();
  }

  Plugin.prototype.init = function () {
    var self = this;

    // insert the form search into the DOM
    $(self.elt).append(
      '<form class="istex-search-form">' +
        '<input class="istex-search-input" type="text" value="" />' +
        '<input class="istex-search-submit" type="submit" value="Rechercher" />' +
        '<p class="istex-search-error"></p>' +
      '</form>'
    );

    // connect the submit action
    $(self.elt).find('.istex-search-form').submit(function () {

      $.ajax({
        url: self.settings.istexApi + '/document/',
        data: { q: 'brain' },
        dataType: 'jsonp'
      }).done(function (items) {
        // forward the results as a DOM event
        $(self.elt).trigger('istex-results', [ self, items ]);
        // forward the results as a global event
        $.event.trigger('istex-results', [ self, items ]);
      }).fail(function (err) {
        $(self.elt).find('.istex-search-error').text(err);
      });

      return false;
    });

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