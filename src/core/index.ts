import { defaultPlayerMetadata } from './data';
import Player from './player';

/**
 * This field will be automatically replaced to
 * current version text during build.
 * Do not modify it!
 **/
const version = '_version_';

Object.defineProperty(window, 'Player', { value: Player });
Object.defineProperty(window, '__player_metadata__', { value: defaultPlayerMetadata });

export { defaultPlayerMetadata, Player, version };
