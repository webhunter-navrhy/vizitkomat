#!/bin/bash
# Prepnutie Vizitkomatu na ostrú doménu vizitkomat.eu.
# Predtým v DNS (Webglobe) nastaviť:
#   A     @    185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153
#   AAAA  @    2606:50c0:8000::153, 2606:50c0:8001::153, 2606:50c0:8002::153, 2606:50c0:8003::153
#   CNAME www  webhunter-navrhy.github.io.
#   (MX záznamy pre poštu nechať tak, ako sú)
set -euo pipefail
cd "$(dirname "$0")/.."
for ip in $(dig +short A vizitkomat.eu @ns1.webglobe.cz); do
  case "$ip" in 185.199.10[89].153|185.199.11[01].153) ;; *) echo "DNS ešte nesmeruje na GitHub Pages ($ip)"; exit 1 ;; esac
done
sed -i '' 's/^PRODUCTION = False/PRODUCTION = True/' build.py
echo "vizitkomat.eu" > CNAME
python3 build.py >/dev/null
git add -A && git commit -qm "Ostrý web na vizitkomat.eu" && git push -q origin HEAD
gh api repos/webhunter-navrhy/vizitkomat/pages -X PUT -f cname=vizitkomat.eu >/dev/null
echo "Hotovo. HTTPS certifikát GitHub vydá do ~15 min, potom:"
echo "  gh api repos/webhunter-navrhy/vizitkomat/pages -X PUT -F https_enforced=true"
