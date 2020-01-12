var express= require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var mysql = require('mysql');



app.get('/Produse',function(req,resp){
  

  var con = mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "password",
      database: "MySQLSchema"
    });
    con.connect(function(err) {
      if (err) throw err;
      con.query("SELECT * FROM Produse", function (err, result, fields) {
        if (err) throw err;
        console.log(result);
        resp.send(result);
      });
    });
  
  });

server.listen(process.env.PORT||3000)
console.log("running");
app.get('/makeupsite.html', function(req, res){
  res.sendFile(__dirname + '/makeupsite.html');
});

app.get('/Produse.html/', function(req, res){
  res.sendFile(__dirname + '/produse.html');
});
app.get('/wishlist.html/', function(req, res){
  res.sendFile(__dirname + '/wishlist.html');
});
app.get('/Produs.html/', function(req, res){
  res.sendFile(__dirname + '/Produs.html');
});
app.get('/cos.html/', function(req, res){
  res.sendFile(__dirname + '/cos.html');
});
app.get('/cont.html/', function(req, res){
  res.sendFile(__dirname + '/cont.html');
});
app.get('/login.html/', function(req, res){
  res.sendFile(__dirname + '/login.html');
});
io.sockets.on('connection',function(socket){
  var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password",
    database: "MySQLSchema"
  });
  console.log('Connected');

  socket.on('disconnect',function(data){
    console.log("disconnect");
  })
  socket.on('Autentificare',function(data){
    con.connect(function(err) {
      if (err) throw err;
      con.query("SELECT * FROM Clienti WHERE email='"+data.email+"' AND parola ='"+data.parola+"'", function (err, result, fields) {
        if (err) throw err;
        if(result!="")
        io.sockets.emit('Autentificat','da');
        else io.sockets.emit('Autentificat','nu');
        //console.log(result);
        //resp.send(result);
      });
    });});
  socket.on('Cont',function(data){
    con.connect(function(err) {
      if (err) throw err;
      con.query("SELECT * FROM Clienti WHERE Email='"+data.email+"' ", function (err, result, fields) {
        if (err) throw err;
        console.log(data.email+" -"+ result);
        io.sockets.emit('ContA',result[0]);
        //console.log(result);console.log(result[0]);
        //resp.send(result);
      });
  });
    
  });
  socket.on('GetWishlist',function(data){
    con.connect(function(err) {
      if (err) throw err;
      var values=[];
      con.query("SELECT * FROM Wishlist WHERE email='"+data.email+"' ", function (err, result, fields) {
        if (err) throw err;
         console.log(result);
        for(var i=0;i<result.length;i++){
          con.query("SELECT * FROM Produse WHERE Denumire='"+result[i].produs+"' ", function (err, res, fields) {
           
            if (err) throw err;
           
            io.sockets.emit('SendWish',res);
             console.log(res);     
            

          });
                 }
        
       
      
  });
    
  });
});



socket.on('GetCos',function(data){
  con.connect(function(err) {
    if (err) throw err;
    var values=[];
    var cant=0;
    con.query("SELECT * FROM Cos WHERE email='"+data.email+"' ", function (err, result, fields) {
      if (err) throw err;
       //console.log(result);
      for(var i=0;i<result.length;i++){
        cant=result[i].cantitate;
        console.log(cant);  


        con.query("SELECT * FROM Produse WHERE Denumire='"+result[i].produs+"' ", function (err, res, fields) {
         
             io.sockets.emit('SendCos',{'object':res,"cantitate":cant});
            // console.log(result[i].cantitate);  
            // console.log(result[i].cantitate);  


          });
        }
        
        
      
});
  
});
});


socket.on('Cos',function(data){
  con.query("SELECT cantitate FROM Cos WHERE email='"+data.email+"' AND produs='"+data.produs+"'", function (err, result, fields) {
    if (err) throw err;
    //console.log(result);
    if(result==""){
  var sql="Insert into Cos ( email, produs, cantitate) VALUES(?,?,?)";
  var value=[data.email,data.produs,1];
  // con.connect(function(err){
    if(err) throw err;
    con.query(sql,value,function(err,result,fields){
      if(err) throw err;
 
      // con.end();
    //})
  })
}
else{
  var sql="Update  Cos SET cantitate=cantitate+1 where email='"+data.email+"'AND produs='"+data.produs+"'";
  con.query(sql,value,function(err,result,fields){
    if(err) throw err;
});
}
  });
});

socket.on('StergeCos',function(data){
  con.query("SELECT cantitate FROM Cos WHERE email='"+data.email+"' AND produs='"+data.denumire+"'", function (err, result, fields) {
    if (err) throw err;
    console.log(result[0].cantitate);
    if(result[0].cantitate==1){
      console.log("1");
  var sql="Delete from Cos  WHERE email='"+data.email+"' AND produs='"+data.denumire+"'";
    if(err) throw err;
    con.query(sql,function(err,result,fields){
      if(err) throw err;
  })
}
else{
  console.log("1<");

  var sql="Update  Cos SET cantitate=cantitate-1 where email='"+data.email+"'AND produs='"+data.denumire+"'";
  con.query(sql,function(err,result,fields){
    if(err) throw err;
});
}
  });
});



