#!/usr/bin/env bash
# Full site check: build, serve dist/ through the worker locally, run every audit on every page.
# Needs: npm install, a Chromium (npx playwright install chromium, or CHROMIUM_PATH=/path/to/chrome).
# Usage: npm run audit            (prints one summary block per check; any non-zero count needs a look)
set -u
cd "$(dirname "$0")/../.."
PORT=8799; B="http://127.0.0.1:$PORT"; OUT="${TMPDIR:-/tmp}/onyx-audit"; mkdir -p "$OUT"
npm run build > "$OUT/build.log" 2>&1 || { echo "build failed, see $OUT/build.log"; exit 1; }
npx wrangler dev --port $PORT --ip 127.0.0.1 --local-upstream 127.0.0.1:$PORT > "$OUT/wrangler.log" 2>&1 &
WPID=$!; trap 'kill $WPID 2>/dev/null; pkill -f "wrangler dev --port $PORT" 2>/dev/null' EXIT
for i in $(seq 1 60); do curl -s -o /dev/null "$B/" && break; sleep 1; done
PAGES=$(cd dist && ls *.html es/*.html ru/*.html | grep -v 404 | sed 's|^|/|')
ALL=$(cd dist && ls *.html es/*.html ru/*.html | sed 's|^|/|')
A=scripts/audit
echo "== incomplete grid rows (lone cards), 11 widths";   WIDTHS=1920,1440,1280,1024,901,900,821,820,768,600,390 node $A/rows.mjs "$B" $PAGES | sort -u
echo "== content blocks with different left edges";         node $A/edges.mjs "$B" $PAGES
echo "== sections glued to a differently coloured section"; node $A/joins.mjs "$B" $PAGES | grep -v ': 0$' || true
echo "== overlap / distorted images / clipped text / two-line buttons"; node $A/visual.mjs "$B" $PAGES | grep -v 'sr-only'
echo "== horizontal overflow (tables and the reviews carousel scroll inside their box)"
WIDTHS=360,390,768,1024,1440,1920 node $A/overflow.mjs "$B" $PAGES | grep 'sticks out' | grep -vE 'div\.card:|-> (table|thead|tr|tbody|td|th)[:.]' || echo "none"
for W in 1440 390; do
  echo "== accessibility (axe-core) and JS errors at ${W}px"
  W=$W node $A/audit.mjs "$B" "$OUT/axe-$W.json" $ALL
  node -e "const d=require('$OUT/axe-$W.json');const v=d.flatMap(p=>p.v.map(x=>p.path+' '+x.id+' '+x.n));console.log('violations:',v.length,'JS/console/request errors:',d.reduce((s,p)=>s+p.errs.length+p.cons.length+p.failed.length,0));v.slice(0,20).forEach(x=>console.log('  '+x))"
done
echo "== phone behaviour (menu, language switch, tabs, carousel, FAQ, booking forms, call bar)"; node $A/mobile.mjs
