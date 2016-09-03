const UsuarioRepository = require('../repositories/usuario');
const usuarioRepository = new UsuarioRepository('mongodb://localhost:27017/jedi');

const LoginController = {
	login: (req, res) => {
		usuarioRepository.where({
			'email': req.body.email,
			'senha': req.body.senha
		}, docs => {
			if (docs.length === 0) res.send('Usuário não cadastrado');
			else {
				req.session.user = {id: docs[0]._id};
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