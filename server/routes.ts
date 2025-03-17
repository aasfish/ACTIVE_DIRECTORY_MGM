import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertADUserSchema, insertADGroupSchema, insertADDeviceSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Middleware to check if user is authenticated
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "No autorizado" });
    }
    next();
  };

  // AD Users
  app.get("/api/ad/users", requireAuth, async (req, res) => {
    const users = await storage.getADUsers();
    res.json(users);
  });

  app.post("/api/ad/users", requireAuth, async (req, res) => {
    const parsed = insertADUserSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Datos inválidos" });
    }
    const user = await storage.createADUser(parsed.data);
    res.status(201).json(user);
  });

  app.patch("/api/ad/users/:id", requireAuth, async (req, res) => {
    const user = await storage.updateADUser(Number(req.params.id), req.body);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.json(user);
  });

  app.delete("/api/ad/users/:id", requireAuth, async (req, res) => {
    const success = await storage.deleteADUser(Number(req.params.id));
    if (!success) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.sendStatus(204);
  });

  // AD Groups
  app.get("/api/ad/groups", requireAuth, async (req, res) => {
    const groups = await storage.getADGroups();
    res.json(groups);
  });

  app.post("/api/ad/groups", requireAuth, async (req, res) => {
    const parsed = insertADGroupSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Datos inválidos" });
    }
    const group = await storage.createADGroup(parsed.data);
    res.status(201).json(group);
  });

  app.patch("/api/ad/groups/:id", requireAuth, async (req, res) => {
    const group = await storage.updateADGroup(Number(req.params.id), req.body);
    if (!group) {
      return res.status(404).json({ message: "Grupo no encontrado" });
    }
    res.json(group);
  });

  app.delete("/api/ad/groups/:id", requireAuth, async (req, res) => {
    const success = await storage.deleteADGroup(Number(req.params.id));
    if (!success) {
      return res.status(404).json({ message: "Grupo no encontrado" });
    }
    res.sendStatus(204);
  });

  // AD Devices
  app.get("/api/ad/devices", requireAuth, async (req, res) => {
    const devices = await storage.getADDevices();
    res.json(devices);
  });

  app.post("/api/ad/devices", requireAuth, async (req, res) => {
    const parsed = insertADDeviceSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Datos inválidos" });
    }
    const device = await storage.createADDevice(parsed.data);
    res.status(201).json(device);
  });

  app.patch("/api/ad/devices/:id", requireAuth, async (req, res) => {
    const device = await storage.updateADDevice(Number(req.params.id), req.body);
    if (!device) {
      return res.status(404).json({ message: "Dispositivo no encontrado" });
    }
    res.json(device);
  });

  app.delete("/api/ad/devices/:id", requireAuth, async (req, res) => {
    const success = await storage.deleteADDevice(Number(req.params.id));
    if (!success) {
      return res.status(404).json({ message: "Dispositivo no encontrado" });
    }
    res.sendStatus(204);
  });

  // User-Group Management
  app.post("/api/ad/users/:userId/groups/:groupId", requireAuth, async (req, res) => {
    const mapping = await storage.addUserToGroup(
      Number(req.params.userId),
      Number(req.params.groupId)
    );
    res.status(201).json(mapping);
  });

  app.delete("/api/ad/users/:userId/groups/:groupId", requireAuth, async (req, res) => {
    const success = await storage.removeUserFromGroup(
      Number(req.params.userId),
      Number(req.params.groupId)
    );
    if (!success) {
      return res.status(404).json({ message: "Relación no encontrada" });
    }
    res.sendStatus(204);
  });

  app.get("/api/ad/users/:userId/groups", requireAuth, async (req, res) => {
    const groups = await storage.getUserGroups(Number(req.params.userId));
    res.json(groups);
  });

  const httpServer = createServer(app);
  return httpServer;
}
