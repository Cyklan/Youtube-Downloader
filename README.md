# youtube-downloader

## How to use

1. rename `env.example` to `.env`
2. get an API key for the youtube data v3 api and place it in the `.env`-file
3. run `npm install`
4. run `node index.js [-c|-p] [id]`

The script will create a directory called 'videos' and download all videos into that directory.

### Arguments

```
-c      download from a channel
-p      download from a playlist

id      channel-id / playlist-id
```
