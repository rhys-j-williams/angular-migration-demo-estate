// Copied from angular-oauth2-oidc's documented silent-refresh snippet, inlined script moved to a
// file so the CSP does not need unsafe-inline (GIS-1180 finding 5).
(function () {
  parent.postMessage(location.hash || ('#' + location.search), location.origin);
})();
