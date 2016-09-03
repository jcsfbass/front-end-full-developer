const fs = require('fs');
const path = require('path');
const mongodb = require('mongodb');
const mongoClient = mongodb.MongoClient;
const ObjectId = mongodb.ObjectId;

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
	},
	solicitacoes: (req, res) => {
		if (req.session.user) {
			mongoClient.connect(MONGODB_URI, (err, db) => {
				const usuarios = db.collection('usuarios');
				usuarios.find({'_id': new ObjectId(req.session.user.id)}).toArray((err, docs) => {
					let solicitacoes = docs[0].solicitacoes;

					if (!solicitacoes) solicitacoes = [];

					if (solicitacoes.length === 0) {
						res.json([]);
						return;
					}

					const query = solicitacoes.map(solicitacao => {
						return {'_id': new ObjectId(solicitacao)};
					});

					usuarios.find({$or: query}).toArray((err, docs) => {
						res.json(docs);
					});

				});
			});
		} else {
			res.json([]);
		}
	}
};

module.exports = UsuarioController;