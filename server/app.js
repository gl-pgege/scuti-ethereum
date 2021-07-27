const express = require("express");

const codeSubmission = require("./src/routes/codeSubmission");
const optIntoContract = require("./src/routes/optIntoContract");
const testCaseRouter = require("./src/routes/testCaseSubmission");
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(express.urlencoded({
  extended: true
}));

app.use(express.json());

app.use("/api", codeSubmission);
app.use("/api", optIntoContract);
app.use('/api', testCaseRouter);

const port = process.env.PORT || 9000;

app.listen(port, () => {
  console.log(`Server started at port ${port}`);
});