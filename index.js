const request = require("request");
const TelegramBot = require('node-telegram-bot-api');



// Telegram bot token
const token = '332043233:AAFze8BV20LP23fCA9EuUQmaO2CYs1T2q08';
const bot = new TelegramBot(token, {polling: true});
var group = "-238244073";
var coin_ids = ["bitcoin","ethereum","ripple", "stellar", "iota", "cardano", "monero", "neo", "stratis", "aeternity"];
bot.on('message', (msg) => {
    
    console.log(msg);
    const chatId = msg.chat.id;
    if(msg.entities && msg.entities[0].type == "bot_command"){
    	if(msg.text == "/rate" ){
    		get_rate()
    		.then(result=>{
    			
    			
    			var message = parse_msg(result);
    			bot.sendMessage(chatId, message ,{parse_mode : "HTML"});
    		})
    		.catch(error=>{
	          bot.sendMessage(chatId, error);
	        })
    		
    	}
    	else{
    		ret_msg = "You can ask me about "+"/rate"
      		bot.sendMessage(chatId, ret_msg);
      		
    	}
    }
    else{
    	ret_msg = "You can ask me about "+"/rate"
      	bot.sendMessage(chatId, ret_msg);
    }
     
});
const parse_msg =(data)=>{
	trade_data = JSON.parse(data);
	var message = "Today's last trade price:\n\n";
    			
	var filteredArray  = trade_data.filter(function(array_el){
       return coin_ids.filter(function(anotherOne_el){
       		if(anotherOne_el == array_el.id){
       			message += "<b>"+array_el.name+"</b>"+":\n";
       			message += "price: $"+array_el.price_usd+"\n";
       			message += "24h change: "+array_el.percent_change_24h+"%\n\n";
       		}
          return anotherOne_el == array_el.id;
       }).length == 1
    });
	
	return message;
	
}
const get_rate =()=>{
  return new Promise(function(resolve, reject) {
  	var options = {
	    method: 'GET',
	    url: 'https://api.coinmarketcap.com/v1/ticker/'
	};

	request(options, function(error, response, body) {
	    if (error) throw new Error(error);

	    if(error) {
            reject(error)
        }
        else {
          resolve(body);
        }

	});
    // Get Ticker Info
    
  });
}

const send_updates_to_group=()=>{

	get_rate()
	.then(result=>{
		
		
		var message = parse_msg(result);
		bot.sendMessage(group, message ,{parse_mode : "HTML"});
	})
	.catch(error=>{
      bot.sendMessage(group, error);
    })
}
send_updates_to_group();

setInterval(function() {
  send_updates_to_group()
}, 1000*60*60);
