/**
 * THE WOO — Broken image DB cleanup
 * Targets: /uploads/... and //uploads/... paths that are already 404 in production.
 */
const mysql = require('mysql2/promise');

async function run() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }

  const url = new URL(dbUrl);
  const conn = await mysql.createConnection({
    host: url.hostname,
    port: Number(url.port) || 3306,
    user: url.username,
    password: url.password,
    database: url.pathname.replace(/^\//, ''),
  });

  console.log('=== DRY-RUN COUNTS ===');

  const [paCount] = await conn.execute(
    `SELECT COUNT(*) AS c FROM photo_assignments
     WHERE image_url LIKE '/uploads/%'
        OR image_url LIKE '%//uploads/%'
        OR image_id LIKE '/uploads/%'
        OR image_id LIKE '%//uploads/%'`
  );
  console.log('photo_assignments broken rows:', paCount[0].c);

  const [miCount] = await conn.execute(
    `SELECT COUNT(*) AS c FROM menu_items
     WHERE image_url LIKE '/uploads/%'
        OR image_url LIKE '%//uploads/%'`
  );
  console.log('menu_items broken rows:', miCount[0].c);

  console.log('\n=== CLEANUP ===');

  if (paCount[0].c > 0) {
    const [delPa] = await conn.execute(
      `DELETE FROM photo_assignments
       WHERE image_url LIKE '/uploads/%'
          OR image_url LIKE '%//uploads/%'
          OR image_id LIKE '/uploads/%'
          OR image_id LIKE '%//uploads/%'`
    );
    console.log('Deleted photo_assignments rows:', delPa.affectedRows);
  } else {
    console.log('photo_assignments: nothing to delete');
  }

  if (miCount[0].c > 0) {
    const [updMi] = await conn.execute(
      `UPDATE menu_items
       SET image_url = NULL
       WHERE image_url LIKE '/uploads/%'
          OR image_url LIKE '%//uploads/%'`
    );
    console.log('Updated menu_items rows (set NULL):', updMi.affectedRows);
  } else {
    console.log('menu_items: nothing to update');
  }

  await conn.end();
  console.log('\nDone.');
}

run().catch(err => {
  console.error('Cleanup error:', err);
  process.exit(1);
});
