#!/bin/bash

# Script to clear all WhatsApp sessions and free up memory
# Run this script whenever you want to clean up session data

echo "🗑️  Clearing WhatsApp sessions..."

# Get directory of script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Clean userDataDir
if [ -d "$SCRIPT_DIR/userDataDir" ]; then
    echo "📁 Cleaning userDataDir..."
    find "$SCRIPT_DIR/userDataDir" -mindepth 1 -delete
    echo "   ✓ userDataDir cleaned"
fi

# Clean token files
if [ -d "$SCRIPT_DIR/tokens" ]; then
    echo "📁 Cleaning tokens..."
    find "$SCRIPT_DIR/tokens" -type f -name "*.data.json" -delete
    find "$SCRIPT_DIR/tokens" -type d -mindepth 1 -delete 2>/dev/null
    echo "   ✓ tokens cleaned"
fi

# Clean wppconnect_tokens (if needed)
if [ -d "$SCRIPT_DIR/wppconnect_tokens" ]; then
    echo "📁 Cleaning wppconnect_tokens..."
    find "$SCRIPT_DIR/wppconnect_tokens" -mindepth 1 -delete 2>/dev/null
    echo "   ✓ wppconnect_tokens cleaned"
fi

# Show disk space freed
echo ""
echo "✅ All sessions cleared successfully!"
echo "💾 Disk usage now:"
du -sh "$SCRIPT_DIR/tokens" "$SCRIPT_DIR/userDataDir" 2>/dev/null

echo ""
echo "You can now restart the wppconnect-server service."
