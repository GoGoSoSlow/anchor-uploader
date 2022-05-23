
const fs = require('fs');
const puppeteer = require('puppeteer');
function GetEnvironmentVar(varname, defaultvalue) {
    var result = process.env[varname];
    if (result != undefined)
        return result;
    else
        return defaultvalue;
}
const anchor_email=process.env.EMAIL;
const anchor_pw=process.env.PASSWORD;
const path='/rnf/';
const UPLOAD_TIMEOUT = 60 * 25 * 1000; //25mins
//const saveDraftOrPublishButtonXPath = '//button/div[text()="Publish now"]';
const isExplicit = true;
const draftMode = GetEnvironmentVar('SAVE_AS_DRAFT', 'false')
const saveDraftOrPublishButtonXPath = draftMode == 'true' ? '//button[text()="Save as draft"]' : '//button/div[text()="Publish now"]'
const selectorForExplicitContentLabel = isExplicit == 'true' ? 'label[for="podcastEpisodeIsExplicit-true"]' : 'label[for="podcastEpisodeIsExplicit-false"]';
const starttime=Date.now();
var numfiles=0;

(async () => {
	try {
		let files = await fs.readdirSync(path);
		const event = new Date();
		console.log(event.toTimeString());
		for (let file of files) {
			
			numfiles++;
			const live = process.env.LIVE;
			//console.log(live);
			if (process.env.LIVE=='true'){
				await doUpload(file);
			}else{
				await doNothing(file);
			}
			const eventtime = new Date();
			const elapsed = fancyTimeFormat((Date.now()-starttime)/1000);
			const avg = fancyTimeFormat(((Date.now()-starttime)/1000)/numfiles);
			console.log(eventtime.toTimeString());
			//console.log(fancyTimeFormat(Date.now()/1000));
			console.log('Finished '+numfiles+' files in '+elapsed+' secs AVG: '+avg);
		}
	} catch (err) {
      console.log(`${err}`);
    }
	
	
})()
async function doNothing(file) {
	console.log('did nothing to: '+file);
	console.log(process.env.REGEX_FOR_TITLES);
	const title = file.replace(new RegExp(process.env.REGEX_FOR_TITLES),"");
	console.log("title: "+title);
	return new Promise((resolve, reject) => resolve("yay"));
}
async function doUpload(file) {
	//do stuff
	console.log('uploading '+file)
	
	//line below is a little faster
	//const browser = await puppeteer.launch({ args: ['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage','--disable-accelerated-2d-canvas','--no-first-run','--no-zygote','--disable-gpu'] });
	const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
	const page = await browser.newPage();
	const title = file.replace(process.env.REGEX_FOR_TITLES,"");
	console.log("title: "+title);
	const navigationPromise = page.waitForNavigation();

	await page.goto('https://anchor.fm/dashboard/episode/new');

	await page.setViewport({ width: 1600, height: 789 });

	await navigationPromise;
	
	console.log("Trying to log in");
	await page.type('#email', anchor_email);
	await page.type('#password', anchor_pw);
	await page.click('button[type=submit]');
	await navigationPromise;
	console.log("Logged in");

	await page.waitForSelector('input[type=file]');
	console.log("Uploading audio file");
	const inputFile = await page.$('input[type=file]');
	await inputFile.uploadFile(path+file);

	console.log("Waiting for upload to finish");
	await page.waitForTimeout(25 * 1000);//25 sec wait to avoid problem, will also wait on line below

	await page.waitForXPath('//div[contains(text(),"Save")]/parent::button[not(boolean(@disabled))]', { timeout: UPLOAD_TIMEOUT });
	const [saveButton] = await page.$x('//div[contains(text(),"Save")]/parent::button[not(boolean(@disabled))]');
	await saveButton.click();
	await navigationPromise;

	console.log("-- Adding title");
	await page.waitForSelector('#title', { visible: true });
	// Wait some time so any field refresh doesn't mess up with our input
	await page.waitForTimeout(2000);
	await page.type('#title', file);
	//await page.type('#title', title);
	
	console.log("-- Adding description");
	await page.waitForSelector('div[role="textbox"]', { visible: true });
	await page.type('div[role="textbox"]', file);

	console.log("-- Selecting content type")
	await page.waitForSelector(selectorForExplicitContentLabel, { visible: true})
	const contentTypeLabel = await page.$(selectorForExplicitContentLabel)
	await contentTypeLabel.click()


	console.log("-- Publishing");
	const [button] = await page.$x(saveDraftOrPublishButtonXPath);

	// If no button is found using label, try using css path
	if (button) {
		await button.click();
	}
	else {
		await page.click('.styles__button___2oNPe.styles__purple___2u-0h.css-39f635');
	}

	await navigationPromise;
	
	await browser.close();
	return new Promise((resolve, reject) => resolve("yay"));
}
function fancyTimeFormat(duration)
{   
    // Hours, minutes and seconds
    var hrs = ~~(duration / 3600);
    var mins = ~~((duration % 3600) / 60);
    var secs = ~~duration % 60;

    // Output like "1:01" or "4:03:59" or "123:03:59"
    var ret = "";

    if (hrs > 0) {
        ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
    }

    ret += "" + mins + ":" + (secs < 10 ? "0" : "");
    ret += "" + secs;
    return ret;
}