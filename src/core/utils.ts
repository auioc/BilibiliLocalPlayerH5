/*
 * Copyright (C) 2022-2025 AUIOC.ORG
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

export interface StrAnyKV {
    [x: string]: any;
}

export interface StrGenKV<T> {
    [x: string]: T;
}

export interface StrKV {
    [x: string]: string;
}

export type AnyFunction = (...args: any[]) => any;

export type AppendArguments<
    F extends AnyFunction,
    A extends any[]
> = F extends (...arg: [...infer P]) => infer R
    ? (...args: [...P, ...A]) => R
    : never;

export type PrependArguments<
    F extends AnyFunction,
    A extends any[]
> = F extends (...arg: [...infer P]) => infer R
    ? (...args: [...A, ...P]) => R
    : never;

export type ExtendedHTMLEventMap = StrAnyKV & HTMLElementEventMap;

export type EventListenerMap<F extends AnyFunction> = {
    [key in keyof ExtendedHTMLEventMap]?: AppendArguments<
        F,
        [ExtendedHTMLEventMap[key]]
    >;
};

export type HTMLTagNames = keyof HTMLElementTagNameMap;

// ================================================================================================================== //

export function clamp(number: number, min: number, max: number) {
    return Math.max(min, Math.min(number, max));
}

export function ternaryWithCallback<T, A, B>(
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

export function span(html: string) {
    const span = document.createElement('span');
    span.innerHTML = html;
    return span;
}

export function spans(...html: string[]) {
    return html.map(span);
}

export function appendChild(parent: HTMLElement, child?: HTMLElement) {
    if (child instanceof HTMLElement) {
        parent.appendChild(child);
    }
}

export function addClass(element: HTMLElement, clazz: string) {
    element.classList.add(clazz);
}

export function removeClass(element: HTMLElement, clazz: string) {
    element.classList.remove(clazz);
}

export function toggleClass(
    element: HTMLElement,
    clazz: string,
    bool: boolean
) {
    if (bool) {
        addClass(element, clazz);
    } else {
        removeClass(element, clazz);
    }
}

export function toggleDisplayBi(display: HTMLElement, hide: HTMLElement) {
    addClass(hide, 'hide');
    removeClass(display, 'hide');
}

export function toggleDisplay(...element: HTMLElement[]) {
    for (const el of element) {
        if (el.classList.contains('hide')) {
            removeClass(el, 'hide');
        } else {
            addClass(el, 'hide');
        }
    }
}

export function opacityVisible(element: HTMLElement) {
    addClass(element, 'visible');
    removeClass(element, 'invisible');
}

export function opacityInvisible(element: HTMLElement) {
    removeClass(element, 'visible');
    addClass(element, 'invisible');
}

export function toggleVisibility(element: HTMLElement) {
    element.classList.toggle('visible');
    element.classList.toggle('invisible');
}

export function formatDate(ts: number) {
    if (ts <= 0) {
        return '0';
    }
    return new Date(ts * 1000).toLocaleString(navigator.language, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    });
}

export function formatTime(seconds: number, alwaysHour?: boolean) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor(seconds / 60) % 60;
    const s = Math.floor(seconds % 60);
    return [h, m, s]
        .map((v) => (v < 10 ? '0' + v : '' + v))
        .filter((v, i) => i !== 0 || v !== '00' || alwaysHour)
        .join(':');
}

export function timeToSeconds(time: string): number {
    // @ts-expect-error
    return time.split(':').reduce((acc, time) => 60 * acc + parseInt(time));
}

export function randomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min)) + min;
}

export function randomStr() {
    return Math.random().toString(36).slice(-8);
}

export function bindEvents<F extends AnyFunction>(
    target: HTMLElement,
    listeners: EventListenerMap<F>,
    params: any[]
) {
    for (const [type, listener] of Object.entries(listeners)) {
        target.addEventListener(type, (event) => listener(...params, event));
    }
}

export function calcVideoRenderedSize(
    video: HTMLVideoElement
): [number, number] {
    const rect = video.getBoundingClientRect();
    const cW = rect.width;
    const cH = rect.height;
    const cR = cW / cH;

    const vW = video.videoWidth;
    const vH = video.videoHeight;
    const vR = vW / vH;

    let w = cW;
    let h = cH;

    if (cR > vR) {
        w = cH * vR;
    } else {
        h = cW / vR;
    }

    return [w, h];
}
