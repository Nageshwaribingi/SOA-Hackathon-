.PHONY: infra build
infra:
	docker compose up -d
build:
	mvn clean verify
