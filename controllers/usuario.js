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
			usuario.posts = usuario.solicitacoes = usuario.amigos =[];

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

					if (solicitacoes.length === 0) {
						res.json([]);
						return;
					}

					const query = solicitacoes.map(solicitacao => {
						return {'_id': new ObjectId(solicitacao)};
					});

					usuarios.find({$or: query}).toArray((err, docs) => res.json(docs));
				});
			});
		} else res.json([]);
	},
	amigos: (req, res) => {
		if (req.session.user) {
			mongoClient.connect(MONGODB_URI, (err, db) => {
				const usuarios = db.collection('usuarios');
				usuarios.find({'_id': new ObjectId(req.session.user.id)}).toArray((err, docs) => {
					let amigos = docs[0].amigos;

					if (amigos.length === 0) {
						res.json([]);
						return;
					}

					const query = amigos.map(amigo => {
						return {'_id': new ObjectId(amigo)};
					});

					usuarios.find({$or: query}).toArray((err, docs) => res.json(docs));
				});
			});
		} else res.json([]);
	},
	pessoas: (req, res) => {
		if (req.session.user) {
			mongoClient.connect(MONGODB_URI, (err, db) => {
				const usuarios = db.collection('usuarios');
				usuarios.find({}).toArray((err, docs) => {
					db.close();

					const user = docs.find(doc => doc._id == req.session.user.id);

					let amigos = user.amigos;

					const known = amigos.concat(req.session.user.id);

					const unknown = [];
					docs.forEach(doc => {
						const some = known.some(userId => doc._id == userId);

						if (!some) unknown.push(doc);
					});

					res.json(unknown);
				});
			});
		} else {
			res.json([]);
		}
	},
	postagens: (req, res) => {
		if (req.session.user) {
			mongoClient.connect(MONGODB_URI, (err, db) => {
				const usuarios = db.collection('usuarios');
				usuarios.find({'_id': new ObjectId(req.session.user.id)}).toArray((err, docs) => {
					db.close();

					res.json(docs[0].posts);
				});
			});
		} else {
			res.json([]);
		}
	},
	createPostagem: (req, res) => {
		mongoClient.connect(MONGODB_URI, (err, db) => {
			const usuarios = db.collection('usuarios');
			usuarios.find({'_id': new ObjectId(req.session.user.id)}).toArray((err, docs) => {
				const posts = docs[0].posts;
				const post = {
					texto: req.body.texto,
					data: new Date()
				};

				posts.unshift(post);

				usuarios.updateOne({'_id': new ObjectId(docs[0]._id)},
				{$set: {'posts': posts}}, (err, results) => {
					db.close();

					res.json(post);
				});
			});
		});
	}
};

module.exports = UsuarioController;