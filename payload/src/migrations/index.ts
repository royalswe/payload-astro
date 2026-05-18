import * as migration_20260421_063131 from './20260421_063131';
import * as migration_20260421_124749 from './20260421_124749';
import * as migration_20260421_154217 from './20260421_154217';
import * as migration_20260422_115233 from './20260422_115233';
import * as migration_20260422_143748 from './20260422_143748';
import * as migration_20260422_150228 from './20260422_150228';
import * as migration_20260422_161122 from './20260422_161122';
import * as migration_20260423_082456_drop_slug_unique from './20260423_082456_drop_slug_unique';

export const migrations = [
  {
    up: migration_20260421_063131.up,
    down: migration_20260421_063131.down,
    name: '20260421_063131',
  },
  {
    up: migration_20260421_124749.up,
    down: migration_20260421_124749.down,
    name: '20260421_124749',
  },
  {
    up: migration_20260421_154217.up,
    down: migration_20260421_154217.down,
    name: '20260421_154217',
  },
  {
    up: migration_20260422_115233.up,
    down: migration_20260422_115233.down,
    name: '20260422_115233',
  },
  {
    up: migration_20260422_143748.up,
    down: migration_20260422_143748.down,
    name: '20260422_143748',
  },
  {
    up: migration_20260422_150228.up,
    down: migration_20260422_150228.down,
    name: '20260422_150228',
  },
  {
    up: migration_20260422_161122.up,
    down: migration_20260422_161122.down,
    name: '20260422_161122',
  },
  {
    up: migration_20260423_082456_drop_slug_unique.up,
    down: migration_20260423_082456_drop_slug_unique.down,
    name: '20260423_082456_drop_slug_unique'
  },
];
