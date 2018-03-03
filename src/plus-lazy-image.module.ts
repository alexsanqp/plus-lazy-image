import { NgModule } from "@angular/core";
import { PlusLazyImageComponent } from "./components";
import { PlusLazyImageDirective } from "./directives";

@NgModule({
    providers   : [],
    declarations: [
        PlusLazyImageDirective,
        PlusLazyImageComponent,
    ],
    exports     : [
        PlusLazyImageDirective,
        PlusLazyImageComponent,
    ],
    entryComponents: [
        PlusLazyImageComponent,
    ]
})
export class PlusLazyImageModule {
}
