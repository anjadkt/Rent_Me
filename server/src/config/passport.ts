import passport from "passport";
import {
  Strategy as GoogleStrategy,
  Profile,
} from "passport-google-oauth20";

import { env } from "./env.js";
import { User } from "../models/user.model.js";
import { UserRole } from "../types/auth.types.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: env.googleClientId,
      clientSecret: env.googleClientSecret,
      callbackURL: env.googleCallbackUrl,
    },

    async (
      _accessToken,
      _refreshToken,
      profile: Profile,
      done
    ) => {
      try {
        const email = profile.emails?.[0]?.value;

        if (!email) {
          return done(
            new Error("Google account does not provide an email")
          );
        }

        let user = await User.findOne({
          $or: [
            { googleId: profile.id },
            { email },
          ],
        });

        if (!user) {
          user = await User.create({
            name: profile.displayName,
            email,
            googleId: profile.id,
            avatar: profile.photos?.[0]?.value,
            role: UserRole.USER,
          });
        } else if (!user.googleId) {
          user.googleId = profile.id;
          user.avatar = profile.photos?.[0]?.value;
          await user.save();
        }

        return done(null, {_id : user._id.toString(), role : user.role});
      } catch (error) {
        return done(error);
      }
    }
  )
);

export default passport;