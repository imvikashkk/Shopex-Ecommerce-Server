import { User } from "../model/User.js";
import crypto from "crypto";

export const fetchUserDetail = async (req, res) => {
  try {
    const { id } = req.user;
    const user = await User.findById(id).populate('addresses');
    res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone:user.phone,
      addresses: user.addresses,
      role: user.role,
    });
  } catch (err) {
    res.status(400).json(err);
  }
};

export const updateUser = async (req, res) => {
  try {
    const data = req.body;
    const { id } = req.user;
    const user = await User.findByIdAndUpdate(
      id,
      {
        name:data.name,
        email:data.email,
        phone:data.phone,
      },
      {
        new:true
      }
    );
    res.status(200).json({message:"User updated successfully !"});
  } catch (error) {
    res.status(400).json(error);
  }
};

export const changePassword = async (req, res) => {
  try {
    const { id } = req.user;
    const { oldpassword, newpassword } = req.body;
    const salt = crypto.randomBytes(16);
    const iterations = 310000;
    const keylen = 32;
    const digest = "sha256";

    const user = await User.findById(id);
    const matchOldPass = async (error, hashedPassword) => {
      // callback function
      if (error) {
        return res.status(400).json({message: error.message, error: error});
      } else if (!crypto.timingSafeEqual(user.password, hashedPassword)) {
        return res.status(400).json({ message: "oldpassword is incorrect !", error:"error"});
      } else {
        // password matched
        const changePass = async (error, hashedPassword) => {
          if (error) {
            return res.status(400).json({error:error.message, error: error});
          }
          user.password = hashedPassword;
          user.salt = salt;
          const saveUser = await user.save();
          res
            .status(200)
            .json({ message: "Password Change successfully !" });
        };
        crypto.pbkdf2(
          newpassword,
          salt,
          iterations,
          keylen,
          digest,
          changePass
        );
      }
    };
    crypto.pbkdf2(
      oldpassword,
      user.salt, // salt
      310000, // iterations
      32, // keylen
      "sha256", // digest
      matchOldPass
    );
  } catch (error) {
    res.status(400).json({message:error.message, error});
  }
};
