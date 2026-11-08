const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  for (const r of process.argv.slice(2)) {
    await p.goto('http://127.0.0.1:5176' + r, { waitUntil: 'networkidle' });
    await p.addStyleTag({ content: 'html{font-size:200% !important}' });
    await p.waitForTimeout(400);
    const ent = p.getByRole('button', { name: 'Entendido' });
    if (await ent.count()) await ent.first().click();
    const d = await p.evaluate(() => {
      const w = document.documentElement.clientWidth;
      return [...document.querySelectorAll('main *')]
        .filter((e) => e.getBoundingClientRect().right > w + 1 && !e.closest('[role=region]'))
        .slice(0, 4)
        .map((e) => {
          const r = e.getBoundingClientRect();
          const chain = [];
          let x = e;
          for (let i = 0; i < 4 && x; i++, x = x.parentElement) chain.push(`${x.tagName}.${(x.className.baseVal ?? x.className).toString().slice(0, 40)}[${Math.round(x.getBoundingClientRect().left)}-${Math.round(x.getBoundingClientRect().right)}]`);
          return `${(e.textContent || '').trim().slice(0, 30)} :: ${chain.join(' < ')}`;
        });
    });
    console.log(r); d.forEach((x) => console.log('  ', x));
  }
  await b.close();
})();
