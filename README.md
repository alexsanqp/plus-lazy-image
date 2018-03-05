## Description
> A lazy loading imaging for Angular 4.

## Installation

```sh
$ npm install --save plus-lazy-image
```

## Usage

Import the `PlusLazyImageModule` in your module:

```typescript
import { NgModule } from '@angular/core';
//...
import { PlusLazyImageModule } from "plus-lazy-image";

@NgModule({
  imports: [
    //...
    PlusLazyImageModule
  ],
})
export class AppModule { }
```

How to use with image...

```html
<div class="some-class">
    <img [plus-lazy-image]="getYourImageUrl()" alt="">
</div>
```
Or with div...
```html
<div class="some-class">
    <div [plus-lazy-bg]="true" [plus-lazy-image]="getYourImageUrl()"></div>
</div>
```

## Input parameters

| Input | Required | Details |
| ---- | ---- | ---- |
| [plus-lazy-image] | Required | String, Image url |
| [plus-lazy-bg] | Optional | Boolean, `Default: false` Set on true if you need set background image |
| [plus-pre-image] | Optional | String, Image url for preloading display |
| [plus-pre-loader] | Optional | Boolean, `Default: true`, if set to `false`, image preloader not displaying |
| [plus-start-load] | Optional | `Subject<boolean> or ReplaySubject<boolean>` If you need to set images, for example by clicking on button, etc.|

## Output parameters
| Input | Required | Details |
| ---- | ---- | ---- |
| [plus-on-load] | Optional | Event fire when image is loaded |


## License

ISC © [Alexander Kryhtenko](https://github.com/alexsanqp)