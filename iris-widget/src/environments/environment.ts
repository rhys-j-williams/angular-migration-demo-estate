export const environment = {
  production: false,
  // iris-orchestrator, platform-services. PORTS.md says 4517. Overridable per mount through the
  // orchestrator-url attribute on the element; this is only the fallback.
  orchestratorUrl: 'http://localhost:4517',
  buildLabel: 'local',
};
