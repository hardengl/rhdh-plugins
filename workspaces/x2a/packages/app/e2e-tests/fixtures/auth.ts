/*
 * Copyright Red Hat, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Page } from '@playwright/test';

/**
 * Locator for the sidebar navigation area after login.
 *
 * In RHDH 1.11 the `<nav>` element itself has `height: 0` (its children
 * overflow and render normally), so Playwright's `.isVisible()` returns
 * `false` for the `<nav>` element.  We therefore wait for a visible link
 * *inside* the sidebar instead, which reliably indicates the app has
 * rendered the authenticated layout.
 */
function sidebarReady(page: Page) {
  return page.locator('nav[aria-label="sidebar nav"] a').first();
}

export async function performGuestLogin(page: Page) {
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded', { timeout: 30000 });

  const enterButton = page.locator('button:has-text("Enter")');
  await enterButton.waitFor({ state: 'visible', timeout: 15000 });
  await enterButton.click();

  await sidebarReady(page).waitFor({ state: 'visible', timeout: 60000 });
}

export async function performLogin(
  page: Page,
  _username?: string,
  _password?: string,
) {
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded', { timeout: 30000 });

  const sidebar = sidebarReady(page);
  const enterButton = page.locator('button:has-text("Enter")');

  try {
    await enterButton.waitFor({ state: 'visible', timeout: 15000 });
    await enterButton.click();
  } catch {
    if (await sidebar.isVisible()) return;
    throw new Error('Neither Enter button nor sidebar appeared within timeout');
  }

  await sidebar.waitFor({ state: 'visible', timeout: 60000 });
}
