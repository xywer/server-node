//PUERTO DONDE VA A CORRER EL SERVIDOR 
//WEB SERVICES
////
//****************CORS **************
//https://github.com/expressjs/cors
// ES UN MODULO PARA PODER DAR PERMISOS
//DE ACCESO AL SERVIDOR
//Y PODER 
//***********************EXPRESS*****************
//En esta introducci�n a la programaci�n as�ncrona con Node.js 
//vamos a introducirnos en el desarrollo web con express.js. 
//  Express est� construido sobre Connect un framework extensible de 
//  manejo de servidores HTTP que provee de
//plugins de alto rendimiento conocidos como middleware.
//---------VARIABLES GLOBALES----------

var port_listen = 6969;
var port_mysql = 3306;
var puerto_io = 3000;
//----------ASIGNAR LA CONFIGURACION DE LA BDD(NOMBRE Y PUERTO Y PASS)---------
var params_bdd = {user: "pekesc5_meetclic", password: "meetclic@", host: "creativeweb.com.ec", port: port_mysql, database: "pekesc5_xywer"};
//var params_bdd = {user: "pekesc5_meetclic", password: "meetclic@", host: "creativeweb.com.ec", port: port_mysql, database: "pekesc5_lady"};
//*********************MYSQL*****************
//-------------------INIT MODULOS A UTILIZAR-------------
//MODULO DE NODE JS PARA LA CONECCION DE LA BDD DE MYSQL
var mysql = require('mysql');//para la comunicacion con la bdd 
var express = require('express')//EL ESL L ENCARGADO DE LA COMUNCION DE URLS 
        , cors = require('cors')//EL NOS FACILITA LA COMUNICACION A ESAS URLS  ACCESO A ESA URL
        , app = express();
app.use(cors());
var io = require('socket.io').listen(puerto_io);//REALIZA UN PUENTE ENTRE TU APP-SISTEMA DE GESTION ---COMUNICACION ENTRE LOS DOS HACIA TU SERVIDOR
//-------------------END MODULOS A UTILIZAR-------------

//--------CONECCCION DE LA BDD--------
var connection = mysql.createConnection(params_bdd);
//--------PERSONA----
//--------VARIABLES GLOBALES DE TABLAS--
var entidad_data_id = 1;//dond s almacenara la informacion dlos usuaiors 
//    ----TABLAS A GESTIONAR---
var cuenta_persona = "cuenta_persona";//children
var persona = "persona";//parent
app.get('/createPersonaInformacion', function (req, res, next) {
    var result = [];

    var post = req.query;
    if (!post.id) {//crear nuevo
        var phone_number = post.phone_number;
        var query_string = "SELECT * FROM  " + cuenta_persona + " t  where  t.phone_number=" + phone_number;
        var objec_conection_bdd = connection;
        var params_data = {query_string: query_string, objec_conection_bdd: objec_conection_bdd};
        getDataModel(params_data, function (data) {

            if (data.length == 0) {
                var data_save = {nombres: post.nombres, apellidos: post.apellidos, persona_genero_id: post.persona_genero_id};
                var query = connection.query('INSERT INTO ' + persona + ' SET ?', data_save, function (err, result) {
                    // Neat! 
                    var persona_id = result.insertId;
                    var data_save_children = {entidad_data_id: entidad_data_id, persona_id: persona_id, pass_user: post.pass_user, persona_genero_id: post.persona_genero_id, documento: post.documento};

                    var query2 = connection.query('INSERT INTO ' + cuenta_persona + ' SET ?', data_save_children, function (err, result) {
                        result = {
                            success: false,
                            msj: "Se Registro Correctamente."
                        };
                        res.json(result);

                    });
                });
            } else {
                result = {
                    success: false,
                    msj: "El # ya fue tomado:" + phone_number
                };
                res.json(result);

            }

        });
//        var query = connection.query('INSERT INTO ' + table_name + ' SET ?', post, function (err, result) {
//            // Neat! 
//            var data = {id: result.insertId, nombres: post.nombres, apellidos: post.apellidos, documento: post.documento}
//            res.json({success: true, data: data});
//        });
    } else {
        var queryString = 'UPDATE  persona_informacion SET nombres="' + post.nombres + '",' + 'apellidos="' + post.apellidos + '",' + 'documento="' + post.documento + '" WHERE persona_informacion.id=' + post.id;

        connection.query(queryString, function (err, result) {

            var data = {id: post.id, nombres: post.nombres, apellidos: post.apellidos, documento: post.documento}
            res.json({success: true, data: data, update: true});
        });
    }


});

app.get('/personaInformacionAll', function (req, res, next) {
//    SELECT * FROM  persona_catalogo ORDER BY id DESC
    var result;
    var query_string = "SELECT * FROM  persona_informacion";
    var objec_conection_bdd = connection;
    var params_data = {query_string: query_string, objec_conection_bdd: objec_conection_bdd};
    getDataModel(params_data, function (data) {
        console.log("obtener informacion", data);
        res.json(data);
    });
    console.log("obtener informacion");
});
//---END PERSONA--
connection.connect(function (err) {
    if (err) {
        console.log('Error connecting to Db');
        return;
    } else {

        console.log('Connection established');
    }

});



app.listen(port_listen, function () {
    console.log('CORS-enabled web server listening on port ' + port_listen);
});
app.get('/api', function (req, res) {
    res.send('Admin Homepage');
});
//-------NEWS--------
var server_user = [];
var clients = [];
var group_leader = [];
//--------------------------SOCKET--------
io.on('connection', function (socket) {
    console.log("ntro al sokec");
//    ---persona agregada--
    socket.on("persona_informacion", function (data) {
        console.log("agregar personas");
        io.emit("persona_informacion_add", data);
    });

//  -----------------NEW--------------
    //esto sirve para emitir
    io.emit('user_connection', socket.id);
    io.emit("server_user", server_user);

    socket.on("set_data", function (data) {
        console.log("usuario enviando front", data);
    });


});
function getDataModel($params, callback) {
    var result;
    var query_string = $params.query_string;
    var objec_conection_bdd = $params.objec_conection_bdd;
    objec_conection_bdd.query(query_string, function (err, rows, fields) {
        if (err) {
            throw err;
        }
        // Pass the message list to the view
        else {
            console.log("primero informacion");
            result = rows;
            callback(result);
        }
    });
    return result;
}