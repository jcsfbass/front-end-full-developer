const UsuarioRepository = require('../repositories/usuario');
const usuarioRepository = new UsuarioRepository('mongodb://localhost:27017/jedi');

const HomeController = {
	home: (req, res) => {
		if (req.session.user) {
			usuarioRepository.findOne(req.session.user.id, user => {
				res.render('home', {
					nome: user.nome,
					imagem: `images/profile/${user._id}.jpg`
				});
			});
		} else res.render('cadastro-login');
	}
};

module.exports = HomeController;