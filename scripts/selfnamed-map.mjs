import { chromium } from 'playwright';
import fs from 'node:fs';

const out = (status, reason, extra={}) => {
  const payload = { status, reason, ...extra, at: new Date().toISOString() };
  fs.writeFileSync('selfnamed-map-status.json', JSON.stringify(payload, null, 2));
  console.log('QBOT_STATUS', JSON.stringify(payload));
};

const email = process.env.SELFNAMED_EMAIL || '';
const password = process.env.SELFNAMED_PASSWORD || '';

if (!email || !password) {
  out('blocked','missing_selfnamed_credentials_in_github_secrets',{
    required:['SELFNAMED_EMAIL','SELFNAMED_PASSWORD']
  });
  process.exit(2);
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });

try {
  await page.goto('https://www.selfnamed.com/en/login', { waitUntil: 'domcontentloaded', timeout: 60000 });

  const emailInput = page.getByLabel(/email/i).or(page.locator('input[type="email"]')).first();
  const passInput = page.getByLabel(/password/i).or(page.locator('input[type="password"]')).first();
  await emailInput.fill(email);
  await passInput.fill(password);

  const continueBtn = page.getByRole('button', { name: /continue|sign in|log in/i }).first();
  await continueBtn.click();
  await page.waitForTimeout(5000);

  if (/\/login(?:\?|$)/.test(page.url())) {
    out('blocked','selfnamed_login_not_completed',{url:page.url()});
    process.exit(3);
  }

  // Prefer an already prepared design/draft: this preserves the supplier-side design identity.
  const myDesigns = page.getByRole('link', { name: /my designs/i }).or(page.getByText(/my designs/i)).first();
  if (await myDesigns.count()) {
    await myDesigns.click();
  } else {
    await page.goto('https://www.selfnamed.com/en/profile', {waitUntil:'domcontentloaded'});
    const md = page.getByText(/my designs/i).first();
    if (await md.count()) await md.click();
  }
  await page.waitForTimeout(3000);

  // Look for the desired cream in drafts/ordered designs.
  const cream = page.getByText(/moisturising day cream|moisturizing day cream/i).first();
  if (!(await cream.count())) {
    out('blocked','no_existing_selfnamed_design_for_moisturising_day_cream',{url:page.url()});
    process.exit(4);
  }

  // Open product/design card, then use its contextual menu if present.
  await cream.click();
  await page.waitForTimeout(1500);

  let addToStore = page.getByText(/add to store/i).first();
  if (!(await addToStore.count())) {
    const menuButtons = page.getByRole('button').filter({hasText:/⋮|\.\.\.|more/i});
    if (await menuButtons.count()) {
      await menuButtons.first().click();
      await page.waitForTimeout(700);
      addToStore = page.getByText(/add to store/i).first();
    }
  }

  if (!(await addToStore.count())) {
    out('blocked','design_found_but_add_to_store_action_not_found',{url:page.url()});
    process.exit(5);
  }

  await addToStore.click();
  await page.waitForTimeout(2500);

  // Continue through non-destructive design preview steps, selecting NOVA10 when offered.
  for (let i=0; i<12; i++) {
    const bodyText = await page.locator('body').innerText();

    if (/billing method|payment method|preauthorization|card number/i.test(bodyText)) {
      out('blocked','selfnamed_billing_method_required',{url:page.url()});
      process.exit(6);
    }

    if (/two[- ]factor|verification code|one[- ]time code|2fa/i.test(bodyText)) {
      out('blocked','selfnamed_2fa_required',{url:page.url()});
      process.exit(7);
    }

    const nova = page.getByText(/^NOVA10$/i).first();
    if (await nova.count()) {
      await nova.click();
      await page.waitForTimeout(500);
    }
    const priceInputs = page.locator('input[name*="price" i], input[placeholder*="price" i]');
    if (await priceInputs.count()) {
      await priceInputs.first().fill('24.90');
    }

    const productName = page.locator('input[name*="name" i], input[name*="title" i]');
    if (await productName.count()) {
      await productName.first().fill('NOVA10 — Crème de jour hydratante 50 ml');
    }

    const successText = page.getByText(/successfully added|added to (the )?store|product added/i).first();
    if (await successText.count()) {
      out('success','selfnamed_product_added_to_nova10',{url:page.url()});
      process.exit(0);
    }

    const cont = page.getByRole('button', {name:/continue|next|add to store|publish|save/i}).first();
    if (await cont.count()) {
      await cont.click();
      await page.waitForTimeout(2200);
      continue;
    }
    break;
  }
  out('blocked','workflow_reached_unknown_selfnamed_step',{url:page.url()});
  process.exit(8);
} catch (e) {
  out('error','automation_exception',{message:String(e),url:page.url()});
  process.exit(9);
} finally {
  await browser.close();
}
