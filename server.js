require("dotenv").config();

const express = require("express");
const app = express();
const pool = require("./db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authenticateToken = require("./middleware/auth");

app.use(express.json());
app.use(express.static("public"));

app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    const result = await pool.query(
        "SELECT * FROM users WHERE username = $1",
        [username]
    );

    if (result.rows.length === 0) {
        return res.status(401).json({
            success: false,
            message: "Invalid username or password"
        });
    }

    const user = result.rows[0];

    const passwordMatches = await bcrypt.compare(
        password,
        user.password_hash
    );

    if (!passwordMatches) {
        return res.status(401).json({
            success: false,
            message: "Invalid username or password"
        });
    }

    const token = jwt.sign(
        {
            userId: user.id,
            username: user.username
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1h"
        }
    );

    res.json({
        success: true,
        token
    });

});

app.get("/me", authenticateToken, (req, res) => {
    res.json({
        success: true,
        user: req.user
    });
    /*const authHeader = req.headers.authorization;

    if(!authHeader) {
        return res.status(401).json({
            success: false,
            message: "Not authenticated"
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, "secret_key");
        console.log(decoded);
        res.json({
            success: true,
            user: decoded
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            message: "Invalid token"
        });
    }*/
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});