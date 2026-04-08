declare module "sql.js" {
  export type SqlJsValue = number | string | Uint8Array | null;

  export interface SqlValue {
    columns: string[];
    values: SqlJsValue[][];
  }

  export interface Statement {
    bind(values?: SqlJsValue[] | Record<string, SqlJsValue>): boolean;
    step(): boolean;
    getAsObject(): Record<string, SqlJsValue>;
    free(): void;
  }

  export class Database {
    constructor(data?: ArrayLike<number> | Buffer | null);
    run(sql: string, params?: SqlJsValue[]): Database;
    exec(sql: string): SqlValue[];
    prepare(sql: string): Statement;
    export(): Uint8Array;
  }

  export default function initSqlJs(config?: {
    locateFile?: (filename: string) => string;
  }): Promise<{ Database: typeof Database }>;
}
