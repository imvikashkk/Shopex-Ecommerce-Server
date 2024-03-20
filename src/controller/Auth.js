import { User } from "../model/User.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { sanitizeUser, sendMail } from "../services/common.js";

export const createUser = async (req, res) => {
  try {
    const password = req.body.password;

    if (password.length < 8) {
      return res.status(400).json({
        message: "password should be at least 8 characters long",
        error: "error",
      });
    }

    const existUser = await User.findOne({ email: req.body.email });

    if (existUser) {
      return res
        .status(400)
        .json({ message: "User already exists !", error: "error" });
    }

    const salt = crypto.randomBytes(16);
    const iterations = 310000;
    const keylen = 32;
    const digest = "sha256";
    const callback = async (error, hashpassword) => {
      if (error) {
        return res.status(500).json({ message: error.message, error });
      }
      try {
        const user = new User({
          ...req.body,
          password: hashpassword,
          salt: salt,
        });

        const doc = await user.save();

        req.login(sanitizeUser(doc), (error) => {
          // this also calls serializer and adds to session
          if (error) {
            return res.status(400).json({ error: error.message, error });
          } else {
            const token = jwt.sign(
              sanitizeUser(doc),
              process.env.JWT_SECRET_KEY
            );
            res
              .setHeader("authorization", `Bearer ${token}`)
              .status(201)
              .json({
                message: "Your account successfully created !",
                id: doc.id,
                role: doc.role,
              });
          }
        });
      } catch (error) {
        res.status(500).json({ message: error.message, error });
      }
    };
    crypto.pbkdf2(password, salt, iterations, keylen, digest, callback);
  } catch (err) {
    res.status(500).json({ message: err.message, error: err });
  }
};

export const loginUser = async (req, res) => {
  try {
    const user = req.user;
    res.setHeader("authorization", `Bearer ${user.token}`);
    res
      .status(200)
      .json({
        message: "You are successfully loggedIn !",
        id: user.id,
        role: user.role,
      });
  } catch (err) {
    res.status(400).json({ message: err.message, err });
  }
};

export const resetPasswordRequest = async (req, res) => {
  try {
    const email = req.body.email;
    const user = await User.findOne({ email: email });
    if (!user) {
      return res
        .status(400)
        .json({ error: "error", message: "User does not exit." });
    }
    const token = crypto.randomBytes(48).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordTokenTime = new Date().toISOString();
    const saveToken = await user.save();
    const resetPageLink =
      "http://localhost:5173/reset-password?token=" + token + "&email=" + email;
    const subject = "reset password for Shopex e-commerce";
    const html = `<p>Click <a href='${resetPageLink}'>here</a> to Reset Password. Valid only 10 minute.</p>`;
    if (email) {
      const response = await sendMail({ to: email, subject, html });
      res.status(200).json({
        message: "password reset link sent to your email successfully done !",
        body: response,
      });
    } else {
      res
        .status(400)
        .json({ status: "error", error: { message: "Invalid email" } });
    }
  } catch (err) {
    res
      .status(500)
      .json({ status: "error", error: { message: "Internal Server Error" } });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, password, token } = req.body;
    const user = await User.findOne({
      email: email,
      resetPasswordToken: token,
    });
    if (!user) {
      //No such user email
      return res.status(400).json({
        message: "The Link You Followed Has Expired !",
        error: "error",
      });
    }

    /* Validate Token Time */
    const resetPasswordTokenTime = new Date(`${user.resetPasswordTokenTime}`);
    const currentTime = new Date();
    const differenceInMinutes =
      (currentTime - resetPasswordTokenTime) / (1000 * 60);
    if (differenceInMinutes > 10) {
      return res.status(400).json({
        message: "The Link You Followed Has Expired !",
        error: "error",
      });
    }
    const salt = crypto.randomBytes(16);
    crypto.pbkdf2(
      // method gives an asynchronous Password-Based Key Derivation
      password, // password
      salt, // salt
      310000, // iterations
      32, // keylen
      "sha256", // digest
      async (error, hashedPassword) => {
        // callback function
        if (error) {
          return res
            .status(400)
            .json({ message: error.message, error: "error" });
        }
        user.password = hashedPassword;
        user.salt = salt;
        user.resetPasswordToken = undefined;
        user.resetPasswordTokenTime = undefined;
        const saveUser = await user.save();
        const subject = "password successfully reset for Shopex e-commerce";
        const html = `<p>Successfully able to Reset Password</p>`;
        if (email) {
          const response = await sendMail({ to: email, subject, html });
          res.status(200).json({
            message: "password changed successfully",
            body: response,
          });
        } else {
          res.status(400).json({
            message: "Invalid Credential !",
            error: "error",
          });
        }
      }
    );
  } catch (err) {
    res.status(500).json({ message: err.message, error: "error" });
  }
};
