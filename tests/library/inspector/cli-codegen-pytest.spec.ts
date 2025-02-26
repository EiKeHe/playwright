/**
 * Copyright (c) Microsoft Corporation.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import fs from 'fs';
import path from 'path';
import { test, expect } from './inspectorTest';

const emptyHTML = new URL('file://' + path.join(__dirname, '..', '..', 'assets', 'empty.html')).toString();

test('should print the correct imports and context options', async ({ runCLI }) => {
  const cli = runCLI(['--target=pytest', emptyHTML]);
  const expectedResult = `from playwright.sync_api import Page, expect


def test_example(page: Page) -> None:`;
  await cli.waitFor(expectedResult);
  expect(cli.text()).toContain(expectedResult);
});

test('should print the correct context options when using a device and lang', async ({ browserName, runCLI }, testInfo) => {
  test.skip(browserName !== 'webkit');

  const tmpFile = testInfo.outputPath('script.js');
  const cli = runCLI(['--target=pytest', '--device=iPhone 11', '--lang=en-US', '--output', tmpFile, emptyHTML]);
  await cli.exited;
  const content = fs.readFileSync(tmpFile);
  expect(content.toString()).toBe(`import pytest

from playwright.sync_api import Page, expect


@pytest.fixture(scope="session")
def browser_context_args(browser_context_args, playwright):
    return {**playwright.devices["iPhone 11"], "locale": "en-US"}


def test_example(page: Page) -> None:

    page.goto("${emptyHTML}")
`);
});

test('should save the codegen output to a file if specified', async ({ runCLI }, testInfo) => {
  const tmpFile = testInfo.outputPath('test_example.py');
  const cli = runCLI(['--target=pytest', '--output', tmpFile, emptyHTML]);
  await cli.exited;
  const content = fs.readFileSync(tmpFile);
  expect(content.toString()).toBe(`from playwright.sync_api import Page, expect


def test_example(page: Page) -> None:

    page.goto("${emptyHTML}")
`);
});
