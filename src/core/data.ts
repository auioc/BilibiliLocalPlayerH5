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
import {
    BilibiliFormat,
    CommentManager,
    CommentProvider,
} from '../lib/CommentCoreLibrary.js';
import { EDC, PlayerMetadata } from './metadata';
import Player from './player';
import {
    calcVideoRenderedSize,
    formatDate,
    formatTime,
    opacityInvisible,
    opacityVisible,
    randomStr,
    spans,
    timeToSeconds,
    toggleDisplay,
    toggleDisplayBi,
} from './utils';

function toggleDisplayByData(dataName: string, clazz: string) {
    let r = '';
    for (let i = 0; i < 4; i++) {
        r += `.player[data-${dataName}='${i < 2 ? 'true' : 'false'}'] `;
        r += `.${clazz}>span:${i % 2 === 0 ? 'first' : 'last'}-child`;
        r += `{display: ${i > 0 && i - 3 < 0 ? 'none' : 'unset'};}\n`;
    }
    return r;
}

function toggleComponent(
    P: Player,
    key: string,
    on: Function,
    onMsg: string,
    off: Function,
    offMsg: string
) {
    if (!P.data[key]) {
        P.data[key] = true;
        on();
        P.setData(key, true);
        P.toast(onMsg);
    } else {
        P.data[key] = false;
        off();
        P.setData(key, false);
        P.toast(offMsg);
    }
}

function option(value: string, text = value, selected = false) {
    const option = document.createElement('option');
    option.value = value;
    option.innerHTML = text;
    if (selected) {
        option.selected = true;
    }
    return option;
}

const icon_danmaku_off =
    '<path d="M14 1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4.414A2 2 0 0 0 3 11.586l-2 2V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12.793a.5.5 0 0 0 .854.353l2.853-2.853A1 1 0 0 1 4.414 12H14a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"/>';
const icon_subtitle_on =
    '<path d="M3.708 7.755c0-1.111.488-1.753 1.319-1.753.681 0 1.138.47 1.186 1.107H7.36V7c-.052-1.186-1.024-2-2.342-2C3.414 5 2.5 6.05 2.5 7.751v.747c0 1.7.905 2.73 2.518 2.73 1.314 0 2.285-.792 2.342-1.939v-.114H6.213c-.048.615-.496 1.05-1.186 1.05-.84 0-1.319-.62-1.319-1.727zm6.14 0c0-1.111.488-1.753 1.318-1.753.682 0 1.139.47 1.187 1.107H13.5V7c-.053-1.186-1.024-2-2.342-2C9.554 5 8.64 6.05 8.64 7.751v.747c0 1.7.905 2.73 2.518 2.73 1.314 0 2.285-.792 2.342-1.939v-.114h-1.147c-.048.615-.497 1.05-1.187 1.05-.839 0-1.318-.62-1.318-1.727z"/><path d="M14 3a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM2 2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/>';

const icons = {
    play: '<path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393"/>',
    pause: '<path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5m5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5"/>',
    volume: '<path d="M9 4a.5.5 0 0 0-.812-.39L5.825 5.5H3.5A.5.5 0 0 0 3 6v4a.5.5 0 0 0 .5.5h2.325l2.363 1.89A.5.5 0 0 0 9 12zm3.025 4a4.5 4.5 0 0 1-1.318 3.182L10 10.475A3.5 3.5 0 0 0 11.025 8 3.5 3.5 0 0 0 10 5.525l.707-.707A4.5 4.5 0 0 1 12.025 8"/>',
    mute: '<path d="M6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06m7.137 2.096a.5.5 0 0 1 0 .708L12.207 8l1.647 1.646a.5.5 0 0 1-.708.708L11.5 8.707l-1.646 1.647a.5.5 0 0 1-.708-.708L10.793 8 9.146 6.354a.5.5 0 1 1 .708-.708L11.5 7.293l1.646-1.647a.5.5 0 0 1 .708 0"/>',
    danmakuOff: icon_danmaku_off,
    danmakuOn:
        icon_danmaku_off +
        '<path d="M3 3.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5M3 6a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9A.5.5 0 0 1 3 6m0 2.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5"/>',
    subtitleOn: icon_subtitle_on,
    subtitleOff: icon_subtitle_on.replace('d=', 'fill="#7e7e7e" d='),
    exitFullscreen:
        '<path fill-rule="evenodd" d="M15 2a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1zM0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm10.096 3.146a.5.5 0 1 1 .707.708L6.707 9.95h2.768a.5.5 0 1 1 0 1H5.5a.5.5 0 0 1-.5-.5V6.475a.5.5 0 1 1 1 0v2.768z"/>',
    fullscreen:
        '<path fill-rule="evenodd" d="M15 2a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1zM0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm5.854 8.803a.5.5 0 1 1-.708-.707L9.243 6H6.475a.5.5 0 1 1 0-1h3.975a.5.5 0 0 1 .5.5v3.975a.5.5 0 1 1-1 0V6.707z"/>',
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
    provider.addStaticSource(
        CommentProvider.XMLProvider('GET', url, null, null),
        CommentProvider.SOURCE_XML
    );
    provider.addParser(
        new BilibiliFormat.XMLParser(),
        CommentProvider.SOURCE_XML
    );
    const commentManager = new CommentManager(stage);
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
    return p.resources.danmaku ? true : false;
}

