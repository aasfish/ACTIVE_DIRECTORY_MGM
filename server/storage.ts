import session from "express-session";
import createMemoryStore from "memorystore";
import { User, ADUser, ADGroup, ADDevice, ADUserGroup, InsertUser } from "@shared/schema";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  sessionStore: session.Store;

  // Auth
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // AD Users
  getADUsers(): Promise<ADUser[]>;
  getADUser(id: number): Promise<ADUser | undefined>;
  createADUser(user: Omit<ADUser, "id" | "createdAt">): Promise<ADUser>;
  updateADUser(id: number, user: Partial<ADUser>): Promise<ADUser | undefined>;
  deleteADUser(id: number): Promise<boolean>;
  resetADUserPassword(id: number): Promise<boolean>;
  toggleADUserLock(id: number): Promise<ADUser>;
  disableADUser(id: number): Promise<ADUser>;
  enableADUser(id: number): Promise<ADUser>;

  // AD Groups
  getADGroups(): Promise<ADGroup[]>;
  getADGroup(id: number): Promise<ADGroup | undefined>;
  createADGroup(group: Omit<ADGroup, "id" | "createdAt">): Promise<ADGroup>;
  updateADGroup(id: number, group: Partial<ADGroup>): Promise<ADGroup | undefined>;
  deleteADGroup(id: number): Promise<boolean>;

  // AD Devices
  getADDevices(): Promise<ADDevice[]>;
  getADDevice(id: number): Promise<ADDevice | undefined>;
  createADDevice(device: Omit<ADDevice, "id">): Promise<ADDevice>;
  updateADDevice(id: number, device: Partial<ADDevice>): Promise<ADDevice | undefined>;
  deleteADDevice(id: number): Promise<boolean>;

  // User-Group Mappings
  addUserToGroup(userId: number, groupId: number): Promise<ADUserGroup>;
  removeUserFromGroup(userId: number, groupId: number): Promise<boolean>;
  getUserGroups(userId: number): Promise<ADGroup[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private adUsers: Map<number, ADUser>;
  private adGroups: Map<number, ADGroup>;
  private adDevices: Map<number, ADDevice>;
  private adUserGroups: Map<number, ADUserGroup>;
  private currentId: number;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.adUsers = new Map();
    this.adGroups = new Map();
    this.adDevices = new Map();
    this.adUserGroups = new Map();
    this.currentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  // Auth methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id, isAdmin: false };
    this.users.set(id, user);
    return user;
  }

  // AD Users methods
  async getADUsers(): Promise<ADUser[]> {
    return Array.from(this.adUsers.values());
  }

  async getADUser(id: number): Promise<ADUser | undefined> {
    return this.adUsers.get(id);
  }

  async createADUser(user: Omit<ADUser, "id" | "createdAt">): Promise<ADUser> {
    const id = this.currentId++;
    const newUser: ADUser = { 
      ...user, 
      id, 
      createdAt: new Date() 
    };
    this.adUsers.set(id, newUser);
    return newUser;
  }

  async updateADUser(id: number, update: Partial<ADUser>): Promise<ADUser | undefined> {
    const user = this.adUsers.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...update };
    this.adUsers.set(id, updatedUser);
    return updatedUser;
  }

  async deleteADUser(id: number): Promise<boolean> {
    return this.adUsers.delete(id);
  }

  async resetADUserPassword(id: number): Promise<boolean> {
    const user = this.adUsers.get(id);
    if (!user) return false;

    const updatedUser = { 
      ...user, 
      mustChangePassword: true,
      passwordLastSet: new Date()
    };
    this.adUsers.set(id, updatedUser);
    return true;
  }

  async toggleADUserLock(id: number): Promise<ADUser> {
    const user = this.adUsers.get(id);
    if (!user) throw new Error("Usuario no encontrado");

    const updatedUser = { 
      ...user, 
      accountLocked: !user.accountLocked 
    };
    this.adUsers.set(id, updatedUser);
    return updatedUser;
  }

  async disableADUser(id: number): Promise<ADUser> {
    const user = this.adUsers.get(id);
    if (!user) throw new Error("Usuario no encontrado");

    const updatedUser = { ...user, enabled: false };
    this.adUsers.set(id, updatedUser);
    return updatedUser;
  }

  async enableADUser(id: number): Promise<ADUser> {
    const user = this.adUsers.get(id);
    if (!user) throw new Error("Usuario no encontrado");

    const updatedUser = { ...user, enabled: true };
    this.adUsers.set(id, updatedUser);
    return updatedUser;
  }

  // AD Groups methods
  async getADGroups(): Promise<ADGroup[]> {
    return Array.from(this.adGroups.values());
  }

  async getADGroup(id: number): Promise<ADGroup | undefined> {
    return this.adGroups.get(id);
  }

  async createADGroup(group: Omit<ADGroup, "id" | "createdAt">): Promise<ADGroup> {
    const id = this.currentId++;
    const newGroup: ADGroup = {
      ...group,
      id,
      createdAt: new Date()
    };
    this.adGroups.set(id, newGroup);
    return newGroup;
  }

  async updateADGroup(id: number, update: Partial<ADGroup>): Promise<ADGroup | undefined> {
    const group = this.adGroups.get(id);
    if (!group) return undefined;
    
    const updatedGroup = { ...group, ...update };
    this.adGroups.set(id, updatedGroup);
    return updatedGroup;
  }

  async deleteADGroup(id: number): Promise<boolean> {
    return this.adGroups.delete(id);
  }

  // AD Devices methods
  async getADDevices(): Promise<ADDevice[]> {
    return Array.from(this.adDevices.values());
  }

  async getADDevice(id: number): Promise<ADDevice | undefined> {
    return this.adDevices.get(id);
  }

  async createADDevice(device: Omit<ADDevice, "id">): Promise<ADDevice> {
    const id = this.currentId++;
    const newDevice: ADDevice = { ...device, id };
    this.adDevices.set(id, newDevice);
    return newDevice;
  }

  async updateADDevice(id: number, update: Partial<ADDevice>): Promise<ADDevice | undefined> {
    const device = this.adDevices.get(id);
    if (!device) return undefined;
    
    const updatedDevice = { ...device, ...update };
    this.adDevices.set(id, updatedDevice);
    return updatedDevice;
  }

  async deleteADDevice(id: number): Promise<boolean> {
    return this.adDevices.delete(id);
  }

  // User-Group mapping methods
  async addUserToGroup(userId: number, groupId: number): Promise<ADUserGroup> {
    const id = this.currentId++;
    const mapping: ADUserGroup = { id, userId, groupId };
    this.adUserGroups.set(id, mapping);
    return mapping;
  }

  async removeUserFromGroup(userId: number, groupId: number): Promise<boolean> {
    const mapping = Array.from(this.adUserGroups.values()).find(
      (m) => m.userId === userId && m.groupId === groupId
    );
    if (!mapping) return false;
    return this.adUserGroups.delete(mapping.id);
  }

  async getUserGroups(userId: number): Promise<ADGroup[]> {
    const mappings = Array.from(this.adUserGroups.values()).filter(
      (m) => m.userId === userId
    );
    return mappings
      .map((m) => this.adGroups.get(m.groupId))
      .filter((g): g is ADGroup => g !== undefined);
  }
}

export const storage = new MemStorage();