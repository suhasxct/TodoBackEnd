import { Router } from "express";
import express from "express";
import client from "../..";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const JWT_SECRET: any = process.env.JWT_SECRET;
const router = Router();
router.use(express.json());

export default router.post("/login", async function (req, res) {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const response = await client.user.findFirst({
      where: {
        username: email,
      },
    });
    if (response == null) {
      res.json({
        message: "User Doesnt exsist",
      });
      return;
    }

    const passwordMatch: any = bcrypt.compare(password, response.password);
    if (passwordMatch) {
      const token = jwt.sign(
        {
          id: response.id,
        },
        JWT_SECRET
      );
      res.json({
        Message: "Login",
        token: token,
      });
    } else {
      res.json({
        message: "Incorrect Password",
      });
    }
  } catch (e) {
    res.send({
      message: "server Error",
    });
  }
});
