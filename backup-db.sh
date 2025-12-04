#!/bin/bash

# MongoDB Backup Script
# Runs daily at 3:00 AM via cron

BACKUP_DIR="/var/www/tripsForUA/backups"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_NAME="tripsforua_backup_$DATE"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Create backup
mongodump --db tripsforua --out "$BACKUP_DIR/$BACKUP_NAME"

# Compress backup
cd $BACKUP_DIR
tar -czf "$BACKUP_NAME.tar.gz" "$BACKUP_NAME"
rm -rf "$BACKUP_NAME"

# Delete backups older than 7 days
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_NAME.tar.gz"
