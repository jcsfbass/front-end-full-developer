Vue.use(VueResource);

new Vue({
	el: '#chat',
	data: {
		novaMensagem: ''
	},
	ready: function() {
		this.getMensagens();
		
		var vueInstance = this;
		setInterval(function(){
			vueInstance.getMensagens();
		}, 1000);
	},
	methods: {
		enviar: function() {
			this.$http.post('/mensagens/' + this.getId(), {texto: this.novaMensagem}).then(function(response) {
				this.novaMensagem = '';
				this.$set('mensagens', response.data.mensagens);
			});
		},
		getMensagens: function() {
			this.$http.get('/mensagens/' + this.getId()).then(function(response){
				this.$set('mensagens', response.data);
			});
		},
		getId() {
			return document.URL.split('/').slice(-1).pop();
		}
	}
});