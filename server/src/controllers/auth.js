const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");
const User = require("../models/user");
const { JWT_SECRET } = require("../utils/constants");

/*
    BELLS & WHISTLES: 
        - Refresh Token
        - Forgot Password
*/

const signUp = async (req, res) => {

    const userInfo = await User.findOne({email: req.body.email});
    
    if(userInfo){
        return res.status(403).json({
            error: 'Email is taken!'
        })
    }
    
    try {
        const user = await new User(req.body);
        await user.setPassword(req.body.password);

        const token = jwt.sign({
            _id: user._id, 
            username: user.username, 
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
        }, JWT_SECRET, {
            expiresIn: "15m"
        });
        
        return res.status(200).json({
            token,
            user: {
                _id: user._id, 
                username: user.username, 
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
            }
        })
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

const signIn = async (req, res) => {
    const {username, password} = req.body

    try {
        const user = await User.findOne({ username });
        if(!(await user.authenticate(password))){
            return res.status(401).json({
                error: "Email and password do not match"
            });
        }

        const token = jwt.sign({
            _id: user._id, 
            username: user.username, 
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
        }, JWT_SECRET, {
            expiresIn: "15m"
        })

        return res.status(200).json({
            token,
            user: {
                _id: user._id, 
                username: user.username, 
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
            }
        })
    } catch (err) {
        console.log("sign-in " + err.message);
    }

}

// ADD this as a middleware to routes you want to protect
const requireSignIn = expressJwt({
    secret: JWT_SECRET,
    userProperty: "auth",
    algorithms: ['HS256']
});

module.exports = {
    signUp,
    signIn,
    requireSignIn
}