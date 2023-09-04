const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;

module.exports = function (passport) {
  passport.use(
    new JwtStrategy(
      {
        secretOrKey: "qwertyuiopqwertyuiopqwertyuiopqwertyuiop",
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      },
      (jwt_payload, cb) => {
        cb(null, false);
      }
    )
  );
};
