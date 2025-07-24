#!/usr/bin/env node

import bcrypt from "bcrypt";

async function generateHash(password: string): Promise<string> {
  const saltRounds = 10;
  const hash = await bcrypt.hash(password, saltRounds);
  return hash;
}

// CLI usage
async function main() {
  const password = process.argv[2];

  if (!password) {
    console.log("Usage: npm run hash-password <password>");
    console.log("Example: npm run hash-password admin123");
    process.exit(1);
  }

  try {
    const hash = await generateHash(password);
    console.log(`Password: ${password}`);
    console.log(`Hash: ${hash}`);
    console.log(`\nCopy this hash to your migration file:`);
    console.log(`'${hash}'`);
  } catch (error) {
    console.error("Error generating hash:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { generateHash };
