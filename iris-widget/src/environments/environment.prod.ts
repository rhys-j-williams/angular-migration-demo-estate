export const environment = {
  production: true,
  // Same origin in production: retail-web's ingress routes /iris/v1/* to the orchestrator
  // (MOL-4133), so the base is empty. Hosts on other origins set orchestrator-url on the element.
  orchestratorUrl: '',
  buildLabel: 'CHANGEME-build-label-set-by-jenkins',
};
