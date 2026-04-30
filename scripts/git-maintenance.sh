#!/bin/bash

echo "=========================================================="
echo "🛡️ ANTIGRAVITY: Git Maintenance Script"
echo "=========================================================="

echo "🔍 Optimizing local configuration..."
git config --local fetch.parallel 0
git config --local core.commitGraph true
git config --local gc.writeCommitGraph true

echo "🧹 Pruning remote references..."
git remote prune origin

echo "📦 Packing objects (Garbage Collection)..."
git gc --prune=now --aggressive

echo "✅ Maintenance complete!"
git count-objects -vH
echo "=========================================================="
