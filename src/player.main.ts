interface PlayerOptions extends StrAnyKV {
    autoPlay?: boolean;
    muted?: boolean;
    fullscreen?: boolean;
}

class Player {
    readonly version = '{version}';
    options: PlayerOptions;
    private readonly metadata: PlayerMetadata;
    readonly title: string;
    readonly videoUrl: string;
    readonly video: HTMLVideoElement;
    overHour: boolean;
    readonly style: HTMLStyleElement;
    readonly container: HTMLDivElement;
    readonly danmakuUrl: string;
    commentManager;
    constructed: boolean;
    elements: StrGenKV<HTMLElement> = {};
    _dyn: StrAnyKV = {};

    constructor(
        container: HTMLDivElement,
        metadata: PlayerMetadata,
        title: string,
        videoUrl: string,
        danmakuUrl: string,
        options: PlayerOptions
    ) {
        console.log('Version:', this.version);
        this.metadata = metadata;
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
            this.overHour = false;
        }
        {
            const style = document.createElement('style');
            this.style = style;
            container.appendChild(style);
        }
        this.container = container;
        this.danmakuUrl = danmakuUrl;
        if (0) this.commentManager = new CommentManager(); // for type intellisense
        this.__bindElements();
        this.__bindEvents();
        {
            this.options.autoPlay ? this.play() : this.pause();
            this.options.muted ? this.mute() : this.unmute();
            this.options.fullscreen ? this.requestFullscreen() : this.setContainerData('fullscreen', false);
        }
        this.constructed = true;
        if (this.options.autoPlay) this.toast('Autoplay');
        this.focus();
    }
    private __bindElements() {
        for (const data of this.metadata.elements) {
            appendChild(this.container, data.create(this));
        }
    }
    private __bindEvents() {
        this.onVideoEvent('loadedmetadata', () => {
            this.setContainerData('paused', this.video.paused);
            this.overHour = this.video.duration >= 60 * 60;
        });
        this.onVideoEvent('play', () => this.setContainerData('paused', this.video.paused));
        this.onVideoEvent('pause', () => this.setContainerData('paused', this.video.paused));
        this.onVideoEvent('volumechange', () => this.setContainerData('muted', this.video.muted));
        this.onPlayerEvent('fullscreenchange', () => {
            const fullscreen = document.fullscreenElement === this.container;
            this.setContainerData('fullscreen', fullscreen ? true : false);
            this.firePlayerEvent(fullscreen ? 'fullscreen' : 'fullscreenexit');
        });
        {
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
        }
        bindMetaEvent(this.container, this.metadata.playerEvent, this);
        bindMetaEvent(this.video, this.metadata.videoEvent, this, this.video);
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
        if (this.constructed) {
            this.firePlayerEvent('toast', { content: html });
        }
    }
    seek(time: number) {
        const fixedTime = clamp(time, 0, this.video.duration);
        this.toast(`Seek: ${fTime(fixedTime, this.overHour)} / ${fTime(this.video.duration)}`);
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
