import { expect, test } from '@playwright/test';
import { createProfile, playLevel, seedUsage, unlockLevel2 } from './helpers';

test('create a profile and see it on the picker', async ({ page }) => {
  await createProfile(page, 'Mia');
  await page.getByTestId('map-profiles').click();
  await expect(page.getByTestId('profile-Mia')).toBeVisible();
  await page.reload();
  await expect(page.getByTestId('profile-Mia')).toBeVisible(); // saved in localStorage
});

test('play level 1 perfectly and unlock level 2', async ({ page }) => {
  test.setTimeout(300_000);
  await createProfile(page);
  await expect(page.getByTestId('level-2')).toHaveAttribute('data-unlocked', 'false');
  await page.getByTestId('level-1').click();
  await expect(page.getByTestId('intro')).toContainText('Left and Right'); // written intro first
  await page.getByTestId('intro-start').click();
  await expect(page.getByTestId('demo')).toBeVisible(); // then the ghost-hand demo
  // The demo never moves on by itself: it waits for "Your turn".
  await expect(page.getByTestId('your-turn')).toBeVisible({ timeout: 15_000 });
  await page.waitForTimeout(2000);
  await expect(page.getByTestId('round')).toHaveCount(0);
  await page.getByTestId('your-turn').click();
  await expect(page.getByTestId('round')).toHaveAttribute('data-index', '0');
  await expect(page.getByTestId('instruction')).toContainText(/^(LEFT|RIGHT)/); // one word in play
  await playLevel(page, true);
  // All answers right: accuracy alone gives 70+, speed (machine-dependent) decides 2 or 3 stars.
  expect(Number(await page.getByTestId('results').getAttribute('data-score'))).toBeGreaterThanOrEqual(70);
  await expect(page.getByTestId('results-next')).toBeVisible();
  await page.getByTestId('results-map').click();
  await expect(page.getByTestId('level-2')).toHaveAttribute('data-unlocked', 'true');
  await expect(page.getByTestId('points')).not.toHaveText('0');
});

test('play level 2 (trace, write and judge b)', async ({ page }) => {
  test.setTimeout(300_000);
  await createProfile(page);
  await unlockLevel2(page);
  await page.getByTestId('level-2').click();
  await expect(page.getByTestId('intro')).toContainText('b starts with a tall stick');
  await playLevel(page, true);
  expect(Number(await page.getByTestId('results').getAttribute('data-score'))).toBeGreaterThanOrEqual(70);
});

test('a retry keeps the best score', async ({ page }) => {
  test.setTimeout(360_000); // a run with every answer missed twice is deliberately slow and calm
  await createProfile(page);
  await page.getByTestId('level-1').click();
  await playLevel(page, true);
  const best = await page.getByTestId('results').getAttribute('data-score');
  await page.getByTestId('results-retry').click();
  await playLevel(page, false);
  await expect(page.getByTestId('best-kept')).toContainText(best!);
  await page.getByTestId('results-map').click();
  await expect(page.getByTestId('level-2')).toHaveAttribute('data-unlocked', 'true');
});

test('shows the sunset countdown after 25 minutes', async ({ page }) => {
  await createProfile(page);
  await seedUsage(page, 26);
  await page.getByTestId('profile-Mia').click();
  await expect(page.getByTestId('sunset')).toBeVisible();
});

test('locks for the day after 30 minutes, with no unlock', async ({ page }) => {
  await createProfile(page);
  await seedUsage(page, 30);
  await page.getByTestId('profile-Mia').click();
  await expect(page.getByTestId('sleep')).toBeVisible();
  await expect(page.getByTestId('level-1')).toHaveCount(0);
});

test('parent gate and dashboard', async ({ page }) => {
  await createProfile(page);
  await page.getByTestId('map-profiles').click();
  await page.getByTestId('parent-btn').click();
  const hold = page.getByTestId('gate-hold');
  const box = (await hold.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(3300);
  await page.mouse.up();
  const question = await page.getByText(/What is \d+ \+ \d+\?/).textContent();
  const [, a, b] = question!.match(/(\d+) \+ (\d+)/)!;
  await page.getByTestId(`gate-answer-${Number(a) + Number(b)}`).click();
  await expect(page.getByTestId('report-Mia')).toBeVisible();
});

test('works offline after the first visit', async ({ page, context }) => {
  await page.goto('/');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload(); // now controlled by the service worker
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByText('Mirror Quest')).toBeVisible();
  await createProfile(page, 'Offline');
  await page.getByTestId('level-1').click();
  await expect(page.getByTestId('level')).toBeVisible();
});
