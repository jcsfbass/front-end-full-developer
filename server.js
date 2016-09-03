const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const multiparty = require('connect-multiparty');
const session = require('express-session');
const mongodb = require('mongodb');
const mongoClient = mongodb.MongoClient;
const ObjectId = mongodb.ObjectId;

const HomeController = require('./controllers/home');
const LoginController = require('./controllers/login');
const UsuarioController = require('./controllers/usuario');

const MONGODB_URI = 'mongodb://localhost:27017/jedi';

app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(session({
	secret: 'jedi',
	resave: false,
	saveUninitialized: false
}));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.get('/', (req, res) => HomeController.home(req, res));

app.post('/login', (req, res) => LoginController.login(req, res));
app.get('/logout', (req, res) => LoginController.logout(req, res));

app.post('/cadastrar', multiparty(), (req, res) => UsuarioController.create(req, res));
app.get('/solicitacoes', (req, res) => UsuarioController.solicitacoes(req, res));
app.get('/amigos', (req, res) => UsuarioController.amigos(req, res));
app.get('/pessoas', (req, res) => UsuarioController.pessoas(req, res));

app.get('/postagens', (req, res) => UsuarioController.postagens(req, res));
app.post('/postagens', (req, res) => UsuarioController.createPostagem(req, res));

app.get('/solicitar/:id', (req, res) => UsuarioController.solicitar(req, res));
app.get('/aceitar/:id', (req, res) => UsuarioController.aceitar(req, res));

app.listen(3000, () => console.log('Aplicação escutando na porta 3000!'));