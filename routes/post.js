// imports
express = require('express');
var router = express.Router();
var cors = require('cors');


// post requests
// testing route
router.post('/test', (req, res) =>{
    res.send("working");
});
// adding list
router.post('/addList', cors(), (req, res) => {
    const name = req.body.listname;
    const user = req.body.username;
    const type = req.body.type;
    const boardname = req.body.boardname;
    console.log("adding list for "+user+"on board"+boardname+"...");
    if(type=="team")
    db.Tlistadd(name, boardname, user, function(err, response){
        if(err){
            console.log(err);
            res.send({
                success: false,
                response:"no data"
            })
        }
        else{
            if(response.length>0){
                console.log(response);
                res.send({
                    success: true,
                    response:response
                });
            }
            else
            res.send({
                status:"no data"
            })
        }
    });
    else
    db.Plistadd(name, boardname, user, function(err, response){
        if(err){
            console.log(err);
            res.send({
                success: false,
                response:"no data"
            })
        }
        else{
            if(response.length>0){
                console.log(response);
                res.send({
                    success: true,
                    response:response
                });
            }
            else
            res.send({
                status:"no data"
            })
        }
    });
});

// creating a team board
router.post('/createTboard', cors(), (req, res) => {
    const name = req.body.name;
    const user = req.body.username;
    const des = req.body.des;
    console.log("creating board for "+user+"...");
    db.createTboard(name, des, user, function(err, response){
        if(err){
            console.log(err);
            res.send({
                success: false,
                response:"no data"
            })
        }
        else{
            if(response.length>0){
                console.log(response);
                res.send({
                    success: true,
                    response:response
                });
            }
            else
            res.send({
                status:"no data"
            })
        }
    });
});
// login verification
router.post('/login-check', cors(),(req,res) => {
    username = req.body.username;
    password = req.body.password;
    allow = false;
    console.log("verifying");
    db.verify(username,password, function(err, response){
        if(err){
            console.log(err);
            res.send({
                allow: allow
            })
        }
        else{
            allow = response;
            res.send({
                allow: allow
            });
        }
    });
});

// registration
router.post('/register', cors(),(req,res) => {
    console.log("registering");
    username = req.body.username;
    email = req.body.email;
    password = req.body.password;
    allow = false;
    db.register(username,email,password, function(err, response){
        if(err){
            console.log(err);
            res.send({
                allow: allow
            })
        }
        else{
            allow = response;
            res.send({
                allow: allow
            });
        }
    });
});

// registeration unique verification
router.post('/uniqueVerify', cors(),(req,res) => {
    console.log("verifying");
    username = req.body.username;
    email = req.body.email;
    
    allow = false;
    if(username==null)
    db.verifyEmail(email, function(err, response){
        if(err){
            console.log(err);
            res.send({
                allow: allow
            })
        }
        else{
            allow = response;
            res.send({
                allow: allow
            });
        }
    });
    else if(email==null)
    db.verifyUsername(username, function(err, response){
        if(err){
            console.log(err);
            res.send({
                allow: allow
            })
        }
        else{
            allow = response;
            res.send({
                allow: allow
            });
        }
    });
});

//forgot password
router.post('/forgot-password', cors(),(req,res) => {
    console.log("checking email");
    email = req.body.email;
    console.log(email);
    async.waterfall([
        function(done){
            crypto.randomBytes(20, function(err, buf){
                var token = buf.toString('hex');
                // console.log(token);
                done(err, token);
            });
        },
        function(token, done){
            db.verifyEmail(email, function(err, response){
                if(err){
                    console.log(err);
                    res.send({
                        allow: false
                    });
                }
                if(!response)
                res.send({
                    allow: false
                });
                expire = Date.now()+3600000; //1 hour
                if(response){
                    db.hashStore(email, token, expire, function(err, res){
                        if(err)
                        // console.log(err);
                        if(res)
                        console.log("token saved");
                    });
                    done(err, token, expire);
                }
            });
        },
        function(token, done){
            var smtpTransport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'vikky.noelle@gmail.com',
                    pass: process.env.GMAILPW
                    }
                });
            var mailOptions = {
                to: email,
                from: 'vikky.noelle@gmail.com',
                subject: 'Virgo password reset',
                text: 'You are recieving this because you (or someone else) have requested the reset of the password.\n'+
                      'Please click on the following link, or paste this into your browser to complete the process.\n'+
                      'http://localhost:3000'+'/reset/'+token+'\n\n'+
                      'If you did not request this, please ignore the email.'
                };
                smtpTransport.sendMail(mailOptions, function(err){
                    console.log("mail sent.");
                    console.log(mailOptions.text);
                    done(err, 'done');
                    // res.send({
                    //     allow: true
                    // });
                });
            }], function(err){
                res.send({
                    allow: true
                });
            });
});

// token verification
router.post('/verifyToken', cors(),(req,res) => {
    console.log("verifying token");
    token = req.body.token;
    tstamp = Date.now();
    db.verifyToken(token,tstamp, function(err, response){
        if(err){
            console.log(err);
            res.send({
                allow: false
            })
        }
        else{
            res.send({
                allow: response
            });
        }
    });
});

router.post('/changePassword', cors(),(req,res) => {
    console.log("changing password");
    password = req.body.password;
    token = req.body.token;
    db.changePassword(token, password, function(err, response){
        if(err){
            console.log(err);
            res.send({
                allow: false
            })
        }
        else{
            console.log(response);
            res.send({
                allow: true,
                email: response
            });
        }
    });
});

module.exports = router;