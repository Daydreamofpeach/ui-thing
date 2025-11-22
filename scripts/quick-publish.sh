#!/bin/bash

echo "🚀 Quick Publish to NPM with Bun"
echo "================================"
echo ""

# Build CLI
echo "🔨 Building CLI..."
bun run build:cli

# Publish
echo ""
echo "📦 Publishing to NPM..."
npm publish --access public

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Published successfully!"
    echo ""
    VERSION=$(node -p "require('./package.json').version")
    echo "📝 Don't forget to:"
    echo "  git tag v$VERSION"
    echo "  git push --tags"
else
    echo "❌ Publishing failed"
    exit 1
fi
