const ConfigDatabase = require('../config/database');
const UsuarioRepository = require('../repositories/usuario');
const usuarioRepository = new UsuarioRepository(ConfigDatabase.uri);

const LoginController = {
	login: (req, res) => {
		usuarioRepository.where({
			'email': req.body.email,
			'senha': req.body.senha
		}, usuarios => {
			if (usuarios.length === 0) res.send('Usuário não cadastrado');
			else {
				req.session.user = {id: usuarios[0]._id};
				res.redirect('/');
			}
		});
	},
	logout: (req, res) => {
		delete req.session.user;
		res.redirect('/');
	}
};

module.exports = LoginController;
