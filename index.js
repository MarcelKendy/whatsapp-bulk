const puppeteer = require('puppeteer');
const config = require('./config')
const fs = require('fs')



const start = async () => {
  // Launching puppeteer
  const browser = await puppeteer.launch({
    headless: false,
    userDataDir: './user_data'
  })
  const page = await browser.newPage()
  // Defining User Agent hehe...
  const userAgent = 'Mozilla/5.0 (X11; Linux x86_64)' +
  'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.39 Safari/537.36';
  await page.setUserAgent(userAgent);
  // Visiting WhatsApp URL
  await page.goto('http://web.whatsapp.com')
  // Waiting for your account QR CODE AUTH
  await page.waitForSelector('#app', {visible: true, timeout: 60000})
  console.log('Authenticated')
  // Getting all contacts, and splitting into an array
  let contactlist = getContact(config.contact)
  contactlist = contactlist.split(/\r?\n/)
  // Loop for each contact
  for (const contact of contactlist) {
    // Getting message
    const precontent = getContent(config.content);
    //let content = encodeURI(precontent);
    let content = precontent;
    //await page.goto('https://web.whatsapp.com/send?phone='+contact+'&text='+content)
    // Accessing api for opening a chat with that contact
    await page.goto('https://web.whatsapp.com/send?phone='+ contact);
    // Waiting the page to load, and getting the textfield id to type the message
    const inp = await page.waitForXPath('//*[@id="main"]/footer/div[1]/div/span[2]/div/div[2]/div[1]/div/div[2]', {visible: true, timeout: 60000});
    // Typing the message and sending
    await inp.type(content);
    await page.keyboard.press("Enter");
    // Waiting for the message to be sent for 5 secs
    sleep(5000);
    console.log('Sent to '+ contact)
  }
  // Closing
  console.log('We tried to reach all contacts. Still, if the conection was not stable or decent enough, some of them might not been able to receive our message.')
  browser.close()
}

// Timing functions
function sleep (milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}

function delay (delayInms) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(2);
    }, delayInms);
  });
}

// Extracting contacts from file
const getContact = (path) => {
  const contact = fs.readFileSync(path, {encoding: 'utf-8'})
  return contact;
}
// Extracting message from file
const getContent = (path) => {
  const content = fs.readFileSync(path, {encoding: 'utf-8'})
  return content;
}
// Calling the main (start) function
start();