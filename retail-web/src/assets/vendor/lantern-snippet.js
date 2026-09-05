/*
 * Lantern Web SDK bootstrap snippet (Lumenview integration guide rev 4.11, section 2.1).
 *
 * Installs the window.Lantern queue stub so that events fired before the vendor script finishes
 * loading are replayed rather than lost. @meridian/lantern-sdk's LanternService injects the real
 * script tag with the URL from runtime config; this file must not load it itself, otherwise we get
 * two copies (the 2020 incident LNTN-12 was written up over).
 *
 * Loaded through angular.json "scripts" so it runs before zone.js. Do not move it into the bundle.
 */
(function (w) {
  if (w.Lantern && w.Lantern.q) {
    return;
  }
  var lantern = { q: [], SDK_VERSION: 'stub' };
  var methods = ['load', 'track', 'page', 'identify', 'group', 'reset'];
  for (var i = 0; i < methods.length; i++) {
    (function (name) {
      lantern[name] = function () {
        lantern.q.push([name].concat(Array.prototype.slice.call(arguments)));
      };
    })(methods[i]);
  }
  lantern.sessionId = function () {
    return null;
  };
  w.Lantern = lantern;
})(window);
