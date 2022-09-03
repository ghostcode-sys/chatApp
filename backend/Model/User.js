const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const user = new mongoose.Schema({
    name: {
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    connections:{
        type:mongoose.Schema.Types.Array
    }
})

user.pre("save",  async function (next){
    try {
        if(this.isModified("password")){
            this.password = await bcrypt.hash(this.password, 10)
        }
    } catch (error) {
        console.log("error model user : /n", error)
    }
    next()
})

const USER = mongoose.model("user", user)

module.exports = USER
