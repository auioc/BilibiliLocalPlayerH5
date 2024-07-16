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

import ASS from 'assjs';
import { CommentManager } from '../lib/CommentCoreLibrary';
import { bindMetaEvent, PlayerMetadata } from './metadata';
import { appendChild, clamp, fTime, StrAnyKV, StrGenKV } from './utils';

interface PlayerOptions extends StrAnyKV {
    autoPlay?: boolean;
    muted?: boolean;
    fullscreen?: boolean;
}

export default class Player {
    options: PlayerOptions;
    readonly #metadata: PlayerMetadata;
    readonly title: string;
    readonly videoUrl: string;
    readonly video: HTMLVideoElement;
    #overHour: boolean;
    readonly style: HTMLStyleElement;
    readonly container: HTMLDivElement;
    readonly danmakuUrl: string;
    commentManager: CommentManager;
    readonly subtitleUrl: string;
    subtitleManager: ASS;
    #constructed: boolean;
    elements: StrGenKV<HTMLElement> = {};
    temp: StrAnyKV = {};

    constructor(
        container: HTMLDivElement,
        metadata: PlayerMetadata,
        title: string,
        videoUrl: string,
        danmakuUrl: string,
        subtitleUrl: string,
        options: PlayerOptions
    ) {
        this.#metadata = metadata;
        this.options = options;
        container.classList.add('player');
        container.tabIndex = 10;
        {
            this.title = title;
            this.videoUrl = videoUrl;
            const video = document.createElement('video');
            container.appendChild(video);
            video.src = videoUrl;
            this.video = video;
            this.#overHour = false;
        }
        {
            const style = document.createElement('style');
            this.style = style;
            container.appendChild(style);
        }
        this.container = container;
        this.danmakuUrl = danmakuUrl;
        // if (0) this.commentManager = new CommentManager(); // for type intellisense
        this.subtitleUrl = subtitleUrl;
        this.#bindElements();
        this.#bindEvents();
        {
            this.options.autoPlay ? this.play() : this.pause();
            this.options.muted ? this.mute() : this.unmute();
            this.options.fullscreen ? this.requestFullscreen() : this.setContainerData('fullscreen', false);
        }
        this.#constructed = true;
        if (this.options.autoPlay) {
            this.toast('Autoplay');
        }
        this.focus();
    }

    #bindElements() {
        for (const data of this.#metadata.elements) {
            appendChild(this.container, data.create(this));
        }
    }

    #bindEvents() {
        this.onVideoEvent('loadedmetadata', () => {
            this.setContainerData('paused', this.video.paused);
            this.#overHour = this.video.duration >= 60 * 60;
        });
        this.onVideoEvent('canplay', () => this.focus());
        this.onVideoEvent('play', () => this.setContainerData('paused', this.video.paused));
        this.onVideoEvent('pause', () => this.setContainerData('paused', this.video.paused));
        this.onVideoEvent('volumechange', () => this.setContainerData('muted', this.video.muted));
        this.onPlayerEvent('fullscreenchange', () => {
            const fullscreen = document.fullscreenElement === this.container;
            this.setContainerData('fullscreen', fullscreen ? true : false);
            this.firePlayerEvent(fullscreen ? 'fullscreen' : 'fullscreenexit');
        });
        new ResizeObserver(() => {
            this.video.dispatchEvent(
                new CustomEvent('resize', {
                    detail: {
                        width: this.video.offsetWidth,
                        height: this.video.offsetHeight,
                    },
                })
            );
        }).observe(this.video);
        bindMetaEvent(this.container, this.#metadata.playerEvent, this);
        bindMetaEvent(this.video, this.#metadata.videoEvent, this, this.video);
    }

    focus() {
        this.container.focus();
    }

    setContainerData(key: string, value: any) {
        this.container.dataset[key] = value;
    }

    getContainerData(key: string) {
        return this.container.dataset[key];
    }

    onVideoEvent(type: string, listener: EventListenerOrEventListenerObject) {
        this.video.addEventListener(type, listener);
    }

    onPlayerEvent(type: string, listener: EventListenerOrEventListenerObject) {
        this.container.addEventListener(type, listener);
    }

    firePlayerEvent(type: string, detail?: any) {
        this.container.dispatchEvent(new CustomEvent(type, detail ? { detail: detail } : null));
    }

    toast(html: string) {
        if (this.#constructed) {
            this.firePlayerEvent('toast', { content: html });
        }
    }

    fCurrentTime(alwaysHour?: boolean) {
        return fTime(this.video.currentTime, alwaysHour === undefined ? this.#overHour : alwaysHour);
    }

    seek(time: number) {
        const fixedTime = clamp(time, 0, this.video.duration);
        this.toast(`Seek: ${fTime(fixedTime, this.#overHour)} / ${fTime(this.video.duration)}`);
        this.video.currentTime = fixedTime;
    }

    seekPercent(percent: number) {
        this.seek(this.video.duration * percent);
    }

    skip(time: number) {
        this.seek(this.video.currentTime + time);
    }

    play() {
        this.video.play().catch((e) => alert(e));
        this.toast('Play');
    }

    pause() {
        this.video.pause();
        this.toast('Pause');
    }

    togglePlay() {
        if (this.video.paused) {
            this.play();
        } else {
            this.pause();
        }
    }

    mute() {
        this.video.muted = true;
        this.setContainerData('muted', true);
        this.firePlayerEvent('mute');
        this.toast('Mute');
    }

    unmute() {
        this.video.muted = false;
        this.setContainerData('muted', false);
        this.firePlayerEvent('unmute');
        this.toast('Unmute');
    }

    toggleMute() {
        if (this.video.muted) {
            this.unmute();
        } else {
            this.mute();
        }
    }

    requestFullscreen() {
        this.container.requestFullscreen();
        this.focus();
    }

    exitFullscreen() {
        document.exitFullscreen().catch(() => {});
        this.focus();
    }

    toggleFullscreen() {
        if (this.getContainerData('fullscreen') === 'true') {
            this.exitFullscreen();
        } else {
            this.requestFullscreen();
        }
    }

    setVolume(volume: number) {
        const fixedVolume = clamp(volume, 0, 1);
        this.video.volume = fixedVolume;
        this.toast(`Volume: ${Math.round(fixedVolume * 100)}%`);
    }

    adjustVolume(volume: number) {
        if (!this.video.muted) {
            this.setVolume(this.video.volume + volume);
        }
    }
}
