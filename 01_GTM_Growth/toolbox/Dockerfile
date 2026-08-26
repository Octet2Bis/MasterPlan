# Dockerfile pour la Toolbox Antigravity GTM (100% Free / Freemium)
#
# Build depuis le dossier 01_GTM_Growth :
#   docker build -t antigravity-toolbox -f toolbox/Dockerfile .
#
# Execution standard :
#   docker run --rm \
#     --env-file .secrets/.env \
#     -v $(pwd)/Workspace:/app/data \
#     antigravity-toolbox \
#     --pipeline b2b --input /app/data/test_leads.csv --output /app/data/output_b2b.csv

FROM python:3.11-slim

WORKDIR /app

# Outils système pour DNS et réseau
RUN apt-get update && apt-get install -y --no-install-recommends \
    dnsutils \
    && rm -rf /var/lib/apt/lists/*

# Installer les dépendances Python
COPY toolbox/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copier le code source de la toolbox et des pipelines
COPY toolbox/ /app/toolbox/
COPY pipelines/ /app/pipelines/

# Environnement Python
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1

ENTRYPOINT ["python", "-m", "pipelines.cascade_runner"]
