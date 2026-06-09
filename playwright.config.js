import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
    testDir: './tests',
    fullyParallel: true,
    reporter: [
        ['list'],
        ['monocart-reporter', {
                name: 'ระบบรายงานผลการทดสอบแยกตาม Browser และ Scope',
                outputFile: './test-results/report.html',
                columns: (defaultColumns) => {
                    defaultColumns.push({
                        id: 'testScope',
                        name: 'Scope',
                        type: 'string',
                        width: 150,
                        style: { fontWeight: 'bold', textAlign: 'center' },
                        getValue: (row) => {
                            const filePath = row.location?.file || '';
                            // 🔥 ปรับ Logic: ถ้ามีชื่อโฟลเดอร์เฉพาะเบราว์เซอร์ให้พ่นตรงตัว ที่เหลือตีเป็น Cross-Browser ทั้งหมดอัตโนมัติ
                            if (filePath.includes('browser-google-chrome-chromium'))
                                return '🌐 Chrome Only';
                            if (filePath.includes('browser-mozilla-firefox-gecko'))
                                return '🦊 Firefox Only';
                            if (filePath.includes('browser-apple-safari-webkit'))
                                return '🍎 Safari Only';
                            return '🌐 Cross-Browser';
                        }
                    });
                }
            }]
    ],
    use: {
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        trace: 'on-first-retry',
    },
    projects: [
        {
            name: 'Google Chrome',
            use: { ...devices['Desktop Chrome'] },
            testMatch: '**/*.spec.ts',
            // 🔥 สั่งข้ามโฟลเดอร์เฉพาะของ Firefox และ Safari
            testIgnore: ['**/browser-mozilla-firefox-gecko/**', '**/browser-apple-safari-webkit*/**'],
        },
        {
            name: 'Mozilla Firefox',
            use: { ...devices['Desktop Firefox'] },
            testMatch: '**/*.spec.ts',
            // 🔥 สั่งข้ามโฟลเดอร์เฉพาะของ Chrome และ Safari
            testIgnore: ['**/browser-google-chrome-chromium/**', '**/browser-apple-safari-webkit*/**'],
        },
        {
            name: 'Apple Safari',
            use: { ...devices['Desktop Safari'] },
            testMatch: '**/*.spec.ts',
            // 🔥 สั่งข้ามโฟลเดอร์เฉพาะของ Chrome และ Firefox
            testIgnore: ['**/browser-google-chrome-chromium/**', '**/browser-mozilla-firefox-gecko/**'],
        }
    ],
});
