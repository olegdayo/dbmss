.PHONY: compose
compose:
	docker compose up -d
	docker exec -it mng /bin/sh -c 'mongoimport --db shop --collection products --file /products.json --jsonArray -u root -p password123 --authenticationDatabase admin'

.PHONY: decompose
decompose:
	docker compose down

.PHONY: clean
clean: decompose
	docker volume rm mongo-data
