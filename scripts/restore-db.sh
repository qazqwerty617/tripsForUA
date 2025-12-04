#!/bin/bash

# MongoDB Restore Script for TripsForUA
# Usage: ./restore-db.sh <backup-file.tar.gz>

BACKUP_DIR="/var/backups/tripsforua"
DB_NAME="tripsforua"

# Check if backup file is provided
if [ -z "$1" ]; then
    echo "📁 Available backups:"
    ls -lh $BACKUP_DIR/*.tar.gz 2>/dev/null
    echo ""
    echo "Usage: ./restore-db.sh <backup-file.tar.gz>"
    echo "Example: ./restore-db.sh tripsforua-2025-12-04_12-00-00.tar.gz"
    exit 1
fi

BACKUP_FILE="$1"

# Check if file exists (with or without full path)
if [ -f "$BACKUP_FILE" ]; then
    FULL_PATH="$BACKUP_FILE"
elif [ -f "$BACKUP_DIR/$BACKUP_FILE" ]; then
    FULL_PATH="$BACKUP_DIR/$BACKUP_FILE"
else
    echo "❌ Backup file not found: $BACKUP_FILE"
    exit 1
fi

# Confirm restore
echo "⚠️  WARNING: This will REPLACE the current database with the backup!"
echo "Backup file: $FULL_PATH"
read -p "Are you sure? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "❌ Restore cancelled."
    exit 1
fi

# Create temp directory for extraction
TEMP_DIR=$(mktemp -d)

# Extract backup
echo "📦 Extracting backup..."
tar -xzf "$FULL_PATH" -C $TEMP_DIR

# Find the backup folder
BACKUP_FOLDER=$(ls $TEMP_DIR)

# Restore database
echo "🔄 Restoring database..."
mongorestore --db $DB_NAME --drop "$TEMP_DIR/$BACKUP_FOLDER/$DB_NAME"

if [ $? -eq 0 ]; then
    echo "✅ Database restored successfully!"
else
    echo "❌ Restore failed!"
fi

# Cleanup
rm -rf $TEMP_DIR
