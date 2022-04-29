const { io } = require('../server');
const {Usuarios} = require('../classes/usuarios');
const {crearMensaje} = require('../utilidades/utilidades');

const usuarios = new Usuarios();

io.on('connection', (client) => {

    client.on('entrarChat', (data, callback) => {

        if(!data.nombre || !data.sala) {
            return callback({
                error: true,
                mensaje: 'El nombre/sala es necesario.'
            });
        }

        // Linea de codigo para unirte a una sala:
        client.join(data.sala);

        usuarios.agregarPersona(client.id, data.nombre, data.sala);
        

            client.broadcast.to(data.para).emit('listaPersonas', usuarios.getPErsonasPorSala(data.sala));
            client.broadcast.to(data.para).emit('crearMensaje', crearMensaje('Administrador',`${data.nombre} abandono el chat.` ));

        callback(usuarios.getPErsonasPorSala(data.sala));
    });


    client.on('crearMensaje', (data, callback) =>{

        let persona = usuarios.getPersona(client.id);

        let mensaje = crearMensaje(persona.nombre, data.mensaje);
        client.broadcast.to(persona.para).emit('crearMensaje', mensaje);
        callback(mensaje);
    });


    client.on('disconnect', () =>{

        let personaBorrada = usuarios.borrarPersona(client.id);

        client.broadcast.to(personaBorrada.para).emit('crearMensaje', crearMensaje('Administrador',`${personaBorrada.nombre} abandono el chat.` ));
        client.broadcast.to(personaBorrada.para).emit('listaPersonas', usuarios.getPErsonasPorSala(personaBorrada.sala));

    });


    // Mensajes Privados:

    client.on('mensajePrivado', data =>{

        let persona = usuarios.getPersona(client.id);
        client.broadcast.to(data.para).emit('mensajePrivado', crearMensaje(persona.nombre, data.mensaje));
    });

});