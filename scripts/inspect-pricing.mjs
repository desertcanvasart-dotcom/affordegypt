import pg from "pg";
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSL === "false" ? false : { rejectUnauthorized: false },
});

const r = await pool.query(`
  SELECT id, name, from_city_id, to_city_id, base_price_by_vehicle, vehicle_prices
  FROM routes
  ORDER BY id
`);
console.log(`routes: ${r.rows.length}`);
for (const row of r.rows.slice(0, 10)) {
  console.log(`  #${row.id} ${row.name} basePriceByVehicle=${JSON.stringify(row.base_price_by_vehicle)} vehiclePrices=${JSON.stringify(row.vehicle_prices)}`);
}

const tb = await pool.query(`SELECT id, city_id, hours, base_price_by_vehicle FROM time_blocks ORDER BY id`);
console.log(`\ntime_blocks: ${tb.rows.length}`);
for (const row of tb.rows.slice(0, 5)) {
  console.log(`  #${row.id} city=${row.city_id} hours=${row.hours} prices=${JSON.stringify(row.base_price_by_vehicle)}`);
}

const v = await pool.query(`SELECT id, name FROM vehicle_types ORDER BY id`);
console.log(`\nvehicle_types:`, v.rows);

const lc = await pool.query(`SELECT id, name, surcharge_pct FROM license_classes ORDER BY id`);
console.log(`license_classes:`, lc.rows);

const at = await pool.query(`SELECT count(*) FROM attractions WHERE ticket_price > 0`);
console.log(`\nattractions with ticket_price > 0: ${at.rows[0].count}`);

const ao = await pool.query(`SELECT count(*) FROM add_ons`);
console.log(`add_ons total: ${ao.rows[0].count}`);

const gr = await pool.query(`SELECT count(*) FROM guide_rates`);
console.log(`guide_rates total: ${gr.rows[0].count}`);

const pt = await pool.query(`SELECT count(*) FROM pricing_tiers`);
console.log(`pricing_tiers (target): ${pt.rows[0].count}`);

await pool.end();
