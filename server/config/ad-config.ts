import { z } from 'zod';

// Schema para validar la configuración de AD
const adConfigSchema = z.object({
  url: z.string().url(),
  baseDN: z.string(),
  username: z.string(),
  password: z.string(),
  searchBase: z.string().optional(),
  searchFilter: z.string().optional(),
});

export type ADConfig = z.infer<typeof adConfigSchema>;

// Configuración por defecto
const defaultConfig: ADConfig = {
  url: process.env.AD_URL || 'ldap://172.26.1.10',
  baseDN: process.env.AD_BASE_DN || 'DC=as,DC=com',
  username: process.env.AD_USERNAME || 'as_admin',
  password: process.env.AD_PASSWORD || 'Nomenclador5907!',
  searchBase: process.env.AD_SEARCH_BASE,
  searchFilter: process.env.AD_SEARCH_FILTER,
};

// Función para validar y obtener la configuración
export function getADConfig(domain?: string): ADConfig {
  // En el futuro, aquí podríamos cargar diferentes configuraciones basadas en el dominio
  const config = defaultConfig;
  
  try {
    return adConfigSchema.parse(config);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Configuración de AD inválida: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
}

// Función para obtener configuraciones de múltiples dominios
export function getMultiDomainConfig(): Record<string, ADConfig> {
  // Aquí podrías cargar configuraciones desde un archivo JSON o base de datos
  return {
    default: getADConfig(),
    // Ejemplo de cómo agregar más dominios:
    // 'otro-dominio': {
    //   url: 'ldap://otro-ad.com',
    //   baseDN: 'DC=otro,DC=com',
    //   username: 'admin',
    //   password: '****',
    // }
  };
}
