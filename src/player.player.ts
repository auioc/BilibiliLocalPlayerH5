const toggleByPlayerData = (dataName: string, thisClass: string) => {
    let r = '';
    for (let i = 0; i < 4; i++) {
        r += `.player[data-${dataName}='${i < 2 ? 'true' : 'false'}'] `;
        r += `.${thisClass}>span:${i % 2 === 0 ? 'first' : 'last'}-child`;
        r += `{display: ${i > 0 && i - 3 < 0 ? 'none' : 'unset'};}\n`;
    }
    return r;
};

const icon_danmaku_off =
    '<path d="M14 1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4.414A2 2 0 0 0 3 11.586l-2 2V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12.793a.5.5 0 0 0 .854.353l2.853-2.853A1 1 0 0 1 4.414 12H14a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"/>';

const Icons = {
    play: '',
    pause: '',
    fullscreen: '',
    fullscreen_exit: '',
    volume: '<path d="M9 4a.5.5 0 0 0-.812-.39L5.825 5.5H3.5A.5.5 0 0 0 3 6v4a.5.5 0 0 0 .5.5h2.325l2.363 1.89A.5.5 0 0 0 9 12zm3.025 4a4.5 4.5 0 0 1-1.318 3.182L10 10.475A3.5 3.5 0 0 0 11.025 8 3.5 3.5 0 0 0 10 5.525l.707-.707A4.5 4.5 0 0 1 12.025 8"/>',
    mute: '<path d="M6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06m7.137 2.096a.5.5 0 0 1 0 .708L12.207 8l1.647 1.646a.5.5 0 0 1-.708.708L11.5 8.707l-1.646 1.647a.5.5 0 0 1-.708-.708L10.793 8 9.146 6.354a.5.5 0 1 1 .708-.708L11.5 7.293l1.646-1.647a.5.5 0 0 1 .708 0"/>',
    danmaku_off: icon_danmaku_off,
    danmaku_on:
        icon_danmaku_off +
        '<path d="M3 3.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5M3 6a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9A.5.5 0 0 1 3 6m0 2.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5"/>',
} as const;

function icon<K extends keyof typeof Icons>(p: K) {
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style="display:block">' +
        Icons[p] +
        '</svg>'
    );
}

