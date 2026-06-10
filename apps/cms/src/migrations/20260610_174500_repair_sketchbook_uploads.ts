import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

async function ignoreExpected(query: Promise<unknown>) {
  try {
    await query
  } catch (error: any) {
    const messages = [
      error?.message,
      error?.cause?.message,
      error?.err?.message,
      error?.err?.cause?.message,
    ]
      .map((value) => String(value ?? ''))
      .join(' ')
      .toLowerCase()

    if (
      messages.includes('already exists') ||
      messages.includes('duplicate column name') ||
      messages.includes('no such column') ||
      messages.includes('no such table')
    ) {
      return
    }

    throw error
  }
}

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`sketches\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`slug\` text,
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

  await ignoreExpected(db.run(sql`ALTER TABLE \`sketches\` ADD \`slug\` text;`))
  await ignoreExpected(db.run(sql`ALTER TABLE \`sketches\` ADD \`cover_id\` integer REFERENCES media(id);`))
  await ignoreExpected(db.run(sql`ALTER TABLE \`sketches\` ADD \`time_span\` text;`))
  await ignoreExpected(db.run(sql`ALTER TABLE \`sketches\` ADD \`featured\` integer DEFAULT false;`))
  await ignoreExpected(db.run(sql`ALTER TABLE \`sketches\` ADD \`pub_date\` text DEFAULT '2026-06-10T00:00:00.000Z' NOT NULL;`))
  await ignoreExpected(db.run(sql`ALTER TABLE \`sketches\` ADD \`status\` text DEFAULT 'draft' NOT NULL;`))
  await ignoreExpected(db.run(sql`ALTER TABLE \`sketches\` ADD \`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL;`))
  await ignoreExpected(db.run(sql`ALTER TABLE \`sketches\` ADD \`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL;`))

  await db.run(sql`CREATE INDEX IF NOT EXISTS \`sketches_cover_idx\` ON \`sketches\` (\`cover_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`sketches_updated_at_idx\` ON \`sketches\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`sketches_created_at_idx\` ON \`sketches\` (\`created_at\`);`)

  await db.run(sql`CREATE TABLE IF NOT EXISTS \`sketches_sketches\` (
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

  await ignoreExpected(db.run(sql`ALTER TABLE \`sketches_sketches\` ADD \`image_id\` integer REFERENCES media(id);`))
  await ignoreExpected(db.run(sql`ALTER TABLE \`sketches_sketches\` ADD \`order\` numeric DEFAULT 0 NOT NULL;`))
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`sketches_sketches_order_idx\` ON \`sketches_sketches\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`sketches_sketches_parent_id_idx\` ON \`sketches_sketches\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`sketches_sketches_image_idx\` ON \`sketches_sketches\` (\`image_id\`);`)

  await ignoreExpected(db.run(sql`INSERT INTO \`sketches\` ("title", "slug", "time_span", "featured", "pub_date", "status")
    SELECT 'Mars', 'mars', 'Diciembre de 2024 - Febrero de 2025', true, '2026-06-10T00:00:00.000Z', 'draft'
    WHERE NOT EXISTS (SELECT 1 FROM \`sketches\` WHERE \`slug\` = 'mars');
  `))

  await ignoreExpected(db.run(sql`UPDATE \`sketches\` SET \`title\` = 'Mars', \`slug\` = 'mars' WHERE \`title\` = 'Raquetas';`))
  await ignoreExpected(db.run(sql`UPDATE \`sketches\` SET \`time_span\` = 'Diciembre de 2024 - Febrero de 2025' WHERE \`slug\` = 'mars';`))
  await ignoreExpected(db.run(sql`UPDATE \`sketches\` SET \`status\` = 'draft' WHERE \`slug\` = 'mars' AND \`cover_id\` IS NULL;`))
  await ignoreExpected(db.run(sql`UPDATE \`sketches\` SET \`slug\` = 'sketchbook-' || \`id\` WHERE \`slug\` IS NULL;`))

  await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`sketches_slug_idx\` ON \`sketches\` (\`slug\`);`)
  await ignoreExpected(db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`sketches_id\` integer REFERENCES sketches(id);`))
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_locked_documents_rels_sketches_id_idx\` ON \`payload_locked_documents_rels\` (\`sketches_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP INDEX IF EXISTS \`payload_locked_documents_rels_sketches_id_idx\`;`)
  await db.run(sql`DROP INDEX IF EXISTS \`sketches_slug_idx\`;`)
  await db.run(sql`DROP INDEX IF EXISTS \`sketches_sketches_image_idx\`;`)
  await db.run(sql`DROP INDEX IF EXISTS \`sketches_sketches_parent_id_idx\`;`)
  await db.run(sql`DROP INDEX IF EXISTS \`sketches_sketches_order_idx\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`sketches_sketches\`;`)
}
