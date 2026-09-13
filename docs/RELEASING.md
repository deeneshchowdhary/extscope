# Building and releasing

## Reproducible build

Anyone should be able to start from a clean checkout and produce a byte-identical `dist/` to what
ships in the Chrome Web Store listing.

```bash
git clone https://github.com/deeneshchowdhary/extscope.git
cd extscope
git checkout <release-tag>       # e.g. v0.1.0
npm ci                           # installs exactly what package-lock.json records — not `npm install`
npm run build                    # type-checks, then produces dist/
```

Requirements: Node.js `>=20` (see `engines` in `package.json`; CI builds on Node 20). `npm ci` is what
makes this reproducible — it installs exactly the versions locked in `package-lock.json` rather than
re-resolving ranges, so a build a year from now uses the same dependency tree as the day it was tagged.

`dist/` is what you load as an unpacked extension (`chrome://extensions` → Developer mode → Load
unpacked), and it's also exactly what gets zipped for the Chrome Web Store upload — see below.

## Producing a release artifact

```bash
cd dist
zip -r ../extscope.zip .
cd ..
shasum -a 256 extscope.zip
```

CI does this on every push to `main` (see `.github/workflows/ci.yml`) and uploads both the zip and a
`.sha256` checksum file as build artifacts, so any commit's exact build output is independently
reproducible and verifiable without trusting a maintainer's local machine.

## Cutting a tagged release

1. Bump `version` in both `package.json` and `manifest.json` (they must match).
2. Commit, tag (`git tag vX.Y.Z`), push the tag.
3. Download the CI build artifact for that commit (or build locally per above — the output should match).
4. Create a GitHub Release for the tag, attach `extscope.zip`, and paste the SHA-256
   checksum from `extscope.zip.sha256` into the release notes so anyone downloading it can
   verify they got the same bytes CI built.
5. Upload the same zip to the Chrome Web Store developer dashboard.

## Verifying a downloaded release

```bash
shasum -a 256 -c extscope.zip.sha256
```

This should print `extscope.zip: OK`. If it doesn't match the checksum published in the
GitHub Release notes, do not install it — the file was corrupted, modified, or came from a different
build than the one being claimed. Report a mismatch per [SECURITY.md](../SECURITY.md).
