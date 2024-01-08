type MetaEventTypes = 'selfEvent' | 'playerEvent' | 'videoEvent';

type MetaEvents<F extends AnyFunction> = EventListenerMap<F> | (() => EventListenerMap<F>);

type ElementMetaEvents<T extends HTMLTagNames> = MetaEvents<
    (player: Player, element: HTMLElementTagNameMap[T]) => void
>;
type ElementVideoMetaEvents<T extends HTMLTagNames> = MetaEvents<
    (player: Player, element: HTMLElementTagNameMap[T], video: HTMLVideoElement) => void
>;

function bindMetaEvent<F extends AnyFunction>(target: HTMLElement, listeners: MetaEvents<F>, ...params: any[]) {
    const _l = typeof listeners === 'function' ? listeners() : listeners;
    if (_l) {
        bindEvents(target, _l, params);
    }
}

class EDC<T extends HTMLTagNames> {
    private tag: T;
    private name: string;
    private _condition: (player: Player) => boolean;
    private _css: (data: EDC<T>) => string;
    _attrs: StrKV = {};
    private _html: string;
    private _selfEvents: ElementMetaEvents<T>;
    private _playerEvents: ElementMetaEvents<T>;
    private _videoEvent: ElementVideoMetaEvents<T>;
    private _childrenBuilders: EDC<any>[] = [];
    private _children: HTMLElement[] = [];
    constructor(tag: T, name?: string) {
        this.tag = tag;
        this.name = name;
    }
    attrs(attrs: StrKV) {
        this._attrs = { ...this._attrs, ...attrs };
        return this;
    }
    attr(k: string, v: string) {
        this._attrs[k] = v;
        return this;
    }
    children(...c: (EDC<any> | HTMLElement)[]) {
        for (const e of c) {
            if (e instanceof HTMLElement) {
                this._children.push(e);
            } else {
                this._childrenBuilders.push(e);
            }
        }
        return this;
    }
    condition(f: (player: Player) => boolean) {
        this._condition = f;
        return this;
    }
    css(sup: (data: EDC<T>) => string) {
        this._css = sup;
        return this;
    }
    html(html: string) {
        this._html = html;
        return this;
    }
    selfEvents(map: ElementMetaEvents<T>) {
        this._selfEvents = map;
        return this;
    }
    playerEvents(map: ElementMetaEvents<T>) {
        this._playerEvents = map;
        return this;
    }
    videoEvents(map: ElementVideoMetaEvents<T>) {
        this._videoEvent = map;
        return this;
    }
    create(player: Player): HTMLElementTagNameMap[T] | null {
        if (this._condition && !this._condition(player)) {
            return null;
        }
        const element = document.createElement(this.tag);
        for (const [key, value] of Object.entries(this._attrs)) {
            element.setAttribute(key, value);
        }
        if (this._html) {
            element.innerHTML = this._html;
        }
        if (this._css) {
            player.style.textContent += this._css(this);
        }
        bindMetaEvent(element, this._selfEvents, player, element);
        bindMetaEvent(player.container, this._playerEvents, player, element);
        bindMetaEvent(player.video, this._videoEvent, player, element, player.video);
        for (const childBulder of this._childrenBuilders) {
            appendChild(element, childBulder.create(player));
        }
        for (const childElement of this._children) {
            appendChild(element, childElement);
        }
        if (this.name) {
            player.elements[this.name] = element;
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
