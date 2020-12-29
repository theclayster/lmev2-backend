const jwt = require("jsonwebtoken");
require("dotenv").config();

let generateToken = (userData, secretSignature, tokenLife) => {
  return new Promise((resolve, reject) => {
    jwt.sign(
      { data: userData },
      secretSignature,
      {
        algorithm: process.env.ALGORITHM_JWT,
        expiresIn: tokenLife,
      },
      (error, token) => {
        if (error) {
          return reject(error);
        }
        resolve(token);
      }
    );
  });
};

let verifyToken = (token, secretKey) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secretKey, (error, decoded) => {
      if (error) {
        return reject(error);
      }
      resolve(decoded);
    });
  });
};

module.exports = {
  generateToken: generateToken,
  verifyToken: verifyToken,
};
