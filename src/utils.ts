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

function newSpan(html: string) {
    const span = document.createElement('span');
    span.innerHTML = html;
    return span;
}

function newSpans(...html: string[]) {
    return html.map(newSpan);
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

function toggleDisplay(element: HTMLElement) {
    if (element.classList.contains('hide')) {
        removeClass(element, 'hide');
    } else {
        addClass(element, 'hide');
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
    const s = Math.round(seconds % 60);
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
