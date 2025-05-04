import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import client from ".";

const GOOGLE_CLIENT_ID = process.env.google_client_id!;
const GOOGLE_CLIENT_SECRET = process.env.google_secret!;

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        let user = await client.user.findFirst({
          where: { username: profile.emails?.[0].value },
        });

        if (!user) {
          user = await client.user.create({
            data: {
              username: profile.emails?.[0].value ?? "",
              firstName: profile.displayName,
              lastName:
                profile.name?.familyName == undefined
                  ? ""
                  : profile.name?.familyName,
              password: "",
            },
          });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);
