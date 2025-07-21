//PG-Verbindung
import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();

// Pool verwaltet mehrere DB-Verbindungen.

const pool = new Pool({
  //Holt den Verbindungsstring (URI) aus der Umgebungsvariable PG_URI aus der .env Datei
  connectionString: process.env.PG_URI,
});
//Erstellt einen neuen Pool mit der angegebenen Verbindungs-URL
const query = async (sqlText, param, callback) => {
  return pool.query(sqlText, param, callback);
};

export { query };
