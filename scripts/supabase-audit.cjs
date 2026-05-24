/**
 * THE WOO — Supabase Primary Upload Audit
 * Read-only discovery. No uploads, no deletions, no DB writes.
 */
const { createClient } = require('@supabase/supabase-js');

const url = process.env.SUPABASE_URL || '';
const key = process.env.SUPABASE_SERVICE_KEY || '';
const bucket = process.env.SUPABASE_BUCKET || 'media';

async function run() {
  console.log('=== Supabase Audit ===\n');
  console.log('URL:', url ? 'Set' : 'MISSING');
  console.log('Service Key:', key ? 'Set (' + key.slice(0, 10) + '...)' : 'MISSING');
  console.log('Bucket name:', bucket);

  if (!url || !key) {
    console.error('\nMissing env vars. Exiting.');
    process.exit(1);
  }

  const sb = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 1. List buckets
  console.log('\n--- 1. List Buckets ---');
  const { data: buckets, error: bucketsErr } = await sb.storage.listBuckets();
  if (bucketsErr) {
    console.error('Error listing buckets:', bucketsErr.message);
  } else {
    console.log('Buckets found:', buckets.length);
    for (const b of buckets) {
      console.log(`  - ${b.name} (id=${b.id}, public=${b.public})`);
    }
  }

  // 2. Check target bucket
  console.log('\n--- 2. Target Bucket Check ---');
  const target = buckets?.find(b => b.name === bucket);
  if (target) {
    console.log('Bucket exists:', target.name);
    console.log('Bucket public:', target.public);
  } else {
    console.log('Bucket NOT FOUND:', bucket);
  }

  // 3. List files in bucket (prefix: menu/)
  console.log('\n--- 3. List Files (prefix: menu/) ---');
  const { data: files, error: filesErr } = await sb.storage.from(bucket).list('menu', { limit: 10 });
  if (filesErr) {
    console.error('Error listing files:', filesErr.message);
  } else {
    console.log('Files found in menu/:', files?.length ?? 0);
    for (const f of files || []) {
      console.log(`  - ${f.name}`);
    }
  }

  // 4. Test public URL shape
  console.log('\n--- 4. Public URL Shape ---');
  const { data: urlData } = sb.storage.from(bucket).getPublicUrl('menu/test.webp');
  console.log('Generated public URL:', urlData?.publicUrl);
  console.log('Starts with SUPABASE_URL?', urlData?.publicUrl?.startsWith(url) ?? false);

  // 5. Auth/user check (service key should have admin rights)
  console.log('\n--- 5. Service Key Auth Check ---');
  const { data: authUser, error: authErr } = await sb.auth.getUser();
  if (authErr) {
    console.log('Auth check error (expected for service key):', authErr.message);
  } else {
    console.log('Auth user:', authUser?.user?.id || 'None');
  }

  console.log('\n=== Audit Complete ===');
}

run().catch(err => {
  console.error('Audit fatal error:', err);
  process.exit(1);
});
