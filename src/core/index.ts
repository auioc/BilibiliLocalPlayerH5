import { playerMetadata } from './data';
import { PlayerMetadata } from './metadata';
import Player from './player';

declare global {
    interface Window {
        player: {
            version: string;
            Player: typeof Player;
            playerMetadata: PlayerMetadata;
            instance?: Player;
        };
    }
}

/**
 * This field will be automatically replaced to
 * current version text during build.
 * Do not modify it!
 **/
// @ts-expect-error
const version = _version_;

export { Player, playerMetadata, version };
