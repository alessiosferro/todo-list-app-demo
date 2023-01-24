import {bootstrapApplication} from "@angular/platform-browser";
import {AppComponent} from "./app/app.component";
import {provideHttpClient} from "@angular/common/http";
import {InjectionToken} from "@angular/core";

export const APP_BASE_URL = new InjectionToken('This is the base url of the API endpoint');

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    {
      provide: APP_BASE_URL,
      useValue: 'https://jsonplaceholder.typicode.com'
    }
  ]
});
