const TextConfig=require("./text.js");
const BotConfig=require("./config.js");
const KeyConfig=require("./keyword.js");
var linebot = require('linebot');
const line = require('@line/bot-sdk');
var pttCrawler = require('pttCrawler');

// bot.broadcast("全域廣播!");
var girlsURL=[];
pttCrawler.crawler( 'Beauty', 0, 3, function (result) {
  for(let i=0;i<result.length;i++)
  {
    if(result[i].pictures.length!=0)
    {
        for(let j=0;j<result[i].pictures.length;j++)
        {
            girlsURL.push(result[i].pictures[j]);
        }
    }
  }
  console.log("美女圖網址爬蟲完成");
});

const client = new line.Client({
  channelAccessToken: BotConfig.channelAccessToken
});

// 用於辨識Line Channel的資訊
const bot = linebot({
  channelId: BotConfig.channelId,
  channelSecret: BotConfig.channelSecret,
  channelAccessToken: BotConfig.channelAccessToken
});

bot.on('message', function (event) {
    console.log("\n");
    console.log("-------new message----------");
    // 收到訊息的內容
    let getText=event.message.text;
    console.log(getText);
    //可能只傳貼圖
    if(typeof getText === 'undefined')
        return;
    else if(getText.split('#').length==1)
    {
        //提到特定關鍵字說話
        for (let it in KeyConfig.chatKeyWord) {
            if(getText.indexOf(it)!=-1)
            {
                event.reply(KeyConfig.chatKeyWord[it]);
                return;
            }
        }
        
        //聊天內容提到貓才會出來說話
        if(getText.indexOf("貓")!=-1)
            event.reply(TextConfig.chat[Math.floor(Math.random()*TextConfig.chat.length)+0]);

        if(getText=="指令")
            event.reply(TextConfig.commandList);
        else if(KeyConfig.getGirlKey[getText])
        {
            if(girlsURL.length==0)
                event.reply("妹子圖準備中請稍後再試~");
            else
            {
                let randGirlURL=girlsURL[Math.floor(Math.random()*girlsURL.length)+0];
                event.reply({
                    "type": "image",
                    "originalContentUrl": randGirlURL,
                    "previewImageUrl": randGirlURL
                })
            }
        }
        else if(KeyConfig.getBoy[getText])
        {
            let URL=TextConfig.boysImage[Math.floor(Math.random()*TextConfig.boysImage.length)+0];
            event.reply({
                "type": "image",
                "originalContentUrl": URL,
                "previewImageUrl": URL
            })
        }
        else if(KeyConfig.getQQN[getText])
        {
            let URL=TextConfig.qqnImage[Math.floor(Math.random()*TextConfig.qqnImage.length)+0];
            event.reply({
                "type": "image",
                "originalContentUrl": URL,
                "previewImageUrl": URL
            })
        }
        else if(KeyConfig.getjiLiao[getText])
        {
            let URL=TextConfig.jiLiao[Math.floor(Math.random()*TextConfig.jiLiao.length)+0];
            event.reply({
                "type": "image",
                "originalContentUrl": URL,
                "previewImageUrl": URL
            })
        }
    }
    else
    {//有人下了指令
        console.log("執行指令",getText.split("#")[1])
        if(getText.split("#")[1]=="指令")
        {
            event.reply(TextConfig.commandList).then(function (data) {
                // 當訊息成功回傳後的處理
                
            }).catch(function (error) {
                // 當訊息回傳失敗後的處理
            });
        }
        else if(getText.split("#")[1]=="叫我")
        {
            try{
                if(
                    typeof getText.split("#")[2]==='undefined' ||
                    typeof getText.split("#")[3]==='undefined'
                )
                    throw "error";
                
                setTimeout(()=>{
                    event.reply(getText.split("#")[2]);
                }, parseInt(getText.split("#")[3])*1000*60)
                event.reply(`主人收到!\n我將於 ${getText.split("#")[3]} 分鐘後叫您~`);
            }
            catch(e)
            {
                event.reply("指令錯誤，格式是 #叫我#內容#幾分鐘後");
            }
        }
        else if(getText.split("#")[1]=="洗頻")
        {
            let sendID;
            if(typeof event.source.groupId==='undefined')
                sendID=event.source.userId;
            else
                sendID=event.source.groupId;
            try{
                if(
                    typeof getText.split("#")[2]==='undefined' ||
                    typeof getText.split("#")[3]==='undefined'
                )
                    throw "error";

                for(let i=0;i<parseInt(getText.split("#")[3]);i++)
                {
                    setTimeout(()=>{
                        client.pushMessage(sendID, {
                            type: 'text',
                            text: getText.split("#")[2]
                        })
                    },i*200);
                }
            }
            catch(e)
            {
                client.pushMessage(sendID, 
                {
                    type: 'text',
                    text: '洗頻指令錯誤，格式為#洗頻#內容#次數'
                });
            }
        }
        else if(getText.split("#")[1]=="除錯")
        {
            console.log(event);
            event.reply(JSON.stringify(event));
        }
        else
        {
            event.reply("無此類型指令");
        }
    }
});



// Bot所監聽的webhook路徑與port
bot.listen('/linewebhook', 3000, function () {
    console.log('[BOT已準備就緒]');
});