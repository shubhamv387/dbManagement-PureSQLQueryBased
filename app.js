const express = require("express");
const db = require("./config/database");
const path = require("path");
const cors = require("cors");
require("dotenv").config();
require("colors");

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());

app.get("/favicon.ico", (req, res) => {
  res.status(204).end();
});

// @desc Create a new table
app.post("/", async (req, res, next) => {
  const { tableName, columns } = req.body;

  function typeIdentify(type) {
    switch (type) {
      case "STRING":
        return "VARCHAR(255)";
      case "NUMBER":
        return "INT";
      case "DOUBLE":
        return "DECIMAL(10, 2)";
      default:
        throw new Error("DataType not defined");
    }
  }

  // Construct the CREATE TABLE SQL statement
  let createTableSQL = `CREATE TABLE IF NOT EXISTS ${tableName} (id INT AUTO_INCREMENT PRIMARY KEY, `;

  columns.forEach((column) => {
    createTableSQL += `${column.name} ${typeIdentify(column.type)}`;
    createTableSQL += ", ";
  });

  createTableSQL +=
    "createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)";

  // console.log(createTableSQL);

  // await db.execute(`DROP TABLE IF EXISTS ${tableName}`);

  db.execute(createTableSQL)
    .then((tableData) => {
      if (tableData[0].warningStatus)
        return res
          .status(200)
          .json({ success: false, message: "table already exists" });
      return res
        .status(200)
        .json({ success: true, message: "table created successfully!" });
    })
    .catch((err) => {
      console.log(err.message);
      return res.status(500).json({ success: false, message: "failed" });
    });
});

// @desc Get all tables from database
app.get("/show-tables", async (req, res, next) => {
  try {
    const result = await db.execute("SHOW TABLES");

    return res
      .status(200)
      .json({ success: true, result: JSON.stringify(result[0]) });
  } catch (error) {
    console.log(error.message);
    return res
      .status(500)
      .json({ success: false, message: "Intername server error" });
  }
});

// @desc Insert data into table
app.post("/add-data", async (req, res, next) => {
  // console.log(req.body);

  const valArray = [];

  for (let key in req.body) {
    if (key !== "tableName") valArray.push(req.body[key]);
  }

  // console.log(valArray);

  const tableColumns = await db.execute(`SELECT * FROM ${req.body.tableName}`);
  // console.log(tableColumns);

  let sqlQuery = `INSERT INTO ${req.body.tableName} (`;
  let sqlVal = `VALUES(`;

  for (let i = 1; i < tableColumns[1].length - 2; i++) {
    sqlQuery += `${tableColumns[1][i].name}`;
    sqlVal += "?";
    if (i < tableColumns[1].length - 3) {
      sqlQuery += ", ";
      sqlVal += ",";
    }
  }
  sqlQuery += ") ";
  sqlVal += ")";

  // console.log(sqlQuery + sqlVal, valArray);

  db.execute(sqlQuery + sqlVal, valArray)
    .then((tableData) => {
      if (tableData[0].warningStatus)
        return res
          .status(500)
          .json({ success: false, message: "Something went wrong!" });
      return res
        .status(201)
        .json({ success: true, message: "data added successfully!" });
    })
    .catch((err) => {
      console.log(err.message);
      return res.status(500).json({ success: false, message: "failed" });
    });
});

// @desc Get data from table
app.get("/:tableName", async (req, res, next) => {
  try {
    const result = await db.execute(`SELECT * FROM ${req.params.tableName}`);
    const table = await db.execute(`DESC ${req.params.tableName}`);
    // console.log(table);
    const tableDesc = [];
    for (let i = 1; i < table[0].length - 2; i++) {
      tableDesc.push({ Field: table[0][i].Field, Type: table[0][i].Type });
    }
    res.status(200).json({ success: true, result: result[0], tableDesc });
  } catch (error) {
    console.log(error.message.underline.red);
    res.status(500).json({ success: false, message: "Intername server error" });
  }
});

// @desc Delete data from table
app.delete("/:tableName/:id", async (req, res, next) => {
  // console.log(req.params);
  try {
    const deletedData = await db.execute(
      `DELETE FROM ${req.params.tableName} WHERE id= ${req.params.id}`
    );
    if (deletedData[0].warningStatus)
      return res
        .status(500)
        .json({ success: false, message: "Something went wrong!" });
    else if (deletedData[0].affectedRows)
      return res
        .status(201)
        .json({ success: true, message: "data deleted successfully!" });
    return res
      .status(404)
      .json({ success: false, message: "data not found in database!" });
  } catch (error) {
    console.log(error.message);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong!" });
  }
});

app.use((req, res, next) => {
  return res.status(200).json({ success: false, message: "page not found" });
});

// Testing the database connection
db.query("SELECT 1")
  .then(() => {
    app.listen(5050, () => {
      console.log("Server is running on http://localhost:5050".underline.cyan);
    });
  })
  .catch((err) => {
    console.error("Error connecting to the database:".underline.red, err);
  });
