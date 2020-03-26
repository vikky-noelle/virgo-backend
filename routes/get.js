// imports
express = require('express');
var router = express.Router();
var cors = require('cors');

// get requests
router.get('/', (req, res) =>  {
    res.send('hello world by vikky');
});

// getting details
router.get('/getDetails', cors(), (req, res) => {
    const user = req.query.username;
    console.log("getting details for "+user+"...");
    db.getDetails(user, function(err, response){
        if(err){
            console.log(err);
            res.send({
                status:"no data"
            })
        }
        else{
            if(response.length>0){
                console.log(response);
                res.send(response);
            }
            else
            res.send({
                status:"no data"
            })
        }
    });
});

// creating a personal board
router.get('/createPboard', cors(), (req, res) => {
    const name = req.query.name;
    const user = req.query.username;
    console.log("creating board for "+user+"...");
    db.createPboard(name, user, function(err, response){
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

module.exports = router;