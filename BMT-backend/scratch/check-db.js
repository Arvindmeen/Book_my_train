const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://admin:BMTpass@localhost:5432/admin_service_database' });

async function check() {
  try {
    const res = await pool.query('SELECT "id", "trainNumber", "trainName", "coachName", "totalSeats" FROM trains WHERE "trainNumber" = \'54879\' OR "trainName" ILIKE \'%Purnagiri%\' LIMIT 5');
    console.log('Target train:', res.rows);

    const all = await pool.query('SELECT count(*) FROM trains');
    console.log('Total trains in DB:', all.rows[0].count);

    const seats = await pool.query('SELECT distinct "seatType" FROM seats');
    console.log('Seat types in DB:', seats.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}
check();
