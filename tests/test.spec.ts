import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // โฟลเดอร์ที่เก็บไฟล์ทดสอบ
  testDir: './tests',

  // รันแบบขนาน (Parallel) ทุกไฟล์
  fullyParallel: true,

  // สั่งให้สร้าง Report เป็น HTML และเปิดอัตโนมัติเมื่อรันเสร็จ
  reporter: [['html', { open: 'always' }]],

  use: {
	// เก็บภาพและวิดีโอเฉพาะตัวที่ Test พัง (ช่วยให้ดีบักง่ายขึ้นมาก)
	screenshot: 'only-on-failure',
	video: 'retain-on-failure',
	trace: 'retain-on-failure',
  },

  // ตั้งค่า Browser ต่างๆ ที่ต้องการทดสอบพร้อมกัน
  projects: [
	{
	  name: 'Google Chrome',
	  use: { ...devices['Desktop Chrome'] },
	},
	{
	  name: 'Mozilla Firefox',
	  use: { ...devices['Desktop Firefox'] },
	},
	{
	  name: 'Apple Safari',
	  use: { ...devices['Desktop Safari'] },
	},
  ],
});