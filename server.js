const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes/index");
const productRoutes = require("./routes/productRoutes/index");
const transactionRoutes = require("./routes/transactionRoutes/index");
const auth = require("./middlewares/auth");

app.use(cors());
app.use(bodyParser.json());
//Connecting Database
connectDB();

//path route
// app.use('/your-path',sampleRoute);
app.use("/api/v1", userRoutes);
app.use("/api/v1/product", auth, productRoutes);
app.use("/api/v1/transaction", auth, transactionRoutes);

//test route
app.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Server works!!",
  });
});

//running node js server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
