const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const multiparty = require('connect-multiparty');
const session = require('express-session');

const HomeController = require('./controllers/home');
const LoginController = require('./controllers/login');
const UsuarioController = require('./controllers/usuario');
const ChatController = require('./controllers/chat');

app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(session({
	secret: 'jedi',
	resave: false,
	saveUninitialized: false
}));

const authenticatePage = (req, res, next) => {
	if (req.session.user) next();
	else res.redirect('/');
};

const authenticateRequest = (req, res, next) => {
	if (req.session.user) next();
	else res.json([]);
};

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.get('/', (req, res) => HomeController.home(req, res));

app.post('/login', (req, res) => LoginController.login(req, res));
app.get('/logout', (req, res) => LoginController.logout(req, res));

app.post('/cadastrar', multiparty(), (req, res) => UsuarioController.create(req, res));
app.get('/solicitacoes', authenticateRequest, (req, res) => UsuarioController.solicitacoes(req, res));
app.get('/amigos', authenticateRequest, (req, res) => UsuarioController.amigos(req, res));
app.get('/pessoas', authenticateRequest, (req, res) => UsuarioController.pessoas(req, res));

app.get('/postagens', authenticateRequest, (req, res) => UsuarioController.postagens(req, res));
app.post('/postagens', authenticateRequest, (req, res) => UsuarioController.createPostagem(req, res));

app.get('/solicitar/:id', authenticateRequest, (req, res) => UsuarioController.solicitar(req, res));
app.get('/aceitar/:id', authenticateRequest, (req, res) => UsuarioController.aceitar(req, res));

app.get('/conversar/:id', authenticatePage, (req, res) => ChatController.chat(req, res));
app.post('/mensagens/:id', authenticateRequest, (req, res) => ChatController.addMensagem(req, res));
app.get('/mensagens/:id', authenticateRequest, (req, res) => ChatController.mensagens(req, res));

app.listen(3000, () => console.log('Aplicação escutando na porta 3000!'));
