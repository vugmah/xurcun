#!/usr/bin/env node
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import superjson from 'superjson';

async function main() {
  const client = createTRPCProxyClient({
    links: [
      httpBatchLink({
        url: 'https://thewoo.az/api/trpc',
        transformer: superjson,
      }),
    ],
  });

  try {
    console.log('Running single query (branchMenu.getMenuByBranch)');
    const single = await client.branchMenu.getMenuByBranch.query({ branchSlug: 'white-city', tab: 'food' });
    console.log('SINGLE RESULT:', JSON.stringify(single, null, 2));

    console.log('\nRunning two queries in parallel to exercise batching');
    const res = await Promise.all([
      client.branchMenu.getMenuByBranch.query({ branchSlug: 'white-city', tab: 'food' }),
      client.branchMenu.getMenuByBranch.query({ branchSlug: 'white-city', tab: 'beverage' }),
    ]);
    console.log('BATCH RESULTS:', JSON.stringify(res, null, 2));
  } catch (err) {
    console.error('ERROR:', err);
    process.exitCode = 1;
  }
}

main();
