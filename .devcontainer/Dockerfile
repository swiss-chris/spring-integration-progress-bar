FROM mcr.microsoft.com/vscode/devcontainers/java:0-17

# Install required packages
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list \
    && apt-get update && apt-get -y install --no-install-recommends \
    google-chrome-stable \
    libglib2.0-0 \
    libxcb1 \
    libnss3 \
    && apt-get clean && rm -rf /var/lib/apt/lists/*
