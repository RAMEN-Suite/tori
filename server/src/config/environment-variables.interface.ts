export interface EnvironmentVariables {
  APP_VERSION: string;
  TORI_GCORE: string;
  TORI_GCORE_RAMEN: string;
  TORI_GCORE_PROJECT: string;
  TORI_SERVER_PORT: number;
  TORI_DB_HOST: string;
  TORI_DB_PASSWORD: string;
  TORI_DB_PORT: number;
  TORI_DB_USER: string;
  TORI_DB_SCHEME: 'neo4j' | 'neo4j+s' | 'bolt' | 'bolt+s';
  TORI_DB_NAME: string;
  TORI_CAMI_HOST?: string;
}
