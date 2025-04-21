# C TECH IMS Database

This directory contains database-related files for the C TECH Inventory Management System.

## Schema

The `schema.sql` file contains the database schema definition with tables for:
- Products
- Suppliers
- Orders
- Order Items

## Setup Instructions

1. Install PostgreSQL if not already installed
2. Create a new database:
   ```
   createdb c_tech_ims
   ```
3. Apply the schema:
   ```
   psql -d c_tech_ims -f schema.sql
   ```

## Database Connection

The application connects to the database using the connection string specified in the backend `.env` file.

## Backup and Restore

To backup the database:
```
pg_dump c_tech_ims > backup.sql
```

To restore from backup:
```
psql -d c_tech_ims -f backup.sql
```