socket.on('StergeWishlist',function(data){
  // con.connect(function(err) {
  //   if (err) throw err;
    con.query("Delete  FROM Wishlist WHERE email='"+data.email+"' AND produs='"+data.denumire+"'", function (err, result, fields) {
      if (err) throw err;
     
//    });
});
  
});
  socket.on('GetComentarii',function(data){
    con.connect(function(err) {
      if (err) throw err;
      con.query("SELECT * FROM Comentarii WHERE produs='"+data.denumire+"' ", function (err, result, fields) {
        if (err) throw err;
        io.sockets.emit('SendComentarii',result);
        console.log(result);
        //resp.send(result);
      });
  });
    
  });

  socket.on('Produs',function(data){
    con.connect(function(err) {
      if (err) throw err;
      con.query("SELECT * FROM Produse WHERE Denumire='"+data+"' ", function (err, result, fields) {
        if (err) throw err;
        io.sockets.emit('ProdusGasit',result);
      });
  });
    
  });

  socket.on('Comanda',function(data){
    con.query("SELECT * FROM Cos WHERE email='"+data+"'", function (err, result, fields) {
    console.log(result);
    for(var i=0;i<result.length;i++){
    var sql="Insert into Comenzi ( Email, Produs, Cantitate) VALUES(?,?,?)";
    var value=[result[i].email,result[i].produs, result[i].cantitate];
      con.query(sql,value,function(err,result,fields){
        if(err) throw err;
   
    })
  }
   
  })
  var sql="Delete from Cos  WHERE email='"+data+"' ";
    con.query(sql,function(err,result,fields){
      if(err) throw err;
  })
});
  socket.on('Client',function(data){
    
    console.log(data.nume+" "+data.prenume+" "+ data.adresa+" "+ data.telefon+" "+ data.email+" "+ data.parola);
    var sql="Insert into Clienti ( Nume, Prenume, Adresa, Telefon, Email, Parola) VALUES(?,?,?,?,?,?)";
    var value=[data.nume,data.prenume, data.adresa, data.telefon, data.email, data.parola];
    con.connect(function(err){
      if(err) throw err;
      con.query(sql,value,function(err,result,fields){
        if(err) io.sockets.emit('ClientAdaugat','nu');
        else {
          io.sockets.emit('ClientAdaugat','da');
        }
   
        con.end();
      })
    })
   
  })


socket.on('Update',function(data){
  

    var sql="Update  Clienti SET Nume='"+data.nume+"', Prenume='"+data.prenume+"',Adresa='"+data.adresa+"', Telefon='"+data.telefon+"',Email=' "+data.email+"', Parola='"+data.parona+"' where Email='"+data.EmailVechi+"'AND Parola='"+data.ParolaVeche+"'";
    con.query(sql,function(err,result,fields){
      if (err) throw err;

    });
     
//    });
});

  socket.on('Wishlist',function(data){
    con.query("SELECT * FROM Wishlist WHERE email='"+data.email+"' AND produs='"+data.produs+"'", function (err, result, fields) {
      if (err) throw err;
      console.log(result);
      if(result==""){
    var sql="Insert into Wishlist ( email, produs) VALUES(?,?)";
    var value=[data.email,data.produs];
    // con.connect(function(err){
      if(err) throw err;
      con.query(sql,value,function(err,result,fields){
        if(err) throw err;
   
        // con.end();
      //})
    })
  }
  });
})


  socket.on('Comentarii',function(data){
    
    var sql="Insert into Comentarii ( nume, coment, produs) VALUES(?,?,?)";
    var value=[data.nume,data.com, data.produs];
    con.connect(function(err){
      if(err) throw err;
      con.query(sql,value,function(err,result,fields){
        if(err) throw err;
   
        con.end();
      })
    })
   
  })
});

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Pass to next layer of middleware
    next();
});

// io.on('connection',function(socket){    console.log('jgjhj');

//   socket.on("Autentificare",function(date){
//     console.log(date);
//     io.emit('Autentificat','nu');
//     //con.query("SELECT * FROM Clienti")
//   })

// });

//app.listen(port, () => console.log(`Example app listening on port ${port}!`))

// app.get('/Produse',function(req,resp){
  

// var con = mysql.createConnection({
//     host: "localhost",
//     user: "root",
//     password: "password",
//     database: "MySQLSchema"
//   });
//   con.connect(function(err) {
//     if (err) throw err;
//     con.query("SELECT * FROM Produse", function (err, result, fields) {
//       if (err) throw err;
//       console.log(result);
//       resp.send(result);
//     });
//   });

// });

