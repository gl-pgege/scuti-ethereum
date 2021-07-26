const express = require("express");
const etherRoutes = require("./src/routes/codeSubmission");
const testCaseRoute = require("./src/routes/testCaseSubmission");
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(express.urlencoded({
  extended: true
}));

app.use(express.json());
app.use("/api", etherRoutes);
app.use('/contract/id/testcases', testCaseRoute);
const port = process.env.PORT || 9000;

app.listen(port, () => {
  console.log(`Server started at port ${port}`);
});