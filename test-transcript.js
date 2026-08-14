const { YoutubeTranscript } = require('youtube-transcript');
YoutubeTranscript.fetchTranscript('dQw4w9WgXcQ').then(res => console.log(res.slice(0, 2)));
