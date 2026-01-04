#!/bin/bash

# Migration: Remove groups field from users collection
# 
# This migration removes the deprecated 'groups' field from all user documents.
# The groups relationship is now managed through the 'members' collection instead.
# 
# Usage:
# mongosh < migration/remove-groups-field.js
# 
# Or direct commands in mongosh:

# Switch to handbook database
use handbook

# Remove 'groups' field from all user documents that have it
db.users.updateMany(
    { groups: { $exists: true } },
    { $unset: { groups: "" } }
)

# Verify - count remaining documents with 'groups' field (should be 0)
db.users.countDocuments({ groups: { $exists: true } })

# Optional: Check how many documents were updated
db.users.find({ _id: { $exists: true } }).count()

