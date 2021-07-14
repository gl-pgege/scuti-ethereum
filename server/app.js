const express = require("express")
const app = express();
// const bodyParser = require("body-parser")

const etherRoutes = require("./src/routes/codeSubmission");

app.use(express.urlencoded({
    extended: true
  }));

app.use(express.json());
app.use("/api", etherRoutes);

const port = process.env.PORT || 9000;

app.listen(port, () => {
    console.log(`Server started at port ${port}`);
})