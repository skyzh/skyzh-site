import { Pool } from '@neondatabase/serverless';
import { Kysely, PostgresDialect } from 'kysely';
import type { PostgresPool } from 'kysely';
import type { DB } from '../../schema';

export default async (req: Request, ctx: any) => {
  const url = new URL(req.url);
  const slug = url.searchParams.get('slug');

  if (slug) {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = new Kysely<DB>({
      dialect: new PostgresDialect({ pool: pool as unknown as PostgresPool }),
    });


    const query = db
      .selectFrom('reaction')
      .selectAll()
      .where('name', '=', slug)

    const reactions = await query.executeTakeFirst();
    ctx.waitUntil(pool.end());

    return new Response(JSON.stringify({ reactions }, null, 2));
  } else {
    return new Response('No slug provided', { status: 400 });
  }

}

export const config = {
  runtime: 'edge',
  regions: ['cle1', 'iad1'],  // fra1 = Frankfurt: pick the Vercel region nearest your Neon DB
};
