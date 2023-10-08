type MetaEventTypes = 'selfEvent' | 'playerEvent' | 'videoEvent';

type MetaEvents<F extends AnyFunction> = EventListenerMap<F> | (() => EventListenerMap<F>);

type ElementMetaEvents<T extends HTMLTagNames> = MetaEvents<
    (player: Player, element: HTMLElementTagNameMap[T]) => void
>;
type ElementVideoMetaEvents<T extends HTMLTagNames> = MetaEvents<
    (player: Player, element: HTMLElementTagNameMap[T], video: HTMLVideoElement) => void
>;

function bindMetadataEvents( // TODO improve
    data: { [s in MetaEventTypes]?: MetaEvents<any> },
    settings: { [s in MetaEventTypes]?: [HTMLElement, () => any] }
) {
    for (const [name, target_params] of Object.entries(settings)) {
        if (data[name as MetaEventTypes]) {
            bindEvent(
                target_params[0],
                ternaryWithCallback(
                    data[name as MetaEventTypes] as MetaEvents<any>,
                    (v) => typeof v === 'function',
                    (v) => v(),
                    (v) => v
                ),
                target_params[1]()
            );
        }
    }
}

class EDC<T extends HTMLTagNames> {
    private tag: T;
    private name: string;
    private _condition: (player: Player) => boolean;
    private _css: (data: EDC<T>) => string;
    attributes: StrKV = {};
    private _html: string;
    private _selfEvent: ElementMetaEvents<T>;
    private _playerEvent: ElementMetaEvents<T>;
    private _videoEvent: ElementVideoMetaEvents<T>;
    private _childrenBuilders: EDC<any>[] = [];
    private _children: HTMLElement[] = [];
    constructor(tag: T, name?: string) {
        this.tag = tag;
        this.name = name;
    }
    attr(attributes: StrKV) {
        this.attributes = attributes;
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
        this._selfEvent = map;
        return this;
    }
    playerEvents(map: ElementMetaEvents<T>) {
        this._playerEvent = map;
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
        for (const [key, value] of Object.entries(this.attributes)) {
            element.setAttribute(key, value);
        }
        if (this._html) {
            element.innerHTML = this._html;
        }
        if (this._css) {
            player.style.textContent += this._css(this);
        }
        bindMetadataEvents(
            {
                selfEvent: this._selfEvent,
                playerEvent: this._playerEvent,
                videoEvent: this._videoEvent,
            },
            {
                selfEvent: [element, () => [player, element]],
                playerEvent: [player.container, () => [player, element]],
                videoEvent: [player.video, () => [player, element, player.video]],
            }
        );
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
