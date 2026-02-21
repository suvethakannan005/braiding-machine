import express from "express";
import { createServer as createViteServer } from "vite";
import { WebSocketServer, WebSocket } from "ws";
import { createServer } from "http";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("industrial_iot.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS machines (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    serial_number TEXT NOT NULL,
    purchase_date TEXT,
    purchase_cost REAL,
    warranty_expiry TEXT,
    supplier_name TEXT,
    supplier_contact TEXT,
    company_name TEXT,
    company_address TEXT,
    installation_date TEXT,
    location TEXT,
    maintenance_schedule TEXT,
    service_history TEXT,
    status TEXT DEFAULT 'Active'
  );

  CREATE TABLE IF NOT EXISTS fault_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    machine_id TEXT,
    fault_type TEXT,
    description TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(machine_id) REFERENCES machines(id)
  );
`);

// Seed initial data
const insert = db.prepare(`
  INSERT OR IGNORE INTO machines (id, name, type, serial_number, purchase_date, purchase_cost, status, location)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);
insert.run("M001", "Braider Alpha", "Braiding Machine", "SN-9921-A", "2023-05-12", 45000, "Active", "Floor A - Section 1");
insert.run("M002", "Winder Pro", "Winding Machine", "SN-8812-B", "2023-08-20", 12000, "Active", "Floor B - Section 2");
insert.run("M003", "Twister X", "Twisting Machine", "SN-7734-C", "2024-01-15", 28000, "Fault", "Floor A - Section 3");
insert.run("M004", "Spooler Max", "Spooling Machine", "SN-6645-D", "2023-11-05", 8500, "Active", "Floor B - Section 1");
insert.run("M005", "Cutter X1", "Cutting Machine", "SN-5556-E", "2024-02-10", 15000, "Active", "Floor C - Section 1");
insert.run("M006", "Inspector 5000", "Quality Inspection Unit", "SN-4467-F", "2024-03-01", 35000, "Active", "Floor C - Section 2");
insert.run("M007", "Braider Beta", "Braiding Machine", "SN-9922-G", "2023-06-15", 46000, "Active", "Floor A - Section 2");
insert.run("M008", "Winder Lite", "Winding Machine", "SN-8813-H", "2023-09-10", 11000, "Under Maintenance", "Floor B - Section 3");
insert.run("M009", "Twister Pro", "Twisting Machine", "SN-7735-I", "2024-01-20", 29000, "Active", "Floor A - Section 4");
insert.run("M010", "Spooler Mini", "Spooling Machine", "SN-6646-J", "2023-12-01", 7500, "Active", "Floor B - Section 4");
insert.run("M011", "Cutter Pro", "Cutting Machine", "SN-5557-K", "2024-02-15", 16000, "Active", "Floor C - Section 3");
insert.run("M012", "Inspector Pro", "Quality Inspection Unit", "SN-4468-L", "2024-03-05", 36000, "Active", "Floor C - Section 4");


async function startServer() {
  const app = express();
  const server = createServer(app);
  const wss = new WebSocketServer({ server });

  app.use(express.json());

  // API Routes
  app.get("/api/machines", (req, res) => {
    const machines = db.prepare("SELECT * FROM machines").all();
    res.json(machines);
  });

  app.post("/api/machines", (req, res) => {
    const m = req.body;
    const insert = db.prepare(`
      INSERT INTO machines (
        id, name, type, serial_number, purchase_date, purchase_cost, 
        warranty_expiry, supplier_name, supplier_contact, company_name, 
        company_address, installation_date, location, maintenance_schedule, 
        service_history, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    try {
      insert.run(
        m.id, m.name, m.type, m.serial_number, m.purchase_date, m.purchase_cost,
        m.warranty_expiry, m.supplier_name, m.supplier_contact, m.company_name,
        m.company_address, m.installation_date, m.location, m.maintenance_schedule,
        m.service_history, m.status || 'Active'
      );
      res.status(201).json({ message: "Machine added" });
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  });

  app.put("/api/machines/:id", (req, res) => {
    const { id } = req.params;
    const m = req.body;
    const update = db.prepare(`
      UPDATE machines SET 
        name = ?, type = ?, serial_number = ?, purchase_date = ?, purchase_cost = ?, 
        warranty_expiry = ?, supplier_name = ?, supplier_contact = ?, company_name = ?, 
        company_address = ?, installation_date = ?, location = ?, maintenance_schedule = ?, 
        service_history = ?, status = ?
      WHERE id = ?
    `);
    update.run(
      m.name, m.type, m.serial_number, m.purchase_date, m.purchase_cost,
      m.warranty_expiry, m.supplier_name, m.supplier_contact, m.company_name,
      m.company_address, m.installation_date, m.location, m.maintenance_schedule,
      m.service_history, m.status, id
    );
    res.json({ message: "Machine updated" });
  });

  app.delete("/api/machines/:id", (req, res) => {
    db.prepare("DELETE FROM machines WHERE id = ?").run(req.params.id);
    res.json({ message: "Machine deleted" });
  });

  app.get("/api/faults", (req, res) => {
    const faults = db.prepare("SELECT * FROM fault_logs ORDER BY timestamp DESC LIMIT 50").all();
    res.json(faults);
  });

  // WebSocket Simulation
  const clients = new Set<WebSocket>();
  wss.on("connection", (ws) => {
    clients.add(ws);
    ws.on("close", () => clients.delete(ws));
  });

  setInterval(() => {
    const machines = db.prepare("SELECT id, name, status FROM machines").all() as any[];
    const sensorData = machines.map(m => {
      const isFaulty = m.status === 'Fault';
      return {
        machineId: m.id,
        name: m.name,
        temperature: isFaulty ? 85 + Math.random() * 20 : 40 + Math.random() * 15,
        vibration: isFaulty ? 0.8 + Math.random() * 0.5 : 0.1 + Math.random() * 0.2,
        rpm: isFaulty ? 500 + Math.random() * 200 : 1200 + Math.random() * 100,
        power: isFaulty ? 2.5 + Math.random() * 1.5 : 1.2 + Math.random() * 0.3,
        tension: isFaulty ? 2 + Math.random() * 8 : 15 + Math.random() * 5,
        timestamp: new Date().toISOString()
      };
    });

    const payload = JSON.stringify({ type: "SENSOR_UPDATE", data: sensorData });
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });

    // Randomly trigger a fault for simulation
    if (Math.random() > 0.98) {
      const randomMachine = machines[Math.floor(Math.random() * machines.length)];
      const faultTypes = ["Overheating", "High Vibration", "Thread Break", "Power Surge"];
      const faultType = faultTypes[Math.floor(Math.random() * faultTypes.length)];
      
      db.prepare("INSERT INTO fault_logs (machine_id, fault_type, description) VALUES (?, ?, ?)")
        .run(randomMachine.id, faultType, `Automatic detection of ${faultType}`);
      
      db.prepare("UPDATE machines SET status = 'Fault' WHERE id = ?").run(randomMachine.id);

      const alertPayload = JSON.stringify({ 
        type: "FAULT_ALERT", 
        data: { machineId: randomMachine.id, machineName: randomMachine.name, faultType } 
      });
      clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(alertPayload);
        }
      });
    }
  }, 2000);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  server.listen(3000, "0.0.0.0", () => {
    console.log("Server running on http://localhost:3000");
  });
}

startServer();
