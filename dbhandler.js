var sqlite3 = new require('sqlite3').verbose();
// database use
var db =  new sqlite3.Database('db/project', (err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Connected to the project SQlite database.');
  });

// login verification
exports.verify = function(username, password, callback){
    var status = false;
    db.all("SELECT * FROM users", function(err,rows){
        if(err) return callback(err);
        rows.forEach(function (row) {
            if(username==row.username&&password==row.password){
                status=true;
                return callback(null, true);     
            }
        }); 
        if(!status)
        return callback(null, false);
    });
}

// registration
exports.register = function(username, email, password, callback){
    user  = {
        $username: username,
        $email: email,
        $password: password
    }
    db.run(`INSERT INTO "users" (username,email,password) VALUES($username, $email, $password)`, user, function(err) {
        if (err) {
          return callback(err, false);
        }
        return callback(null, true);
    });
}

// verfying email
exports.verifyEmail = function(email, callback){
    var status = false;
    db.all("SELECT * FROM users", function(err,rows){
        if(err) return callback(err);
        rows.forEach(function (row) {
            if(email==row.email){
                status=true;
                console.log(email);
                return callback(null, true);     
            }
        }); 
        if(!status)
        return callback(null, false);
    });
}
// verifying username
exports.verifyUsername = function(username, callback){
    var status = false;
    db.all("SELECT * FROM users", function(err,rows){
        if(err) return callback(err);
        rows.forEach(function (row) {
            if(username==row.username){
                status=true;
                console.log(username);
                return callback(null, true);     
            }
        }); 
        if(!status)
        return callback(null, false);
    });
}

// storing hash
exports.hashStore = function(email,hashkey,expire, callback){
    var status = false;
    user  = {
        $email: email,
        $hashkey: hashkey,
        $expire: expire
    }
    db.run(`INSERT INTO "forgotpassword" (email,hashkey,expire) VALUES($email, $hashkey, $expire)`, user, function(err) {
        if (err) {
          return callback(err, false);
        }
        return callback(null, true);
    });
}

// verifying token
exports.verifyToken = function(token,tstamp, callback){
    status=false;
    db.all("SELECT * FROM forgotpassword", function(err,rows){
        if(err) return callback(err);
        rows.forEach(function (row) {
            if(token==row.hashkey&&(tstamp-row.expire)<=36000){
                status=true;
                console.log(row.expire);
                console.log(tstamp-row.expire>3600000);
                return callback(null, true);     
            }
        }); 
        user = {
            $token: token
        }
        if(!status){
            db.run(`DELETE from forgotpassword WHERE hashkey = $token`,user, function(err){
                if(err)
                return callback(err);
            });
            console.log("deleting");
            return callback(null, false);
        }
    });
}

// change password
exports.changePassword = function(token, password, callback){
    status=false;
    var email;
    db.all("SELECT * FROM forgotpassword", function(err,rows){
        if(err) return callback(err);
        rows.forEach(function (row) {
            if(token==row.hashkey){
                email = row.email
                console.log(email);
                user = {
                    $email: email,
                    $password: password
                }
                db.run(`UPDATE users SET password = $password WHERE email = $email`, user, function(err){
                    if(err)
                    return callback(err);
                });
                tokenuser = {
                    $token: token
                }
                db.run(`DELETE from forgotpassword WHERE hashkey = $token`,tokenuser, function(err){
                    if(err)
                    return callback(err);
                });
                return callback(null, email);     
            }
        }); 
    });
}

// getting userdetails
exports.getDetails = function(username, callback){
    user = {
        $username:username
    }
    console.log("sqlite query reached");
    list = [];
    list1 = [];
    list2 = [];
    db.all(`SELECT * FROM pboard WHERE username = $username`, user, function(err,rows){
        if(err) return callback(err);
        rows.forEach(function (row) {
            list1.push(row.boardname);
        }); 
        db.all(`SELECT * FROM team WHERE membername = $username`, user, function(err,rows){
            if(err) return callback(err);
            rows.forEach(function (row) {
                console.log(row.teamname);
                list2.push(row.teamname);
            }); 
            list.push({
                boardname:list1.length>0?list1:null
            });
            list.push({
                teamname:list2.length>0?list2:null
            });
            return callback(null, list);
        });
    });
}

// create a personal board
exports.createPboard = function(name, username, callback){
    user = {
        $name: name,
        $username:username
    }
    console.log("sqlite query reached");
    db.all(`INSERT into pboard(username, boardname) VALUES($username,$name)`, user, function(err,rows){
        if(err) return callback(err);
        callback(null, "created!");
    });
}

// creating team board
exports.createTboard = function(name, des, username, callback){
    user = {
        $name: name,
        $username:username,
        $des:des
    }
    console.log("sqlite query reached");
    db.all(`INSERT into teamDetail(username, teamname, des) VALUES($username,$name,$des)`, user, function(err,rows){
        if(err) return callback(err);
        user1 = {
            $name:name,
            $username:username
        }
        db.all(`INSERT into team(teamname, membername) VALUES($name,$username)`, user1, function(err,rows){
            if(err) return callback(err);
            callback(null, "created!");
        });
        // callback(null, "created!");
    });
}
// adding personal list
exports.Plistadd = function(name, boardname, username, callback){
    user = {
        $name: name,
        $username:username,
        $boardname:boardname
    }
    console.log("sqlite query reached, plist add");
    db.all(`INSERT into pboardlist(pname, list, username) VALUES($boardname,$name,$username)`, user, function(err,rows){
        if(err) return callback(err);
        callback(null, "created!");
    });
}
// adding team list
exports.Tlistadd = function(name, boardname, username, callback){
    user = {
        $name: name,
        $username:username,
        $boardname:boardname
    }
    console.log("sqlite query reached, tlist add");
    db.all(`INSERT into tboard(teamname, list, username) VALUES($boardname,$name,$username)`, user, function(err,rows){
        if(err) return callback(err);
        callback(null, "created!");
    });
}

// db.close causes issues hence db is supposed to be opened again and again