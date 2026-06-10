import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

async function ignoreIfExists(query: Promise<unknown>) {
  try {
    await query
  } catch (error: any) {
    const message = String(error?.message ?? error)

    if (
      message.includes('already exists') ||
      message.includes('duplicate column name') ||
      message.includes('no such column')
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
  	\`image\` text NOT NULL,
  	\`alt\` text NOT NULL,
  	\`featured\` integer DEFAULT false,
  	\`pub_date\` text NOT NULL,
  	\`status\` text DEFAULT 'draft' NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`sketches_updated_at_idx\` ON \`sketches\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`sketches_created_at_idx\` ON \`sketches\` (\`created_at\`);`)
  await ignoreIfExists(db.run(sql`INSERT INTO \`sketches\` ("title", "image", "alt", "featured", "pub_date", "status") SELECT 'Raquetas', '/sketches/1.JPEG', 'Sketch de varias raquetas de tenis con un mensaje', true, '2026-06-10T00:00:00.000Z', 'published' WHERE NOT EXISTS (SELECT 1 FROM \`sketches\` WHERE \`title\` = 'Raquetas');`))
  await ignoreIfExists(db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`sketches_id\` integer REFERENCES sketches(id);`))
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_locked_documents_rels_sketches_id_idx\` ON \`payload_locked_documents_rels\` (\`sketches_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`sketches\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	\`media_id\` integer,
  	\`collections_id\` integer,
  	\`texts_id\` integer,
  	\`figures_id\` integer,
  	\`videos_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`collections_id\`) REFERENCES \`collections\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`texts_id\`) REFERENCES \`texts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`figures_id\`) REFERENCES \`figures\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`videos_id\`) REFERENCES \`videos\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "users_id", "media_id", "collections_id", "texts_id", "figures_id", "videos_id") SELECT "id", "order", "parent_id", "path", "users_id", "media_id", "collections_id", "texts_id", "figures_id", "videos_id" FROM \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_collections_id_idx\` ON \`payload_locked_documents_rels\` (\`collections_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_texts_id_idx\` ON \`payload_locked_documents_rels\` (\`texts_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_figures_id_idx\` ON \`payload_locked_documents_rels\` (\`figures_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_videos_id_idx\` ON \`payload_locked_documents_rels\` (\`videos_id\`);`)
}
