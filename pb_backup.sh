#!/bin/bash
set -e

TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
DEST="./backend/backup/$TIMESTAMP"

mkdir -p "$DEST"
sqlite3 backend/pb_data/data.db ".backup $DEST/data.db"
sqlite3 backend/pb_data/auxiliary.db ".backup $DEST/auxiliary.db"

echo "Backup saved to $DEST"
