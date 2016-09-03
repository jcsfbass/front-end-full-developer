const fs = require('fs');
const path = require('path');
const mongoClient = require('mongodb').MongoClient;

const MONGODB_URI = 'mongodb://localhost:27017/jedi';

const UsuarioController = {
	create: (req, res) => {
		mongoClient.connect(MONGODB_URI, (err, db) => {
			const usuarios = db.collection('usuarios');

			const usuario = req.body;
			usuario.posts = [];

			usuarios.insertOne(usuario, (err, result) => {
				db.close();

				req.session.user = {id: result.ops[0]._id};

				fs.readFile(req.files.foto.path, (err, data) => {
					fs.writeFile(path.join(__dirname, `../public/images/profile/${req.session.user.id}.jpg`), data);
				});

				res.redirect('/');
			});
		});
	}
};

module.exports = UsuarioController;