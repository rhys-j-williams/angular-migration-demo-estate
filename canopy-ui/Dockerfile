# Canopy showcase. Static Angular build behind unprivileged nginx.
# The library itself is not deployed anywhere; it is published to the registry by scripts/publish.sh.

# Stage 1: build. Node version must match .nvmrc; the CI agent is nodejs16-rhel8.
FROM registry.access.redhat.com/ubi8/nodejs-16:1-128 AS build
USER 0
WORKDIR /opt/app-root/src
COPY package.json package-lock.json .npmrc ./
# Registry is whatever .npmrc says. In CI that is Artifactory; NPM_REGISTRY overrides for the estate build.
ARG NPM_REGISTRY=
RUN if [ -n "$NPM_REGISTRY" ]; then npm config set @meridian:registry "$NPM_REGISTRY"; fi \
 && npm ci --no-audit --no-fund
COPY angular.json tsconfig.json ./
COPY projects ./projects
COPY scripts ./scripts
COPY CHANGELOG.md ./
RUN npm run build && npm run build:showcase

# Stage 2: serve. Unprivileged nginx from the Red Hat registry, listens on 8080.
FROM registry.access.redhat.com/ubi8/nginx-120:1-104
COPY --from=build /opt/app-root/src/dist/canopy-showcase /opt/app-root/src
COPY nginx.conf /etc/nginx/nginx.conf
# Runtime config for the showcase is static; there is no env.json here unlike the applications.
EXPOSE 8080
USER 1001
CMD ["nginx", "-g", "daemon off;"]
