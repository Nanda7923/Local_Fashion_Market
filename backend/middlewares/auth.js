const admin = require('firebase-admin');
const { initializeApp, cert, getApps } = require("firebase-admin/app");
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const fireBaseAdminConfig = {
    type : process.env.FB_TYPE ,
    project_id : process.env.FB_PROJECT_ID,
    private_key_id : process.env.FB_PRIVATE_KEY_ID,
    private_key : process.env.FB_PRIVATE_KEY.replace(/\\n/g, "\n"),
    client_email : process.env.FB_CLIENT_EMAIL,
    client_id : process.env.FB_CLIENT_ID,
    auth_uri : process.env.FB_AUTH_URI,
    token_uri : process.env.FB_TOKEN_URI,
    auth_provider_x509_cert_url : process.env.FB_AUTH_PROVIDER_X509_cert_url,
    client_x509_cert_url : process.env.FB_CLIENT_X509_cert_url,
    universe_domain : process.env.FB_Universe_Domain,
}

if (getApps().length === 0) {
    admin.initializeApp({
        credential: cert(fireBaseAdminConfig)
    });
}

async function verify(req, res, next){
    console.info(`[CART_DIAG] request=${req.requestId} middleware=verify entered`);

    let authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith('Bearer ')) {
        console.info(`[CART_DIAG] request=${req.requestId} middleware=verify exited status=401`);
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }
    let token = authorization.substring("Bearer ".length);
        try{
            try{
                let payload = jwt.verify(token, process.env.TOKEN_SECRET);
                if (payload.userId) {
                    const user = await User.findById(payload.userId).select('role isBanned');
                    if (!user) {
                        return res.status(401).json({ message: "Unauthorized: Account not found" });
                    }
                    if (user.isBanned) {
                        return res.status(403).json({ message: "Your account has been banned" });
                    }
                    payload.role = user.role;
                    payload.isBanned = user.isBanned;
                }
                req.user = payload;
                console.info(`[CART_DIAG] request=${req.requestId} middleware=verify exited outcome=authenticated`);
                return next();
            }catch(err) {
                console.info(`[CART_DIAG] request=${req.requestId} middleware=verify exited status=401`);
                return res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
            }
            return res.status(401).json({ message: "Unauthorized: Invalid or expired credentials" });
        }catch(err){
            console.info(`[CART_DIAG] request=${req.requestId} middleware=verify exited status=401`);
            return res.status(401).json({ message: "Unauthorized: Invalid or expired credentials" });
        }
}

function checkRole(role){
    return async function(req, res, next){
        let user = req.user;
        if(!user){
            return res.status(403).send('Not authorized');
        }else{
            let userRole = user.role;
            if(role !== userRole){
                return res.status(403).send('Not authorized');
            }else{
                next();
            }
        }
    }
}

function checkIsBanned(allowBanned = false) {
    return async function(req, res, next) {
        console.info(`[CART_DIAG] request=${req.requestId} middleware=checkIsBanned entered`);
        const user = req.user;

        if (!user) {
            console.info(`[CART_DIAG] request=${req.requestId} middleware=checkIsBanned exited status=401`);
            return res.status(401).json({ message: 'Not authorized' });
        }

        // If banned users are not allowed and this user is banned
        if (!allowBanned && user.isBanned) {
            console.info(`[CART_DIAG] request=${req.requestId} middleware=checkIsBanned exited status=403`);
            return res.status(403).json({
                message: "Your account has been banned"
            });
        }

        console.info(`[CART_DIAG] request=${req.requestId} middleware=checkIsBanned exited outcome=allowed`);
        return next();
    };
}

module.exports = {
    verify,
    checkRole,
    checkIsBanned,
}
