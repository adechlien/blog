import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

async function ignoreIfExists(runQuery: () => Promise<unknown>) {
  try {
    await runQuery()
  } catch (error: any) {
    const details = [
      String(error?.message ?? ''),
      String(error?.cause?.message ?? ''),
      String(error?.stack ?? ''),
      String(error ?? ''),
    ]
      .join('\n')
      .toLowerCase()

    if (
      details.includes('already exists') ||
      details.includes('duplicate column name') ||
      details.includes('no such column')
    ) {
      return
    }

    throw error
  }
}

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`movies\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`label\` text NOT NULL,
  	\`letterboxd_url\` text NOT NULL,
  	\`poster_id\` integer NOT NULL,
  	\`order\` numeric DEFAULT 0,
  	\`featured\` integer DEFAULT true,
  	\`status\` text DEFAULT 'draft' NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`poster_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`movies_poster_idx\` ON \`movies\` (\`poster_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`movies_updated_at_idx\` ON \`movies\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`movies_created_at_idx\` ON \`movies\` (\`created_at\`);`)
  await ignoreIfExists(() => db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`movies_id\` integer REFERENCES movies(id);`))
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_locked_documents_rels_movies_id_idx\` ON \`payload_locked_documents_rels\` (\`movies_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP INDEX IF EXISTS \`payload_locked_documents_rels_movies_id_idx\`;`)
  await db.run(sql`DROP TABLE \`movies\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await ignoreIfExists(() => db.run(sql`CREATE TABLE \`__new_payload_locked_documents_rels\` (
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
  	\`sketches_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`collections_id\`) REFERENCES \`collections\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`texts_id\`) REFERENCES \`texts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`figures_id\`) REFERENCES \`figures\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`videos_id\`) REFERENCES \`videos\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`sketches_id\`) REFERENCES \`sketches\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `))
  await ignoreIfExists(() => db.run(sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "users_id", "media_id", "collections_id", "texts_id", "figures_id", "videos_id", "sketches_id") SELECT "id", "order", "parent_id", "path", "users_id", "media_id", "collections_id", "texts_id", "figures_id", "videos_id", "sketches_id" FROM \`payload_locked_documents_rels\`;`))
  await ignoreIfExists(() => db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`))
  await ignoreIfExists(() => db.run(sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`))
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_locked_documents_rels_collections_id_idx\` ON \`payload_locked_documents_rels\` (\`collections_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_locked_documents_rels_texts_id_idx\` ON \`payload_locked_documents_rels\` (\`texts_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_locked_documents_rels_figures_id_idx\` ON \`payload_locked_documents_rels\` (\`figures_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_locked_documents_rels_videos_id_idx\` ON \`payload_locked_documents_rels\` (\`videos_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_locked_documents_rels_sketches_id_idx\` ON \`payload_locked_documents_rels\` (\`sketches_id\`);`)
}
