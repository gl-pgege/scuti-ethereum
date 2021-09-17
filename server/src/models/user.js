const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");


const userSchema = mongoose.Schema({
    first_name: {
        type: String,
        trim: true,
        required: true
    },
    last_name: {
        type: String,
        trim: true,
        required: true
    },
    username: {
        type: String,
        trim: true,
        required: true
    },
    email: {
        type: String,
        trim: true,
        required: true
    },
    hashed_password: {
        type: String,
        required: true
    }
});

userSchema.virtual("password").set(async (password) => {
    this._password = password;
    this.hashed_password = "await encryptPassword(password);";
}).get(() => {
    return this._password;
});

userSchema.methods = {
    authenticate: async function(plainTextPassword) {
        try {
            const isCorrectPassword = await bcrypt.compare(plainTextPassword, this.hashed_password);
            return Promise.resolve(isCorrectPassword);  
        } catch(err){
            return Promise.reject(err);
        }            
    },
    encryptPassword: async function(password){
        const saltRounds = 10;
        
        if(!password) return "";
        try {
            const hash = await bcrypt.hash(password, saltRounds);
            return Promise.resolve(hash);
        } catch (error) {
            return Promise.reject(new Error(`encryptPassword - ${error.message}`));
        }
    },
    setPassword: async function(password) {
        try {
            this.hashed_password = await this.encryptPassword(password);
            await this.save();
            return Promise.resolve(this);
        } catch (err) {
            return Promise.reject(err)
        }
    },
}

module.exports = mongoose.model("User", userSchema);