#!/bin/bash

# Set permissions for all files
find out -type f -exec chmod 644 {} \;
find out -type d -exec chmod 755 {} \;

# Create a deployment archive
tar -czf deploy.tar.gz -C out .

echo "Created deploy.tar.gz"
echo "To deploy:"
echo "1. Upload deploy.tar.gz to your server"
echo "2. On your server, navigate to /cc directory"
echo "3. Run: tar -xzf deploy.tar.gz"
echo "4. Ensure Apache has mod_rewrite and mod_headers enabled" 