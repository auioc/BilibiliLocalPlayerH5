/*
 * Copyright (C) 2022-2024 AUIOC.ORG
 * Copyright (C) 2018-2022 PCC-Studio
 *
 * This file is part of BilibiliLocalPlayerH5.
 *
 * BilibiliLocalPlayerH5 is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

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
