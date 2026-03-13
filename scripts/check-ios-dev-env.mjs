import process from "node:process";
import { spawnSync } from "node:child_process";

function compareVersions(a, b) {
  const aParts = a.split(".").map(Number);
  const bParts = b.split(".").map(Number);
  const length = Math.max(aParts.length, bParts.length);

  for (let index = 0; index < length; index += 1) {
    const aPart = aParts[index] ?? 0;
    const bPart = bParts[index] ?? 0;

    if (aPart > bPart) {
      return 1;
    }

    if (aPart < bPart) {
      return -1;
    }
  }

  return 0;
}

function assertSupportedNode() {
  const current = process.versions.node;
  const minimum = "20.19.4";

  if (compareVersions(current, minimum) < 0) {
    console.warn(
      `[ios:dev] Warning: Node ${minimum}+ is recommended, but current version is ${current}. If iOS build issues recur, run 'nvm install 20.19.4' and 'nvm use 20.19.4'.`,
    );
  }
}

async function assertSupportedGlob() {
  const globPackage = await import("glob/package.json", {
    with: { type: "json" },
  });
  const version = globPackage.default?.version ?? globPackage.version;
  const major = Number(version.split(".")[0]);

  if (!Number.isFinite(major) || major < 10) {
    throw new Error(
      `[ios:dev] glob 10+ is required for Expo prebuild, but resolved version is ${version}. Run 'pnpm install' to refresh dependencies.`,
    );
  }
}

function assertCocoaPodsInstalled() {
  const result = spawnSync("pod", ["--version"], { stdio: "ignore" });

  if (result.status !== 0) {
    throw new Error(
      "[ios:dev] CocoaPods is required for iOS native builds. Install it with 'brew install cocoapods'.",
    );
  }
}

function assertFullXcodeSelected() {
  const xcodeBuild = spawnSync("xcodebuild", ["-version"], {
    encoding: "utf8",
  });

  if (xcodeBuild.status !== 0) {
    throw new Error(
      "[ios:dev] Full Xcode is required. Open Xcode once, then run 'sudo xcode-select -s /Applications/Xcode.app/Contents/Developer'.",
    );
  }
}

function assertUtf8Locale() {
  const lang = process.env.LANG ?? "";
  const lcAll = process.env.LC_ALL ?? "";
  const hasUtf8 = [lang, lcAll].some((value) => value.toUpperCase().includes("UTF-8"));

  if (!hasUtf8) {
    throw new Error(
      "[ios:dev] UTF-8 locale is required for CocoaPods. Run with 'export LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8'.",
    );
  }
}

async function main() {
  assertSupportedNode();
  await assertSupportedGlob();
  assertUtf8Locale();
  assertCocoaPodsInstalled();
  assertFullXcodeSelected();
  console.log("[ios:dev] environment check passed");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
