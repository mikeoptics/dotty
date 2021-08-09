
const Discord = require("discord.js")
const client = new Discord.Client()
const Web3 = require('web3')
const axios = require("axios")

let tokenAddress = "0xaadc2d4261199ce24a4b0a57370c4fcf43bb60aa";




const rpcURL = 'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'

const rpcPALM = 'https://palm-mainnet.infura.io/v3/3a961d6501e54add9a41aa53f15de99b'
const web3 = new Web3(rpcURL)
const web3PALM = new Web3(rpcPALM)


// The minimum ABI to get ERC20 Token balance
let minABI = [
  // balanceOf
  {
    "constant":true,
    "inputs":[{"name":"_owner","type":"address"}],
    "name":"balanceOf",
    "outputs":[{"name":"balance","type":"uint256"}],
    "type":"function"
  },
  // decimals
  {
    "constant":true,
    "inputs":[],
    "name":"decimals",
    "outputs":[{"name":"","type":"uint8"}],
    "type":"function"
  }
];

let contract = new web3.eth.Contract(minABI,tokenAddress);
let contractPALM = new web3PALM.eth.Contract(minABI,tokenAddress);

async function getBalance(walletAddress) {
  balance = await contract.methods.balanceOf(walletAddress).call();
  balancePALM = await contractPALM.methods.balanceOf(walletAddress).call();
  return {"eth": balance, "palm": balancePALM};
}



// 0x4bd5e7edbf3d3846e77a7042b329da3f441e8ad4

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

client.on("message", message => {
   if (message.content.startsWith('0x')) {
     getBalance(message.content).then(function (result) {
    message.reply("This address owns " + result.eth + " Tenders on ETH and " + result.palm + " on PALM" )
});
    
  }
  if (message.content.startsWith('OS ')) {
        axios.get(`https://api.opensea.io/api/v1/events?asset_contract_address=${tokenAddress}&token_id=${message.content.slice(3)}&event_type=created&limit=1`)
    .then(x => {
      try {
        let {starting_price} = x.data.asset_events[0]
        let price = starting_price/1000000000000000000

let {image_url, name, owner, token_id} = x.data.asset_events[0].asset
      console.log(x.data.asset_events[0].asset)
      message.reply(
        `**#${token_id} '${name.toUpperCase()}'**
        Owner: ${owner.user.username} [${owner.address}]
        Price: **${price} Ξ**
        ${image_url}
        `
      )
      } catch (error) {
        console.log("Doesnt exist")
        message.reply("This is not listed on Opensea")
      }
      
      
      })
   

    
  }
})


client.login(process.env['TOKEN'])
