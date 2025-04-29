const express = require('express');
const app = express();
const PORT = 5000;

require('dotenv').config();

const connectToDB = require('./config/connectDB');
const cors = require('cors');
const cookieParser = require('cookie-parser');

app.use(cors({
    origin:[ "http://localhost:5173", "https://pennytrail.vercel.app"],
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

const userRouter = require('./router/userRouter');
const expenseRouter = require('./router/expenseRouter');


app.use("/user", userRouter);
app.use("/expense", expenseRouter);


app.use("/", async (req, res) => {
    res.json({ message: "Welcome to Penny Trail" })
})



connectToDB().then(() => {
    console.log("Connected to DB");
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch((error) => {
    console.error("Error connecting to the database:", error);
});