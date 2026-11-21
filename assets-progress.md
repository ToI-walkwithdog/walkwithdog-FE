# Asset extraction progress

Figma file: `L9wmxtCJsPuTjbgTRNumk5`

| Batch | Status | Files saved | Failures / notes |
|---|---|---|---|
| A - Icons | Complete | 36 SVG files in `src/assets/icons/` | Figma returned no node-level export for `2045:1490` and `2045:1495`; both replaced with same-icon Iconify SVGs. Other icons use isolated Figma vector-layer SVGs. Inventory heading says 37 instances, but its table contains 36 rows. |
| B - Vectors | Complete | 8 SVG files in `src/assets/icons/` | Used isolated Figma vector-layer SVGs to avoid including ancestor screen backgrounds. |
| C - Images | Complete | 11 PNG files (one per image fill) in `src/assets/images/` | Replaced the 1x/2x/3x variants with one file each. Preserved original Figma raw sources for uploaded images and used a 4x export for `walking-map`. Verified alpha with Pillow. The inventory's 343×743 size differs from the earlier node export. |
| D - Tokens | Complete | `src/theme/tokens.ts` | `assets-inventory.md` has no section 4. Figma variable definitions and design context were queried for 1-1 (`2073:240`), 3 (`2045:1371`), 5-1 (`2045:1458`), and 8-1 (`2077:3064`). Empty Figma variables are listed as unresolved in the token file. |

## Per-node results

### Batch A - Icons

| File | Node ID | Screens | Status |
|---|---|---|---|
| `icon-back.svg` | `2045:649` | 2-6, 4-1, 4-2, 4-3, 5-3, 5-7, 7-2, 7-3, 7-4, 8-1, 8-2, 8-3, 8-4, 8-5, 8-6, 9-1, 9-2, 10-2, 10-3 | Figma SVG |
| `icon-dog-body.svg` | `2045:1490` | 5-1, 5-2, 5-4, 5-5, 6-2 | Iconify fallback (`boxicons:dog-body-filled`) |
| `icon-dog-water.svg` | `2045:1472` | 5-1, 5-2, 5-4, 5-5, 6-2 | Figma SVG |
| `icon-dog-poop.svg` | `2045:1474` | 5-1, 5-2, 5-4, 5-5, 6-2 | Figma SVG |
| `icon-pause.svg` | `2045:1511` | 5-1, 5-2, 5-4, 5-5 | Figma SVG |
| `icon-camera.svg` | `2045:1495` | 5-1, 5-2, 5-4, 6-2 | Iconify fallback (`material-symbols:photo-camera`) |
| `icon-add.svg` | `2045:1477` | 5-1, 5-2, 5-4 | Figma SVG |
| `icon-check.svg` | `2073:552` | 1-4, 1-5 | Figma SVG |
| `icon-info.svg` | `2073:434` | 1-4, 7-2 | Figma SVG |
| `icon-paw-stamp.svg` | `2073:487` | 1-6, 6-3 | Figma SVG |
| `icon-calendar.svg` | `2045:1887` | 10-1 | Figma SVG |
| `icon-chevron-left.svg` | `2045:2150` | 7-2 | Figma SVG |
| `icon-dog.svg` | `2073:486` | 1-6 | Figma SVG |
| `icon-download.svg` | `2045:1802` | 6-2 | Figma SVG |
| `icon-error.svg` | `2077:3427` | 5-6 | Figma SVG |
| `icon-expand-more.svg` | `2045:2116` | 7-2 | Figma SVG |
| `icon-profile.svg` | `2045:1407` | 3 | Figma SVG |
| `icon-chevron-right.svg` | `2045:1868` | 10-1 | Figma SVG |
| `icon-footprints.svg` | `2045:1843` | 10-1 | Figma SVG |
| `icon-help.svg` | `2045:1901` | 10-1 | Figma SVG |
| `icon-settings.svg` | `2045:1834` | 10-1 | Figma SVG |
| `icon-shield.svg` | `2045:1839` | 10-1 | Figma SVG |
| `icon-user.svg` | `2045:1865` | 10-1 | Figma SVG |
| `icon-paw.svg` | `2073:265` | 1-1 | Figma SVG |
| `icon-phone.svg` | `2045:1749` | 5-5 | Figma SVG |
| `icon-location.svg` | `2045:2114` | 7-2 | Figma SVG |
| `icon-medical-services.svg` | `2045:1734` | 5-5 | Figma SVG |
| `icon-more.svg` | `2045:1746` | 5-5 | Figma SVG |
| `icon-notifications.svg` | `2045:1895` | 10-1 | Figma SVG |
| `icon-pets.svg` | `2045:1848` | 10-1 | Figma SVG |
| `icon-play.svg` | `2045:1610` | 5-2 | Figma SVG |
| `icon-schedule.svg` | `2045:2138` | 7-2 | Figma SVG |
| `icon-star.svg` | `2045:2142` | 7-2 | Figma SVG |
| `icon-tune.svg` | `2045:1872` | 10-1 | Figma SVG |
| `icon-warning.svg` | `2045:1742` | 5-5 | Figma SVG |
| `icon-previous.svg` | `2073:368` | 1-3 | Figma SVG |