const __player_metadata__: PlayerMetadata = {
    elements: [
        new EDC('div') //
            .class('toast box visibility-transition invisible')
            .playerEvents({
                toast: (P, E, T: CustomEvent) => {
                    E.innerHTML = T.detail.content;
                    opacityVisible(E);
                    clearTimeout(P._dyn.toastTimer);
                    P._dyn.toastTimer = setTimeout(() => opacityInvisible(E), 800);
                },
            }),
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
                        new EDC('button', 'playToggle') //
                            .class('play-toggle')
                            .css((s) => toggleByPlayerData('paused', s._attrs.class))
                            .selfEvents({ click: (P) => P.togglePlay() })
                            .children(...newSpans('⏵', '⏸')),
                        new EDC('div') //
                            .class('volume-wrapper')
                            .children(
                                new EDC('button', 'muteToggle')
                                    .class('mute-toggle')
                                    .css((s) => toggleByPlayerData('muted', s._attrs.class))
                                    .selfEvents({
                                        click: (P) => P.toggleMute(),
                                    })
                                    .children(...newSpans(icon('mute'), icon('volume'))),
                                new EDC('input', 'volume')
                                    .class('volume')
                                    .title('Volume')
                                    .attrs({
                                        type: 'number',
                                        min: '0',
                                        max: '100',
                                        step: '5',
                                        value: '100',
                                    })
                                    .selfEvents({
                                        input: (P, E) => P.setVolume(E.valueAsNumber / 100),
                                    })
                                    .playerEvents({
                                        mute: (_, E) => (E.disabled = true),
                                        unmute: (_, E) => (E.disabled = false),
                                    })
                                    .videoEvents({
                                        volumechange: (_, E, V) => (E.valueAsNumber = Math.round(V.volume * 100)),
                                    })
                            ),
                        new EDC('div') //
                            .class('progress-wrapper')
                            .children(
                                new EDC('input', 'progress')
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
                                            P._dyn.progressInputting = false;
                                        },
                                        input: (P, E) => {
                                            P._dyn.progressInputting = true;
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
                                            if (!P._dyn.progressInputting) {
                                                const v = V.currentTime / V.duration;
                                                E.valueAsNumber = v ? v : 0;
                                            }
                                        },
                                    }),
                                new EDC('div', 'progressPopup') //
                                    .class('progress-popup box visibility-transition invisible')
                            ),
                        new EDC('div') //
                            .class('time-label')
                            .selfEvents({
                                mouseover: (P) => toggleDisplayBi(P.elements.timeInput, P.elements.timeCurrent),
                                mouseleave: (P) => toggleDisplayBi(P.elements.timeCurrent, P.elements.timeInput),
                            })
                            .children(
                                new EDC('input', 'timeInput')
                                    .class('time-input hide')
                                    .attrs({
                                        type: 'time',
                                        step: '1',
                                    })
                                    .selfEvents({
                                        change: (P, E) => {
                                            if (E.validity.valid) {
                                                P.seek(timeToSeconds(E.value));
                                            } else {
                                                E.value = fTime(P.video.currentTime);
                                            }
                                        },
                                    })
                                    .videoEvents({
                                        canplay: (P, E, V) => {
                                            E.step = V.duration >= 3600 ? '1' : '0';
                                            E.value = P.fCurrentTime();
                                            E.max = fTime(V.duration);
                                        },
                                        timeupdate: (P, E, V) => {
                                            E.value = P.fCurrentTime();
                                        },
                                    }),
                                new EDC('span', 'timeCurrent') //
                                    .html('--:--')
                                    .videoEvents({
                                        canplay: (P, E, V) => (E.textContent = P.fCurrentTime()),
                                        timeupdate: (P, E, V) => (E.textContent = P.fCurrentTime()),
                                    }),
                                new EDC('span').html(' / '),
                                new EDC('span')
                                    .html('--:--') //
                                    .videoEvents({
                                        canplay: (_, E, V) => (E.textContent = fTime(V.duration)),
                                    })
                            ),
                        new EDC('div', 'danmaku-controls')
                            .condition((P) => (P.danmakuUrl ? true : false))
                            .class('danmaku-controls')
                            .children(
                                new EDC('button', 'danmakuToggle')
                                    .condition((P) => (P.danmakuUrl ? true : false))
                                    .class('danmaku-toggle')
                                    .css((s) => toggleByPlayerData('danmaku-on', s._attrs.class))
                                    .selfEvents({
                                        click: (P) => {
                                            if (!P._dyn.danmakuOn) {
                                                P._dyn.danmakuOn = true;
                                                P.commentManager.start();
                                                P.setContainerData('danmakuOn', true);
                                                P.toast('Danmaku On');
                                            } else {
                                                P._dyn.danmakuOn = false;
                                                P.commentManager.clear();
                                                P.commentManager.stop();
                                                P.setContainerData('danmakuOn', false);
                                                P.toast('Danmaku Off');
                                            }
                                        },
                                    })
                                    .children(...newSpans(icon('danmaku_on'), icon('danmaku_off'))),
                                new EDC('button', 'danmakuListToggle') //
                                    .html('?')
                                    .title('Danmaku list')
                                    .selfEvents({
                                        click: (P) => toggleDisplay(P.elements.danmakuList),
                                    })
                                    .playerEvents({
                                        danmakuload: (P, E) => (E.innerHTML = `(${danmakuCount(P)})`),
                                    }),
                                new EDC('input')
                                    .class('danmaku-time-offset')
                                    .title('Danmaku time offset')
                                    .attrs({
                                        type: 'number',
                                        step: '1',
                                        value: '0',
                                    })
                                    .selfEvents({
                                        create: (P, E) => {
                                            if (!P.options.danmakuTimeOffset) P.options.danmakuTimeOffset = 0;
                                            E.valueAsNumber = P.options.danmakuTimeOffset;
                                        },
                                        input: (P, E) => {
                                            P.options.danmakuTimeOffset = E.valueAsNumber;
                                            P.commentManager.clear();
                                        },
                                    }),
                                new EDC('input')
                                    .class('danmaku-size-offset')
                                    .title('Danmaku size offset')
                                    .attrs({
                                        type: 'number',
                                        step: '1',
                                        value: '0',
                                    })
                                    .selfEvents({
                                        create: (P, E) => {
                                            if (!P.options.danmakuSizeOffset) P.options.danmakuSizeOffset = 0;
                                            E.valueAsNumber = P.options.danmakuSizeOffset;
                                            P._dyn.danmakuSizeFlag = randomStr();
                                        },
                                        input: (P, E) => {
                                            P.options.danmakuSizeOffset = E.valueAsNumber;
                                            P._dyn.danmakuSizeFlag = randomStr();
                                            P.commentManager.clear();
                                        },
                                    })
                            ),
                        new EDC('button', 'fullscreenToggle')
                            .class('fullscreen-toggle')
                            .css((s) => toggleByPlayerData('fullscreen', s._attrs.class))
                            .selfEvents({
                                click: (P) => P.toggleFullscreen(),
                            })
                            .children(...newSpans('🡷', '🡵'))
                    )
            ),
        new EDC('div', 'danmakuList')
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
            ),
        new EDC('div')
            .class('overlays abp')
            .selfEvents({
                click: (P) => P.togglePlay(),
            })
            .children(
                new EDC('div', 'danmakuStage')
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
                                    if (size && override['sizeFlag'] != P._dyn.danmakuSizeFlag) {
                                        if (!sizeBak) {
                                            override['sizeBackup'] = size;
                                            sizeBak = size;
                                        }
                                        override['size'] = sizeBak + P.options.danmakuSizeOffset;
                                        override['sizeFlag'] = P._dyn.danmakuSizeFlag;
                                    }
                                    return override;
                                });
                            }
                            P._dyn.danmakuOn = true;
                            P.setContainerData('danmakuOn', true);
                            if (!P.options.danmakuTimeOffset) P.options.danmakuTimeOffset = 0;
                        },
                    })
                    .videoEvents({
                        timeupdate: (P, _, V) => {
                            if (!P._dyn.danmakuOn) return;
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
                    })
            ),
    ],
    playerEvent: {
        mousemove: (P) => {
            clearTimeout(P._dyn.mouseTimer);
            P.setContainerData('mouseIdle', false);
            P._dyn.mouseTimer = setTimeout(() => {
                P.setContainerData('mouseIdle', true);
            }, 1e3);
        },
        keydown: (P, T) => {
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
                    default:
                        break;
                }
            }
        },
    },
};

Object.defineProperty(window, '__player_metadata__', __player_metadata__);