function initSubtitle(
    stage: HTMLElement,
    video: HTMLVideoElement,
    url: string
) {
    const req = new XMLHttpRequest();
    req.open('GET', url, false);
    req.send();
    if (req.status === 200) {
        return new ASS(req.responseText, video, {
            container: stage,
            resampling: 'video_height',
        });
    }
    return null;
}

function hasSubtitle(p: Player) {
    return p.resources.subtitle ? true : false;
}

// ====================================================================== //

const toastBox = new EDC('div') //
    .class('toast box visibility-transition invisible')
    .playerEvents({
        toast: (P, E, T: CustomEvent) => {
            E.innerHTML = T.detail.content;
            opacityVisible(E);
            clearTimeout(P.data.toastTimer);
            P.data.toastTimer = setTimeout(() => opacityInvisible(E), 800);
        },
    });

const playToggle = new EDC('button', 'playToggle') //
    .class('play-toggle')
    .title('Play/Pause')
    .css(() => toggleDisplayByData('paused', 'play-toggle'))
    .selfEvents({
        click: (P) => P.togglePlay(),
    })
    .children(...spans(icon('play'), icon('pause')));

const muteToggle = new EDC('button', 'muteToggle')
    .class('mute-toggle')
    .title('Mute/Unmute')
    .css(() => toggleDisplayByData('muted', 'mute-toggle'))
    .selfEvents({
        click: (P) => P.toggleMute(),
    })
    .children(...spans(icon('mute'), icon('volume')));

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
        volumechange: (_, E, V) =>
            (E.valueAsNumber = Math.round(V.volume * 100)),
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
            P.data.progressInputting = false;
        },
        input: (P, E) => {
            P.data.progressInputting = true;
            const value = E.valueAsNumber;
            const popup = P.elements.progressPopup;
            popup.textContent = formatTime(P.video.duration * value);
            // prettier-ignore
            popup.style.left = `calc(${value * 100}% + (${8 - value * 100 * 0.15}px))`;
            popup.style.transform = `translateX(${-popup.offsetWidth / 2}px)`;
            opacityVisible(popup);
        },
    })
    .videoEvents({
        timeupdate: (P, E, V) => {
            if (!P.data.progressInputting) {
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
        mouseleave: (P) =>
            toggleDisplayBi(P.elements.timeCurrent, P.elements.timeInput),
        keydown: (P, E, event) => {
            if (event.key === 'Enter') {
                if (E.validity.valid) {
                    P.seek(timeToSeconds(E.value));
                } else {
                    E.value = P.currentTime(true);
                }
            }
        },
    })
    .videoEvents({
        canplay: (P, E, V) => {
            E.value = P.currentTime(true);
            E.max = formatTime(V.duration, true);
        },
        timeupdate: (P, E) => {
            if (E !== document.activeElement) {
                E.value = P.currentTime(true);
            }
        },
    });

const timeCurrent = new EDC('span', 'timeCurrent') //
    .html('--:--')
    .selfEvents({
        click: (P) =>
            toggleDisplay(P.elements.timeInput, P.elements.timeCurrent),
    })
    .videoEvents({
        canplay: (P, E, V) => (E.textContent = P.currentTime()),
        timeupdate: (P, E, V) => (E.textContent = P.currentTime()),
    });

const timeTotal = new EDC('span')
    .html('--:--') //
    .videoEvents({
        canplay: (_, E, V) => (E.textContent = formatTime(V.duration)),
    });

const playbackRate = new EDC('select', 'playbackRate') //
    .title('Playback Rate')
    .class('playback-rate')
    .videoEvents({
        canplay: (_, E, V) => (V.playbackRate = parseFloat(E.value)),
    })
    .selfEvents({
        change: (P, E) => {
            P.video.playbackRate = parseFloat(E.value);
            P.toast('Playback Rate: ' + E.value);
        },
    })
    .children(
        option('2.0'), //
        option('1.5'),
        option('1.25'),
        option('1.0', '1.0', true),
        option('0.75'),
        option('0.5')
    );

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
    .children(...spans(icon('subtitleOn'), icon('subtitleOff')));

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
    .children(...spans(icon('danmakuOn'), icon('danmakuOff')));

const danmakuListToggle = new EDC('button', 'danmakuListToggle') //
    .html('?')
    .title('Danmaku list')
    .selfEvents({
        click: (P) => toggleDisplay(P.elements.danmakuList),
    })
    .playerEvents({
        danmakuload: (P, E) =>
            (E.innerHTML = `(${P.commentManager.timeline.length})`),
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
            P.data.danmakuSizeFlag = randomStr();
        },
        input: (P, E) => {
            P.options.danmakuSizeOffset = E.valueAsNumber;
            P.data.danmakuSizeFlag = randomStr();
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
    .children(...spans(icon('exitFullscreen'), icon('fullscreen')));

const danmakuList = new EDC('div', 'danmakuList')
    .condition(hasDanmaku)
    .class('danmaku-list box hide')
    .children(
        new EDC('table') //
            .playerEvents({
                danmakuload: async (P, E) => {
                    const timeline = P.commentManager.timeline;
                    const overHour = timeline
                        ? timeline[timeline.length - 1].stime >= 36e5
                        : false;
                    let html = '';
                    for (const d of timeline) {
                        html += // for performance, do not use document.createElement
                            `<tr><td data-time="${d.stime}">${formatTime(
                                d.stime / 1000,
                                overHour
                            )}</td>` +
                            `<td>${formatDate(d.date)}</td>` +
                            `<td>${d.text}</td></tr>`;
                    }
                    E.innerHTML = html;
                },
            })
            .selfEvents({
                click: async (P, E, ev) => {
                    if (
                        ev.target instanceof HTMLElement &&
                        ev.target.dataset.time
                    ) {
                        P.seek(parseInt(ev.target.dataset.time) / 1000);
                    }
                },
            })
    );

const subtitleStage = new EDC('div', 'subtitleStage')
    .class('subtitle-stage container')
    .condition(hasSubtitle)
    .selfEvents({
        create: (P, E) => {
            P.subtitleManager = initSubtitle(E, P.video, P.resources.subtitle);
            P.firePlayerEvent('subtitleload');
            P.data.subtitleOn = true;
            P.setData('subtitleOn', true);
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
            P.commentManager = initDanmaku(E, P.resources.danmaku, () => {
                P.elements.overlays.classList.add('abp');
                P.setData('danmakuOn', true);
                P.firePlayerEvent('danmakuload');
            });

            if (P.options.danmakuStageAbsoluteSize === undefined) {
                P.options.danmakuStageAbsoluteSize = true;
            }

            P.commentManager.filter.addModifier((data) => {
                const override = data;
                const size = data['size'];
                let sizeBak = data['sizeBackup'];
                if (size && override['sizeFlag'] != P.data.danmakuSizeFlag) {
                    if (!sizeBak) {
                        override['sizeBackup'] = size;
                        sizeBak = size;
                    }
                    override['size'] = sizeBak + P.options.danmakuSizeOffset;
                    override['sizeFlag'] = P.data.danmakuSizeFlag;
                }
                return override;
            });

            if (!P.options.danmakuTimeOffset) P.options.danmakuTimeOffset = 0;
        },
    })
    .videoEvents({
        timeupdate: (P, _, V) => {
            if (!P.data.danmakuOn) return;
            const cm = P.commentManager;
            const time = Math.floor(
                1e3 * (V.currentTime - P.options.danmakuTimeOffset)
            );
            const deltaTime = time - cm._lastPosition;
            if (deltaTime < 0 || deltaTime > cm.options.seekTrigger) {
                cm.clear();
            }
            cm.time(time);
        },
        play: (P) => P.commentManager.start(),
        pause: (P) => P.commentManager.stop(),
        resize: (P, E, V) => {
            if (P.options.danmakuStageAbsoluteSize) {
                const d = calcVideoRenderedSize(V);
                E.style.width = d[0] + 'px';
                E.style.height = d[1] + 'px';
            }
            const cm = P.commentManager;
            cm.clear();
            cm.setBounds();
            cm.options.scroll.scale = V.offsetWidth / 680 / 1;
        },
    });

// ====================================================================== //

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
                        [
                            'File',
                            `${P.title} @ ${P.video.videoWidth}x${P.video.videoHeight}`,
                        ],
                        [
                            'Time',
                            `${P.currentTime()} / ${formatTime(
                                P.video.duration
                            )} (${P.video.playbackRate.toFixed(2)}x)`,
                        ],
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
                P.toast(`Time: ${P.currentTime()} (${P.video.currentTime})`);
                break;
            default:
                break;
        }
    }
};

// ====================================================================== //

export const playerMetadata = {
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
                            .children(
                                timeInput,
                                timeCurrent,
                                new EDC('span').html(' / '),
                                timeTotal
                            ),
                        playbackRate,
                        subtitleToggle,
                        new EDC('div')
                            .condition(hasDanmaku)
                            .class('danmaku-controls')
                            .children(
                                danmakuToggle,
                                danmakuListToggle,
                                danmakuTimeOffset,
                                danmakuSizeOffset
                            ),
                        fullscreenToggle
                    )
            ),
        danmakuList,
        new EDC('div', 'overlays')
            .class('overlays')
            .selfEvents({
                click: (P) => P.togglePlay(),
            })
            .children(subtitleStage, danmakuStage),
    ],
    playerEvent: {
        keydown: hotkeys,
    },
} as PlayerMetadata;
