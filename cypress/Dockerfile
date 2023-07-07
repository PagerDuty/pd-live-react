# Args are defined in the Dockerfile before the FROM command.
ARG NODE_VERSION='20.3.1'
ARG CHROME_VERSION='114.0.5735.198-1'
# ARG EDGE_VERSION='100.0.1185.29-1'
# ARG FIREFOX_VERSION='107.0'
ARG YARN_VERSION='1.22.19'

FROM cypress/factory

COPY . /opt/app
WORKDIR /opt/app
RUN npm install --save-dev cypress
# GitHub Actions requires zstd for actions/cache
RUN apt-get update && \
  apt-get install --no-install-recommends -y \
  zstd \
  gzip \
  # clean up
  && rm -rf /var/lib/apt/lists/* \
  && apt-get clean
