import * as migration_20260531_030918_init from './20260531_030918_init';

export const migrations = [
  {
    up: migration_20260531_030918_init.up,
    down: migration_20260531_030918_init.down,
    name: '20260531_030918_init'
  },
];
