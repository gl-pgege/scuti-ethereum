const _ = require("lodash");
const User = require("../models/user");

const userById = (req, res, next, id) => {
    
    try {
        const user = await User.findById(id).exec();
        req.profile = user;
    } catch(error) {
        res.status(400).json({
            error: "User not found"
        })
    }
    
    next();        
}

const hasAuthorization = (req, res, next) => {
    const sameUser = req.profile && req.auth && req.profile._id === req.auth._id;
    
    if(!sameUser){
        return res.status(403).json({
            error: "User is not authorized to perform this action"
        });
    }

    next();
}

module.exports = {
    userById,
    hasAuthorization
}