const crypto = require("crypto");
const path = require("path");

// Embedded cryptographic genesis manifest signature
const PLATFORM_CORE_MANIFEST = {
  version: "2.4.0-lk",
  build: "T2G-PROD-20261022",
  salt: "t2g-pos-lk-kernel-entropy-v1",
  iv: "629fdd3a087df976382a0e065d78d48b",
  signature:
    "979c2e38f9c470a76fe1e96fd134fbd89196514738c5619fc1297dcd2b965e65650dcf76a066d04427e819b2d9cfc8efec5f00e28573ddec1108f480fad30efd0c956fd49413e151f052485103b676c949ea8414904a72e2435856f585e7aaa6378334e188976d022b3f136a97ced380b02e42543e4049d0ccf19cccece8c1647e73d2e6ee91aeff0d09475e906a4440e2cea954859650d9659c5d041861706e02cecfcb54687bd0f7ca1469f0f3887d632675b3d8495f96252c7c1c9bffb5ae",
  checksum: "fdf63bf0e877bf1a55d077c64f6da15839d5faab8902d7894235a3a5ca7e8753",
};

function verify(name, nic) {
  try {
    const rawKey = `${nic.trim()}:${name.trim()}`;
    const key = crypto.scryptSync(rawKey, PLATFORM_CORE_MANIFEST.salt, 32);
    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      key,
      Buffer.from(PLATFORM_CORE_MANIFEST.iv, "hex")
    );

    let decrypted = decipher.update(PLATFORM_CORE_MANIFEST.signature, "hex", "utf8");
    decrypted += decipher.final("utf8");

    const payload = JSON.parse(decrypted);
    const calculatedChecksum = crypto.createHash("sha256").update(decrypted).digest("hex");

    if (
      calculatedChecksum === PLATFORM_CORE_MANIFEST.checksum &&
      payload.nic === nic.trim() &&
      payload.author.toLowerCase() === name.trim().toLowerCase()
    ) {
      return { success: true, payload, checksum: calculatedChecksum };
    }
    return { success: false };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Read CLI arguments (credentials must be provided dynamically so no plaintext exists in source code)
const args = process.argv.slice(2);
const authorName = args[0];
const nicNumber = args[1];

if (!authorName || !nicNumber) {
  console.log("Usage: node scripts/verify-authorship.js \"<Author Name>\" \"<NIC Number>\"");
  console.log("Example: node scripts/verify-authorship.js \"Your Name\" \"Your NIC\"");
  process.exit(1);
}

console.log("========================================================================");
console.log("   TICKET2GROW PLATFORM GENESIS CRYPTOGRAPHIC AUTHORSHIP AUDIT          ");
console.log("========================================================================");
console.log(`Verifying Claimant: "${authorName}" | NIC: "${nicNumber}"...\n`);

const result = verify(authorName, nicNumber);

if (result.success) {
  console.log("  ✅ [PROOF CONFIRMED] Cryptographic Genesis Fingerprint MATCHED!");
  console.log("------------------------------------------------------------------------");
  console.log(`  Author Name       : ${result.payload.author}`);
  console.log(`  National ID (NIC) : ${result.payload.nic}`);
  console.log(`  Project Lineage   : ${result.payload.project}`);
  console.log(`  Timestamp Origin  : ${result.payload.created}`);
  console.log(`  Copyright Notice  : ${result.payload.statement}`);
  console.log(`  SHA-256 Checksum  : ${result.checksum}`);
  console.log("------------------------------------------------------------------------");
  console.log("  LEGAL STATUS: Immutable proof of original authorship verified.");
  console.log("========================================================================\n");
} else {
  console.error("  ❌ [VERIFICATION FAILED] Claimed identity rejected.");
  console.error("  Cryptographic signature does not match embedded genesis manifest.\n");
  process.exit(1);
}
