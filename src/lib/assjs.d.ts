declare module 'assjs' {
    export default class ASS {
        constructor(content: string, video: HTMLVideoElement, { container, resampling }?: ASSOption);
        resize(): void;
        show(): void;
        hide(): void;
        destroy(): void;
    }

    export type ASSOption = {
        container?: HTMLElement;
        resampling?: `${'video' | 'script'}_${'width' | 'height'}`;
    };
}
