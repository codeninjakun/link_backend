// Server entry point

import express from "express";
import { createNewUser, signin } from "./controller/user";
import * as dotenv from "dotenv";
dotenv.config();
import "dotenv/config.js";

import router from "./routes/userRoute";

const routeUser = `/api/user`

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(routeUser,router);

app.get("/", (req, res) => {
  res.send("Test!");
});

app.listen(5000, () => {
  console.log("Works!");
});
