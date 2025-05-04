import { Router } from "express";
import express from "express";
import { z } from "zod";
import bcrypt from "bcrypt";
import client from "../..";
const router = Router();
router.use(express.json());
export default router.use("/signup", (req, res) => {
  const userSchema = z.object({
    email: z.string().email({ message: "Invalid email format" }),
    password: z
      .string()
      .min(4, { message: "Password must be at least 8 characters long" }),
    firstname: z.string(),
    lastname: z.string(),
  });
  const valid = userSchema.safeParse(req.body);
  if (!valid.success) {
    res.status(403).json({
      message: valid.error,
    });
    return;
  }
  try {
    const email = req.body.email;
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const password = req.body.password;

    bcrypt.hash(password, 5, async (err, hash) => {
      if (err) {
        throw new Error("Password Hash Error");
      } else {
        try {
          const user = await client.user.create({
            data: {
              username: email,
              firstName: firstname,
              lastName: lastname,
              password: hash,
            },
          });
          res.json({
            message: "User Created Successfully",
          });
        } catch (e) {
          res.json({
            messaage: "Error in Creating a user",
          });
        }
      }
    });
  } catch (e) {
    res.json({
      message: e,
    });
  }
});
