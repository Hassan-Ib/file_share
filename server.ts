import dotenv from "dotenv";
import { connect } from "mongoose";
dotenv.config();
import server from "./app";
// import

console.log(`Server running on port ${process.env.PORT}`);

const mongoUrl = process.env.DB_CONNECTION_STRING!;

connect(mongoUrl)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log("💥💥 Error connecting to MongoDB: ");
  });

server.listen(4000, () => {
  console.log("Server is running on port 4000");
});
