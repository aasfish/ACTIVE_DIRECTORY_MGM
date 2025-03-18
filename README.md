# Gestor de Active Directory

Aplicación web para la gestión de Active Directory con interfaz en español.

## Características

- Gestión completa de usuarios de Active Directory
- Administración de grupos y permisos
- Gestión de dispositivos
- Interfaz intuitiva en español
- Soporte para múltiples dominios
- Operaciones de usuario (bloqueo, desbloqueo, reset de contraseña)

## Requisitos

- Node.js >= 18
- Acceso a un servidor de Active Directory
- Ubuntu (recomendado para despliegue)

## Configuración

1. Configurar las variables de entorno en un archivo `.env`:

```env
AD_URL=ldap://your-ad-server
AD_BASE_DN=DC=your,DC=domain,DC=com
AD_USERNAME=your_admin_user
AD_PASSWORD=your_admin_password
```

2. Instalar dependencias:

```bash
npm install
```

3. Iniciar la aplicación:

```bash
npm run dev
```

## Configuración de Múltiples Dominios

La aplicación soporta múltiples dominios de Active Directory. La configuración se encuentra en `server/config/ad-config.ts`.

Ejemplo de configuración para múltiples dominios:

```typescript
{
  'dominio1': {
    url: 'ldap://ad1.company.com',
    baseDN: 'DC=ad1,DC=company,DC=com',
    username: 'admin1',
    password: '****'
  },
  'dominio2': {
    url: 'ldap://ad2.company.com',
    baseDN: 'DC=ad2,DC=company,DC=com',
    username: 'admin2',
    password: '****'
  }
}
```

## Seguridad

- Las contraseñas y credenciales sensibles deben configurarse a través de variables de entorno
- La aplicación implementa autenticación y autorización
- Todas las operaciones son registradas para auditoría

## Soporte

Para reportar problemas o sugerir mejoras, por favor crear un issue en este repositorio.
