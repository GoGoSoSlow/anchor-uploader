# Anchor-uploader - An automation tool to publish your podcasts

This is a docker image that can automate uploads to anchor.fm .  It is based on [Schrodinger-Hat/youtube-to-anchorfm](https://github.com/Schrodinger-Hat/youtube-to-anchorfm) .  I am not affiliated with Anchor.fm or anyone else of consequence.
## How it works

This uses puppeteer with a headless chrome module to upload to Anchor.  WIP, and may be abandoned.  

Currently it uploads all of the files in the mounted folder in the order in alphabetic order, and uses the filename as the title and description, removing text subject to a regex stored in an environment variable. It will probably fail if there is anything besides audio files in the folder, including subdirectories.


## How can I use it?

# docker-compose.yml
	version: '3.3'
	services:
		anchor-uploader:
			volumes:
				- '/path-to-files/:/rnf'
			environment:
				- LIVE=true          			#false means no files uploaded, useful to test upload order
				- SAVE_AS_DRAFT=false			#true doesn't publish
				- 'REGEX_FOR_TITLES=/\.[^.]*$$'  #NOT WORKING - regex to remove from filename to use as title, default removed file extension
				- EMAIL=email@example.com
				- 'PASSWORD=xxx'
			image: anchor-uploader

# then
docker-compose up


## TODO
Make web interface w/preview of actions and ability to abandon uploads.
remove uneccesary dependencies, configurable sorting of files, further testing of unusual file names, better support for slow uploads, error handling reuse browser between files

# License

MIT
