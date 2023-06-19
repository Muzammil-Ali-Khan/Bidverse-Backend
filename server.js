const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes/index");
const productRoutes = require("./routes/productRoutes/index");
const transactionRoutes = require("./routes/transactionRoutes/index");
const auth = require("./middlewares/auth");
const cron = require("node-cron");
const nodemailer = require("nodemailer");
const Product = require("./models/Product");
const User = require("./models/User");

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

cron.schedule("* */5 * * *", async () => {
  const products = Product.find();
  // products.forEach((prod) => {
  for (let i = 0; i < products.length; i++) {
    let prod = products[i];
    if (!prod.isEmailSent) {
      const todayDate = new Date();
      const endDate = new Date(prod.endTime);
      if (todayDate > endDate) {
        if (prod.bidAmounts.length > 0) {
          const greaterBid =
            prod.bidAmounts.find((item) => item.amount > prod.price) ?? {};
          const bidder = User.findById(greaterBid.userId);
          const prodOwner = User.findById(prod.userId);

          mailService(
            prodOwner.email,
            `Product ${prod.name} Bid Ended`,
            `Congratulations, your product bid has ended. Here are the details of the person who has bidded the most highest.\n Name: ${bidder.name} \n Email: ${bidder.email} \n Contact No.: ${bidder.number}`
          );

          mailService(
            bidder.email,
            `Product ${prod.name} Bid Ended`,
            `Congratulations, you have won the product ${prod.name}. Here are the details of the person who is the owner of this product.\n Name: ${prodOwner.name} \n Email: ${prodOwner.email} \n Contact No.: ${prodOwner.number}`
          );

          let updatedProduct = await Product.findByIdAndUpdate(
            { _id: prod._id },
            { isEmailSent: true },
            { new: true }
          );
        } else {
          mailService(
            prodOwner.email,
            `Product ${prod.name} Bid Ended`,
            `Sorry, No one has bidded on your product`
          );
          let updatedProduct = await Product.findByIdAndUpdate(
            { _id: prod._id },
            { isEmailSent: true },
            { new: true }
          );
        }
      }
    }
  }
  // });
});

function mailService(receiverEmail, subject, body) {
  let mailTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "muzammilali1512@gmail.com",
      // use generated app password for gmail
      pass: "vskcknbnnauspcgr",
    },
  });

  // setting credentials
  let mailDetails = {
    from: "muzammilali1512@gmail.com",
    to: receiverEmail,
    subject: subject,
    text: body,
  };

  // sending email
  mailTransporter.sendMail(mailDetails, function (err, data) {
    if (err) {
      console.log("error occurred", err.message);
    } else {
      console.log("---------------------");
      console.log("email sent successfully");
    }
  });
}

//running node js server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
