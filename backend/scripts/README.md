# Additional Admin setup

## Migrate legacy product departments

Older product records may contain `department` instead of `headCategory`. The application reads those legacy values as `headCategory` for storefront category menus and product queries. To permanently migrate them, run this from the backend directory after confirming `.env` points to the intended database:

```powershell
node scripts/migrateDepartmentToHeadCategory.js
```

The migration checks that the connection targets `Fashion_website` before writing. It only touches products that still have a `department` field. It copies that value into `headCategory` when `headCategory` is missing or blank, preserves an existing `headCategory`, and removes the deprecated field. It is safe to run again.

Public `/users/register` requests always create a `User`. To create an additional Admin, run the local setup script from the `backend` directory. It loads this backend's `.env`, verifies that the connection targets `Fashion_website`, uses the existing User model and bcrypt password hashing helper, and checks the credentials through the same login service used by `POST /users/login`. It refuses a registered email and never changes an existing account.

In PowerShell, enter the details interactively so the password is not written into the command history:

```powershell
$env:ADMIN_NAME = Read-Host "Admin name"
$env:ADMIN_EMAIL = Read-Host "Admin email"
$securePassword = Read-Host "Admin password (8-16 characters)" -AsSecureString
$env:ADMIN_PASSWORD = [System.Net.NetworkCredential]::new("", $securePassword).Password
try {
    pnpm exec node scripts/createFirstAdmin.js
} finally {
    Remove-Item Env:ADMIN_NAME, Env:ADMIN_EMAIL, Env:ADMIN_PASSWORD -ErrorAction SilentlyContinue
    Remove-Variable securePassword -ErrorAction SilentlyContinue
}
```

The script prints success only after MongoDB saves the new Admin and the existing login service accepts the supplied email and password. It does not print the password. If the email is already registered, setup stops without changing that account and reports the normalized email and its existing role. Choose a genuinely unused email to create a separate Admin. This script is a local setup path, not a public registration endpoint.

After setup, open the frontend, use the account menu to log out of the normal User account, then choose **Log In** and sign in with the new Admin email and password. Admins can open `/admin/products/create` directly, or use **Create Product** from the account panel.
