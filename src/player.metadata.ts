type MetaEventTypes = 'selfEvent' | 'playerEvent' | 'videoEvent';

type MetaEvents<F extends AnyFunction> = EventListenerMap<F> | (() => EventListenerMap<F>);

type ElementMetaEvents<T extends HTMLTagNames> = MetaEvents<
    (player: Player, element: HTMLElementTagNameMap[T]) => void
>;
type ElementVideoMetaEvents<T extends HTMLTagNames> = MetaEvents<
    (player: Player, element: HTMLElementTagNameMap[T], video: HTMLVideoElement) => void
>;

function bindMetaEvent<F extends AnyFunction>(target: HTMLElement, listeners: MetaEvents<F>, ...params: any[]) {
    const l = typeof listeners === 'function' ? listeners() : listeners;
    if (l) {
        bindEvents(target, l, params);
    }
}

class EDC<T extends HTMLTagNames> {
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

interface PlayerMetadata {
    elements?: EDC<any>[];
    playerEvent?: MetaEvents<(player: Player) => void>;
    videoEvent?: MetaEvents<(player: Player, video: HTMLVideoElement) => void>;
}
