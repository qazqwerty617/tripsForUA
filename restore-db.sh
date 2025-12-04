#!/bin/bash

# MongoDB Restore Script
# Usage: ./restore-db.sh backup_filename.tar.gz

BACKUP_DIR="/var/www/tripsForUA/backups"

if [ -z "$1" ]; then
    echo "Usage: ./restore-db.sh <backup_filename.tar.gz>"
    echo ""
    echo "Available backups:"
    ls -la $BACKUP_DIR/*.tar.gz 2>/dev/null || echo "No backups found"
    exit 1
fi

BACKUP_FILE="$BACKUP_DIR/$1"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "Error: Backup file not found: $BACKUP_FILE"
    exit 1
fi

# Extract backup
cd $BACKUP_DIR
BACKUP_NAME=$(basename "$1" .tar.gz)
tar -xzf "$1"

# Restore database
mongorestore --db tripsforua --drop "$BACKUP_DIR/$BACKUP_NAME/tripsforua"

# Cleanup
rm -rf "$BACKUP_DIR/$BACKUP_NAME"

echo "Restore completed from: $1"
