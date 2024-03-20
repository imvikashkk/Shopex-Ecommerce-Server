import {Address} from "../model/Address.js"
import {User} from "../model/User.js"

export const addAddress = async (req, res) => {
    try {
      const address = req.body;
      const { id } = req.user;
      const add = new Address({...address, userId:id})
      await add.save();
      const user = await User.findByIdAndUpdate(
        id,
        { $push: { addresses: add.id } },
        { new: true }
      );
      res.status(200).json({message:"Address added successfully !",});
    } catch (error) {
      res.status(400).json(error);
    }
};

export const removeAddress = async (req, res) => {
    try {
      const { addressId} = req.body;
      const { id } = req.user;

      const user = await User.findByIdAndUpdate(
        id,
        { $pull: { addresses: addressId } },
        { new: true }
      );
      const add = await Address.findByIdAndDelete(addressId);
      res.status(200).json({message:"Your Address removed succeessfully !"});
    } catch (error) {
      res.status(400).json(error);
    }
};

export const updateAddress = async (req, res) => {
    try {
      const body = req.body;
      const add = body.address
      const {id} = req.user;
      const address = await Address.findByIdAndUpdate({_id:body.id, userId:id}, add);
      res.status(200).json({message:"Your Address updated succeessfully !",  address});
    } catch (error) {
      res.status(400).json(error);
    }
};