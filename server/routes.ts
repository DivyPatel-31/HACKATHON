import type { Express } from "express";
import { createServer, type Server } from "http";
import { Server as SocketIOServer } from "socket.io";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertAlertSchema, insertReportSchema, insertSensorReadingSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  const httpServer = createServer(app);
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // WebSocket connection handling
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    socket.on('join-room', (role) => {
      socket.join(role);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Update user role
  app.patch('/api/auth/user/role', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { role } = req.body;
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const updatedUser = await storage.upsertUser({
        ...user,
        role,
        updatedAt: new Date(),
      });

      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  // Sensor routes
  app.get('/api/sensors', isAuthenticated, async (req, res) => {
    try {
      const sensors = await storage.getSensors();
      res.json(sensors);
    } catch (error) {
      console.error("Error fetching sensors:", error);
      res.status(500).json({ message: "Failed to fetch sensors" });
    }
  });

  app.get('/api/sensors/:id/readings', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { from, to } = req.query;
      
      const fromDate = from ? new Date(from as string) : undefined;
      const toDate = to ? new Date(to as string) : undefined;
      
      const readings = await storage.getSensorReadings(id, fromDate, toDate);
      res.json(readings);
    } catch (error) {
      console.error("Error fetching sensor readings:", error);
      res.status(500).json({ message: "Failed to fetch sensor readings" });
    }
  });

  app.post('/api/sensor-readings', isAuthenticated, async (req, res) => {
    try {
      const reading = insertSensorReadingSchema.parse(req.body);
      const newReading = await storage.createSensorReading(reading);
      
      // Emit real-time update
      io.emit('sensor-reading', newReading);
      
      res.status(201).json(newReading);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      console.error("Error creating sensor reading:", error);
      res.status(500).json({ message: "Failed to create sensor reading" });
    }
  });

  // Alert routes
  app.get('/api/alerts', isAuthenticated, async (req, res) => {
    try {
      const alerts = await storage.getAlerts();
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      res.status(500).json({ message: "Failed to fetch alerts" });
    }
  });

  app.get('/api/alerts/active', isAuthenticated, async (req, res) => {
    try {
      const alerts = await storage.getActiveAlerts();
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching active alerts:", error);
      res.status(500).json({ message: "Failed to fetch active alerts" });
    }
  });

  app.post('/api/alerts', isAuthenticated, async (req, res) => {
    try {
      const alert = insertAlertSchema.parse(req.body);
      const newAlert = await storage.createAlert(alert);
      
      // Emit real-time alert
      io.emit('new-alert', newAlert);
      
      res.status(201).json(newAlert);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      console.error("Error creating alert:", error);
      res.status(500).json({ message: "Failed to create alert" });
    }
  });

  app.patch('/api/alerts/:id/resolve', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.resolveAlert(id);
      
      // Emit update
      io.emit('alert-resolved', id);
      
      res.json({ message: "Alert resolved" });
    } catch (error) {
      console.error("Error resolving alert:", error);
      res.status(500).json({ message: "Failed to resolve alert" });
    }
  });

  // Report routes
  app.get('/api/reports', isAuthenticated, async (req, res) => {
    try {
      const reports = await storage.getReports();
      res.json(reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  app.get('/api/reports/mine', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const reports = await storage.getReportsByUser(userId);
      res.json(reports);
    } catch (error) {
      console.error("Error fetching user reports:", error);
      res.status(500).json({ message: "Failed to fetch user reports" });
    }
  });

  app.post('/api/reports', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const reportData = insertReportSchema.parse({ ...req.body, userId });
      const newReport = await storage.createReport(reportData);
      
      // Emit real-time update
      io.emit('new-report', newReport);
      
      res.status(201).json(newReport);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      console.error("Error creating report:", error);
      res.status(500).json({ message: "Failed to create report" });
    }
  });

  // Analytics routes
  app.get('/api/analytics/stats', isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get('/api/analytics/water-level-trends', isAuthenticated, async (req, res) => {
    try {
      // Mock water level trend data
      const data = {
        labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
        values: [1.2, 1.8, 2.1, 2.3, 2.0, 1.7, 1.5]
      };
      res.json(data);
    } catch (error) {
      console.error("Error fetching water level trends:", error);
      res.status(500).json({ message: "Failed to fetch water level trends" });
    }
  });

  app.get('/api/analytics/threat-distribution', isAuthenticated, async (req, res) => {
    try {
      const data = {
        labels: ['Storm Surge', 'Pollution', 'Erosion', 'Algal Bloom'],
        values: [35, 25, 20, 20]
      };
      res.json(data);
    } catch (error) {
      console.error("Error fetching threat distribution:", error);
      res.status(500).json({ message: "Failed to fetch threat distribution" });
    }
  });

  // Notification routes
  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const notifications = await storage.getUserNotifications(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.patch('/api/notifications/:id/read', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.markNotificationAsRead(id);
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  return httpServer;
}
