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

import Player from './player';
import { AnyFunction, EventListenerMap, HTMLTagNames, StrKV, appendChild, bindEvents } from './utils';

type MetaEventTypes = 'selfEvent' | 'playerEvent' | 'videoEvent';

type MetaEvents<F extends AnyFunction> = EventListenerMap<F> | (() => EventListenerMap<F>);

type ElementMetaEvents<T extends HTMLTagNames> = MetaEvents<
    (player: Player, element: HTMLElementTagNameMap[T]) => void
>;
type ElementVideoMetaEvents<T extends HTMLTagNames> = MetaEvents<
    (player: Player, element: HTMLElementTagNameMap[T], video: HTMLVideoElement) => void
>;

export function bindMetaEvent<F extends AnyFunction>(target: HTMLElement, listeners: MetaEvents<F>, ...params: any[]) {
    const l = typeof listeners === 'function' ? listeners() : listeners;
    if (l) {
        bindEvents(target, l, params);
    }
}

export class EDC<T extends HTMLTagNames> {
    #tag: T;
    #name: string;
    #condition: (player: Player) => boolean;
    #css: (data: EDC<T>) => string;
    #attrs: StrKV = {};
    #html: string;
    #selfEvents: ElementMetaEvents<T>;
    #playerEvents: ElementMetaEvents<T>;
    #videoEvent: ElementVideoMetaEvents<T>;
    #childrenBuilders: EDC<any>[] = [];
    #children: HTMLElement[] = [];

    constructor(tag: T, name?: string) {
        this.#tag = tag;
        this.#name = name;
    }
    attrs(attrs: StrKV) {
        this.#attrs = { ...this.#attrs, ...attrs };
        return this;
    }
    attr(k: string, v: string) {
        this.#attrs[k] = v;
        return this;
    }
    title(title: string) {
        this.attr('title', title);
        return this;
    }
    class(clazz: string) {
        this.attr('class', clazz);
        return this;
    }
    children(...c: (EDC<any> | HTMLElement)[]) {
        for (const e of c) {
            if (e instanceof HTMLElement) {
                this.#children.push(e);
            } else {
                this.#childrenBuilders.push(e);
            }
        }
        return this;
    }
    condition(f: (player: Player) => boolean) {
        this.#condition = f;
        return this;
    }
    css(sup: () => string) {
        this.#css = sup;
        return this;
    }
    html(html: string) {
        this.#html = html;
        return this;
    }
    selfEvents(map: ElementMetaEvents<T>) {
        this.#selfEvents = map;
        return this;
    }
    playerEvents(map: ElementMetaEvents<T>) {
        this.#playerEvents = map;
        return this;
    }
    videoEvents(map: ElementVideoMetaEvents<T>) {
        this.#videoEvent = map;
        return this;
    }
    create(player: Player): HTMLElementTagNameMap[T] | null {
        if (this.#condition && !this.#condition(player)) {
            return null;
        }
        const element = document.createElement(this.#tag);
        for (const [key, value] of Object.entries(this.#attrs)) {
            element.setAttribute(key, value);
        }
        if (this.#html) {
            element.innerHTML = this.#html;
        }
        if (this.#css) {
            player.style.textContent += this.#css(this);
        }
        bindMetaEvent(element, this.#selfEvents, player, element);
        bindMetaEvent(player.container, this.#playerEvents, player, element);
        bindMetaEvent(player.video, this.#videoEvent, player, element, player.video);
        for (const childBulder of this.#childrenBuilders) {
            appendChild(element, childBulder.create(player));
        }
        for (const childElement of this.#children) {
            appendChild(element, childElement);
        }
        if (this.#name) {
            player.elements[this.#name] = element;
        }
        element.dispatchEvent(new CustomEvent('create'));
        return element;
    }
}

export interface PlayerMetadata {
    elements?: EDC<any>[];
    playerEvent?: MetaEvents<(player: Player) => void>;
    videoEvent?: MetaEvents<(player: Player, video: HTMLVideoElement) => void>;
}
