import { Pool } from '@neondatabase/serverless';
import { Kysely, PostgresDialect } from 'kysely';
import type { DB, Reaction } from '../../schema';

const EMOJI_LIMIT_PER_REQUEST = 100;

export default async (req: Request, ctx: any) => {
    const body: Reaction = await req.json();

    if (body && body.name) {
        for (let i = 1; i <= 8; i++) {
            (body as any)[`emoji_${i}`] = parseInt((body as any)[`emoji_${i}`])
            let cnt = (body as any)[`emoji_${i}`];
            if (cnt < 0 || cnt >= EMOJI_LIMIT_PER_REQUEST || cnt === undefined) {
                return new Response('Invalid request', { status: 400 });
            }
        }


        const pool = new Pool({ connectionString: process.env.DATABASE_URL });
        const db = new Kysely<DB>({ dialect: new PostgresDialect({ pool }) });

        const query = db
            .updateTable('reaction')
            .where('name', '=', body.name)
            .set(({ bxp }) => ({
                'emoji_1': bxp('emoji_1', '+', body.emoji_1),
                'emoji_2': bxp('emoji_2', '+', body.emoji_2),
                'emoji_3': bxp('emoji_3', '+', body.emoji_3),
                'emoji_4': bxp('emoji_4', '+', body.emoji_4),
                'emoji_5': bxp('emoji_5', '+', body.emoji_5),
                'emoji_6': bxp('emoji_6', '+', body.emoji_6),
                'emoji_7': bxp('emoji_7', '+', body.emoji_7),
                'emoji_8': bxp('emoji_8', '+', body.emoji_8),
            }))

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
