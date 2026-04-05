# BankEngine | High-Integrity Core Banking Ledger

A backend-focused **digital BankEngine system** designed with an emphasis on **data integrity, transactional correctness, and system design principles**.  
The project evolves from a standalone banking database design done in an earlier repo to a full backend service with authentication, business logic, and API-driven workflows.

---

## 📌 Overview

This project simulates the **core backend of a digital wallet / neobank system**, similar to those used in fintech platforms.  
It prioritizes correctness over UI, focusing on **ACID-compliant transactions**, **ledger-based accounting**, and **clean separation of concerns**.

The system was built in two phases:
1. **Banking Database Design** – normalized schema with strict constraints
2. **Backend Integration** – Django-based service layer on top of the schema

---

BankEngine is a robust, full-stack financial system designed to manage multi-tier ledgers with strict **ACID compliance**. Built with Python and Django, the system prioritizes transactional integrity and server-side security over client-side fluff.



## 🚀 Core Backend Features

* **Transactional Integrity (ACID):** Utilizes Django's `transaction.atomic` blocks to ensure that fund transfers either complete entirely or roll back fully, preventing data corruption or "phantom" money.
* **Ledger Provisioning:** Dynamic creation of different financial instruments (Savings, Current, Investment) with independent liquidity tracking.
* **Security Protocols:** Implements identity re-verification for high-risk operations (ledger termination/deactivation) and strict server-side validation to prevent overdrafts.
* **System Design:** Normalized relational database schema designed for high-cardinality relationships between users, accounts, and immutable transaction logs.
* **Real-time Monitoring:** A hardware-accelerated dashboard utilizing the **Intersection Observer API** for efficient data visualization.


## 🛠️ Tech Stack

* **Language:** Python 3.10+, JavaScript (ES6+)
* **Backend:** Django 4.x, Django REST Framework (Decoupled API Architecture)
* **Frontend:** React 18, Vite, Tailwind CSS (Custom Nexus Wealth UI)
* **Database:** MySQL / SQLite


## 🔧 System Design & Logic

### Concurrency Control
To prevent "Double Spending" or race conditions during high-volume transfers, the engine is designed to handle row-level locking. This ensures that while one transaction is updating a balance, others must wait for the lock to release.

### Account State Machine
Ledgers follow a strict state flow:
1.  **PROVISIONED:** Account is active and can receive/send funds.
2.  **BLOCKED:** System-triggered state when active liquidity is detected during a termination request.
3.  **TERMINATED:** Permanent deactivation; the node is frozen in the database for audit purposes but removed from the active engine.

### 📸 Screenshots

#### Landing Page
![Nexus Wealth Landing Page](assets/landingPage.png)

#### User Dashboard Overview
![Bank Engine Dashboard](assets/Dashboard.png)

#### Database Architecture
![ER Diagram of the Database](assets/ER-Diagram.png)


## 🚦 Getting Started

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/yourusername/BankEngine.git](https://github.com/yourusername/BankEngine.git)

2. **Setup Virtual Enviroument**
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate

3. **Install Dependencies**
    ```bash
    pip install -r requirements.txt

5. **Make Database Migrations**
    ```bash
    python manage.py makemigrations
    python manage.py migrate

4. **Run Server**
    ```bash
    python manage.py runserver