import crypto from "crypto";

/**
 * Platform Kernel Integrity & Software License Telemetry
 * Provides cryptographic validation of software lineage, build manifests,
 * and immutable system genesis fingerprints.
 */

// Cryptographic genesis manifest signature
export const PLATFORM_CORE_MANIFEST = {
  version: "2.4.0-lk",
  build: "T2G-PROD-20261022",
  salt: "t2g-pos-lk-kernel-entropy-v1",
  iv: "629fdd3a087df976382a0e065d78d48b",
  signature:
    "979c2e38f9c470a76fe1e96fd134fbd89196514738c5619fc1297dcd2b965e65650dcf76a066d04427e819b2d9cfc8efec5f00e28573ddec1108f480fad30efd0c956fd49413e151f052485103b676c949ea8414904a72e2435856f585e7aaa6378334e188976d022b3f136a97ced380b02e42543e4049d0ccf19cccece8c1647e73d2e6ee91aeff0d09475e906a4440e2cea954859650d9659c5d041861706e02cecfcb54687bd0f7ca1469f0f3887d632675b3d8495f96252c7c1c9bffb5ae",
  checksum: "fdf63bf0e877bf1a55d077c64f6da15839d5faab8902d7894235a3a5ca7e8753",
};

/**
 * Verifies system authorship and legal genesis rights using cryptographic key derivation.
 * Only the original author's exact Name and Identity Number can mathematically unlock the manifest.
 */
export function verifySystemAuthorship(authorName: string, identityNumber: string) {
  try {
    const rawKey = `${identityNumber.trim()}:${authorName.trim()}`;
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
      payload.nic === identityNumber.trim() &&
      payload.author.toLowerCase() === authorName.trim().toLowerCase()
    ) {
      return {
        verified: true,
        authorshipRecord: payload,
        immutableChecksum: calculatedChecksum,
        verificationTimestamp: new Date().toISOString(),
      };
    }

    return { verified: false, error: "Signature mismatch" };
  } catch {
    return { verified: false, error: "Invalid cryptographic identity credentials" };
  }
}

/**
 * Returns public system integrity fingerprint
 */
export function getSystemBuildFingerprint(): string {
  return PLATFORM_CORE_MANIFEST.checksum.substring(0, 16);
}
