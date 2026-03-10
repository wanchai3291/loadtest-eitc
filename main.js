require("dotenv").config();

const { Kafka } = require("kafkajs");

// ---- CONFIG ----
const TOPIC = process.env.KAFKA_TOPIC;
const BROKERS = process.env.BROKERS.split(",");

const NUM_RECORDS = 1.5e6;
const TIMEOUT_MS = 15 * 60 * 1000; // 15 นาที

const MIN_THROUGHPUT = 100;  // เริ่มที่ 100 RPS
const MAX_THROUGHPUT = 5000; // peak ที่ 5000 RPS
const RAMP_UP_SEC = 300;     // ramp up ใน 5 นาที

// ---- CONFLUENT CONFIG ----
const PRODUCER_CONFIG = {
  clientId: "eiet-loadtest",
  brokers: BROKERS,
  ssl: { rejectUnauthorized: false },
  sasl: {
    mechanism: "plain",
    username: process.env.KAFKA_KEY,
    password: process.env.KAFKA_SECRET,
  },
  connectionTimeout: 30000,
  requestTimeout: 30000,
};

// ---- MESSAGE ----
function buildMessage() {
  return {
    before: null,
    after: {
      cma_id: "N7DLkRTOKOB",
      time_stamp: "2026-02-09T07:25:17.582607Z",
      device_id: "8E34F835-96A4-4807-88EE-C4D6F1A44BBC",
      user_id: "JdgRbYVojcQ",
      action: "xxxxxxxxxxxxxxxxxxxxxxxxxxx",
      session: "1770621753-21E2A64AC7654D79BA80AF2BC155CF3A",
      screen_name: "xxxxxxxxxxxxxxxxxxxxxxxxxxx",
      section: "xxxxxxxxxxxxxxxxxxxxxxxxxxx",
      network_isp: "AIS-Fibre",
      network_ip: "58.136.36.61",
      app_name: "Myais",
      app_version: "1230 (18155)",
      component_id: "xxxxxxxxxxxxxxxxxxxxxxxxxxx",
      component_type: "cardButton",
      dynamic_id: null,
      object_type: null,
      current_usecase_name: "billAndPayment",
      usecase_step: "0",
      language: "th",
      market_funnel_stage: "Topup/Pay",
      campaign_source: null,
      campaign_medium: null,
      campaign_campaign: null,
      campaign_term: null,
      campaign_content: null,
      device_model: "iPhone16,2",
      device_os: "iOS",
      device_brand: "Apple",
      device_os_version: "26.2",
      device_location_last_updated: "2026-02-09T07:25:13.749687Z",
      device_location_latitude: "13.783507920519314",
      device_location_longitude: "100.54659640802389",
      created_at: 1770621917721000000,
      hp1_public_id: "neTC8yWfoF4O39RoBBuI5ItPOHx27XIshwuDy9A2d7he38WGe9UB7AytGwGYMfQB",
      hp1_current_asset: "neTC8yWfoF4O39RoBBuI5ItPOHx27XIshwuDy9A2d7he38WGe9UB7AytGwGYMfQB",
      public_id_charging_type: "postpaid",
      current_asset_charging_type: "postpaid",
      hp1_public_id_serenade_type: null,
      hp1_current_asset_serenade_type: null,
      product_name: null,
      product_type: null,
      product_price: null,
      product_price_unit: null,
      hp1_public_id_type: "MOBILE",
      hp1_current_asset_type: "MOBILE",
      hp1_public_id_register_date: "2017-03-01",
      hp1_current_asset_register_date: "2017-03-01",
      product_subcategory: null,
      product_item_vat_price: null,
      product_item_vat_unit_price: null,
      product_brand: null,
      product_description: null,
      payment_item: null,
      product_order_asset_ref: null,
      product_payment_ref: null,
      hp1_public_id_n_type: "CPI",
      hp1_current_asset_n_type: "CPI",
      product_number: null,
      location_source: "gps",
      geo_hash: "w4rqrvpyc",
      engagement_time: 13748,
      total_engagement_time: 163908,
      engagement_step: 30,
      app_session: "command-oda=173b0424-6b90-4eda-90c7-69cc7e6b2bc48E34F835-96A4-4807-88EE-C4D6F1A44BBC",
      keyword_search: null,
      dynamic_value: null,
      component_value: null,
      mylid: null,
      network_connectivity_type: "wifi",
      notification_name: null,
      category_name: null,
      component_index: null,
      product_wifi_specification: null,
      product_category: null,
      coupon_enddate: null,
      project_subtype: null,
      previous_screen_name: null,
      status: null,
      detail: null,
      product_ratingtype: null,
      product_internet_specification: null,
      product_voice_specification: null,
      product_charge_period_time: null,
    },
    source: {
      version: "1.9.6.Final",
      connector: "sqlserver",
      name: "sql-dis-az-asse-dev-001",
      ts_ms: 1771251424300,
      snapshot: "false",
      db: "sqldb-dis-az-asse-sit-hot",
      sequence: null,
      schema: "dbo",
      table: "event_data",
      change_lsn: "00003e3e:0001b018:0049",
      commit_lsn: "00003e3f:000072f0:003a",
      event_serial_no: 1,
    },
    op: "c",
    ts_ms: 1771251432731,
    transaction: null,
  };
}

