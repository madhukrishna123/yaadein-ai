const requiredForProduction = [
  "NEXT_PUBLIC_APP_URL",
  "ADMIN_PASSWORD",
  "ADMIN_SESSION_SECRET",
  "OPENAI_API_KEY",
  "OPENAI_IMAGE_MODEL",
  "DATABASE_URL",
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET",
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
  "RAZORPAY_WEBHOOK_SECRET",
  "WHATSAPP_VERIFY_TOKEN",
  "WHATSAPP_ACCESS_TOKEN",
  "WHATSAPP_PHONE_NUMBER_ID"
];

const optionalForLocal = [
  "NEXT_PUBLIC_WHATSAPP_NUMBER",
  "OPENAI_IMAGE_PREVIEW_QUALITY",
  "OPENAI_IMAGE_HD_QUALITY",
  "MOCK_RESTORATION_ENABLED"
];

const missing = requiredForProduction.filter((key) => !process.env[key]);

console.log("Yaadein AI environment check");
console.log("Required production keys:", requiredForProduction.length);
console.log("Optional local keys:", optionalForLocal.length);

if (missing.length > 0) {
  console.log("\nMissing production keys:");
  for (const key of missing) console.log(`- ${key}`);
  console.log("\nLocal development can still run with mock services, but production is not ready.");
  process.exitCode = 1;
} else {
  console.log("\nAll production keys are present.");
}
