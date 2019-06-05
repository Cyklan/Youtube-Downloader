const fs = require("fs")
const path = require("path")
const fetch = require("node-fetch")
const youtubedl = require("youtube-dl")
require("dotenv").config()

const apiKey = process.env.YOUTUBE_API_KEY

let downloaded = 0
let nextPageToken
let requests = 0
let videoCount
let videos = []

function checkForDirectory() {
    if (fs.existsSync("./videos")) return;
    console.log("Creating directory 'videos'")
    fs.mkdirSync("./videos")
}

async function getChannelUploads(channelID) {
    process.stdout.write("Searching for channel...")
    
    const uploads = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelID}&key=${apiKey}`)
    .then(response => response.json())
    .then(response => response.items[0].contentDetails.relatedPlaylists.uploads)
    return uploads
}

async function getNextVideos(playlistId) {
    const response = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&maxResults=5&playlistId=${playlistId}&pageToken=${nextPageToken}&key=${apiKey}`)
    .then(res => res.json())
    nextPageToken = response.nextPageToken
    response.items.forEach(item => videos.push(item.contentDetails.videoId))
}

async function getNextVideo(playlistId) {
    return new Promise(async (resolve, reject) => {
        const response = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&maxResults=1&playlistId=${playlistId}&pageToken=${nextPageToken}&key=${apiKey}`)
        .then(res => res.json())
        nextPageToken = response.nextPageToken
        resolve(response.items[0].contentDetails.videoId)
    })
}

async function downloadFromChannel(channel) {
    process.stdout.write("Searching for channel...")
    playlistId = await getChannelUploads(channel)
    await downloadFromPlaylist(playlistId)
}

async function downloadFromPlaylist(playlistId) {
    const playlistResponse = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&maxResults=5&playlistId=${playlistId}&key=${apiKey}`)
    .then(response => response.json())
    
    videoCount = playlistResponse.pageInfo.totalResults
    const maxResults = playlistResponse.pageInfo.resultsPerPage
    requests = videoCount - maxResults
    nextPageToken = playlistResponse.nextPageToken
    playlistResponse.items.forEach(item => videos.push(item.contentDetails.videoId))
    process.stdout.clearLine()
    process.stdout.cursorTo(0)
    console.log(`Found ${videoCount} videos`)
    console.log("Downloading...")
    process.stdout.write(`Finished 0 / ${videoCount}`)

    downloadVideos(playlistId)
}

async function downloadVideos(playlistId) {
    await videos.forEach(video => {
        let vid = youtubedl(`http://youtube.com/watch?v=${video}`)
        vid.on("info", info => {
            vid.pipe(fs.createWriteStream(`./videos/${info._filename}.mp4`))
        })
        vid.on("end", async () => {
            process.stdout.clearLine()
            process.stdout.cursorTo(0)
            process.stdout.write(`Finished: ${++downloaded} / ${videoCount}`)
            requests--
            if (requests >= 0) {
                const videoId = await getNextVideo(playlistId)
                await downloadNextVideo(videoId)
            }
        })
    })
}

function downloadNextVideo(videoId) {
    let vid = youtubedl(`http://youtube.com/watch?v=${videoId}`)
    vid.on("info", info => {
        vid.pipe(fs.createWriteStream(`./videos/${info._filename}.mp4`))
    })
    vid.on("end", async () => {
        process.stdout.clearLine()
            process.stdout.cursorTo(0)
            process.stdout.write(`Finished: ${++downloaded} / ${videoCount}`)
            requests--
            if (requests >= 0) {
                const videoId = await getNextVideo(playlistId)
                await downloadNextVideo(videoId)
            }
    })
}

function howToUse() {
    console.log("How to use")
    console.log("node index.js [-c|-p] [id]")
    console.log("\n\t-c = download channel uploads")
    console.log("\t-p = download playlist videos")
    console.log("\n\tid = channel / playlist-id")
    process.exit(0)
}

if (process.argv.length <= 2) {
    howToUse()
}

if (process.argv.length == 3) {
    howToUse()
}

if (process.argv.length >= 5) {
    howToUse()
}

if (process.argv[2].toLowerCase() == "-c") {
    checkForDirectory()
    downloadFromChannel(process.argv[3])
} else if (process.argv[2].toLowerCase() == "-p") {
    checkForDirectory()
    downloadFromPlaylist(process.argv[3])
} else {
    howToUse()
}