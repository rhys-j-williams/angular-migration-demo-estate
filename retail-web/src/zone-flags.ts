/**
 * Zone.js patch flags. Read by zone.js at load time, so this file must be imported before it.
 *
 * Scroll and mousemove are unpatched because the transaction list virtual scroller was triggering
 * change detection on every scroll frame (MOL-2203, the "dashboard feels laggy on the 2019
 * ThinkPads" ticket). Nothing in the app relies on change detection running for those two events.
 */
(window as any).__zone_symbol__UNPATCHED_EVENTS = ['scroll', 'mousemove'];
(window as any).__Zone_disable_requestAnimationFrame = true;
