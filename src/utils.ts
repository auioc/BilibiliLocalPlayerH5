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

interface StrAnyKV {
    [x: string]: any;
}

interface StrGenKV<T> {
    [x: string]: T;
}

interface StrKV {
    [x: string]: string;
}

type AnyFunction = (...args: any[]) => any;

type AppendArguments<F extends AnyFunction, A extends any[]> = F extends (...arg: [...infer P]) => infer R
    ? (...args: [...P, ...A]) => R
    : never;

type PrependArguments<F extends AnyFunction, A extends any[]> = F extends (...arg: [...infer P]) => infer R
    ? (...args: [...A, ...P]) => R
    : never;

type ExtendedHTMLEventMap = StrAnyKV & HTMLElementEventMap;

type EventListenerMap<F extends AnyFunction> = {
    [key in keyof ExtendedHTMLEventMap]?: AppendArguments<F, [ExtendedHTMLEventMap[key]]>;
};

type HTMLTagNames = keyof HTMLElementTagNameMap;

interface SubtitleManager {
    new (
        subtitle: string,
        media: HTMLMediaElement,
        options: {
            container?: HTMLElement;
            resampling?: 'video_width' | 'video_height' | 'script_width' | 'script_height';
        }
    ): SubtitleManager;
    resize(): void;
    hide(): void;
    show(): void;
    destory(): void;
}

// ================================================================================================================== //

function clamp(number: number, min: number, max: number) {
    return Math.max(min, Math.min(number, max));
}

function ternaryWithCallback<T, A, B>(
    value: T,
    predicate: (value: T) => boolean,
    aOperator: (value: T) => A,
    bOperator: (value: T) => B
) {
    if (predicate(value)) {
        return aOperator(value);
    }
    return bOperator(value);
}

function span(html: string) {
    const span = document.createElement('span');
    span.innerHTML = html;
    return span;
}

function spans(...html: string[]) {
    return html.map(span);
}

function appendChild(parent: HTMLElement, child?: HTMLElement) {
    if (child instanceof HTMLElement) {
        parent.appendChild(child);
    }
}

function addClass(element: HTMLElement, clazz: string) {
    element.classList.add(clazz);
}

function removeClass(element: HTMLElement, clazz: string) {
    element.classList.remove(clazz);
}

function toggleDisplayBi(display: HTMLElement, hide: HTMLElement) {
    addClass(hide, 'hide');
    removeClass(display, 'hide');
}

function toggleDisplay(...element: HTMLElement[]) {
    for (const el of element) {
        if (el.classList.contains('hide')) {
            removeClass(el, 'hide');
        } else {
            addClass(el, 'hide');
        }
    }
}

function opacityVisible(element: HTMLElement) {
    addClass(element, 'visible');
    removeClass(element, 'invisible');
}

function opacityInvisible(element: HTMLElement) {
    removeClass(element, 'visible');
    addClass(element, 'invisible');
}

function fTime(seconds: number, alwaysHour?: boolean) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor(seconds / 60) % 60;
    const s = Math.floor(seconds % 60);
    return [h, m, s]
        .map((v) => (v < 10 ? '0' + v : '' + v))
        .filter((v, i) => i !== 0 || v !== '00' || alwaysHour)
        .join(':');
}

function timeToSeconds(time: string): number {
    // @ts-expect-error
    return time.split(':').reduce((acc, time) => 60 * acc + parseInt(time));
}

function randomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function randomStr() {
    return Math.random().toString(36).slice(-8);
}

function bindEvents<F extends AnyFunction>(target: HTMLElement, listeners: EventListenerMap<F>, params: any[]) {
    for (const [type, listener] of Object.entries(listeners)) {
        target.addEventListener(type, (event) => listener(...params, event));
    }
}
