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

export async function performGuestLogin(page: Page) {
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded', { timeout: 30000 });

  const enterButton = page.locator('button:has-text("Enter")');
  await enterButton.waitFor({ state: 'visible', timeout: 15000 });
  await enterButton.click();

  // Wait for a link inside the sidebar nav rather than the nav container
  // itself. In RHDH 1.11+ the <nav> element may have CSS visibility:hidden
  // while its children are still rendered visible, causing Playwright to
  // consider the nav element hidden even though the sidebar is on screen.
  await page
    .locator('nav a')
    .first()
    .waitFor({ state: 'visible', timeout: 60000 });
}

export async function performLogin(
  page: Page,
  _username?: string,
  _password?: string,
) {
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded', { timeout: 30000 });

  // Use a sidebar link as the login-complete indicator rather than the
  // nav container, which may be CSS-hidden in RHDH 1.11+ while its
  // child links remain visible.
  const sidebarLink = page.locator('nav a').first();
  const enterButton = page.locator('button:has-text("Enter")');

  try {
    await enterButton.waitFor({ state: 'visible', timeout: 15000 });
    await enterButton.click();
  } catch {
    if (await sidebarLink.isVisible()) return;
    throw new Error('Neither Enter button nor nav appeared within timeout');
  }

  await sidebarLink.waitFor({ state: 'visible', timeout: 60000 });
}
