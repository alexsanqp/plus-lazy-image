import {
    OnInit, Directive, ElementRef, Input, Output, NgZone, OnChanges,
    OnDestroy, AfterContentInit, EventEmitter, HostBinding,
} from '@angular/core';
import { LazyImage } from '../interfaces/lazy-image.interface';
import { Constants } from '../core/constants';
import { LazyImageAdapter } from '../interfaces/lazy-image-adapter.interface';
import { ImageBackgroundElement } from '../core/image-background-element';
import { ImageElement } from '../core/image-element';
import { Subscription } from 'rxjs/Subscription';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { switchMap, debounceTime } from 'rxjs/operators';
import { OperatorFunction } from 'rxjs/interfaces';
import { Observer } from 'rxjs/Observer';

/**
 * Angular plus-lazy-image Directive
 */
@Directive({
    selector: '[plus-lazy-image]',
})
export class PlusLazyImageDirective implements OnInit, OnChanges, AfterContentInit, OnDestroy {
    @Input('plus-lazy-bg')
    public plusLazyBg: boolean;

    @Input('plus-lazy-image')
    public image: string;

    @Input('plus-pre-image')
    public preImage: string;

    @Input('plus-pre-loader')
    public isPreLoader: boolean;

    @Input('plus-start-load')
    public startLoad: Subject<boolean> | ReplaySubject<boolean>;

    @Output('plus-on-load')
    public onLoad: EventEmitter<boolean> = new EventEmitter();

    @HostBinding('class.plus-loading')
    public plusLoadingClass = true;

    @HostBinding('class.plus-loaded')
    public plusLoadedClass = false;

    @HostBinding('class.plus-failed')
    public plusFailedClass = false;

    public element: HTMLImageElement | HTMLDivElement;

    private _subscribe: Subscription;
    private _imagesSubject: ReplaySubject<LazyImage>;

    constructor(elRef: ElementRef, private ngZone: NgZone) {
        this.element        = elRef.nativeElement;
        this._imagesSubject = new ReplaySubject<LazyImage>();
        this._subscribe     = new Subscription();
        this.isPreLoader    = true;
        this.plusLazyBg     = false;
    }

    public ngOnInit(): void {
        const imageAdapter: LazyImageAdapter<HTMLImageElement | HTMLDivElement>
                  = this._getElement(this.element);

        this._startLoading(imageAdapter);

        this._imagesSubject.next({
            path     : this.image,
            element  : imageAdapter,
            startLoad: this.startLoad || null,
        });
    }

    public ngOnChanges(): void {
        // TODO ...
    }

    public ngAfterContentInit(): void {
        this.ngZone.runOutsideAngular(() => {
            const imagesSubId = this._imagesSubject.pipe(
                debounceTime(10),
                this._onHandlerLazyImage(),
            )
                .subscribe((success) => this.onLoad.emit(success));

            this._subscribe.add(imagesSubId);
        });
    }

    public ngOnDestroy(): void {
        this._subscribe.unsubscribe();
    }

    /**
     * Handler method for each image
     * @returns {OperatorFunction<any, any>}
     * @private
     */
    private _onHandlerLazyImage(): OperatorFunction<any, any> {
        return switchMap((imageItem: LazyImage) => {
            const imageLazy: LazyImageAdapter<HTMLImageElement | HTMLDivElement>
                      = imageItem.element;

            const image: HTMLImageElement = this._getElementImage(imageLazy);

            if (null !== imageItem.startLoad) {
                const imageStartLoadSubId = imageItem.startLoad.subscribe((isStartLoad) => {
                    if (isStartLoad === true) {
                        imageLazy.setPath(imageItem.path);

                        if (this.plusLazyBg) {
                            image.src = imageLazy.getPath();
                        }
                    }
                });

                this._subscribe.add(imageStartLoadSubId);
            } else {
                imageLazy.setPath(imageItem.path);

                if (this.plusLazyBg) {
                    image.src = imageLazy.getPath();
                }
            }

            return Observable
                .create((observer: Observer<LazyImage>) => {
                    image.onload  = () => {
                        this._finishLoading(imageLazy);
                        observer.next(imageItem);
                        observer.complete();
                    };
                    image.onerror = (err) => {
                        this._filedLoaded(imageLazy);
                        observer.error(err);
                    };
                });
        });
    }

    /**
     * Method call when image start loading
     * @param {LazyImageAdapter<HTMLImageElement | HTMLDivElement>} element
     * @private
     */
    private _startLoading(element: LazyImageAdapter<HTMLImageElement | HTMLDivElement>): void {
        this.plusLoadingClass = true;

        if (this.isPreLoader) {
            element.setPath(this.preImage || Constants.DEFAULT_PRELOADER);

            if (!this.plusLazyBg) {
                element.setStyle('object-fit', 'contain');
            }
        } else {
            if (!this.plusLazyBg) {
                element.setStyle('visibility', 'hidden');
            }
        }
    }

    /**
     * Method call when image load is finished
     * @param {LazyImageAdapter<HTMLImageElement | HTMLDivElement>} element
     * @private
     */
    private _finishLoading(element: LazyImageAdapter<HTMLImageElement | HTMLDivElement>): void {
        this.plusLoadingClass = false;
        this.plusLoadedClass  = true;

        if (this.isPreLoader) {
            if (!this.plusLazyBg) {
                element.setStyle('object-fit', '');
            }
        } else {
            if (!this.plusLazyBg) {
                element.setStyle('visibility', 'visible');
            }
        }
    }

    /**
     * Method call when image load is failed
     * @param {LazyImageAdapter<HTMLImageElement | HTMLDivElement>} image
     * @private
     */
    private _filedLoaded(image: LazyImageAdapter<HTMLImageElement | HTMLDivElement>): void {
        this.plusFailedClass = true;
    }

    /**
     * Method for get image adapter
     * @param {HTMLImageElement | HTMLDivElement} element
     * @returns {LazyImageAdapter<HTMLImageElement | HTMLDivElement>}
     * @private
     */
    private _getElement(
        element?: HTMLImageElement | HTMLDivElement,
    ): LazyImageAdapter<HTMLImageElement | HTMLDivElement> {
        if (this.plusLazyBg) {
            return new ImageBackgroundElement(element as HTMLDivElement);
        }

        return new ImageElement(element as HTMLImageElement);
    }

    /**
     * Method for get Image element
     * @param {LazyImageAdapter<any>} imageLazy
     * @returns {HTMLImageElement}
     * @private
     */
    private _getElementImage(imageLazy: LazyImageAdapter<any>): HTMLImageElement {
        if (this.plusLazyBg) {
            return new Image();
        }

        return imageLazy.getRef();
    }
}
