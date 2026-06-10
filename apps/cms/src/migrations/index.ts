import * as migration_20260531_030918_init from './20260531_030918_init';
import * as migration_20260607_162320_add_videos from './20260607_162320_add_videos';
import * as migration_20260610_155138_add_sketches from './20260610_155138_add_sketches';
import * as migration_20260610_161600_sketchbooks_model from './20260610_161600_sketchbooks_model';

export const migrations = [
  {
    up: migration_20260531_030918_init.up,
    down: migration_20260531_030918_init.down,
    name: '20260531_030918_init',
  },
  {
    up: migration_20260607_162320_add_videos.up,
    down: migration_20260607_162320_add_videos.down,
    name: '20260607_162320_add_videos',
  },
  {
    up: migration_20260610_155138_add_sketches.up,
    down: migration_20260610_155138_add_sketches.down,
    name: '20260610_155138_add_sketches',
  },
  {
    up: migration_20260610_161600_sketchbooks_model.up,
    down: migration_20260610_161600_sketchbooks_model.down,
    name: '20260610_161600_sketchbooks_model'
  },
];
