# Anchor-uploader - An automation tool to publish your podcasts

This is a docker image that can automate uploads to anchor.fm .  It is based on [Schrodinger-Hat/youtube-to-anchorfm](https://github.com/Schrodinger-Hat/youtube-to-anchorfm) .  I am not affiliated with Anchor.fm or anyone else of consequence.
## How it works

This uses puppeteer with a headless chrome module to upload to Anchor.  WIP, and may be abandoned.  

Currently it uploads all of the files in the mounted folder in the order that readdirSync supplies them(alphabetic, at least when running this on WSL2).  It will probably freak out if there is anything besides audio files in the folder, including subdirectories.


## How can I use it?

# docker-compose.yml
	version: '3.3'
	services:
		anchor-uploader:
			volumes:
				- '/path-to-files/:/rnf'
			environment:
				- LIVE=true          		#false means no files uploaded, useful to test upload order
				- SAVE_AS_DRAFT=false		#true doesn't publish
				- REGEX_FOR_TITLES="\.[^.]*$"   #regex to remove from filename to use as title, default removed file extension
				- EMAIL=email@example.com
				- 'PASSWORD=xxx'
			image: anchor-uploader

# then
docker-compose up

If you have large episodes that fail, you may need to increase the UPLOAD_TIMEOUT in upload.js and rebuild the image.

## TODO
remove uneccesary dependencies, configurable sorting of files, testing of unusual file names, better support for slow uploads, error handling and option to abandon uploads
remove hacky stuff, reuse browser between files

# License

MIT
