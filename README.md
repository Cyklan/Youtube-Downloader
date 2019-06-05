# Youtube Channel Downloader

Do you know that feeling? You just found a youtube channel but you're leaving on a 23h flight tomorrow.
You want to binge as much as possible.

Just use this tool! Download **every** video on their entire channel (or just certain playlists, whatever floats your boat) with only a few keyboard strokes


## How to use

1. rename `env.example` to `.env`
2. get an API key for the Youtube Data V3 API from the Google Cloud Console [Here's how](https://developers.google.com/youtube/v3/getting-started)) and place it in the `.env`-file. (
3. run `npm install`
4. run `node index.js [-c|-p] [id]`

The script will create a directory called 'videos' and download all videos into that directory.

### Arguments

```
-c      download from a channel
-p      download from a playlist

id      channel-id / playlist-id
```
