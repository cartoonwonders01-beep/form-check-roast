import puppeteer from 'puppeteer';

(async () => {
  console.log('🚀 Starting Comprehensive Multi-Cycle Roast & Character Switching Test...');
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/snap/bin/chromium',
    args: ['--no-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 480, height: 850 });

  const errors = [];
  page.on('pageerror', err => errors.push(err.toString()));

  console.log('📡 Navigating to http://localhost:5173...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });

  const personas = ['Coach', 'Quack', 'Brick', 'Darth'];
  let totalSuccess = 0;
  let totalTests = 0;

  // Test Cartoon Coach Mode
  for (const p of personas) {
    console.log(`\n--------------------------------------------`);
    console.log(`🎭 Testing Persona: ${p}`);
    console.log(`--------------------------------------------`);

    // Click persona tab
    const buttons = await page.$$('button');
    for (const b of buttons) {
      const text = await page.evaluate(el => el.textContent, b);
      if (text.includes(p)) {
        await b.click();
        console.log(`  👉 Switched to persona: "${text.trim()}"`);
        break;
      }
    }
    await new Promise(r => setTimeout(r, 400));

    // Check initial roast on switch
    let lastRoast = await page.evaluate(() => {
      const pTags = Array.from(document.querySelectorAll('p'));
      const quote = pTags.find(p => p.textContent.startsWith('"') && p.textContent.endsWith('"'));
      return quote ? quote.textContent : null;
    });
    console.log(`  ✨ Initial Persona Roast: ${lastRoast}`);

    // Click Roast 3 times in a row
    for (let i = 1; i <= 3; i++) {
      totalTests++;
      const currentButtons = await page.$$('button');
      for (const b of currentButtons) {
        const text = await page.evaluate(el => el.textContent, b);
        if (text.includes('ROAST') || text.includes('Roast') || text.includes('Diagnose')) {
          await b.click();
          break;
        }
      }
      await new Promise(r => setTimeout(r, 500));

      const newRoast = await page.evaluate(() => {
        const pTags = Array.from(document.querySelectorAll('p'));
        const quote = pTags.find(p => p.textContent.startsWith('"') && p.textContent.endsWith('"'));
        return quote ? quote.textContent : null;
      });

      console.log(`  ⚡ [Click #${i}]: ${newRoast}`);

      if (newRoast && newRoast !== lastRoast) {
        totalSuccess++;
        console.log(`    ✅ Success: New unique roast displayed!`);
      } else if (newRoast && lastRoast === null) {
        totalSuccess++;
        console.log(`    ✅ Success: Initial roast loaded!`);
      } else {
        console.error(`    ❌ Failed: Roast did not change or is null!`);
      }
      lastRoast = newRoast;
    }
  }

  // Test Savage X-Ray Mode
  console.log(`\n--------------------------------------------`);
  console.log(`⚡ Testing Savage X-Ray Mode: Diagnose Fault`);
  console.log(`--------------------------------------------`);
  
  const modeButtons = await page.$$('button');
  for (const b of modeButtons) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text.includes('Savage X-Ray')) {
      await b.click();
      console.log(`  👉 Switched to Savage X-Ray Mode`);
      break;
    }
  }
  await new Promise(r => setTimeout(r, 500));

  let lastXRayRoast = null;
  for (let i = 1; i <= 3; i++) {
    totalTests++;
    const currentButtons = await page.$$('button');
    for (const b of currentButtons) {
      const text = await page.evaluate(el => el.textContent, b);
      if (text.includes('Diagnose Fault')) {
        await b.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 500));

    const newRoast = await page.evaluate(() => {
      const pTags = Array.from(document.querySelectorAll('p'));
      const quote = pTags.find(p => p.textContent.startsWith('"') && p.textContent.endsWith('"'));
      return quote ? quote.textContent : null;
    });

    console.log(`  ⚡ [X-Ray Click #${i}]: ${newRoast}`);
    if (newRoast && newRoast !== lastXRayRoast) {
      totalSuccess++;
      console.log(`    ✅ Success: New unique X-Ray diagnosis displayed!`);
    } else {
      console.error(`    ❌ Failed: X-Ray diagnosis did not change!`);
    }
    lastXRayRoast = newRoast;
  }

  console.log(`\n============================================`);
  console.log(`📊 FINAL TEST SUMMARY:`);
  console.log(`Passed: ${totalSuccess} / ${totalTests} tests`);
  console.log(`Errors: ${errors.length}`);
  console.log(`============================================`);

  await browser.close();

  if (errors.length > 0 || totalSuccess < totalTests) {
    process.exit(1);
  } else {
    process.exit(0);
  }
})();
