const UsuarioRepository = require('../repositories/usuario');
const usuarioRepository = new UsuarioRepository('mongodb://localhost:27017/jedi');

const UploadService = require('../services/upload');

const UsuarioController = {
	create: (req, res) => {
		const usuario = req.body;
		usuario.posts = usuario.solicitacoes = usuario.amigos = [];

		usuarioRepository.create(usuario, doc => {
			req.session.user = {id: doc._id};

			UploadService.uploadProfilePhoto(req.files.foto.path, doc._id, () => res.redirect('/'));
		});
	},
	solicitacoes: (req, res) => {
		usuarioRepository.solicitacoes(req.session.user.id, solicitacoes => {
			res.json(solicitacoes);
		});
	},
	amigos: (req, res) => {
		usuarioRepository.amigos(req.session.user.id, amigos => {
			res.json(amigos);
		});
	},
	pessoas: (req, res) => {
		usuarioRepository.pessoas(req.session.user.id, pessoas => {
			res.json(pessoas);
		});
	},
	postagens: (req, res) => {
		usuarioRepository.postagens(req.session.user.id, postagens => {
			res.json(postagens);
		});
	},
	createPostagem: (req, res) => {
		usuarioRepository.createPostagem(req.session.user.id, req.body.texto, postagem => {
			res.json(postagem);
		});
	},
	solicitar: (req, res) => {
		usuarioRepository.addSolicitao(req.params.id, req.session.user.id, solicitacoes => {
			res.json(solicitacoes);
		});
	},
	aceitar: (req, res) => {
		usuarioRepository.addAmigo(req.params.id, req.session.user.id, amigosDoAmigo => {
			usuarioRepository.addAmigo(req.session.user.id, req.params.id, amigos => {
				res.json(amigos);
			});
		});
	}
};

module.exports = UsuarioController;
