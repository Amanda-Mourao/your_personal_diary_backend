import express from "express";
import cors from "cors";
import chalk from "chalk";
import { query } from "./db/index.js";
// import dotenv from "dotenv";
// dotenv.config();

const port = process.env.PORT || 3000;
console.log(process.env.PG_URI);

const app = express();

app.use(express.json(), cors());

app.get("/posts", async (req, res) => {
  try {
    const { rows } = await query(
      "SELECT id, author, title, content, cover, date, category, status from posts order by date DESC ;"
    );
    res.json(rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error" });
  }
});

app.get("/posts/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const { rows, rowCount } = await query(
      "SELECT author, title, content, cover, date, category, status from posts WHERE id = $1;",
      [id]
    );
    // da die Funktion weiter läuft soll beim res.status--->return eingefügt, damit der Code danach nicht mehr ausgeführt wird
    if (rowCount === 0) {
      return res.status(404).json({ msg: "Product not found" });
    }

    res.json({ data: rows[0] });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error" });
  }
});

app.post("/posts", async (req, res) => {
  const { author, title, content, cover, date, category, status } = req.body;

  if (!author) return res.status(400).json({ msg: "Author required" });

  try {
    const { rows } = await query(
      "INSERT INTO posts (author, title, content, cover, date, category, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;",
      [author, title, content, cover, date, category, status]
    );

    res.status(201).json(rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error" });
  }
});

app.put("/posts/:id", async (req, res) => {
  const { id } = req.params;
  const { author, title, content, cover, date, category, status } = req.body;

  try {
    const { rows, rowCount } = await query(
      `UPDATE posts
        SET
            author = COALESCE($1, author),
            title = COALESCE($2, title),
            content = COALESCE($3, content),
            cover = COALESCE($4, cover),
            date = COALESCE($5, date),
            category = COALESCE($6, category),
            status = COALESCE($7, status)
        WHERE id = $8
        RETURNING author, title, content, cover, date, category, status;`,
      [author, title, content, cover, date, category, status, id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ msg: "Product not found" });
    }

    res.json(rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error" });
  }
});

app.delete("/posts/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const { rows, rowCount } = await query(
      "DELETE FROM posts WHERE id = $1 RETURNING *;",
      [id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ msg: "Product not found" });
    }

    res.json({ msg: "Delete successful", data: rows[0] });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error" });
  }
});

// app.listen(port, () => console.log(`Server läuft auf port ${port}`));
app.listen(port, () =>
  console.log(chalk.bgBlueBright(`Server läuft auf port ${port}`))
);

// Prüfen, ob die ID im Datenbank-Ergebnis gefunden wurde
// → Wenn keine Zeile zurückgegeben wurde (rowCount === 0), bedeutet das:
// → Es gibt keinen Eintrag mit dieser ID → also Fehler 404 zurückgeben
// → Für ---> GET:id, PUT, DELETE
