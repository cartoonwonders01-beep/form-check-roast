import puppeteer from 'puppeteer';

(async () => {
  console.log('🚀 Launching headless browser for Multi-Character & Multi-Click Roast Stress Test...');
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/snap/bin/chromium',
    args: ['--no-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 480, height: 850 });

  const logs = [];
  page.on('console', msg => logs.push(`[CONSOLE ${msg.type()}]: ${msg.text()}`));
  page.on('pageerror', err => logs.push(`[PAGE ERROR]: ${err.toString()}`));

  console.log('📡 Navigating to http://localhost:5173...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });

  const characters = ['Coach', 'Quack', 'Brick', 'Darth'];

  for (const charName of characters) {
    console.log(`\n========================================`);
    console.log(`🎭 TESTING CHARACTER: ${charName}`);
    console.log(`========================================`);

    // Click character button
    const charButtons = await page.$$('button');
    let switched = false;
    for (const b of charButtons) {
      const text = await page.evaluate(el => el.textContent, b);
      if (text.includes(charName)) {
        console.log(`👉 Selecting character tab: "${text.trim()}"`);
        await b.click();
        switched = true;
        break;
      }
    }
    await new Promise(r => setTimeout(r, 400));

    // Now click Roast button 3 times in a row and check text changes every time
    for (let clickNum = 1; clickNum <= 3; clickNum++) {
      console.log(`\n  ⚡ Click #${clickNum} for ${charName}:`);
      
      const buttons = await page.$$('button');
      let roastClicked = false;
      for (const b of buttons) {
        const text = await page.evaluate(el => el.textContent, b);
        if (text.includes('ROAST') || text.includes('Roast') || text.includes('Diagnose')) {
          await b.click();
          roastClicked = true;
          break;
        }
      }

      if (!roastClicked) {
        console.error(`  ❌ Failed to find Roast button on click #${clickNum}!`);
      }

      // Wait 800ms
      await new Promise(r => setTimeout(r, 800));

      // Extract roast text from DOM
      const roastText = await page.evaluate(() => {
        const pTags = Array.from(document.querySelectorAll('p'));
        const quotes = pTags.filter(p => p.textContent.startsWith('"') && p.textContent.endsWith('"'));
        return quotes.map(q => q.textContent);
      });

      console.log(`  📝 DOM Roast Text: ${JSON.stringify(roastText)}`);
    }
  }

  console.log('\n--- BROWSER CONSOLE LOGS ---');
  logs.forEach(l => console.log(l));

  await browser.close();
  console.log('\n✅ Stress test completed.');
})();
