require("dotenv").config();

const express = require("express");
const cors = require('cors')
const connectDB = require("./config/db");
const { errorHandler } = require("./middlewares/error.middleware");
const { PORT, API_VERSION } = require("./config/config");
const adminRouter = require('./routes/admin.route')
const app = express();
const path = require("path");


// ROUTING
const router = require("./routes/project.route");
const pageRoutes = require("./routes/page.route");
const apiConfigRoute = require("./routes/api.route");


connectDB();

app.use(cors({
  origin: '*', // allow all origins for development
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'x-admin']
}));

app.use(express.static('public'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));


app.use(`/api/${API_VERSION}/projects`, router);
app.use(`/api/${API_VERSION}/`,adminRouter)

app.use(`/api/${API_VERSION}/config`, apiConfigRoute);


app.use("/", pageRoutes);

app.use(errorHandler);

app.listen(PORT, () =>
  console.log(`Example app listening on port http://localhost:${PORT} !`)
);
