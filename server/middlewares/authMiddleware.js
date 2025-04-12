const admin = require("../firebaseAdmin.js");

const verifyFirebaseToken = async(req,res,next) => {
    const authHeader = req.headers.authorization //read token coming from client request.

    if(!authHeader || (!authHeader.startsWith("Bearer "))) return res.status(401).json({message : "No token provided!"});

    const token = authHeader.split(" ")[1] // split by space and take second param as first one is "Bearer"

    try{
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;
        next();

    }catch(error){
        console.error("Token verification failed:", error.message);
        return res.status(401).json({message : "Unauthorized!"});
    }

}

module.exports = {verifyFirebaseToken};