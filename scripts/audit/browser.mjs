// Shared launcher for the audit scripts: Chromium from Playwright (npx playwright install chromium),
// or any Chrome/Chromium binary given in CHROMIUM_PATH.
import { chromium } from 'playwright-core';
export const launch = () => chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
