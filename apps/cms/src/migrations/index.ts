import * as migration_20260531_030918_init from './20260531_030918_init';
import * as migration_20260607_162320_add_videos from './20260607_162320_add_videos';

export const migrations = [
  {
    up: migration_20260531_030918_init.up,
    down: migration_20260531_030918_init.down,
    name: '20260531_030918_init',
  },
  {
    up: migration_20260607_162320_add_videos.up,
    down: migration_20260607_162320_add_videos.down,
    name: '20260607_162320_add_videos'
  },
];
