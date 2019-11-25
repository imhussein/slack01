var express = require("express");
var app = express();
require("body-parser");
require("colors");
var path = require("path");
var fs = require("fs");
const cors = require("cors");
var rootDir = path.join(path.dirname(process.mainModule.filename));
const uuid = require("uuid");

app.use(cors());
app.use(express.json());
app.use("/assets", express.static(__dirname));

function readData(fn) {
  fs.readFile(path.join(rootDir, "posts.json"), { encoding: "utf-8" }, function(
    err,
    data
  ) {
    if (err) {
      console.log(err);
      return;
    }
    fn(JSON.parse(data));
  });
}

app.get("/", function(req, res) {
  readData(function(data) {
    return res.json({ data });
  });
});

app.post("/", function(req, res) {
  readData(function(data) {
    let newData = data;
    newData.push({
      title: req.body.title,
      id: uuid()
    });
    fs.writeFile(
      path.join(rootDir, "posts.json"),
      JSON.stringify(newData),
      function(err) {
        if (err) {
          console.log(err);
        }
      }
    );
  });
});

var port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server Started At Port ${port}`.yellow);
});
