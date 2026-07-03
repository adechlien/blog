import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

async function getColumns(db: any, tableName: string): Promise<string[]> {
  try {
    const rows = await db.all(sql.raw(`PRAGMA table_info(\`${tableName}\`)`))

    return rows.map((row: any) => row.name)
  } catch {
    return []
  }
}

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  const columns = await getColumns(db, 'collections')

  if (!columns.includes('kind')) {
    return
  }

  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_collections\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`slug\` text NOT NULL,
  	\`description\` text,
  	\`color\` text NOT NULL,
  	\`icon_id\` integer,
  	\`order\` numeric DEFAULT 0,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`icon_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`INSERT INTO \`__new_collections\` ("id", "name", "slug", "description", "color", "icon_id", "order", "updated_at", "created_at")
    SELECT "id", "name", "slug", "description", "color", "icon_id", "order", "updated_at", "created_at" FROM \`collections\`;
  `)
  await db.run(sql`DROP TABLE \`collections\`;`)
  await db.run(sql`ALTER TABLE \`__new_collections\` RENAME TO \`collections\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`collections_slug_idx\` ON \`collections\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`collections_icon_idx\` ON \`collections\` (\`icon_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`collections_updated_at_idx\` ON \`collections\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`collections_created_at_idx\` ON \`collections\` (\`created_at\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  const columns = await getColumns(db, 'collections')

  if (columns.includes('kind')) {
    return
  }

  await db.run(sql`ALTER TABLE \`collections\` ADD \`kind\` text DEFAULT 'other' NOT NULL;`)
}
