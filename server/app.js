const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

const codeSubmission = require("./src/routes/codeSubmission");
const optIntoContract = require("./src/routes/optIntoContract");
const testCaseRouter = require("./src/routes/testCaseSubmission");
const contestInformation = require("./src/routes/contestInformation");
const githubRepo = require("./src/routes/githubRepo");
const authRoutes = require("./src/routes/auth");
const { mongoURL } = require("./src/utils/constants");

// CONNECT TO OUR MONGO DB DATABASE
mongoose.connect(mongoURL)

dotenv.config();

const app = express();

app.use(morgan("dev")); 
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

app.use(cors({ origin: true, credentials: true }));


app.use("/api", authRoutes);
app.use("/api", codeSubmission);
app.use("/api", optIntoContract);
app.use('/api', testCaseRouter);
app.use("/api", contestInformation);
app.use("/api", githubRepo);

const port = process.env.PORT || 9000;

app.listen(port, () => {
  console.log(`Server started at port ${port}`);
});