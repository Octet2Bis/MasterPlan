FROM python:3.9-slim

WORKDIR /app

RUN pip install --no-cache-dir pandas requests python-dotenv

COPY waterfall_enrichment.py /app/waterfall_enrichment.py

ENTRYPOINT ["python", "/app/waterfall_enrichment.py"]
