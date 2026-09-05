# keystone-web. Diverged from platform-tooling/docker/angular/Dockerfile in KEY-1840 because the
# shared image's nginx template appends 'unsafe-inline' to style-src for the runtime env.json
# loader, and this application must not carry it (GIS-STD-014 tier 1). Keep in step with the
# shared file for base image tags; GIS-STD-021 appendix B lists the approved ones.
#
# Build:  podman build --build-arg NPM_REGISTRY=http://host.containers.internal:4873 -t keystone-web .
# Run:    podman run -p 8080:8080 keystone-web

ARG NODE_VERSION=16.20.2
ARG NGINX_TAG=1-30

FROM artifactory.meridian.internal/docker-remote/library/node:${NODE_VERSION}-bullseye-slim AS build
ARG NPM_REGISTRY=https://artifactory.meridian.internal/artifactory/api/npm/npm-virtual/
ENV CI=true NG_CLI_ANALYTICS=false NODE_OPTIONS=--max-old-space-size=3072
WORKDIR /workspace
COPY package.json package-lock.json .npmrc ./
# The @meridian scope in .npmrc points at the local Verdaccio for the estate build; in CI the
# secret-mounted .npmrc overrides it with Artifactory and the token (GIS-2911, never an ARG).
RUN --mount=type=secret,id=npmrc,target=/root/.npmrc \
    if [ -n "${NPM_REGISTRY}" ]; then npm config set @meridian:registry "${NPM_REGISTRY}"; fi \
 && npm ci --no-audit --no-fund
COPY angular.json tsconfig.json tsconfig.app.json .browserslistrc ./
COPY src ./src
COPY scripts ./scripts
RUN npx ng build --configuration production && node scripts/check-csp.js

FROM artifactory.meridian.internal/docker-redhat-remote/ubi9/nginx-124:${NGINX_TAG} AS runtime
ARG BUILD_TAG=local
ARG GIT_SHA=unknown
LABEL org.opencontainers.image.title="keystone-web" \
      org.opencontainers.image.revision="${GIT_SHA}" \
      org.opencontainers.image.version="${BUILD_TAG}" \
      bank.meridian.team="identity-platform" \
      bank.meridian.ticket-key="KEY"
COPY --from=build /workspace/dist/keystone-web /opt/app-root/src
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 8080
USER 1001
CMD ["nginx", "-g", "daemon off;"]
