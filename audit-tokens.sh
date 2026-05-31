#!/bin/bash
# Audita el consumo de tokens de sesiones recientes de Claude Code
# Uso: bash audit-tokens.sh [días]

DAYS=${1:-7}
SESSION_DIR="$HOME/.claude/sessions"

if [ ! -d "$SESSION_DIR" ]; then
  echo "No se encontró $SESSION_DIR"
  echo "Prueba: ~/.anthropic/claude/sessions o similar según tu OS"
  exit 1
fi

echo "=== Consumo de tokens (últimos $DAYS días) ==="
echo ""

TOTAL_INPUT=0
TOTAL_OUTPUT=0
SESSION_COUNT=0

for f in $(find "$SESSION_DIR" -name "*.json" -mtime -$DAYS 2>/dev/null); do
  result=$(python3 -c "
import json, sys, os
try:
    data = json.load(open('$f'))
    msgs = data.get('messages', [])
    inp = sum(m.get('input_tokens', 0) for m in msgs)
    out = sum(m.get('output_tokens', 0) for m in msgs)
    # Precio aprox Sonnet 4.6: \$3/1M input, \$15/1M output
    cost = (inp * 3 + out * 15) / 1_000_000
    date = os.path.basename('$f').replace('.json','')[:10]
    print(f'{date} | in:{inp:>8,} | out:{out:>7,} | \${cost:.3f}')
except:
    pass
" 2>/dev/null)
  
  if [ -n "$result" ]; then
    echo "$result"
    SESSION_COUNT=$((SESSION_COUNT + 1))
  fi
done

echo ""
echo "Sesiones analizadas: $SESSION_COUNT"
echo ""
echo "Tip: sesiones >100K input tokens = contexto sin limpiar"
echo "Tip: usa /clear entre tareas no relacionadas"
