import knex from 'knex';
declare const config: {
    client: string;
    connection: string | {
        server: string;
        port: number;
        user: string;
        password: string;
        database: string;
        options: {
            encrypt: boolean;
            trustServerCertificate: boolean;
            enableArithAbort: boolean;
        };
        host?: undefined;
    };
    pool: {
        min: number;
        max: number;
    };
    migrations: {
        directory: string;
        extension: string;
    };
    seeds: {
        directory: string;
        extension: string;
    };
} | {
    client: string;
    connection: string | {
        host: string;
        port: number;
        user: string;
        password: string;
        database: string;
        server?: undefined;
        options?: undefined;
    };
    pool: {
        min: number;
        max: number;
    };
    migrations: {
        directory: string;
        extension: string;
    };
    seeds: {
        directory: string;
        extension: string;
    };
};
declare const db: knex.Knex<any, unknown[]>;
export default db;
export { config };
//# sourceMappingURL=database.d.ts.map