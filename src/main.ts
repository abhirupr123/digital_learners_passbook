import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';

import * as pdfjsLib from 'pdfjs-dist';
pdfjsLib.GlobalWorkerOptions.workerSrc='assets/pdf.worker.js';

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
