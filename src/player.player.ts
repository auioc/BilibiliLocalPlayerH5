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

const __player_metadata__ = (function () {
    function toggleDisplayByData(dataName: string, clazz: string) {
        let r = '';
        for (let i = 0; i < 4; i++) {
            r += `.player[data-${dataName}='${i < 2 ? 'true' : 'false'}'] `;
            r += `.${clazz}>span:${i % 2 === 0 ? 'first' : 'last'}-child`;
            r += `{display: ${i > 0 && i - 3 < 0 ? 'none' : 'unset'};}\n`;
        }
        return r;
    }

    function toggleComponent(P: Player, key: string, on: Function, onMsg: string, off: Function, offMsg: string) {
        if (!P.temp[key]) {
            P.temp[key] = true;
            on();
            P.setContainerData(key, true);
            P.toast(onMsg);
        } else {
            P.temp[key] = false;
            off();
            P.setContainerData(key, false);
            P.toast(offMsg);
        }
    }

    const icon_danmaku_off =
        '<path d="M14 1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4.414A2 2 0 0 0 3 11.586l-2 2V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12.793a.5.5 0 0 0 .854.353l2.853-2.853A1 1 0 0 1 4.414 12H14a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"/>';
    const icon_subtitle_on =
        '<path d="M3.708 7.755c0-1.111.488-1.753 1.319-1.753.681 0 1.138.47 1.186 1.107H7.36V7c-.052-1.186-1.024-2-2.342-2C3.414 5 2.5 6.05 2.5 7.751v.747c0 1.7.905 2.73 2.518 2.73 1.314 0 2.285-.792 2.342-1.939v-.114H6.213c-.048.615-.496 1.05-1.186 1.05-.84 0-1.319-.62-1.319-1.727zm6.14 0c0-1.111.488-1.753 1.318-1.753.682 0 1.139.47 1.187 1.107H13.5V7c-.053-1.186-1.024-2-2.342-2C9.554 5 8.64 6.05 8.64 7.751v.747c0 1.7.905 2.73 2.518 2.73 1.314 0 2.285-.792 2.342-1.939v-.114h-1.147c-.048.615-.497 1.05-1.187 1.05-.839 0-1.318-.62-1.318-1.727z"/><path d="M14 3a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM2 2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/>';

    const icons = {
        volume: '<path d="M9 4a.5.5 0 0 0-.812-.39L5.825 5.5H3.5A.5.5 0 0 0 3 6v4a.5.5 0 0 0 .5.5h2.325l2.363 1.89A.5.5 0 0 0 9 12zm3.025 4a4.5 4.5 0 0 1-1.318 3.182L10 10.475A3.5 3.5 0 0 0 11.025 8 3.5 3.5 0 0 0 10 5.525l.707-.707A4.5 4.5 0 0 1 12.025 8"/>',
        mute: '<path d="M6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06m7.137 2.096a.5.5 0 0 1 0 .708L12.207 8l1.647 1.646a.5.5 0 0 1-.708.708L11.5 8.707l-1.646 1.647a.5.5 0 0 1-.708-.708L10.793 8 9.146 6.354a.5.5 0 1 1 .708-.708L11.5 7.293l1.646-1.647a.5.5 0 0 1 .708 0"/>',
        danmakuOff: icon_danmaku_off,
        danmakuOn:
            icon_danmaku_off +
            '<path d="M3 3.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5M3 6a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9A.5.5 0 0 1 3 6m0 2.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5"/>',
        subtitleOn: icon_subtitle_on,
        subtitleOff: icon_subtitle_on.replace('d=', 'fill="#7e7e7e" d='),
    } as const;

    function icon<K extends keyof typeof icons>(p: K) {
        return (
            '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style="display:block">' +
            icons[p] +
            '</svg>'
        );
    }

    // ====================================================================== //

    function initDanmaku(stage: HTMLElement, url: string, onload: () => void) {
        const provider = new CommentProvider();
        provider.addStaticSource(CommentProvider.XMLProvider('GET', url, null, null), CommentProvider.SOURCE_XML);
        provider.addParser(new BilibiliFormat.XMLParser(), CommentProvider.SOURCE_XML);
        const commentManager = new CommentManager(stage);
        // @ts-expect-error
        provider.addTarget(commentManager);
        commentManager.init('css');
        provider
            .load()
            .then(() => {
                commentManager.start();
                onload();
            })
            .catch((e) => alert('DanmakuError: ' + e));
        return commentManager;
    }

    function hasDanmaku(p: Player) {
        return p.danmakuUrl ? true : false;
    }

    function initSubtitle(stage: HTMLElement, video: HTMLVideoElement, url: string) {
        const req = new XMLHttpRequest();
        req.open('GET', url, false);
        req.send();
        if (req.status === 200) {
            // @ts-expect-error
            const ass = new ASS(req.responseText, video, { container: stage, resampling: 'video_height' });
            return ass as SubtitleManager;
        }
        return null;
    }

    function hasSubtitle(p: Player) {
        return p.subtitleUrl ? true : false;
    }

    // ====================================================================== //

    const toastBox = new EDC('div') //
        .class('toast box visibility-transition invisible')
        .playerEvents({
            toast: (P, E, T: CustomEvent) => {
                E.innerHTML = T.detail.content;
                opacityVisible(E);
                clearTimeout(P.temp.toastTimer);
                P.temp.toastTimer = setTimeout(() => opacityInvisible(E), 800);
            },
        });

    const playToggle = new EDC('button', 'playToggle') //
        .class('play-toggle')
        .title('Play/Pause')
        .css(() => toggleDisplayByData('paused', 'play-toggle'))
        .selfEvents({
            click: (P) => P.togglePlay(),
        })
        .children(...newSpans('⏵', '⏸'));

    const muteToggle = new EDC('button', 'muteToggle')
        .class('mute-toggle')
        .title('Mute/Unmute')
        .css(() => toggleDisplayByData('muted', 'mute-toggle'))
        .selfEvents({
            click: (P) => P.toggleMute(),
        })
        .children(...newSpans(icon('mute'), icon('volume')));

    const volumeInput = new EDC('input', 'volume')
        .class('volume')
        .title('Volume')
        .attrs({ type: 'number', min: '0', max: '100', step: '5', value: '100' })
        .selfEvents({
            input: (P, E) => P.setVolume(E.valueAsNumber / 100),
        })
        .playerEvents({
            mute: (_, E) => (E.disabled = true),
            unmute: (_, E) => (E.disabled = false),
        })
        .videoEvents({
            volumechange: (_, E, V) => (E.valueAsNumber = Math.round(V.volume * 100)),
        });

    const progressBar = new EDC('input', 'progress')
        .class('progress')
        .attrs({
            type: 'range',
            min: '0',
            max: '1',
            step: '0.0001',
            'default-value': '0',
            'data-seeking': 'false',
        })
        .selfEvents({
            create: (_, E) => (E.valueAsNumber = 0),
            change: (P, E) => {
                P.seekPercent(E.valueAsNumber);
                opacityInvisible(P.elements.progressPopup);
                P.temp.progressInputting = false;
            },
            input: (P, E) => {
                P.temp.progressInputting = true;
                const value = E.valueAsNumber;
                const popup = P.elements.progressPopup;
                popup.textContent = fTime(P.video.duration * value);
                popup.style.left = `calc(${value * 100}% + (${8 - value * 100 * 0.15}px))`;
                popup.style.transform = 'translateX(' + -popup.offsetWidth / 2 + 'px)';
                opacityVisible(popup);
            },
        })
        .videoEvents({
            timeupdate: (P, E, V) => {
                if (!P.temp.progressInputting) {
                    const v = V.currentTime / V.duration;
                    E.valueAsNumber = v ? v : 0;
                }
            },
        });

    const progressPopup = new EDC('div', 'progressPopup') //
        .class('progress-popup box visibility-transition invisible');

    const timeInput = new EDC('input', 'timeInput')
        .class('time-input hide')
        .attrs({ type: 'time', step: '1' })
        .selfEvents({
            change: (P, E) => {
                if (E.validity.valid) {
                    P.seek(timeToSeconds(E.value));
                } else {
                    E.value = fTime(P.video.currentTime, true);
                }
            },
        })
        .videoEvents({
            canplay: (P, E, V) => {
                E.value = P.fCurrentTime(true);
                E.max = fTime(V.duration, true);
            },
            timeupdate: (P, E, V) => {
                E.value = P.fCurrentTime(true);
            },
        });

    const timeCurrent = new EDC('span', 'timeCurrent') //
        .html('--:--')
        .videoEvents({
            canplay: (P, E, V) => (E.textContent = P.fCurrentTime()),
            timeupdate: (P, E, V) => (E.textContent = P.fCurrentTime()),
        });

    const timeTotal = new EDC('span')
        .html('--:--')
        .selfEvents({
            click: (P) => toggleDisplay(P.elements.timeInput, P.elements.timeCurrent),
        })
        .videoEvents({
            canplay: (_, E, V) => (E.textContent = fTime(V.duration)),
        });

    const subtitleToggle = new EDC('button', 'subtitleToggle')
        .condition(hasSubtitle)
        .class('subtitle-toggle')
        .title('Subtitle')
        .css(() => toggleDisplayByData('subtitle-on', 'subtitle-toggle'))
        .selfEvents({
            click: (P) =>
                toggleComponent(
                    P,
                    'subtitleOn',
                    () => P.subtitleManager.show(),
                    'Subtitle On',
                    () => P.subtitleManager.hide(),
                    'Subtitle Off'
                ),
        })
        .children(...newSpans(icon('subtitleOn'), icon('subtitleOff')));

    const danmakuToggle = new EDC('button', 'danmakuToggle')
        .class('danmaku-toggle')
        .title('Danmaku')
        .css(() => toggleDisplayByData('danmaku-on', 'danmaku-toggle'))
        .selfEvents({
            click: (P) =>
                toggleComponent(
                    P,
                    'danmakuOn',
                    () => P.commentManager.start(),
                    'Danmaku On',
                    () => {
                        P.commentManager.clear();
                        P.commentManager.stop();
                    },
                    'Danmaku Off'
                ),
        })
        .children(...newSpans(icon('danmakuOn'), icon('danmakuOff')));

    const danmakuListToggle = new EDC('button', 'danmakuListToggle') //
        .html('?')
        .title('Danmaku list')
        .selfEvents({
            click: (P) => toggleDisplay(P.elements.danmakuList),
        })
        .playerEvents({
            danmakuload: (P, E) => (E.innerHTML = `(${P.commentManager.timeline.length})`),
        });

    const danmakuTimeOffset = new EDC('input')
        .class('danmaku-time-offset')
        .title('Danmaku time offset')
        .attrs({ type: 'number', step: '1', value: '0' })
        .selfEvents({
            create: (P, E) => {
                if (!P.options.danmakuTimeOffset) P.options.danmakuTimeOffset = 0;
                E.valueAsNumber = P.options.danmakuTimeOffset;
            },
            input: (P, E) => {
                P.options.danmakuTimeOffset = E.valueAsNumber;
                P.commentManager.clear();
            },
        });

    const danmakuSizeOffset = new EDC('input')
        .class('danmaku-size-offset')
        .title('Danmaku size offset')
        .attrs({ type: 'number', step: '1', value: '0' })
        .selfEvents({
            create: (P, E) => {
                if (!P.options.danmakuSizeOffset) P.options.danmakuSizeOffset = 0;
                E.valueAsNumber = P.options.danmakuSizeOffset;
                P.temp.danmakuSizeFlag = randomStr();
            },
            input: (P, E) => {
                P.options.danmakuSizeOffset = E.valueAsNumber;
                P.temp.danmakuSizeFlag = randomStr();
                P.commentManager.clear();
            },
        });

    const fullscreenToggle = new EDC('button', 'fullscreenToggle')
        .class('fullscreen-toggle')
        .title('Fullscreen')
        .css(() => toggleDisplayByData('fullscreen', 'fullscreen-toggle'))
        .selfEvents({
            click: (P) => P.toggleFullscreen(),
        })
        .children(...newSpans('🡷', '🡵'));

    const danmakuList = new EDC('div', 'danmakuList')
        .condition(hasDanmaku)
        .class('danmaku-list box hide')
        .children(
            new EDC('ul') //
                .playerEvents({
                    danmakuload: async (P, E) => {
                        const timeline = P.commentManager.timeline;
                        const overHour = timeline ? timeline[timeline.length - 1].stime >= 36e5 : false;
                        let html = '';
                        for (const data of timeline) {
                            html += // for performance, do not use document.createElement
                                `<li><span>${fTime(data.stime / 1e3, overHour)}</span>` +
                                `<span title="${data.text}">${data.text}</span></li>`;
                        }
                        E.innerHTML = html;
                    },
                })
        );

    const subtitleStage = new EDC('div', 'subtitleStage')
        .class('subtitle-stage container')
        .condition(hasSubtitle)
        .selfEvents({
            create: (P, E) => {
                P.subtitleManager = initSubtitle(E, P.video, P.subtitleUrl);
                P.firePlayerEvent('subtitleload');
                P.temp.subtitleOn = true;
                P.setContainerData('subtitleOn', true);
            },
        })
        .videoEvents({
            resize: (P) => P.subtitleManager.resize(),
        });

    const danmakuStage = new EDC('div', 'danmakuStage')
        .class('danmaku-stage container')
        .condition(hasDanmaku)
        .selfEvents({
            create: (P, E) => {
                P.commentManager = initDanmaku(E, P.danmakuUrl, () => P.firePlayerEvent('danmakuload'));
                if (P.options.danmakuSizeOffset) {
                    P.commentManager.filter.addModifier(function (commentData: StrAnyKV) {
                        const override = commentData;
                        const size = commentData['size'];
                        let sizeBak = commentData['sizeBackup'];
                        if (size && override['sizeFlag'] != P.temp.danmakuSizeFlag) {
                            if (!sizeBak) {
                                override['sizeBackup'] = size;
                                sizeBak = size;
                            }
                            override['size'] = sizeBak + P.options.danmakuSizeOffset;
                            override['sizeFlag'] = P.temp.danmakuSizeFlag;
                        }
                        return override;
                    });
                }
                P.temp.danmakuOn = true;
                P.setContainerData('danmakuOn', true);
                if (!P.options.danmakuTimeOffset) P.options.danmakuTimeOffset = 0;
            },
        })
        .videoEvents({
            timeupdate: (P, _, V) => {
                if (!P.temp.danmakuOn) return;
                const cm = P.commentManager;
                const time = Math.floor(1e3 * (V.currentTime - P.options.danmakuTimeOffset));
                const deltaTime = time - cm._lastPosition;
                if (deltaTime < 0 || deltaTime > cm.options.seekTrigger) {
                    cm.clear();
                }
                cm.time(time);
            },
            play: (P) => P.commentManager.start(),
            pause: (P) => P.commentManager.stop(),
            resize: (P, _, V) => {
                const cm = P.commentManager;
                cm.clear();
                cm.setBounds();
                cm.options.scroll.scale = V.offsetWidth / 680 / 1;
            },
        });

    // ====================================================================== //

    const mouseIdle = (P: Player) => {
        clearTimeout(P.temp.mouseTimer);
        P.setContainerData('mouseIdle', false);
        P.temp.mouseTimer = setTimeout(() => {
            P.setContainerData('mouseIdle', true);
        }, 1e3);
    };

    const hotkeys = (P: Player, T: KeyboardEvent) => {
        if (T.target === P.container) {
            switch (T.keyCode) {
                case 32: // Space
                    P.togglePlay();
                    break;
                case 77: // M
                    P.toggleMute();
                    break;
                case 70: // F
                    P.toggleFullscreen();
                    break;
                case 38: // Up
                    P.adjustVolume(0.05);
                    break;
                case 40: // Down
                    P.adjustVolume(-0.05);
                    break;
                case 37: // Left
                    P.skip(T.ctrlKey ? -10 : T.shiftKey ? -1 : -5);
                    break;
                case 39: // Right
                    P.skip(T.ctrlKey ? 10 : T.shiftKey ? 1 : 5);
                    break;
                case 73: // I
                    P.toast(
                        [
                            ['LocalTime', new Date().toLocaleString()],
                            ['File', `${P.title} @ ${P.video.videoWidth}x${P.video.videoHeight}`],
                            ['Time', `${P.fCurrentTime()} / ${fTime(P.video.duration)}`],
                        ]
                            .map(([l, t]) => `<b>${l}: </b>${t}`)
                            .join('<br/>')
                    );
                    break;
                case 68: // D
                    if (P.elements.danmakuToggle) P.elements.danmakuToggle.click();
                    break;
                case 81: // Q
                    console.log(P.video.currentTime);
                    P.toast(`Time: ${P.fCurrentTime()} (${P.video.currentTime})`);
                    break;
                default:
                    break;
            }
        }
    };

    // ====================================================================== //

    return {
        elements: [
            toastBox,
            new EDC('div') //
                .class('controls-wrapper')
                .selfEvents({
                    mousemove: (P) => opacityVisible(P.elements.controls),
                    mouseleave: (P) => {
                        opacityInvisible(P.elements.controls);
                        P.focus();
                    },
                })
                .children(
                    new EDC('div', 'controls') //
                        .class('controls box visibility-transition invisible')
                        .playerEvents({
                            fullscreen: (_, E) => opacityInvisible(E),
                        })
                        .children(
                            playToggle,
                            new EDC('div') //
                                .class('volume-wrapper')
                                .children(muteToggle, volumeInput),
                            new EDC('div') //
                                .class('progress-wrapper')
                                .children(progressBar, progressPopup),
                            new EDC('div') //
                                .class('time-label')
                                .selfEvents({
                                    mouseleave: (P) => toggleDisplayBi(P.elements.timeCurrent, P.elements.timeInput),
                                })
                                .children(timeInput, timeCurrent, new EDC('span').html(' / '), timeTotal),
                            subtitleToggle,
                            new EDC('div')
                                .condition(hasDanmaku)
                                .class('danmaku-controls')
                                .children(danmakuToggle, danmakuListToggle, danmakuTimeOffset, danmakuSizeOffset),
                            fullscreenToggle
                        )
                ),
            danmakuList,
            new EDC('div')
                .class('overlays abp')
                .selfEvents({
                    click: (P) => P.togglePlay(),
                })
                .children(subtitleStage, danmakuStage),
        ],
        playerEvent: {
            mousemove: mouseIdle,
            keydown: hotkeys,
        },
    } as PlayerMetadata;
})();

Object.defineProperty(window, '__player_metadata__', __player_metadata__);
