rm -rf prod-build
docker compose -f docker-compose-prod.yml rm -f
docker compose -f docker-compose-prod.yml up --build