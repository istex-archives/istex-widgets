/* jshint -W117 */
'use strict';

/**
 * Widget ISTEX
 */
;(function ($, window, document, undefined) {

  var pluginName = "istexResults";
  var defaults = {
    abstractLength: 250
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

    var tplStats = $(
      '<div class="istex-results-items-stats">' +
        'Environ 783 594 résultats' + 
      '</div>'
    );

    var tplItems = $('<ol class="istex-results-items"></ol>');

    /*jshint ignore:start*/
    var tplItem = $(
      '<li class="istex-results-item">' +
        '<a href="#" class="istex-results-item-title">Biomechanical Simulation of Electrode Migration for Deep Brain Stimulation</a>' +
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
    /*jshint ignore:end*/

    tplItems.append(tplItem.clone());
    tplItems.append(tplItem.clone());
    tplItems.append(tplItem.clone());
    tplItems.append(tplItem.clone());

    // insert the result list template into the DOM
    $(self.elt).append(tplStats);
    $(self.elt).append(tplItems);


    // truncate abstract text
    $(self.elt).find('.istex-results-item-abstract').each(function (idx, elt) {
      var abs = $(elt).text();
      if (abs.length > self.settings.abstractLength) {
        abs = abs.substring(0, self.settings.abstractLength);
        abs += "…";
        $(elt).text(abs);
      }
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