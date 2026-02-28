declare module 'assjs' {
    export type Resampling = `${'video' | 'script'}_${'width' | 'height'}`;

    export default class ASS {
        constructor(
            content: string,
            video: HTMLVideoElement,
            { container, resampling }?: ASSOption
        );

        container: HTMLElement;
        video: HTMLVideoElement;
        width: number;
        height: number;
        scale: number;
        info: ASSInfo;
        dialogues: Dialogue[];
        _: _;

        resize(): void;
        show(): void;
        hide(): void;
        destroy(): void;

        get resampling(): Resampling;
        public set resampling(v: Resampling);
    }

    export interface ASSOption {
        container?: HTMLElement;
        resampling?: Resampling;
    }

    export interface ASSInfo {
        Title: string;
        'Original Script': string;
        'Original Translation'?: string;
        'Original Editing'?: string;
        'Original Timing'?: string;
        'Script Updated By'?: string;
        'Update Details'?: string;
        'Synch Point'?: string;
        ScriptType: string;
        Collisions: 'Normal' | 'Reverse';
        PlayResX: string;
        PlayResY: string;
        PlayDepth?: string;
        Timer: string;
        WrapStyle?: '0' | '1' | '2' | '3';
    }

    // TODO Slice type
    export type Slice = Record<any, any>;

    // TODO any
    export interface Dialogue {
        x: number;
        y: number;
        start: number;
        end: number;
        alignment: number;
        animationName: string;
        effect: any;
        fade: any;
        width: number;
        height: number;
        layer: any;
        margin: {
            left: number;
            right: number;
            vertical: number;
        };
        slices: Slice[];
    }

    // TODO _ type
    export interface _ {
        index: number;
        resampling: Resampling;
        stagings: Dialogue[];
    }
}
