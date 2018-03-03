import { ReplaySubject } from "rxjs/ReplaySubject";
import { Subject } from "rxjs/Subject";
import { LazyImageAdapter } from './lazy-image-adapter.interface';

export interface LazyImage {
    path: string;
    element: LazyImageAdapter<HTMLImageElement | HTMLDivElement>;
    startLoad?: Subject<boolean> | ReplaySubject<boolean>;
    isLoaded?: boolean;
}