import puppeteer from 'puppeteer';

(async () => {
  console.log('🚀 Launching headless browser to test roast interaction...');
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/snap/bin/chromium',
    args: ['--no-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 480, height: 850 });

  const logs = [];
  page.on('console', msg => logs.push(`[BROWSER CONSOLE ${msg.type()}]: ${msg.text()}`));
  page.on('pageerror', err => logs.push(`[PAGE ERROR]: ${err.toString()}`));

  console.log('📡 Navigating to http://localhost:5173...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });

  console.log('🔍 Looking for roast button...');
  // Find button containing Roast or Diagnose
  const buttons = await page.$$('button');
  console.log(`Found ${buttons.length} buttons on page.`);

  let clicked = false;
  for (const b of buttons) {
    const text = await page.evaluate(el => el.textContent, b);
    console.log(`Button text: "${text}"`);
    if (text.includes('ROAST') || text.includes('Roast') || text.includes('Diagnose')) {
      console.log(`🎯 Clicking button: "${text}"`);
      await b.click();
      clicked = true;
      break;
    }
  }

  if (!clicked) {
    console.error('❌ Could not find Roast button!');
  }

  // Wait 3 seconds to see state update
  await new Promise(r => setTimeout(r, 3000));

  // Check if roast verdict text appeared in DOM
  const bodyText = await page.evaluate(() => document.body.innerText);
  console.log('\n--- BODY TEXT AFTER CLICK ---');
  console.log(bodyText.slice(0, 500));

  console.log('\n--- BROWSER CONSOLE LOGS ---');
  logs.forEach(l => console.log(l));

  await page.screenshot({ path: 'after_roast_click.png' });
  console.log('\n📸 Saved screenshot to after_roast_click.png');

  await browser.close();
})();
