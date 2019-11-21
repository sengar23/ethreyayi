const request = require("request");
const TelegramBot = require('node-telegram-bot-api');



// Telegram bot token
const token = '332043233:AAFze8BV20LP23fCA9EuUQmaO2CYs1T2q08';
const bot = new TelegramBot(token, {polling: true});
var group = "-238244073";
const initial_inv = 2195;
const usd_rate = 67;
const holdings = [
  {
    "id":"bitcoin",
    "qty": 0.107484
  },
  {
    "id":"ethereum",
    "qty": 1.8034
  },
  {
    "id": "stellar",
    "qty": 1167.39
  },
  {
    "id": "iota",
    "qty": 128
  },
  {
    "id": "ripple",
    "qty": 310
  },
  {
    "id": "cardano",
    "qty": 295.55
  },
  {
    "id": "verge",
    "qty": 1113
  },
  {
    "id": "revolutionvr",
    "qty": 300
  }
]; 
const my_chat_id = "120301453";

var coin_ids = ["bitcoin","bitcoin-cash", "ethereum", "litecoin", "ripple", "stellar", "iota", "cardano", "monero", "neo", "stratis", "aeternity", "verge", "revolutionvr"];
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
      else if(msg.text == "/2332" ){
        get_rate()
        .then(result=>{
          
          
          var message = get_portfolio(result);
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
	var trade_data = JSON.parse(data);
	var message = "Today's last trade price:\n\n";
    			
	var filteredArray  = trade_data.filter(function(array_el){
       return coin_ids.filter(function(anotherOne_el){
       		if(anotherOne_el == array_el.id){
            var inr_rate = array_el.price_usd*usd_rate;
            inr_rate = Math.round(inr_rate);
       			message += "<b>"+array_el.name+"</b>"+":\n";
       			message += "Price in USD: $"+array_el.price_usd+"\n";
            message += "Price in INR: ₹"+inr_rate+"\n";
            message += "Price in BTC: "+array_el.price_btc+"\n";
       			message += "24h change: "+array_el.percent_change_24h+"%\n\n";
       		}
          return anotherOne_el == array_el.id;
       }).length == 1
    });
	
	return message;
	
}
const get_portfolio = (data)=>{
  var trade_data = JSON.parse(data);
  var message = "Your portfolio value:\n";
  var total = 0.0;
  var message_inner = "";
  var filteredArray  = trade_data.filter(function(array_el){
       return holdings.filter(function(anotherOne_el){
          if(anotherOne_el.id == array_el.id){
            message_inner += "<b>"+array_el.name+"</b>"+":\n";
            var t = parseFloat(anotherOne_el.qty) * parseFloat(array_el.price_usd);
            total = total + t;
            t = t.toFixed(2);
            var inr_rate = t*usd_rate;
            inr_rate = Math.round(inr_rate);
            message_inner += "Price in USD: $"+array_el.price_usd+"\n";
            message_inner += "Holding Price in USD: $"+t+"\n";
            message_inner += "Holding Price in INR: ₹"+inr_rate+"\n\n";
          }
          return anotherOne_el == array_el.id;
       }).length == 1
    });
  var percent_gain = ((total - initial_inv) / initial_inv)*100;
  percent_gain = percent_gain.toFixed(2);
  total = total.toFixed(2);
  var total_inr_rate = total*usd_rate;
  total_inr_rate = Math.round(total_inr_rate);
  message += "Total Gains: "+percent_gain+"%\n";
  message += "Total Price in USD: $"+total+"\n";
  message += "Total Price in INR: ₹"+total_inr_rate+"\n\n";
  message += message_inner;
  return message;
}
const get_rate =()=>{
  return new Promise(function(resolve, reject) {
  	var options = {
	    method: 'GET',
	    url: 'https://api.coinmarketcap.com/v1/ticker/?limit=500'
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

const send_updates_to_chat=()=>{

  get_rate()
    .then(result=>{
      
      
      var message = get_portfolio(result);
      bot.sendMessage(my_chat_id, message ,{parse_mode : "HTML"});
    })
    .catch(error=>{
        bot.sendMessage(chatId, error);
      })
}
send_updates_to_chat();

setInterval(function() {
  send_updates_to_group();
  send_updates_to_chat();
}, 6000*60*60);
