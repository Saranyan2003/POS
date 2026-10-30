# 🚀 Ticket2Grow POS - Quick Setup Guide

Follow these simple steps to run this project on your computer without missing any data!

---

### Step 1: Start MySQL in XAMPP
1. Open the **XAMPP Control Panel**.
2. Click **Start** next to **MySQL** (and optionally **Apache** if you want to inspect phpMyAdmin).

---

### Step 2: Install Node Dependencies
Open your terminal in the project folder and run:
```bash
npm install
```

---

### Step 3: Setup the Database (No Data Loss!)
You have **two options** to load the complete database:

#### Option A: Automatic 1-Command Setup (Recommended)
Run:
```bash
npm run db:setup
```
*This automatically synchronizes the MySQL schema and seeds all 8 industry businesses, products, stock, staff, and accounts.*

#### Option B: Import the SQL Backup Dump
A complete export dump is included in this folder: [`pos_db_backup.sql`](./pos_db_backup.sql)
1. Open **phpMyAdmin** at `http://localhost/phpmyadmin`.
2. Create a database named `pos_db`.
3. Click the **Import** tab, choose `pos_db_backup.sql`, and click **Import**.

---

### Step 4: Start the Application
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser!

---

### 🔑 Test Accounts & Demo Logins:
* **Super Admin Portal:** [http://localhost:3000/login](http://localhost:3000/login)
  * **Login ID:** `ADMIN-0001`
  * **Password:** `AdminPassword@123`
* **Industry 1-Click QA Logins (8 Businesses):**
  * `OWN-GROCERY`, `OWN-CAFE`, `OWN-BAKERY`, `OWN-PHARM`, `OWN-FASHION`, `OWN-TECH`, `OWN-WHOLESALE`, `OWN-SALON`
  * Password for all demo accounts: `Demo1234!`
* **Public Paginated Catalog API & Storefront:**
  * Public Website: `http://localhost:3000/catalog/T2G-BAKERY`
  * REST API: `http://localhost:3000/api/v1/catalog?businessCode=T2G-BAKERY&page=1&limit=6`
