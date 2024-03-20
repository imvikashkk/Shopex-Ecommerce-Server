import mongoose from "mongoose";

export const connectDataBase = async function (DATABASE_URL){
    try{
        await mongoose.connect(DATABASE_URL);
        console.log("Database Successfully Connected !!")
    }catch(error){
        console.log({error})
    }
}