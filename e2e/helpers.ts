import { expect, type Page } from '@playwright/test';
import { GLYPH_BOX } from '../src/core/geometry';
import { getGlyph } from '../src/core/glyphs';

export async function createProfile(page: Page, name = 'Mia', age = 5) {
  await page.goto('/');
  await page.getByTestId('add-profile').click();
  await page.getByTestId('name-input').fill(name);
  await page.getByTestId(`age-${age}`).click();
  await page.getByTestId('avatar-fox').click();
  await page.getByTestId('create-save').click();
  await expect(page.getByTestId('map')).toBeVisible();
}

async function skipDemo(page: Page) {
  const turn = page.getByTestId('your-turn');
  if (await turn.isVisible().catch(() => false)) await turn.click();
  const start = page.getByTestId('intro-start');
  if (await start.isVisible().catch(() => false)) await start.click();
  const skip = page.getByTestId('skip-demo');
  if (await skip.isVisible().catch(() => false)) await skip.click();
}

/** Draw a glyph on the writing pad with the mouse, following the template strokes. */
export async function drawGlyph(page: Page, glyphId: string, mirror = false) {
  const box = (await page.getByTestId('write-pad').boundingBox())!;
  for (const stroke of getGlyph(glyphId).strokes) {
    const pts = stroke.map((p) => ({
      x: box.x + ((mirror ? GLYPH_BOX.width - p.x : p.x) / GLYPH_BOX.width) * box.width,
      y: box.y + (p.y / GLYPH_BOX.height) * box.height,
    }));
    await page.mouse.move(pts[0].x, pts[0].y);
    await page.mouse.down();
    for (const p of pts.slice(1).filter((_, i, a) => i % 3 === 0 || i === a.length - 1))
      await page.mouse.move(p.x, p.y);
    await page.mouse.up();
  }
}

/** Answer the current round, correctly or not. */
export async function answerRound(page: Page, correct: boolean) {
  await skipDemo(page);
  const round = page.getByTestId('round');
  await expect(round).toHaveCount(1);
  const kind = await round.getAttribute('data-kind');
  switch (kind) {
    case 'side': {
      const target = (await page.getByTestId('prompt').getAttribute('data-target')) as 'left' | 'right';
      const other = target === 'left' ? 'right' : 'left';
      await page.getByTestId(`side-${correct ? target : other}`).click();
      break;
    }
    case 'facing': {
      const target = (await page.getByTestId('prompt').getAttribute('data-target')) as 'left' | 'right';
      const view = await page.locator('.facing-stage').getAttribute('data-view');
      const screenSide = view === 'back' ? target : target === 'left' ? 'right' : 'left';
      const other = screenSide === 'left' ? 'right' : 'left';
      await page.getByTestId(`facing-${correct ? screenSide : other}`).click();
      break;
    }
    case 'pick': {
      await page.locator(`[data-testid^="option-"][data-correct="${correct}"]`).first().click();
      break;
    }
    case 'judge': {
      const shown = await page.getByTestId('judge-card').getAttribute('data-shown');
      const right = shown === 'identity';
      await page.getByTestId(right === correct ? 'judge-yes' : 'judge-flip').click();
      break;
    }
    case 'write': {
      const glyph = (await page.getByTestId('write-pad').getAttribute('data-glyph'))!;
      await drawGlyph(page, glyph, !correct);
      await page.getByTestId('write-done').click();
      break;
    }
    default:
      throw new Error(`unknown round kind ${kind}`);
  }
}

/** Play the whole level. correct=false misses every round twice. */
export async function playLevel(page: Page, correct: boolean) {
  const results = page.getByTestId('results');
  await skipDemo(page); // closes the intro card
  for (let i = 0; i < 20; i++) {
    // Wait for round i (after any exit animation of the previous one) or the results.
    const round = page.locator(`[data-testid="round"][data-index="${i}"]`);
    await expect
      .poll(
        async () => {
          await skipDemo(page); // a demo waits for "Your turn" before the next round kind
          return (
            (await results.count()) > 0 ||
            ((await round.count()) > 0 && (await page.getByTestId('round').count()) === 1)
          );
        },
        { timeout: 15000 },
      )
      .toBe(true);
    if ((await results.count()) > 0) break;
    await answerRound(page, correct);
    if (!correct) {
      await expect(round).toHaveAttribute('data-tries', '2', { timeout: 5000 });
      await answerRound(page, false);
    }
  }
  await expect(results).toBeVisible();
}

/** Seed today's play time for the first profile. */
export async function seedUsage(page: Page, minutes: number) {
  // Leave the profile first so the running play clock doesn't overwrite the seed.
  await page.getByTestId('map-profiles').click();
  await expect(page.getByTestId('profiles')).toBeVisible();
  await page.evaluate((mins) => {
    const raw = JSON.parse(localStorage.getItem('mirror-quest')!);
    const now = Date.now();
    const d = new Date(now);
    const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    raw.state.profiles[0].usage = { date, usedMs: mins * 60_000, lastWallMs: now };
    localStorage.setItem('mirror-quest', JSON.stringify(raw));
  }, minutes);
  await page.reload();
}

/** Give the first profile a passing Level 1 score so Level 2 is open. */
export async function unlockLevel2(page: Page) {
  await page.getByTestId('map-profiles').click();
  await expect(page.getByTestId('profiles')).toBeVisible();
  await page.evaluate(() => {
    const raw = JSON.parse(localStorage.getItem('mirror-quest')!);
    raw.state.profiles[0].levels.L01 = {
      bestScore: 80,
      bestStars: 2,
      attempts: 1,
      bestTimeMs: 30000,
      lastPlayedAt: Date.now(),
    };
    localStorage.setItem('mirror-quest', JSON.stringify(raw));
  });
  await page.reload();
  await page.locator('[data-testid^="profile-"]').first().click();
  await expect(page.getByTestId('level-2')).toHaveAttribute('data-unlocked', 'true');
}
