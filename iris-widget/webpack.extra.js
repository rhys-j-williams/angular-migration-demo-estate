// Passed to ngx-build-plus through angular.json extraWebpackConfig (IRIS-0417).
//
// The widget is loaded into someone else's page, so its webpack runtime must not fight the host's.
// Both bundles are Angular CLI output and both default to `webpackJsonp`-style globals; without a
// distinct output.uniqueName the chunk loading bookkeeping collides. We do not emit lazy chunks
// (singleBundle) but the runtime still registers the global.
module.exports = {
  output: {
    uniqueName: 'meridianIrisWidget',
  },
  // zone.js is deliberately NOT bundled. The host page provides it, see README "Zone.js" and T35
  // in _demo-notes/TRAPS.md. If you find yourself adding it back, stop and read that first.
};
