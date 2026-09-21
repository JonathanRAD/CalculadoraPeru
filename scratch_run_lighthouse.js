const { execSync } = require('child_process');
const fs = require('fs');

function runLighthouse(url, outputPath, isMobile = true) {
  const flags = isMobile
    ? '--form-factor=mobile --screenEmulation.mobile=true'
    : '--form-factor=desktop --preset=desktop';
  const cmd = `npx --yes lighthouse "${url}" --output=json --output-path="${outputPath}" --chrome-flags="--headless=new --no-sandbox" ${flags} --only-categories=performance,accessibility,best-practices,seo`;
  
  console.log(`Running Lighthouse (${isMobile ? 'Mobile' : 'Desktop'}) -> ${outputPath}...`);
  try {
    execSync(cmd, { stdio: 'pipe', timeout: 120000 });
  } catch (err) {
    // Lighthouse CLI may exit with code 1 on Windows during temp dir cleanup, but JSON is still written.
    if (!fs.existsSync(outputPath)) {
      console.error(`Execution failed and file ${outputPath} was not written:`, err.message);
      throw err;
    }
  }

  const raw = fs.readFileSync(outputPath, 'utf8');
  const data = JSON.parse(raw);
  
  const result = {
    performance: Math.round((data.categories.performance?.score || 0) * 100),
    accessibility: Math.round((data.categories.accessibility?.score || 0) * 100),
    bestPractices: Math.round((data.categories['best-practices']?.score || 0) * 100),
    seo: Math.round((data.categories.seo?.score || 0) * 100),
    fcp: data.audits['first-contentful-paint']?.numericValue || 0,
    fcpDisplay: data.audits['first-contentful-paint']?.displayValue || 'N/A',
    lcp: data.audits['largest-contentful-paint']?.numericValue || 0,
    lcpDisplay: data.audits['largest-contentful-paint']?.displayValue || 'N/A',
    tbt: data.audits['total-blocking-time']?.numericValue || 0,
    tbtDisplay: data.audits['total-blocking-time']?.displayValue || 'N/A',
    cls: data.audits['cumulative-layout-shift']?.numericValue || 0,
    clsDisplay: data.audits['cumulative-layout-shift']?.displayValue || '0',
    speedIndex: data.audits['speed-index']?.numericValue || 0,
    speedIndexDisplay: data.audits['speed-index']?.displayValue || 'N/A',
  };

  console.log(`Completed:`, result);
  return result;
}

function calculateMedian(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

async function main() {
  const mobileRuns = [];
  
  for (let i = 1; i <= 3; i++) {
    console.log(`\n=== MOBILE RUN ${i} / 3 ===`);
    const res = runLighthouse('http://localhost:3000', `./lighthouse-mobile-run${i}.json`, true);
    mobileRuns.push(res);
  }

  console.log(`\n=== DESKTOP VALIDATION RUN ===`);
  const desktopRun = runLighthouse('http://localhost:3000', './lighthouse-desktop-run.json', false);

  const medianResult = {
    performance: calculateMedian(mobileRuns.map(r => r.performance)),
    accessibility: calculateMedian(mobileRuns.map(r => r.accessibility)),
    bestPractices: calculateMedian(mobileRuns.map(r => r.bestPractices)),
    seo: calculateMedian(mobileRuns.map(r => r.seo)),
    fcpMs: calculateMedian(mobileRuns.map(r => r.fcp)),
    lcpMs: calculateMedian(mobileRuns.map(r => r.lcp)),
    tbtMs: calculateMedian(mobileRuns.map(r => r.tbt)),
    cls: calculateMedian(mobileRuns.map(r => r.cls)),
    speedIndexMs: calculateMedian(mobileRuns.map(r => r.speedIndex)),
  };

  console.log('\n========================================');
  console.log('FINAL MOBILE SUMMARY (3 RUNS & MEDIAN):');
  console.log('========================================');
  mobileRuns.forEach((r, idx) => {
    console.log(`Run ${idx + 1}: Perf ${r.performance} | A11y ${r.accessibility} | BP ${r.bestPractices} | SEO ${r.seo} | FCP ${r.fcpDisplay} | LCP ${r.lcpDisplay} | TBT ${r.tbtDisplay} | CLS ${r.clsDisplay}`);
  });
  console.log('\nMEDIAN:');
  console.log(`Performance: ${medianResult.performance}`);
  console.log(`Accessibility: ${medianResult.accessibility}`);
  console.log(`Best Practices: ${medianResult.bestPractices}`);
  console.log(`SEO: ${medianResult.seo}`);
  console.log(`FCP: ${(medianResult.fcpMs / 1000).toFixed(2)} s`);
  console.log(`LCP: ${(medianResult.lcpMs / 1000).toFixed(2)} s`);
  console.log(`TBT: ${Math.round(medianResult.tbtMs)} ms`);
  console.log(`CLS: ${medianResult.cls.toFixed(3)}`);
  console.log(`Speed Index: ${(medianResult.speedIndexMs / 1000).toFixed(2)} s`);

  console.log('\n========================================');
  console.log('DESKTOP VALIDATION:');
  console.log('========================================');
  console.log(`Performance: ${desktopRun.performance} | A11y ${desktopRun.accessibility} | BP ${desktopRun.bestPractices} | SEO ${desktopRun.seo} | FCP ${desktopRun.fcpDisplay} | LCP ${desktopRun.lcpDisplay} | TBT ${desktopRun.tbtDisplay} | CLS ${desktopRun.clsDisplay}`);
  
  fs.writeFileSync('./lighthouse-final-summary.json', JSON.stringify({ mobileRuns, medianResult, desktopRun }, null, 2));
}

main().catch(console.error);
