const UsuarioRepository = require('../repositories/usuario');
const usuarioRepository = new UsuarioRepository('mongodb://localhost:27017/jedi');

const HomeController = {
	home: (req, res) => {
		if (req.session.user) {
			usuarioRepository.findOne(req.session.user.id, usuario => {
				res.render('home', {
					nome: usuario.nome,
					imagem: `images/profile/${usuario._id}.jpg`
				});
			});
		} else res.render('cadastro-login');
	}
};

module.exports = HomeController;