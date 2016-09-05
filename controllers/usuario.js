const fs = require('fs');
const path = require('path');
const mongodb = require('mongodb');
const mongoClient = mongodb.MongoClient;
const ObjectId = mongodb.ObjectId;

const MONGODB_URI = 'mongodb://localhost:27017/jedi';

const UsuarioRepository = require('../repositories/usuario');
const usuarioRepository = new UsuarioRepository('mongodb://localhost:27017/jedi');

const UsuarioController = {
	create: (req, res) => {
		const usuario = req.body;
		usuario.posts = usuario.solicitacoes = usuario.amigos = [];

		usuarioRepository.create(usuario, doc => {
			req.session.user = {id: doc._id};

			fs.readFile(req.files.foto.path, (err, data) => {
				fs.writeFile(
					path.join(__dirname, `../public/images/profile/${doc._id}.jpg`),
					data
				);

				res.redirect('/');
			});
		});
	},
	solicitacoes: (req, res) => {
		if (req.session.user) {
			usuarioRepository.solicitacoes(req.session.user.id, solicitacoes => {
				res.json(solicitacoes);
			});
		} else res.json([]);
	},
	amigos: (req, res) => {
		if (req.session.user) {
			usuarioRepository.amigos(req.session.user.id, amigos => {
				res.json(amigos);
			});
		} else res.json([]);
	},
	pessoas: (req, res) => {
		if (req.session.user) {
			usuarioRepository.pessoas(req.session.user.id, pessoas => {
				res.json(pessoas);
			});
		} else res.json([]);
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
	},
	solicitar: (req, res) => {
		if (req.session.user) {
			mongoClient.connect(MONGODB_URI, (err, db) => {
				const usuarios = db.collection('usuarios');
				usuarios.find({'_id': new ObjectId(req.params.id)}).toArray((err, docs) => {
					let solicitacoes = docs[0].solicitacoes;
					solicitacoes.push(req.session.user.id);

					usuarios.updateOne({'_id': new ObjectId(docs[0]._id)},
					{$set: {'solicitacoes': solicitacoes}}, (err, results) => {
						db.close();

						res.json(solicitacoes);
					});
				});
			});
		} else {
			res.json([]);
		}
	},
	aceitar: (req, res) => {
		if (req.session.user) {
			mongoClient.connect(MONGODB_URI, (err, db) => {
				const usuarios = db.collection('usuarios');
				usuarios.find({'_id': new ObjectId(req.session.user.id)}).toArray((err, docs) => {
					let solicitacoes = docs[0].solicitacoes;
					let amigos = docs[0].amigos;

					let solicitacoesSet = new Set(solicitacoes);
					solicitacoesSet.delete(req.params.id);
					solicitacoes = Array.from(solicitacoesSet);

					amigos.push(req.params.id);

					let valueToUpdate = {'solicitacoes': solicitacoes, 'amigos': amigos};

					usuarios.updateOne({'_id': new ObjectId(docs[0]._id)},
					{$set: valueToUpdate}, (err, results) => {

						usuarios.find({'_id': new ObjectId(req.params.id)}).toArray((err, docs) => {
							let solicitacoes = docs[0].solicitacoes;
							let amigos = docs[0].amigos;

							let solicitacoesSet = new Set(solicitacoes);
							solicitacoesSet.delete(req.params.id);
							solicitacoes = Array.from(solicitacoesSet);

							amigos.push(req.session.user.id);

							let valueToUpdate = {'solicitacoes': solicitacoes, 'amigos': amigos};

							usuarios.updateOne({'_id': new ObjectId(req.params.id)},
							{$set: valueToUpdate}, (err, results) => {
								res.json(valueToUpdate);
								db.close();
							});
						});
					});
				});
			});
		} else {
			res.json({});
		}
	}
};

module.exports = UsuarioController;
