import express from "express";
import { createHandler } from "graphql-http/lib/use/express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import signin from "./Routes/RestApi/signin";
import login from "./Routes/RestApi/login";
import { schema } from "./Routes/Graphql/TodoSchema/schema";
import { root } from "./Routes/Graphql/TodoResolver/resolver";
import { context } from "./middleware/context";
import { clientRedis } from "./imports/redis";
import { rateLimit } from "express-rate-limit";
import jwt from "jsonwebtoken";
import passport from "passport";
import "./passportconfig";

export const client = new PrismaClient();

export default client;
const app = express();
const port: any = process.env.port;
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});
app.use(limiter);
app.use(cors());
app.use("/user", signin);
app.use("/user", login);

app.all(
  "/graphql",
  createHandler({
    schema: schema,
    rootValue: root,
    context: (req, params) => context(req, params),
  })
);

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/" }),
  (req: any, res) => {
    const user = req.user;
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });

    res.redirect(`http://localhost:5173/oauth-success?token=${token}`);
  }
);

async function startserver() {
  await clientRedis.connect();
  app.listen({ port }, () => {
    console.log(
      `Running a GraphQL API server at http://localhost:${process.env.NODE_PORT}/graphql`
    );
  });
}
startserver();
