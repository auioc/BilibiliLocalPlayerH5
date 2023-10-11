const toggleByPlayerData = (dataName: string, thisClass: string) => {
    let r = '';
    for (let i = 0; i < 4; i++) {
        r += `.player[data-${dataName}='${i < 2 ? 'true' : 'false'}'] `;
        r += `.${thisClass}>span:${i % 2 === 0 ? 'first' : 'last'}-child`;
        r += `{display: ${i > 0 && i - 3 < 0 ? 'none' : 'unset'};}\n`;
    }
    return r;
};

const __player_metadata__: PlayerMetadata = {
    elements: [
        new EDC('div')
            .attr({ class: 'toast box visibility-transition invisible' }) //
            .playerEvents({
                toast: (P, E, T: CustomEvent) => {
                    E.innerHTML = T.detail.content;
                    opacityVisible(E);
                    clearTimeout(P._dyn.toastTimer);
                    P._dyn.toastTimer = setTimeout(() => opacityInvisible(E), 800);
                },
            }),
        new EDC('div')
            .attr({ class: 'controls-wrapper' })
            .selfEvents({
                mousemove: (P) => opacityVisible(P.elements.controls),
                mouseleave: (P) => {
                    opacityInvisible(P.elements.controls);
                    P.focus();
                },
            })
            .children(
                new EDC('div', 'controls')
                    .attr({
                        class: 'controls box visibility-transition invisible',
                    })
                    .playerEvents({
                        fullscreen: (_, E) => opacityInvisible(E),
                    })
                    .children(
                        new EDC('button', 'playToggle') //
                            .attr({ class: 'play-toggle' })
                            .css((s) => toggleByPlayerData('paused', s.attributes.class))
                            .selfEvents({ click: (P) => P.togglePlay() })
                            .children(...newSpans('⏵', '⏸')),
                        new EDC('div') //
                            .attr({ class: 'volume-wrapper' })
                            .children(
                                new EDC('button', 'muteToggle')
                                    .attr({ class: 'mute-toggle' })
                                    .css((s) => toggleByPlayerData('muted', s.attributes.class))
                                    .selfEvents({
                                        click: (P) => P.toggleMute(),
                                    })
                                    .children(...newSpans('<s>Mute</s>', 'Mute')),
                                new EDC('input', 'volume')
                                    .attr({
                                        class: 'volume',
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
                        new EDC('div')
                            .attr({ class: 'progress-wrapper' }) //
                            .children(
                                new EDC('input', 'progress')
                                    .attr({
                                        class: 'progress',
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
                                    .attr({
                                        class: 'progress-popup box visibility-transition invisible',
                                    })
                            ),
                        new EDC('div')
                            .attr({ class: 'time-label' })
                            .selfEvents({
                                mouseover: (P) => toggleDisplayBi(P.elements.timeInput, P.elements.timeCurrent),
                                mouseleave: (P) => toggleDisplayBi(P.elements.timeCurrent, P.elements.timeInput),
                            })
                            .children(
                                new EDC('input', 'timeInput')
                                    .attr({
                                        class: 'time-input hide',
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
                                            E.step = P.overHour ? '1' : '0';
                                            E.value = fTime(V.currentTime, P.overHour);
                                            E.max = fTime(V.duration);
                                        },
                                        timeupdate: (P, E, V) => {
                                            E.value = fTime(V.currentTime, P.overHour);
                                        },
                                    }),
                                new EDC('span', 'timeCurrent') //
                                    .html('--:--')
                                    .videoEvents({
                                        canplay: (P, E, V) => (E.textContent = fTime(V.currentTime, P.overHour)),
                                        timeupdate: (P, E, V) => (E.textContent = fTime(V.currentTime, P.overHour)),
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
                            .attr({ class: 'danmaku-controls' })
                            .children(
                                new EDC('button', 'danmakuToggle')
                                    .condition((P) => (P.danmakuUrl ? true : false))
                                    .attr({ class: 'danmaku-toggle' })
                                    .css((s) => toggleByPlayerData('danmaku-on', s.attributes.class))
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
                                    .children(...newSpans('Danmaku', '<s>Danmaku</s>')),
                                new EDC('button', 'danmakuListToggle') //
                                    .html('?') //
                                    .selfEvents({
                                        click: (P) => toggleDisplay(P.elements.danmakuList),
                                    })
                                    .playerEvents({
                                        danmakuload: (P, E) => (E.innerHTML = `(${P.commentManager.timeline.length})`),
                                    }),
                                new EDC('input')
                                    .attr({
                                        class: 'danmaku-time-offset',
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
                                    .attr({
                                        class: 'danmaku-size-offset',
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
                            .attr({ class: 'fullscreen-toggle' })
                            .css((s) => toggleByPlayerData('fullscreen', s.attributes.class))
                            .selfEvents({
                                click: (P) => P.toggleFullscreen(),
                            })
                            .children(...newSpans('🡷', '🡵'))
                    )
            ),
        new EDC('div', 'danmakuList')
            .condition((P) => (P.danmakuUrl ? true : false))
            .attr({ class: 'danmaku-list box hide' })
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
            .attr({ class: 'overlays abp' })
            .selfEvents({
                click: (P) => P.togglePlay(),
            })
            .children(
                new EDC('div', 'danmakuStage')
                    .attr({ class: 'danmaku-stage container' })
                    .condition((P) => (P.danmakuUrl ? true : false))
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
                        P.skip(T.ctrlKey ? -1 : -5);
                        break;
                    case 39: // Right
                        P.skip(T.ctrlKey ? 1 : 5);
                        break;
                    case 84: // T
                        P.toast(P.title);
                        break;
                    case 73: // I
                        P.toast(
                            `${new Date().toLocaleTimeString()}<br/>${fTime(P.video.currentTime, P.overHour)} / ${fTime(
                                P.video.duration
                            )}`
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
(window as any).__player_metadata__ = __player_metadata__;
