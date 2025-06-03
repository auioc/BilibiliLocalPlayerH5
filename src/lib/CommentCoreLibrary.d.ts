type Method = 'GET' | 'POST' | 'PUT';

type SourceType =
    | typeof CommentProvider.SOURCE_JSON
    | typeof CommentProvider.SOURCE_XML
    | typeof CommentProvider.SOURCE_TEXT;

interface CommentParser {}

export interface ICommentData {
    [x: string]: any;

    text: string;
    mode: number;
    stime: number;
    size: number;
    color: number;
    date?: number;
}

export class CommentProvider {
    constructor();

    static readonly SOURCE_JSON = 'JSON';
    static readonly SOURCE_XML = 'XML';
    static readonly SOURCE_TEXT = 'TEXT';

    static BaseHttpProvider(
        method: Method,
        url: string,
        type: string,
        args: Object,
        body: any
    ): Promise<any>;
    static JSONProvider(
        method: Method,
        url: string,
        args: Object,
        body: any
    ): Promise<any>;
    static XMLProvider(
        method: Method,
        url: string,
        args: Object,
        body: any
    ): Promise<any>;
    static TextProvider(
        method: Method,
        url: string,
        args: Object,
        body: any
    ): Promise<any>;

    addStaticSource(source: Promise<any>, type: SourceType): CommentProvider;
    addParser(parser: CommentParser, type: SourceType): CommentProvider;
    addTarget(commentManager: CommentManager): CommentProvider;
    load(): Promise<unknown>;
}

export namespace BilibiliFormat {
    export class XMLParser implements CommentParser {
        constructor();
    }
}

interface CommentManagerOptions {
    global: {
        opacity: number;
        scale: number;
        className: string;
    };
    scroll: {
        opacity: number;
        scale: number;
    };
    limit: number;
    seekTrigger: number;
}

export class CommentManager {
    options: CommentManagerOptions;
    /** danmaku on stage now */
    runline: any[];
    timeline: ICommentData[];
    filter: CommentFilter;
    /** time (ms) */
    _lastPosition: number;
    /** danmaku index in `timeline` */
    position: number;

    constructor(stage: HTMLElement);

    init(renderer: 'legacy' | 'css'): void;
    start(): void;
    stop(): void;
    clear(): void;
    time(time: number): void;
    setBounds(): void;
}

export class CommentFilter {
    constructor();

    addModifier(modififer: (data: ICommentData) => ICommentData): void;
}
