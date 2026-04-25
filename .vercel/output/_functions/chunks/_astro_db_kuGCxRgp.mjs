import { asDrizzleTable } from '@astrojs/db/runtime';
import { createClient } from '@astrojs/db/db-client/libsql-node.js';
import '@astrojs/db/dist/runtime/virtual.js';

const db = await createClient({
  url: "file:./.astro/local.db",
  token: process.env.ASTRO_DB_APP_TOKEN ?? void 0
});
const TextLike = asDrizzleTable("TextLike", { "columns": { "textId": { "type": "text", "schema": { "unique": false, "deprecated": false, "name": "textId", "collection": "TextLike", "primaryKey": true } }, "likes": { "type": "number", "schema": { "unique": false, "deprecated": false, "name": "likes", "collection": "TextLike", "primaryKey": false, "optional": false } } }, "deprecated": false, "indexes": {} }, false);

export { TextLike as T, db as d };
