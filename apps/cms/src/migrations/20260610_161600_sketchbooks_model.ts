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
      messages.includes('no such column')
    ) {
      return
    }

    throw error
  }
}

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await ignoreExpected(db.run(sql`ALTER TABLE \`sketches\` ADD \`slug\` text;`))
  await ignoreExpected(db.run(sql`ALTER TABLE \`sketches\` ADD \`time_span\` text;`))
  await ignoreExpected(db.run(sql`ALTER TABLE \`sketches\` RENAME COLUMN \`image\` TO \`cover\`;`))
  await ignoreExpected(db.run(sql`ALTER TABLE \`sketches\` RENAME COLUMN \`alt\` TO \`cover_alt\`;`))
  await ignoreExpected(db.run(sql`ALTER TABLE \`sketches\` ADD \`cover_id\` integer REFERENCES media(id);`))
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`sketches_cover_idx\` ON \`sketches\` (\`cover_id\`);`)

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
  await ignoreExpected(db.run(sql`ALTER TABLE \`sketches\` DROP COLUMN \`cover\`;`))
  await ignoreExpected(db.run(sql`ALTER TABLE \`sketches\` DROP COLUMN \`cover_alt\`;`))
  await ignoreExpected(db.run(sql`UPDATE \`sketches\` SET \`slug\` = 'sketchbook-' || \`id\` WHERE \`slug\` IS NULL;`))
  await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`sketches_slug_idx\` ON \`sketches\` (\`slug\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`sketches_sketches\`;`)
  await db.run(sql`UPDATE \`sketches\` SET \`title\` = 'Raquetas' WHERE \`title\` = 'Mars';`)
  await db.run(sql`DROP INDEX \`sketches_slug_idx\`;`)
  await db.run(sql`ALTER TABLE \`sketches\` DROP COLUMN \`time_span\`;`)
  await db.run(sql`ALTER TABLE \`sketches\` DROP COLUMN \`slug\`;`)
}
