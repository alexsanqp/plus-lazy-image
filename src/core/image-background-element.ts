import { LazyImageAdapter } from '../interfaces/lazy-image-adapter.interface';

export class ImageBackgroundElement implements LazyImageAdapter<HTMLDivElement> {
    private _imageElement: HTMLDivElement;

    public constructor(imageDiv: HTMLDivElement) {
        this._imageElement = imageDiv;
    }

    public setPath(path: string): void {
        this._imageElement.style.backgroundImage = `url('${path}')`;
    }

    public getPath(): string {
        return this._imageElement.style.backgroundImage.replace(/url\(['"]?(.*?)['"]?\)/i, '$1');
    }

    public setStyle(style: any, value: any): void {
        this._imageElement.style[style] = value;
    }

    public getRef(): HTMLDivElement {
        return this._imageElement;
    }
}
