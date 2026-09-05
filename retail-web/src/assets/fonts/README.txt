material-icons.woff2 is not committed (MOL-2101 review: binary fonts go through the static asset
bucket, not git). The Jenkins "Fetch fonts" stage copies it from Artifactory generic-static before
the build. Locally, run tools/fetch-fonts.sh or accept icon ligatures rendering as text.
