// 모듈 추출
var socketio = require('socket.io');
var express = require('express');
var http = require('http');
var fs = require('fs');

const { response } = require('express');
var router = express.Router();

const mysql = require('mysql');  // mysql 모듈 로드
const { charset } = require('mime-types');
const conn = {  // mysql 접속 설정
    host: '127.0.0.1',
    port: '3306',
    user: 'node',
    password: '1234',
    database: 'nodejs'
};
var connection = mysql.createConnection(conn);
connection.connect();
var query = `SELECT * FROM seat ORDER BY seat_no*1;`; 
var seat = [];
connection.query(query, function(err, result){
    if(err){
        console.log(err);
    }
    var temp = [];
    var count = 0;
    for(var i = 0; i < result.length; i++){
        temp.push(result[i].SEAT_STATUS);
        if(0 == (result[i].SEAT_2%13)){
            if(temp.length != 1){
                seat.push(temp);
                count++;
                temp = [];
            }
        }
    }
    app.get('/seats', function(request, response, next){
        response.send(seat);
    });
});

// 웹 서버를 생성
var app = express();
var server = http.createServer(app);

// 라우트 실행
app.get('/', function(request, response, next){
    fs.readFile('theater.html', function(error, data){
        response.send(data.toString());
    });
});

// app.get('/seats', function(request, response, next){
//     response.send(seats);
// });

app.get('/updateSeat', function(request, response){
    var x = request.query.x;
    var y = request.query.y;
    var connection = mysql.createConnection(conn);
    connection.connect();
    var query = `UPDATE seat SET seat_status = '2' WHERE seat_1 = ${x} AND seat_2 = ${y};`;
    connection.query(query, function(err, result){
        if(err){
            console.log(err);
        }
        console.log("완료");
        response.send(result);
    });
    connection.end();
});

app.get('/updateSeat2', function(request, response){
    var x = request.query.x;
    var y = request.query.y;
    var connection = mysql.createConnection(conn);
    connection.connect();
    var query = `UPDATE seat SET seat_status = '1' WHERE seat_1 = ${x} AND seat_2 = ${y};`;
    connection.query(query, function(err, result){
        if(err){
            console.log(err);
        }
        console.log("완료");
        response.send(result);
    });
    connection.end();
});

// 웹 서버
server.listen(52273, function(){
    console.log('Server Runningat http://127.0.0.1:52273');
});

// 소켓 서버를 생성 및 실행
var io = socketio.listen(server);
io.sockets.on('connection', function(socket){
    socket.on('reserve', function(data){
        seats[data.y][data.x] = 2;
        io.sockets.emit('reserve', data);
    });
});
