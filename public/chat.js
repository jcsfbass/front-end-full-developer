Vue.use(VueResource);

new Vue({
	el: '#chat',
	data: {
		novaMensagem: ''
	},
	ready: function() {
		this.$http.get('/mensagens/' + this.getId()).then(function(response){
			this.$set('mensagens', response.data);
		});
	},
	methods: {
		enviar: function() {
			this.$http.post('/mensagens/' + this.getId(), {texto: this.novaMensagem}).then(function() {
				this.novaMensagem = '';
			});
		},
		getId() {
			return document.URL.split('/').slice(-1).pop();;
		}
	}
});