import { LazyImageAdapter } from '../interfaces/lazy-image-adapter.interface';

export class ImageElement implements LazyImageAdapter<HTMLImageElement> {
    private _imageElement: HTMLImageElement;

    public constructor(image: HTMLImageElement) {
        this._imageElement = image;
    }

    public setPath(path: string): void {
        this._imageElement.src = path;
    }

    public getPath() {
        return this._imageElement.src;
    }

    public setStyle(style: any, value: any): void {
        this._imageElement.style[style] = value;
    }

    public getRef(): HTMLImageElement {
        return this._imageElement;
    }
}