// ---- MAIN ----
(async () => {
  console.log("START:", new Date());

  const kafka = new Kafka(PRODUCER_CONFIG);
  const producer = kafka.producer({ allowAutoTopicCreation: false });
  await producer.connect();

  let sent = 0;
  const start = Date.now();
  const endTime = start + TIMEOUT_MS;
  const latencies = [];

  while (sent < NUM_RECORDS && Date.now() < endTime) {
    const tickStart = Date.now();
    const elapsedSec = (Date.now() - start) / 1000;

    // คำนวณ throughput ปัจจุบันตาม ramp up
    const progress = Math.min(elapsedSec / RAMP_UP_SEC, 1);
    const currentThroughput = Math.floor(
      MIN_THROUGHPUT + (MAX_THROUGHPUT - MIN_THROUGHPUT) * progress
    );

    const promises = Array.from({ length: currentThroughput }, () => {
      const t0 = Date.now();
      return producer
        .send({
          topic: TOPIC,
          messages: [{ value: JSON.stringify(buildMessage()) }],
        })
        .then(() => {
          latencies.push(Date.now() - t0);
          sent++;
        });
    });

    await Promise.all(promises);

    const elapsed = Date.now() - tickStart;
    const rpsNow = (sent / ((Date.now() - start) / 1000)).toFixed(1);
    console.log(
      `Sent ${sent} | Current RPS: ${currentThroughput} | Avg RPS: ${rpsNow}`
    );

    const wait = 1000 - elapsed;
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  }

  const totalDuration = (Date.now() - start) / 1000;
  latencies.sort((a, b) => a - b);

  const min = latencies[0] || 0;
  const max = latencies[latencies.length - 1] || 0;
  const avg = latencies.reduce((a, b) => a + b, 0) / latencies.length || 0;
  const p90 = latencies[Math.floor(latencies.length * 0.9)] || 0;
  const p95 = latencies[Math.floor(latencies.length * 0.95)] || 0;
  const rps = sent / totalDuration;

  console.log("FINISH:", new Date());
  console.log("================ SUMMARY ================");
  console.log("Total messages:", sent);
  console.log("Total duration (sec):", totalDuration.toFixed(2));
  console.log("RPS:", rps.toFixed(4));
  console.log("Latency min (ms):", min);
  console.log("Latency max (ms):", max);
  console.log("Latency avg (ms):", avg.toFixed(3));
  console.log("Latency p90 (ms):", p90);
  console.log("Latency p95 (ms):", p95);
  console.log("=========================================");

  await producer.disconnect();
})();