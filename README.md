# SmartMaint (MERN)

Machine maintenance, spare inventory, warranty, suppliers, service history, team profiles and messaging.

**Stack:** MongoDB, Express, React (Vite + TypeScript + Tailwind), Node. Login uses JWT + bcrypt.

## Run it

1. Install Node 18+ and MongoDB (local) or use a MongoDB Atlas connection string.
2. From this folder:

```bash
npm run install:all
cp server/.env.example server/.env     # then edit MONGO_URI and JWT_SECRET
npm run dev
```

For the first Super Admin account, set `SUPER_ADMIN_SETUP_KEY` in `server/.env` to a long random value. Choose **Super Admin** on Create Account and enter that key. The server accepts this setup only while no Super Admin exists; after setup, remove the key. Additional Super Admin accounts can only be created by an authenticated Super Admin in User Management.

- App: http://localhost:5173  (API runs on :5000, proxied automatically)
- Camera works on `localhost` and on https sites only.

## Production (single server)

```bash
npm run build
npm start        # serves the API and the built React app on :5000
```

## How it works

- No default data. Create an account, then register machines, people, suppliers and parts.
- Public account creation supports Manager, Supplier, Inventory Manager, and a one-time Super Admin setup protected by `SUPER_ADMIN_SETUP_KEY`.
- Suppliers can only view their assigned supplier profile, linked parts, related machines, and orders/deliveries. Only Super Admins manage supplier accounts.
- Inventory Managers can manage spare parts, supply orders, part warranties, and spare-part activity. Stock In, Usage, and Replacement activities update quantity and are recorded in history.
- The person who signs up owns the workspace. Super Admins manage user accounts and access roles; assigned roles control module access.
- Job titles are free text. Messages can go to one person, everyone, or everyone with a job title.
- A person added with "Let this person sign in" gets their own login to the same workspace and the assigned access role.
- Photos (camera or upload) are resized in the browser to 320px and stored in MongoDB.

## QR code and monthly checks

- **Add machine → Scan QR code** fills the form from the QR (camera, or "Upload QR image"). You still review and press Save.
- QR text can be JSON, `key: value` lines, a URL with `?name=…&machineCode=…`, or just a machine ID.
  Example: `{"name":"Hydraulic press","machineCode":"MC-001","manufacturer":"Bosch","model":"HP-200","serialNumber":"SN123","location":"Line A","installDate":"2024-03-05"}`
- Each machine's page shows a **QR label** you can download and print.
- **Monthly checks** page: every machine is due one month after its last check (or after registration). "Check now" records the check and updates the machine status. Due and overdue checks show on the dashboard.

## Message delete

- **Messages**: Delete works on both Inbox and Sent. It removes the message from your own list only, other people keep their copy.
