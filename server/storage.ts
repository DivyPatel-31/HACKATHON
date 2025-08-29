import {
  users,
  sensors,
  alerts,
  reports,
  sensorReadings,
  notifications,
  type User,
  type UpsertUser,
  type Sensor,
  type InsertSensor,
  type Alert,
  type InsertAlert,
  type Report,
  type InsertReport,
  type SensorReading,
  type InsertSensorReading,
  type Notification,
  type InsertNotification,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Sensor operations
  getSensors(): Promise<Sensor[]>;
  getSensor(id: string): Promise<Sensor | undefined>;
  createSensor(sensor: InsertSensor): Promise<Sensor>;
  updateSensorReading(sensorId: string, value: number): Promise<void>;
  
  // Alert operations
  getAlerts(): Promise<Alert[]>;
  getActiveAlerts(): Promise<Alert[]>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  resolveAlert(id: string): Promise<void>;
  
  // Report operations
  getReports(): Promise<Report[]>;
  getReportsByUser(userId: string): Promise<Report[]>;
  createReport(report: InsertReport): Promise<Report>;
  updateReportStatus(id: string, status: string): Promise<void>;
  
  // Sensor reading operations
  getSensorReadings(sensorId: string, from?: Date, to?: Date): Promise<SensorReading[]>;
  createSensorReading(reading: InsertSensorReading): Promise<SensorReading>;
  
  // Notification operations
  getUserNotifications(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: string): Promise<void>;
  
  // Analytics operations
  getStats(): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }
  
  // Sensor operations
  async getSensors(): Promise<Sensor[]> {
    return await db.select().from(sensors);
  }

  async getSensor(id: string): Promise<Sensor | undefined> {
    const [sensor] = await db.select().from(sensors).where(eq(sensors.id, id));
    return sensor;
  }

  async createSensor(sensor: InsertSensor): Promise<Sensor> {
    const [newSensor] = await db.insert(sensors).values(sensor).returning();
    return newSensor;
  }

  async updateSensorReading(sensorId: string, value: number): Promise<void> {
    await db.update(sensors)
      .set({ lastValue: value.toString(), lastReading: new Date() })
      .where(eq(sensors.id, sensorId));
  }
  
  // Alert operations
  async getAlerts(): Promise<Alert[]> {
    return await db.select().from(alerts).orderBy(desc(alerts.createdAt));
  }

  async getActiveAlerts(): Promise<Alert[]> {
    return await db.select().from(alerts).where(eq(alerts.isActive, true)).orderBy(desc(alerts.createdAt));
  }

  async createAlert(alert: InsertAlert): Promise<Alert> {
    const [newAlert] = await db.insert(alerts).values(alert).returning();
    return newAlert;
  }

  async resolveAlert(id: string): Promise<void> {
    await db.update(alerts)
      .set({ isActive: false, resolvedAt: new Date() })
      .where(eq(alerts.id, id));
  }
  
  // Report operations
  async getReports(): Promise<Report[]> {
    return await db.select().from(reports).orderBy(desc(reports.createdAt));
  }

  async getReportsByUser(userId: string): Promise<Report[]> {
    return await db.select().from(reports)
      .where(eq(reports.userId, userId))
      .orderBy(desc(reports.createdAt));
  }

  async createReport(report: InsertReport): Promise<Report> {
    const [newReport] = await db.insert(reports).values(report).returning();
    return newReport;
  }

  async updateReportStatus(id: string, status: string): Promise<void> {
    await db.update(reports)
      .set({ status, updatedAt: new Date() })
      .where(eq(reports.id, id));
  }
  
  // Sensor reading operations
  async getSensorReadings(sensorId: string, from?: Date, to?: Date): Promise<SensorReading[]> {
    let query = db.select().from(sensorReadings).where(eq(sensorReadings.sensorId, sensorId));
    
    if (from && to) {
      query = query.where(and(
        gte(sensorReadings.timestamp, from),
        lte(sensorReadings.timestamp, to)
      ));
    }
    
    return await query.orderBy(desc(sensorReadings.timestamp));
  }

  async createSensorReading(reading: InsertSensorReading): Promise<SensorReading> {
    const [newReading] = await db.insert(sensorReadings).values(reading).returning();
    await this.updateSensorReading(reading.sensorId, parseFloat(reading.value));
    return newReading;
  }
  
  // Notification operations
  async getUserNotifications(userId: string): Promise<Notification[]> {
    return await db.select().from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db.insert(notifications).values(notification).returning();
    return newNotification;
  }

  async markNotificationAsRead(id: string): Promise<void> {
    await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id));
  }
  
  // Analytics operations
  async getStats(): Promise<any> {
    const [activeAlertsCount] = await db.select({ count: sql`count(*)` }).from(alerts).where(eq(alerts.isActive, true));
    const [sensorsOnlineCount] = await db.select({ count: sql`count(*)` }).from(sensors).where(eq(sensors.isActive, true));
    const [reportsCount] = await db.select({ count: sql`count(*)` }).from(reports);
    
    return {
      activeAlerts: parseInt(activeAlertsCount.count as string) || 0,
      sensorsOnline: parseInt(sensorsOnlineCount.count as string) || 0,
      totalReports: parseInt(reportsCount.count as string) || 0,
    };
  }
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private sensors: Map<string, Sensor> = new Map();
  private alerts: Map<string, Alert> = new Map();
  private reports: Map<string, Report> = new Map();
  private sensorReadings: Map<string, SensorReading[]> = new Map();
  private notifications: Map<string, Notification[]> = new Map();

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Initialize with some mock sensors
    const mockSensors: Sensor[] = [
      {
        id: "sensor-1",
        name: "Harbor Tide Gauge",
        type: "tide_gauge",
        latitude: "40.7128",
        longitude: "-74.0060",
        isActive: true,
        lastValue: "2.3",
        lastReading: new Date(),
        createdAt: new Date(),
      },
      {
        id: "sensor-2", 
        name: "Weather Station Alpha",
        type: "weather_station",
        latitude: "40.7589",
        longitude: "-73.9851",
        isActive: true,
        lastValue: "15.2",
        lastReading: new Date(),
        createdAt: new Date(),
      },
    ];

    mockSensors.forEach(sensor => this.sensors.set(sensor.id, sensor));

    // Initialize with some mock alerts
    const mockAlerts: Alert[] = [
      {
        id: "alert-1",
        type: "storm_surge",
        severity: "critical",
        title: "Storm Surge Warning",
        description: "High tide expected at 3:45 PM - Evacuation recommended for Zone A",
        location: "Coastal Zone A",
        latitude: "40.7128",
        longitude: "-74.0060",
        isActive: true,
        createdAt: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
        resolvedAt: null,
      },
      {
        id: "alert-2",
        type: "pollution",
        severity: "medium",
        title: "High Tide Alert", 
        description: "Elevated water levels detected",
        location: "Bay Area",
        latitude: "40.7589",
        longitude: "-73.9851",
        isActive: true,
        createdAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
        resolvedAt: null,
      },
    ];

    mockAlerts.forEach(alert => this.alerts.set(alert.id, alert));
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const user: User = {
      ...userData,
      id: userData.id || `user-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }
  
  // Sensor operations
  async getSensors(): Promise<Sensor[]> {
    return Array.from(this.sensors.values());
  }

  async getSensor(id: string): Promise<Sensor | undefined> {
    return this.sensors.get(id);
  }

  async createSensor(sensor: InsertSensor): Promise<Sensor> {
    const newSensor: Sensor = {
      ...sensor,
      id: `sensor-${Date.now()}`,
      createdAt: new Date(),
    };
    this.sensors.set(newSensor.id, newSensor);
    return newSensor;
  }

  async updateSensorReading(sensorId: string, value: number): Promise<void> {
    const sensor = this.sensors.get(sensorId);
    if (sensor) {
      sensor.lastValue = value.toString();
      sensor.lastReading = new Date();
      this.sensors.set(sensorId, sensor);
    }
  }
  
  // Alert operations
  async getAlerts(): Promise<Alert[]> {
    return Array.from(this.alerts.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getActiveAlerts(): Promise<Alert[]> {
    return Array.from(this.alerts.values())
      .filter(alert => alert.isActive)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createAlert(alert: InsertAlert): Promise<Alert> {
    const newAlert: Alert = {
      ...alert,
      id: `alert-${Date.now()}`,
      createdAt: new Date(),
      resolvedAt: null,
    };
    this.alerts.set(newAlert.id, newAlert);
    return newAlert;
  }

  async resolveAlert(id: string): Promise<void> {
    const alert = this.alerts.get(id);
    if (alert) {
      alert.isActive = false;
      alert.resolvedAt = new Date();
      this.alerts.set(id, alert);
    }
  }
  
  // Report operations
  async getReports(): Promise<Report[]> {
    return Array.from(this.reports.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getReportsByUser(userId: string): Promise<Report[]> {
    return Array.from(this.reports.values())
      .filter(report => report.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createReport(report: InsertReport): Promise<Report> {
    const newReport: Report = {
      ...report,
      id: `report-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.reports.set(newReport.id, newReport);
    return newReport;
  }

  async updateReportStatus(id: string, status: string): Promise<void> {
    const report = this.reports.get(id);
    if (report) {
      report.status = status as any;
      report.updatedAt = new Date();
      this.reports.set(id, report);
    }
  }
  
  // Sensor reading operations
  async getSensorReadings(sensorId: string, from?: Date, to?: Date): Promise<SensorReading[]> {
    const readings = this.sensorReadings.get(sensorId) || [];
    if (!from || !to) return readings;
    
    return readings.filter(reading => 
      new Date(reading.timestamp) >= from && new Date(reading.timestamp) <= to
    );
  }

  async createSensorReading(reading: InsertSensorReading): Promise<SensorReading> {
    const newReading: SensorReading = {
      ...reading,
      id: `reading-${Date.now()}`,
      timestamp: new Date(),
    };
    
    const readings = this.sensorReadings.get(reading.sensorId) || [];
    readings.push(newReading);
    this.sensorReadings.set(reading.sensorId, readings);
    
    await this.updateSensorReading(reading.sensorId, parseFloat(reading.value));
    return newReading;
  }
  
  // Notification operations
  async getUserNotifications(userId: string): Promise<Notification[]> {
    return this.notifications.get(userId) || [];
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const newNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}`,
      createdAt: new Date(),
    };
    
    const userNotifications = this.notifications.get(notification.userId) || [];
    userNotifications.push(newNotification);
    this.notifications.set(notification.userId, userNotifications);
    
    return newNotification;
  }

  async markNotificationAsRead(id: string): Promise<void> {
    for (const [userId, notifications] of this.notifications.entries()) {
      const notification = notifications.find(n => n.id === id);
      if (notification) {
        notification.isRead = true;
        this.notifications.set(userId, notifications);
        break;
      }
    }
  }
  
  // Analytics operations
  async getStats(): Promise<any> {
    const activeAlerts = Array.from(this.alerts.values()).filter(alert => alert.isActive).length;
    const sensorsOnline = Array.from(this.sensors.values()).filter(sensor => sensor.isActive).length;
    const totalReports = Array.from(this.reports.values()).length;
    
    return {
      activeAlerts,
      sensorsOnline,
      totalReports,
      waterLevel: "2.3",
      communityReports: totalReports,
    };
  }
}

export const storage = new DatabaseStorage();
