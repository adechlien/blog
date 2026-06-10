import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

async function getColumns(db: any, tableName: string): Promise<string[]> {
  try {
    const rows = await db.all(sql.raw(`PRAGMA table_info(\`${tableName}\`)`))

    return rows.map((row: any) => row.name)
  } catch {
    return []
  }
}

function valueForColumn(columns: string[], column: string, fallback: string) {
  return columns.includes(column) ? `\`${column}\`` : fallback
}

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  const sketchColumns = await getColumns(db, 'sketches')

  await db.run(sql`PRAGMA foreign_keys=OFF;`)

  if (sketchColumns.length > 0) {
    const title = valueForColumn(sketchColumns, 'title', `'Untitled'`)
    const slug = valueForColumn(sketchColumns, 'slug', `'sketchbook-' || \`id\``)
    const coverId = valueForColumn(sketchColumns, 'cover_id', 'NULL')
    const timeSpan = valueForColumn(sketchColumns, 'time_span', 'NULL')
    const featured = valueForColumn(sketchColumns, 'featured', 'false')
    const pubDate = valueForColumn(
      sketchColumns,
      'pub_date',
      `'2026-06-10T00:00:00.000Z'`,
    )
    const status = valueForColumn(sketchColumns, 'status', `'draft'`)
    const updatedAt = valueForColumn(
      sketchColumns,
      'updated_at',
      `(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`,
    )
    const createdAt = valueForColumn(
      sketchColumns,
      'created_at',
      `(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`,
    )

    await db.run(sql`CREATE TABLE \`__new_sketches\` (
    	\`id\` integer PRIMARY KEY NOT NULL,
    	\`title\` text NOT NULL,
    	\`slug\` text NOT NULL,
    	\`cover_id\` integer,
    	\`time_span\` text,
    	\`featured\` integer DEFAULT false,
    	\`pub_date\` text NOT NULL,
    	\`status\` text DEFAULT 'draft' NOT NULL,
    	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    	FOREIGN KEY (\`cover_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
    );
    `)

    await db.run(sql.raw(`INSERT INTO \`__new_sketches\` ("id", "title", "slug", "cover_id", "time_span", "featured", "pub_date", "status", "updated_at", "created_at")
      SELECT
        \`id\`,
        ${title},
        COALESCE(${slug}, 'sketchbook-' || \`id\`),
        ${coverId},
        ${timeSpan},
        ${featured},
        ${pubDate},
        ${status},
        ${updatedAt},
        ${createdAt}
      FROM \`sketches\`;
    `))

    await db.run(sql`DROP TABLE \`sketches\`;`)
    await db.run(sql`ALTER TABLE \`__new_sketches\` RENAME TO \`sketches\`;`)
  } else {
    await db.run(sql`CREATE TABLE \`sketches\` (
    	\`id\` integer PRIMARY KEY NOT NULL,
    	\`title\` text NOT NULL,
    	\`slug\` text NOT NULL,
    	\`cover_id\` integer,
    	\`time_span\` text,
    	\`featured\` integer DEFAULT false,
    	\`pub_date\` text NOT NULL,
    	\`status\` text DEFAULT 'draft' NOT NULL,
    	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    	FOREIGN KEY (\`cover_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
    );
    `)
  }

  const sketchItemColumns = await getColumns(db, 'sketches_sketches')

  if (sketchItemColumns.length > 0) {
    const order = valueForColumn(sketchItemColumns, 'order', '0')
    const imageId = valueForColumn(sketchItemColumns, 'image_id', 'NULL')

    await db.run(sql`CREATE TABLE \`__new_sketches_sketches\` (
    	\`_order\` integer NOT NULL,
    	\`_parent_id\` integer NOT NULL,
    	\`id\` text PRIMARY KEY NOT NULL,
    	\`title\` text NOT NULL,
    	\`image_id\` integer,
    	\`order\` numeric DEFAULT 0 NOT NULL,
    	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
    	FOREIGN KEY (\`_parent_id\`) REFERENCES \`sketches\`(\`id\`) ON UPDATE no action ON DELETE cascade
    );
    `)

    await db.run(sql.raw(`INSERT INTO \`__new_sketches_sketches\` ("_order", "_parent_id", "id", "title", "image_id", "order")
      SELECT
        \`_order\`,
        \`_parent_id\`,
        \`id\`,
        \`title\`,
        ${imageId},
        ${order}
      FROM \`sketches_sketches\`;
    `))

    await db.run(sql`DROP TABLE \`sketches_sketches\`;`)
    await db.run(sql`ALTER TABLE \`__new_sketches_sketches\` RENAME TO \`sketches_sketches\`;`)
  } else {
    await db.run(sql`CREATE TABLE \`sketches_sketches\` (
    	\`_order\` integer NOT NULL,
    	\`_parent_id\` integer NOT NULL,
    	\`id\` text PRIMARY KEY NOT NULL,
    	\`title\` text NOT NULL,
    	\`image_id\` integer,
    	\`order\` numeric DEFAULT 0 NOT NULL,
    	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
    	FOREIGN KEY (\`_parent_id\`) REFERENCES \`sketches\`(\`id\`) ON UPDATE no action ON DELETE cascade
    );
    `)
  }

  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`sketches_slug_idx\` ON \`sketches\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`sketches_cover_idx\` ON \`sketches\` (\`cover_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`sketches_updated_at_idx\` ON \`sketches\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`sketches_created_at_idx\` ON \`sketches\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`sketches_sketches_order_idx\` ON \`sketches_sketches\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`sketches_sketches_parent_id_idx\` ON \`sketches_sketches\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`sketches_sketches_image_idx\` ON \`sketches_sketches\` (\`image_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP INDEX IF EXISTS \`sketches_sketches_image_idx\`;`)
  await db.run(sql`DROP INDEX IF EXISTS \`sketches_sketches_parent_id_idx\`;`)
  await db.run(sql`DROP INDEX IF EXISTS \`sketches_sketches_order_idx\`;`)
  await db.run(sql`DROP INDEX IF EXISTS \`sketches_created_at_idx\`;`)
  await db.run(sql`DROP INDEX IF EXISTS \`sketches_updated_at_idx\`;`)
  await db.run(sql`DROP INDEX IF EXISTS \`sketches_cover_idx\`;`)
  await db.run(sql`DROP INDEX IF EXISTS \`sketches_slug_idx\`;`)
}
