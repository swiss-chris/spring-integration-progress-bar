FROM mcr.microsoft.com/vscode/devcontainers/java:0-17

# Install required packages
RUN apt-get update && apt-get -y install --no-install-recommends \
    libglib2.0-0 \
    libxcb1 \
    && apt-get clean && rm -rf /var/lib/apt/lists/*
