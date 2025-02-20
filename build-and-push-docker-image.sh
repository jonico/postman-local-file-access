#!/bin/bash

# Set variables
GITHUB_ORG=${GITHUB_ORG:-postman-solutions-eng}
REPO_NAME=${REPO_NAME:-postman-local-filesystem-api}
TAG=${TAG:-latest}


# Build the Docker image
docker build -t ghcr.io/$GITHUB_ORG/$REPO_NAME:$TAG .

# Push the Docker image to GitHub Container Registry
docker push ghcr.io/$GITHUB_ORG/$REPO_NAME:$TAG
