// This file is required by karma.conf.js and loads recursively all the .spec and framework files

import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

declare const require: {
  context(path: string, deep?: boolean, filter?: RegExp): {
    <T>(id: string): T;
    keys(): string[];
  };
};

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
);

// Then we find all the tests.
const context = require.context('./', true, /\.spec\.ts$/);
// And load the modules.
context.keys().forEach(context);

// Pull every source file under app/ into the bundle so the coverage denominator is the whole
// application, not just what the specs happen to import. Sonar was reporting 61% while the
// honest figure was in the thirties (MOL-2911). Module files are safe to import here; nothing
// bootstraps. Keep this in step with codeCoverageExclude in angular.json.
const sources = require.context('./app', true, /^(?!.*\.spec\.ts$).*\.ts$/);
sources.keys().forEach(sources);
