import {
    OnInit,
    Directive,
    ElementRef,
    Input,
    Output,
    NgZone,
    OnChanges,
    OnDestroy,
    AfterContentInit,
    EventEmitter,
    HostBinding
} from "@angular/core";
import { ReplaySubject } from "rxjs/ReplaySubject";
import { Subject } from "rxjs/Subject";
import { Observable } from "rxjs/Observable";
import { switchMap, debounceTime } from "rxjs/operators";
import { OperatorFunction } from "rxjs/interfaces";
import { LazyImage } from "../interfaces/lazy-image.interface";
import { Constants } from "../core/constants";
import { LazyImageAdapter } from "../interfaces/lazy-image-adapter.interface";

/**
 * Angular plus-lazy-image Directive
 */
@Directive({
    selector: '[plus-lazy-image]',
})
export class PlusLazyImageDirective implements OnInit, OnChanges, AfterContentInit, OnDestroy {

    //@Input('plus-lazy-all') images: any;

    @Input('plus-lazy-bg') _isBackgroundImage: boolean;
    @Input('plus-lazy-image') image: string;
    @Input('plus-pre-image') preImage: string;
    @Input('plus-pre-loader') isPreLoader: boolean;
    @Input('plus-start-load') startLoad: Subject<boolean> | ReplaySubject<boolean>;

    @Output('plus-on-load') onLoad: EventEmitter<boolean> = new EventEmitter();

    @HostBinding('class.plus-loading') plusLoadingClass = true;
    @HostBinding('class.plus-loaded') plusLoadedClass   = false;
    @HostBinding('class.plus-failed') plusFailedClass   = false;

    public element: HTMLElement;

    private _imagesSubject: ReplaySubject<LazyImage>;

    constructor(elRef: ElementRef, private ngZone: NgZone) {
        this.element            = elRef.nativeElement;
        this._imagesSubject     = new ReplaySubject<LazyImage>();
        this.isPreLoader        = true;
        this._isBackgroundImage = false;
    }

    public ngOnInit(): void {
        let image: LazyImageAdapter<HTMLImageElement | HTMLDivElement> = this._getElement();

        this._startLoading(image);

        this._imagesSubject.next({
            path     : this.image,
            element  : image,
            startLoad: this.startLoad || null
        });
    }

    public ngOnChanges(): void {

    }

    public ngAfterContentInit(): void {
        this.ngZone.runOutsideAngular(() => {
            this._imagesSubject.pipe(
                debounceTime(10),
                this.onHandlerLazyImage()
            ).subscribe(success => this.onLoad.emit(<boolean>success));
        });
    }

    public ngOnDestroy(): void {

    }

    public onHandlerLazyImage(): OperatorFunction<any, any> {
        return switchMap((imageItem: LazyImage) => {
            const imageLazy: LazyImageAdapter<HTMLImageElement | HTMLDivElement> = imageItem.element;

            const image: HTMLImageElement = this._getElementImage(imageLazy);

            if (!imageItem.isLoaded) {
                if (null !== imageItem.startLoad) {
                    imageItem.startLoad.subscribe(isStartLoad => {
                        if (isStartLoad === true) {
                            imageLazy.setPath(imageItem.path);

                            if (this._isBackgroundImage) {
                                image.src = imageLazy.getPath();
                            }
                        }
                    });
                } else {
                    imageLazy.setPath(imageItem.path);

                    if (this._isBackgroundImage) {
                        image.src = imageLazy.getPath();
                    }
                }
            }

            return Observable
                .create(observer => {
                    image.onload  = () => {
                        this._finishLoading(imageLazy);
                        observer.next(imageItem);
                        observer.complete();
                    };
                    image.onerror = err => {
                        this._filedLoaded(imageLazy);
                        observer.error(null);
                    };
                });
        });
    }

    private _startLoading(element: LazyImageAdapter<HTMLImageElement | HTMLDivElement>): void {
        this.plusLoadingClass = true;

        if (this.isPreLoader) {
            element.setPath(this.preImage || Constants.DEFAULT_PRELOADER);

            if (!this._isBackgroundImage) {
                element.setStyle('object-fit', 'contain');
            }
        } else {
            if (!this._isBackgroundImage) {
                element.setStyle('visibility', 'hidden');
            }
        }
    }

    private _finishLoading(element: LazyImageAdapter<HTMLImageElement | HTMLDivElement>): void {
        this.plusLoadingClass = false;
        this.plusLoadedClass  = true;

        if (this.isPreLoader) {
            if (!this._isBackgroundImage) {
                element.setStyle('object-fit', '');
            }
        } else {
            if (!this._isBackgroundImage) {
                element.setStyle('visibility', 'visible');
            }
        }
    }

    private _filedLoaded(image: LazyImageAdapter<HTMLImageElement | HTMLDivElement>): void {
        this.plusFailedClass = true;
    }

    private _getElement(element?: HTMLImageElement | HTMLDivElement): LazyImageAdapter<HTMLImageElement | HTMLDivElement> {
        if (this._isBackgroundImage) {
            return new ImageBackgroundElement(<HTMLDivElement>this.element);
        }

        return new ImageElement(<HTMLImageElement>this.element);
    }

    private _getElementImage(imageLazy: LazyImageAdapter<any>): HTMLImageElement {
        if (this._isBackgroundImage) {
            return new Image();
        }

        return imageLazy.getRef();
    }
}

class ImageBackgroundElement implements LazyImageAdapter<HTMLDivElement> {
    private _imageElement: HTMLDivElement;

    public constructor(imageDiv: HTMLDivElement) {
        this._imageElement = imageDiv;
    }

    public setPath(path: string): void {
        this._imageElement.style.backgroundImage = `url('${path}')`;
    }

    public getPath(): string {
        return this._imageElement.style.backgroundImage.replace(/url\(['"]?(.*?)['"]?\)/i, "$1");
    }

    public setStyle(style: string, value: any): void {
        this._imageElement.style[ style ] = value;
    }

    public getRef(): HTMLDivElement {
        return this._imageElement;
    }
}

class ImageElement implements LazyImageAdapter<HTMLImageElement> {
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

    public setStyle(style: string, value: any): void {
        this._imageElement.style[ style ] = value;
    }

    public getRef(): HTMLImageElement {
        return this._imageElement;
    }
}