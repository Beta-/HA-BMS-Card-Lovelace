#!/bin/bash
# HACS Compliance Check Script

echo "🔍 Checking HACS compliance..."
echo ""

# Check for required files
echo "✓ Checking required files:"
FILES=(
  "hacs.json"
  "LICENSE"
  "README.md"
  "info.md"
  "dist/jk-bms-reactor-card.js"
)

ALL_PRESENT=true
for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✓ $file"
  else
    echo "  ✗ $file (MISSING!)"
    ALL_PRESENT=false
  fi
done

echo ""

# Check hacs.json content
if [ -f "hacs.json" ]; then
  echo "📄 hacs.json content:"
  cat hacs.json | head -10
  echo ""
fi

# Check dist folder
if [ -d "dist" ]; then
  echo "📦 dist/ folder contents:"
  ls -lh dist/
  echo ""
fi

# Git status
echo "📊 Git status (files to commit):"
git status --short 2>/dev/null || echo "Not a git repository or git not available"
echo ""

if [ "$ALL_PRESENT" = true ]; then
  echo "✅ All required files present!"
  echo ""
  echo "Next steps:"
  echo "1. git add ."
  echo "2. git commit -m 'Add HACS-compliant structure with built card'"
  echo "3. git push"
  echo "4. Create a GitHub release with tag v1.0.0"
  echo "5. Add the repository to HACS"
else
  echo "❌ Some required files are missing. Please check above."
fi
