import { Pool, neonConfig } from '@neondatabase/serverless';
import { Kysely, PostgresDialect } from 'kysely';
import DATA from '../dist/posts.json' assert { type: 'json' };

import ws from 'ws';
neonConfig.webSocketConstructor = ws;

import 'dotenv/config'

export async function main() {
    const data = DATA
    data.items.push({ slug: 'page-about' })
    const pool = new Pool({ connectionString: process.env.DATABASE_URL })
    pool.on('error', err => console.error(err))
    const db = new Kysely({ dialect: new PostgresDialect({ pool }) });
    const result = await db.insertInto('reaction').values(DATA.items.map((item) => ({
        name: item.slug, emoji_1: 0, emoji_2: 0, emoji_3: 0, emoji_4: 0, emoji_5: 0, emoji_6: 0, emoji_7: 0, emoji_8: 0
    })))
        .onConflict((oc) => oc.column('name').doNothing()).execute()
    console.log(result)
    await pool.end()
}

main().then(() => { })
