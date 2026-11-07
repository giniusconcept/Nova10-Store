import { chromium } from 'playwright';
import fs from 'node:fs';

const out = (status, reason, extra = {}) => {
  const payload = { status, reason, ...extra, at: new Date().toISOString() };
  fs.writeFileSync('selfnamed-map-status.json', JSON.stringify(payload, null, 2));
  console.log('QBOT_STATUS', JSON.stringify(payload));
};

const statePath = process.env.SELFNAMED_STORAGE_STATE_PATH || '.auth/selfnamed.json';
if (!fs.existsSync(statePath)) {
  out('blocked', 'missing_selfnamed_google_session', {
    required: ['SELFNAMED_STORAGE_STATE_B64']
  });
  process.exit(2);
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  storageState: statePath,
  viewport: { width: 1440, height: 1100 }
});
const page = await context.newPage();

try {
  await page.goto('https://www.selfnamed.com/en/profile', {
    waitUntil: 'domcontentloaded',
    timeout: 60000
  });
  await page.waitForTimeout(3000);

  if (/\/login(?:\?|$)/.test(page.url()) || await page.getByText(/log in|sign in with an existing account/i).count()) {
    out('blocked', 'selfnamed_google_session_expired_or_invalid', { url: page.url() });
    process.exit(3);
  }

  const myDesigns = page.getByRole('link', { name: /my designs/i })
    .or(page.getByText(/my designs/i)).first();

  if (await myDesigns.count()) {
    await myDesigns.click();
  } else {
    const maybeMenu = page.getByText(/my products|products|designs/i).first();
    if (await maybeMenu.count()) await maybeMenu.click();
  }
  await page.waitForTimeout(2500);

  const cream = page.getByText(/moisturising day cream|moisturizing day cream|cr[eè]me de jour hydratante/i).first();
  if (!(await cream.count())) {
    out('blocked', 'no_existing_selfnamed_design_for_moisturising_day_cream', { url: page.url() });
    process.exit(4);
  }

  await cream.click();
  await page.waitForTimeout(1200);

  let addToStore = page.getByText(/add to store|ajouter.*boutique/i).first();
  if (!(await addToStore.count())) {
    const more = page.getByRole('button', { name: /more|actions|options/i }).first();
    if (await more.count()) {
      await more.click();
      await page.waitForTimeout(500);
      addToStore = page.getByText(/add to store|ajouter.*boutique/i).first();
    }
  }

  if (!(await addToStore.count())) {
    out('blocked', 'design_found_but_add_to_store_action_not_found', { url: page.url() });
    process.exit(5);
  }

  await addToStore.click();
  await page.waitForTimeout(2000);

  for (let i = 0; i < 12; i++) {
    const bodyText = await page.locator('body').innerText();

    if (/billing method|payment method|preauthorization|card number|moyen de paiement/i.test(bodyText)) {
      out('blocked', 'selfnamed_billing_method_required', { url: page.url() });
      process.exit(6);
    }

    if (/two[- ]factor|verification code|one[- ]time code|2fa|code de v[eé]rification/i.test(bodyText)) {
      out('blocked', 'selfnamed_2fa_required', { url: page.url() });
      process.exit(7);
    }

    const nova = page.getByText(/^NOVA10$/i).first();
    if (await nova.count()) {
      await nova.click();
      await page.waitForTimeout(400);
    }

    const priceInputs = page.locator('input[name*="price" i], input[placeholder*="price" i]');
    if (await priceInputs.count()) await priceInputs.first().fill('24.90');

    const productName = page.locator('input[name*="name" i], input[name*="title" i]');
    if (await productName.count()) {
      await productName.first().fill('NOVA10 — Crème de jour hydratante 50 ml');
    }

    const successText = page.getByText(/successfully added|added to (the )?store|product added|ajout[eé].*boutique/i).first();
    if (await successText.count()) {
      out('success', 'selfnamed_product_added_to_nova10', { url: page.url() });
      process.exit(0);
    }

    const cont = page.getByRole('button', {
      name: /continue|next|add to store|publish|save|continuer|suivant|publier|enregistrer/i
    }).first();

    if (await cont.count()) {
      await cont.click();
      await page.waitForTimeout(1800);
      continue;
    }
    break;
  }

  out('blocked', 'workflow_reached_unknown_selfnamed_step', { url: page.url() });
  process.exit(8);
} catch (e) {
  out('error', 'automation_exception', { message: String(e), url: page.url() });
  process.exit(9);
} finally {
  await browser.close();
}
