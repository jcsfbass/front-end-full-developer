const fs = require('fs');
const path = require('path');

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
			usuarioRepository.postagens(req.session.user.id, postagens => {
				res.json(postagens);
			});
		} else res.json([]);
	},
	createPostagem: (req, res) => {
		if (req.session.user) {
			usuarioRepository.createPostagem(req.session.user.id, req.body.texto, postagem => {
				res.json(postagem);
			});
		} else res.json([]);
	},
	solicitar: (req, res) => {
		if (req.session.user) {
			usuarioRepository.addSolicitao(req.params.id, req.session.user.id, solicitacoes => {
				res.json(solicitacoes);
			});
		} else res.json([]);
	},
	aceitar: (req, res) => {
		if (req.session.user) {
			usuarioRepository.addAmigo(req.params.id, req.session.user.id, amigosDoAmigo => {
				usuarioRepository.addAmigo(req.session.user.id, req.params.id, amigos => {
					res.json(amigos);
				});
			});
		} else res.json([]);
	}
};

module.exports = UsuarioController;