### Batch B - Vectors

| File | Node ID | Screens | Status |
|---|---|---|---|
| `icon-stop.svg` | `2045:1515` | 5-1, 5-2, 5-4, 5-5 | Figma SVG |
| `vector-rectangle-327.svg` | `2076:749` | 6-3 | Figma SVG |
| `vector-rectangle-328.svg` | `2076:750` | 6-3 | Figma SVG |
| `vector-rectangle-329.svg` | `2076:751` | 6-3 | Figma SVG |
| `vector-location.svg` | `2045:1425` | 3 | Figma SVG |
| `vector-next.svg` | `2045:1445` | 3 | Figma SVG |
| `vector-matching-background.svg` | `2045:1410` | 3 | Figma SVG |
| `vector-walk-route-orange.svg` | `2045:1790` | 6-2 | Figma SVG |

### Batch C - Images

| File(s) | Node ID | Screens | Status |
|---|---|---|---|
| `dog-kongi.png` | `2045:2130` | 4-1, 4-2, 4-3, 7-2, 7-3, 7-4, 7-5, 8-3, 8-4, 8-7, 8-8 | Figma raw source, 719×864; opaque |
| `walking-map.png` | `2045:1460` | 5-1, 5-2, 5-4, 5-5, 6-2 | Figma 4x export, 1372×2536; opaque |
| `dog-moka.png` | `2045:2160` | 7-2, 8-5 | Figma raw source, 1536×1024; transparent pixels present |
| `dog-bori.png` | `2045:2190` | 7-2, 8-6 | Figma raw source, 1536×1024; opaque |
| `dog-hero.png` | `2073:267` | 1-1 | Figma raw source, 1536×1024; transparent pixels present |
| `paw-1.png` | `2073:471` | 1-6 | Figma raw source, 512×512; transparent pixels present |
| `paw-2.png` | `2073:474` | 1-6 | Figma raw source, 512×512; transparent pixels present |
| `paw-3.png` | `2073:477` | 1-6 | Figma raw source, 512×512; transparent pixels present |
| `home-start-dog.png` | `2045:1420` | 3 | Figma 4x export, RGBA, transparent pixels present |
| `home-booking-dog.png` | `2045:1421` | 3 | Figma 4x export, RGBA, transparent pixels present |
| `logo.png` | `2073:252` | 1-1 | Figma raw source, 899×197; transparent pixels present |
| — | `2045:1542` | 5-1, 5-2, 5-4, 5-5, 6-2 | Implement in code: home indicator |
| — | `2045:1508` | 5-1, 5-2, 5-4, 5-5 | Implement in code: divider line |
| — | `2073:551` | 1-4, 1-5 | Implement in code: checkbox shape; no image fill |
| — | `2045:1409` | 3 | Implement in code: background; no image fill |
| — | `2045:1416` | 3 | Implement in code: gradient; no image fill |
| — | `2045:1655` | 5-5 | Implement in code: map tone/background; no image fill |
| — | `2045:1789` | 6-2 | Implement in code: map tone/background; no image fill |
| — | `2073:468` | 1-6 | Implement in code: pledge background; no image fill |
| — | `2045:1725` | 5-5 | Implement in code: sheet handle |
| — | `2045:1723` | 5-5 | Implement in code: dim overlay |
| — | `2045:1556` | 5-2 | Implement in code: pause-map overlay |

### Batch D - Tokens

| File | Node IDs | Status |
|---|---|---|
| `src/theme/tokens.ts` | `2073:240`, `2045:1371`, `2045:1458`, `2077:3064` | Figma colors, typography, font weights, shadows, radii, and gradients recorded |

Fonts used (not installed): Pretendard (Regular, Medium); Gumi Romance TTF (Regular); Noto Sans KR (Regular, Bold); NanumSquareRound (Regular, Bold, ExtraBold); Urbanist (Medium).

Unresolved Figma variables with empty values: `main/card`, `orange_gradi_btn`, `map_background`.
