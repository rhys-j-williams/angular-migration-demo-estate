# iris-widget sandbox image. Serves dist/ behind nginx so the harness and the design review
# environment have somewhere to load the bundle from. NOT the production delivery path; retail-web
# vendors the artefact. See docs/runbooks/release.md.
#
# Base images come from platform-tooling/docker; this is the thin per-component layer.
FROM artifactory.meridian.internal/docker-base/nodejs-16-rhel8:16.20.2 AS build
WORKDIR /opt/app-root/src
COPY package.json package-lock.json .npmrc ./
RUN npm ci
COPY . .
RUN npm run build:prod

FROM artifactory.meridian.internal/docker-base/nginx-122-rhel8:1.22
COPY nginx.conf /etc/nginx/nginx.conf
# Laid out the way a host would serve it, so the same paths work here and in retail-web.
COPY --from=build /opt/app-root/src/dist/iris-widget /usr/share/nginx/html/assets/widgets
COPY scripts/harness/index.html /usr/share/nginx/html/index.html
EXPOSE 8080
USER 1001
