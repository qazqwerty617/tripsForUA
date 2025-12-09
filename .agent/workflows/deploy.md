---
description: How to deploy updates to the production server
---

To deploy the latest changes to your live website, follow these steps:

1.  **Connect to your server** via SSH:
    ```bash
    ssh root@YOUR_SERVER_IP
    ```

2.  **Navigate to the project directory** (adjust path if different):
    ```bash
    cd /var/www/tripsForUA
    ```

3.  **Get the latest code** from GitHub:
    ```bash
    git pull
    ```

4.  **Update dependencies** (only if needed):
    ```bash
    npm install
    cd client && npm install && cd ..
    ```

5.  **Rebuild the Frontend** (Critical for visual changes):
    ```bash
    cd client
    npm run build
    cd ..
    ```

6.  **Restart the Backend** (Critical for API changes):
    ```bash
    pm2 restart all
    ```
    *(Or specific service name if you know it)*

Done! Your site is now updated.
