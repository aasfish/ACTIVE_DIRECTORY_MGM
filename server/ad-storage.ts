import ActiveDirectory from 'activedirectory2';
import { IStorage } from './storage';
import { ADUser, ADGroup, ADDevice, ADUserGroup, User, InsertUser } from '@shared/schema';
import session from 'express-session';
import createMemoryStore from 'memorystore';
import { getADConfig, type ADConfig } from './config/ad-config';

const MemoryStore = createMemoryStore(session);

export class ADStorage implements IStorage {
  private ad: ActiveDirectory;
  sessionStore: session.Store;
  private config: ADConfig;

  constructor(domain?: string) {
    this.config = getADConfig(domain);
    this.ad = new ActiveDirectory(this.config);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  // Auth methods (mantiene la sesión en memoria)
  async getUser(id: number): Promise<User | undefined> {
    // Implementar según necesidad
    return undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return new Promise((resolve, reject) => {
      this.ad.authenticate(username, '', (err, auth) => {
        if (err) {
          reject(err);
        }
        // Si el usuario existe en AD, crear un usuario local para la sesión
        resolve(auth ? { id: 1, username, password: '', isAdmin: true } : undefined);
      });
    });
  }

  async createUser(user: InsertUser): Promise<User> {
    // La creación de usuarios se manejará a través de las operaciones de AD
    throw new Error('Users should be created through AD operations');
  }

  // AD Users methods
  async getADUsers(): Promise<ADUser[]> {
    return new Promise((resolve, reject) => {
      this.ad.findUsers('', (err, users) => {
        if (err) {
          reject(err);
          return;
        }
        const adUsers: ADUser[] = users.map((user: any) => ({
          id: 0, // Se genera dinámicamente
          samAccountName: user.sAMAccountName,
          displayName: user.displayName,
          givenName: user.givenName,
          surname: user.sn,
          email: user.mail,
          title: user.title,
          department: user.department,
          company: user.company,
          officePhone: user.telephoneNumber,
          mobile: user.mobile,
          streetAddress: user.streetAddress,
          city: user.l,
          state: user.st,
          country: user.co,
          enabled: !user.userAccountControl || (user.userAccountControl & 2) !== 2,
          accountLocked: user.lockoutTime !== '0',
          mustChangePassword: false,
          lastLogon: user.lastLogon ? new Date(user.lastLogon) : null,
          createdAt: user.whenCreated ? new Date(user.whenCreated) : new Date(),
        }));
        resolve(adUsers);
      });
    });
  }

  async createADUser(user: Omit<ADUser, "id" | "createdAt">): Promise<ADUser> {
    return new Promise((resolve, reject) => {
      const newUser = {
        username: user.samAccountName,
        displayName: user.displayName,
        givenName: user.givenName,
        sn: user.surname,
        mail: user.email,
        title: user.title,
        department: user.department,
        company: user.company,
        telephoneNumber: user.officePhone,
        mobile: user.mobile,
        streetAddress: user.streetAddress,
        l: user.city,
        st: user.state,
        co: user.country,
      };

      this.ad.createUser(newUser, (err: any) => {
        if (err) {
          reject(err);
          return;
        }
        resolve({
          ...user,
          id: 0,
          createdAt: new Date(),
        });
      });
    });
  }

  async resetADUserPassword(id: number, newPassword: string): Promise<ADUser | undefined> {
    // Implementar el cambio de contraseña en AD
    return new Promise((resolve, reject) => {
      this.ad.setUserPassword(id.toString(), newPassword, (err: any) => {
        if (err) {
          reject(err);
          return;
        }
        // Retornar el usuario actualizado
        this.getADUser(id).then(resolve).catch(reject);
      });
    });
  }

  // Implementar el resto de los métodos según sea necesario
  // Los métodos restantes seguirán un patrón similar, utilizando
  // las funciones correspondientes de ActiveDirectory2

  // Método para cambiar el dominio en tiempo de ejecución
  setDomain(domain: string) {
    this.config = getADConfig(domain);
    this.ad = new ActiveDirectory(this.config);
  }
}