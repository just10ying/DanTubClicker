var Constants = {
	// Server Constants:
	ServerConstantLoadComplete: '[INFO] Server successfully loaded constants.',
	MongoUserDataCollection: 'user_data',
	MongoDbURL: 'mongodb://localhost:27017/dantub',
	ServerHttpPort: 8081,
	
	// Client Constants:
	ClientConstantLoadComplete: '[INFO] Client succesfully loaded constants.',
	GgConnectError: '[Error] could not authenticate with GgJohnLee.com servers.',
	DataRetrievalError: '[Error] could not retrieve user data at this time.',
	AutoSaveSuccess: '[INFO] Autosave successful',
	DefaultAlias: 'Guest',
	JohnLeeQuotes: [
		'"aaaaaaaaaaaahhhhhhhhhhHHHHHHHHHH" ~ John Lee',
		'"It is I, Mayro" ~ Supra Mayro',
		'"Guys where is my base" ~ John Lee',
		'"Hwyyyyyyyyyyyyyyyyyyyyy" ~ John Lee',
		'"This is the kind of fanservice I\'m opposed to" ~ John Lee',
		'"I don\'t want no birds.  Please don\'t give me any birds" ~ John Lee',
		'"Who could it be?  Believe it or not... it\'s JAHN LEE" ~ Joey',
		'"YASSSSSSSSSSS BC SURPRISE" ~ Joey'
	],
	FacebookAppId: '1598147250427698',
	QuoteRefreshInterval: 10000,
	UserInfoRefreshInterval: 10000,
	AutoSaveInterval: 10000,
	GgUpdatesPerSecond: 5,
	HomeTabNames: {
		Home: 'Home',
		Options: 'Options',
		Comments: 'Comments'
	},
	ChatModes: {
		Chat: 'chat',
		ClientInfo: 'client_info'
	},
	
	// Shared Constants:
	MessageEvents: {
		SocketIOConnect: 'connect',
		SocketIODisconnect: 'disconnect',
		FbConnect: 'fb_connect',
		ChatMessage: 'chat_message'
	},
	UserDataURL: '/server/user_data',
	ConnectedClientsURL: '/server/connected_clients',
	WebsocketPort: 8082
};

// ------------------------------------------ Generate Constants Object ------------------------------------------ //

function define(container, name, value) {
	Object.defineProperty(container, name, {
		value: value,
		enumerable: true
	});
}

if (typeof exports === 'undefined') {
	console.log(Constants.ClientConstantLoadComplete);
}
else {
	for (var key in Constants) {
		define(exports, key, Constants[key]);
	}
}