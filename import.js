const fs = require("fs");
const csv = require("csv-parser");
const { MongoClient } = require("mongodb");

// MongoDB connection URI
const uri =
  "mongodb+srv://bittukarthik77:tveNTcXdr49q0vQo@cluster0.yxc5u.mongodb.net/test";
const client = new MongoClient(uri);

async function importCSV() {
  try {
    // Connect to MongoDB
    await client.connect();
    console.log("Connected to MongoDB");

    const database = client.db("test"); // Replace with your database name
    const collection = database.collection("collect_request"); // Replace with your collection name

    // Path to CSV file (ensure correct path)
    const csvFilePath = "C:/Users/bittu/OneDrive/Documents/test.collect_request.csv";

    const records = [];

    // Read the CSV file and parse it
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on("data", (row) => {
        records.push(row);
      })
      .on("end", async () => {
        try {
          // Insert parsed data into MongoDB
          if (records.length > 0) {
            const result = await collection.insertMany(records);
            console.log(`${result.insertedCount} records inserted`);
          } else {
            console.log("No records to insert.");
          }
        } catch (error) {
          console.error("Error inserting data into MongoDB:", error);
        } finally {
          // Close the MongoDB connection
          await client.close();
          console.log("MongoDB connection closed");
        }
      })
      .on("error", (error) => {
        console.error("Error reading the CSV file:", error);
      });
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

// Call the importCSV function
importCSV();
