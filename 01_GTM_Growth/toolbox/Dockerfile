"""
Dockerfile global pour la Toolbox Antigravity.

Ce conteneur unique sert tous les pipelines (B2B, B2C, CRM Hygiene).
Le pipeline à exécuter est passé en argument CLI.

Usage :
  docker build -t antigravity-toolbox ./01_GTM_Growth/toolbox/
  docker run --rm \
    --env-file 01_GTM_Growth/.secrets/.env \
    -v $(pwd)/01_GTM_Growth/Workspace:/app/data \
    antigravity-toolbox \
    --pipeline b2b --input /app/data/test_leads.csv --output /app/data/output.csv
"""
FROM python:3.11-slim

WORKDIR /app

# Copier les dépendances et les installer
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copier la toolbox et les pipelines
COPY . /app/toolbox/
COPY ../pipelines/ /app/pipelines/

# Point d'entrée : le runner de cascade
ENTRYPOINT ["python", "-m", "pipelines.cascade_runner"]
