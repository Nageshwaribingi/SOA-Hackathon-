# Demo evidence checklist

- [ ] Start Docker, then `docker compose up -d`; capture `docker compose ps`.
- [ ] Build all modules with `mvn clean verify`; save console output.
- [ ] Capture Eureka with every application registered.
- [ ] Login, seed records, and show LOT-A100 and LOT-A101 for MED-100.
- [ ] Recall LOT-A100; show Kafka event envelope and downstream `GET /workflow` row.
- [ ] Show LOT-A101 is not included in the event scope.
- [ ] Send request without JWT (401) and recall write as SHELF_CLERK (403).
- [ ] Stop one ProductLot instance and show the remaining instance serves the Gateway route; restart it.
- [ ] Replay the same eventId; show one `consumed_event` row.
- [ ] Inject malformed event; show it in `soa.s02.t17.events.DLT`.
- [ ] Run test suite and load script; record actual machine, request count, latency and errors.

## Extra ProductLot instance

Start the standard ProductLot service, then launch a second process with `SERVER_PORT=8086` and `eureka.instance.instance-id=productlot-8086`. Gateway uses `lb://productlot-service`. For a real stop/recovery demo, keep both instances running before stopping one. Ensure both use the same `productlot_db` and same JWT secret.
