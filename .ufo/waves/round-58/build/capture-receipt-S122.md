# Source capture receipt — S122 (Kafka consumer offsets / commit APIs)

- source: S122 — https://kafka.apache.org/43/javadoc/org/apache/kafka/clients/consumer/KafkaConsumer.html (§Offsets and Consumer Position; §Manual Offset Control)
- opened: 2026-10-24T14:22:46Z (HTTP 200; Last-Modified Thu, 25 Jun 2026 16:46:30 GMT; etag "41808-65516bbe91cf8")
- capture: `.ufo/waves/round-58/build/ScoutKafkaOffsets/body.html` sha256 ed0068fabe16e861a4be746dbd91db68c7fdef5742f08f6a51d3d26d209e9d41
- located quote (§Offsets and Consumer Position): "The committed position is the last offset that has been stored securely."
- located quote (§Manual Offset Control, note): "Note: The committed offset should always be the offset of the next message that your application will read."
- located quote (§Manual Offset Control, at-least-once example): "In this case the process that took over consumption would consume from last committed offset and would repeat the insert of the last batch of data."
- tier: A — authoritative javadoc for the consumer offset/commit contract (distinct URL from S118's consumer-configs page).
