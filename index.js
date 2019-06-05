const fs = require("fs")
const path = require("path")
const fetch = require("node-fetch")
const youtubedl = require("youtube-dl")
const Youtube = require("youtube-video-api")
require("dotenv").config()
const youtube = Youtube({
    video: {
        part: "status,snippet"
    }
})

const apiKey = process.env.YOUTUBE_API_KEY

const channelID = "UCD1z-dZ1ZNyk8wca31_DxIA"
let videos = []
let downloaded = 0

async function fetchYoutubeVideos(channel) {
    let nextPageToken


    process.stdout.write("Searching for channel...")
    
    const uploads = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channel}&key=${apiKey}`)
        .then(response => response.json())
        .then(response => response.items[0].contentDetails.relatedPlaylists.uploads)

    process.stdout.clearLine()
    process.stdout.cursorTo(0)
    process.stdout.write("Downloading...\n")
        const playlistResponse = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&maxResults=5&playlistId=${uploads}&key=${apiKey}`)
        .then(response => response.json())
    
    const videoCount = playlistResponse.pageInfo.totalResults
    const maxResults = playlistResponse.pageInfo.resultsPerPage
    const requests = Math.floor(videoCount / maxResults)
    nextPageToken = playlistResponse.nextPageToken
    playlistResponse.items.forEach(item => videos.push(item.contentDetails.videoId))
    process.stdout.write(`${0} / ${videoCount}`)
    await videos.forEach(video => {
        let vid = youtubedl(`http://youtube.com/watch?v=${video}`)
        vid.on("info", info => {
            process.stdout.clearLine()
            process.stdout.cursorTo(0)
            process.stdout.write(`${++downloaded} / ${videoCount}`)
            vid.pipe(fs.createWriteStream(`./songs/${info._filename}.mp3`))
        })
    })
    videos = []
    for (let i = 0; i < requests; i++) {
        const response = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&maxResults=5&playlistId=${uploads}&pageToken=${nextPageToken}&key=${apiKey}`)
        .then(res => res.json())
        nextPageToken = response.nextPageToken
        response.items.forEach(item => videos.push(item.contentDetails.videoId))

        await videos.forEach(video => {
            let vid = youtubedl(`http://youtube.com/watch?v=${video}`)
            vid.on("info", info => {
                process.stdout.clearLine()
                process.stdout.cursorTo(0)
                process.stdout.write(`${++downloaded} / ${videoCount}`)
                vid.pipe(fs.createWriteStream(`./songs/${info._filename}.mp3`))
            })
        })
        videos = []
    }
    
    // for (let i = 0; i < 10; i++) {
    //     let vid = youtubedl(`http://youtube.com/watch?v=${videos[i]}`)
    //     let videoName
    //     vid.on("info", info => {
    //         console.log(`Downloading ${info._filename}`)
    //         videoName = `${info._filename}.mp3`
    //         vid.pipe(fs.createWriteStream(`${videoName}.mp3`))
    //     })
    // }
}

fetchYoutubeVideos(channelID)