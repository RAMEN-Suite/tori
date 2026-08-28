import type { DatabaseType } from 'typeorm/driver/types/DatabaseType';

export type Neo4jScheme = 'neo4j' | 'neo4j+s' | 'neo4j+scc' | 'bolt' | 'bolt+s' | 'bolt+scc';

export interface GcoreConfig {
  default: string;
  ramen: string;
  project: string;
}

export interface ServerConfig {
  name: string;
  port: number;
  version: string;
}

export interface DatabaseConfig {
  host: string;
  password: string;
  port: number;
  username: string;
  scheme: Neo4jScheme;
  database: string;
}

export interface UserDatabaseConfig {
  type: DatabaseType;
  host?: string;
  password?: string;
  port?: number;
  username?: string;
  database: string;
  synchronize?: boolean;
}

export interface CamiConfig {
  host?: string;
}

export interface EnvironmentConfig {
  gcore: GcoreConfig;
  server: ServerConfig;
  database: DatabaseConfig;
  cami: CamiConfig;
  userDatabase: UserDatabaseConfig;
}
