#!/bin/bash

# MongoDB Backup Script for TripsForUA
# This script creates a backup of the MongoDB database

# Configuration
BACKUP_DIR="/var/backups/tripsforua"
DB_NAME="tripsforua"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_PATH="$BACKUP_DIR/$DB_NAME-$DATE"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Create backup using mongodump
echo "🔄 Starting backup of $DB_NAME..."
mongodump --db $DB_NAME --out $BACKUP_PATH

# Check if backup was successful
if [ $? -eq 0 ]; then
    echo "✅ Backup created successfully: $BACKUP_PATH"
    
    # Compress the backup
    cd $BACKUP_DIR
    tar -czf "$DB_NAME-$DATE.tar.gz" "$DB_NAME-$DATE"
    rm -rf "$DB_NAME-$DATE"
    echo "📦 Backup compressed: $DB_NAME-$DATE.tar.gz"
    
    # Keep only last 7 backups (delete older ones)
    ls -t $BACKUP_DIR/*.tar.gz 2>/dev/null | tail -n +8 | xargs -r rm
    echo "🗑️  Old backups cleaned (keeping last 7)"
else
    echo "❌ Backup failed!"
    exit 1
fi

echo ""
echo "📁 Current backups:"
ls -lh $BACKUP_DIR/*.tar.gz 2>/dev/null
