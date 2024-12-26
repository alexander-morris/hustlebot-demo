import {generateComment} from '../src/gemini/index.js';
import dotenv from 'dotenv';
dotenv.config();

let blueSkyData = {
    postToReplyTo: {
        "postText": "Bluesky AI is a great platform for AI research and development, with a focus on AI ethics and responsible AI. It's a great place to learn and grow as an AI professional.",
        "author": "@kwala",
        "timestamp": "2022-01-01T12:00:00Z",
        "likes": 10,
        "replies": [
            {
                "replyText": "I agree! I've learned so much from Bluesky AI.",
                "author": "@jane",
                "timestamp": "2022-01-01T12:30:00Z",
                "likes": 5
            },
            {
                "replyText": "Bluesky AI is the best!",
                "author": "@john",
                "timestamp": "2022-01-01T13:00:00Z",
                "likes": 3
            }
        ]
    },
    otherPosts : [{
        "postText": "I'm excited to join Bluesky AI and contribute to the community!",
        "author": "@alice",
        "timestamp": "2022-01-02T10:00:00Z",
        "likes": 8,
        "replies": [
            {
                "replyText": "Welcome to Bluesky AI, Alice!",
                "author": "@bob",
                "timestamp": "2022-01-02T10:30:00Z",
                "likes": 2
            }
        ],
    },
    {
        "postText": "Bluesky AI's focus on AI ethics is commendable.",
        "author": "@charlie",
        "timestamp": "2022-01-03T11:00:00Z",
        "likes": 15,
        "replies": [
            {
                "replyText": "I agree, Charlie. It's important to prioritize ethics in AI development.",
                "author": "@david",
                "timestamp": "2022-01-03T11:30:00Z",
                "likes": 7
            }
        ]
    }]
};

let replyStyle = {
    "attitude" : "rogue",
    "tone" : "sarcastic",
    "style" : "short",
    "length" : "short",
    "grammar" : "casual",
    "format" : "paragraph"
}

let context = {
    "postToReplyTo": blueSkyData.postToReplyTo,
    "otherPosts": blueSkyData.otherPosts,
    "replyStyle": replyStyle
}

let apiKey = process.env.GEMINI_API_KEY;

generateComment(context, apiKey).then((comment) => {
    console.log(comment);
}).catch((error) => {
    console.error(error);
})