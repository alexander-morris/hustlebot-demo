import { AtpAgent } from '@atproto/api';
import * as dotenv from 'dotenv';
import {generateComment} from '../gemini/index.js';
import * as process from 'process';

export async function task(roundNumber) {
  // Run your task and store the proofs to be submitted for auditing
  // The submission of the proofs is done in the submission function
  console.log(`\n*** EXECUTING TASK FOR ROUND ${roundNumber} ***\n`);
  try {

    dotenv.config();

    // Create a Bluesky Agent 
    const agent = new AtpAgent({
      service: 'https://bsky.social',
    });

    await agent.login({
      identifier: process.env.BLUESKY_USERNAME,
      password: process.env.BLUESKY_PASSWORD
    });
  
    const postTransformer = (post) => {
      return {
        uri: post.uri,
        cid: post.cid,
        content: post.record.text,
        author: {
          did: post.author.did,
          displayName: post.author.displayName,
        },
      };
    };
    
    ////////////////////////////////////

    // Fetch the latest post from the KWALABot Account
    const fetchRecentPostsByAuthor = async (
      authorHandleName = 'kwalabot.bsky.social',
      limit = 3,
      feedFilter = "posts_no_replies"
    ) => {
      const authorHandle = await agent.api.com.atproto.identity.resolveHandle({
        handle: authorHandleName, // Replace with your handle
      });
    
      let kwalaFeed = await agent.api.app.bsky.feed.getAuthorFeed({
        actor: authorHandle.data.did,
        filter: feedFilter,
        limit: limit
      });
    
      let postContent = await agent.api.app.bsky.feed.getPosts({
        uris: kwalaFeed.data.feed.map(({ post }) => post.uri)
      }).then(res => res.data.posts);
    
      postContent = postContent.map(postTransformer);
      
      console.log("\n>>> POST CONTENT: ", postContent, "\n");
      return postContent;
    };

    // Extract Hashtags from an Array of Posts
    const extractHashtags = async (posts) => {
      console.log("\n>>> Extracting hashtags from all posts...\n");

      const allHashtags = posts.map(post => {
        console.log(`\n>>> Extracting hashtags from post: ${post.content}\n`);
        const hashtags = post.content.match(/#\w+/g);
        console.log("\n>>> Extracted hashtags: ", hashtags, "\n");
        return hashtags || []; // Return an empty array if no hashtags are found
      });

      // Flatten the array and remove duplicates
      const uniqueHashtags = [...new Set(allHashtags.flat())];
      console.log("\n>>> All unique hashtags extracted: ", uniqueHashtags, "\n");

      return uniqueHashtags.length > 0 ? uniqueHashtags : ["#NoHashtagFound"];
    };


    // Query Gemini with post reponse + attitude string
    // Fake Gemini Reply for Testing
    const queryGemini = async (content, attitude) => {
      console.log(`\n>>> Simulating Gemini query with content: "${content}" and attitude: "${attitude}"...\n`);
      
      let context = [
        { blueSkyData: content,
          replyStyle : { // Edit the lines below to customize how your bots behave
            "attitude" : "rogue",
            "tone" : "sarcastic",
            "style" : "short",
            "length" : "short",
            "grammar" : "casual",
            "format" : "paragraph"
        }
       }
      ];

      let apiKey = process.env.GEMINI_API_KEY;

      let comment = await generateComment(context, apiKey);

      return comment;
    };


    // Repost with comment
    const makeRepost = async (parentPost, replyText) => {
      const response = await agent.api.app.bsky.feed.post.create(
        { repo: agent.session?.did },
        {
          text: replyText, // Replace with your reply text
          reply: {
            root: {
              uri: parentPost.uri,
              cid: parentPost.cid,
            },
            parent: {
              uri: parentPost.uri,
              cid: parentPost.cid,
            },
          },
          createdAt: new Date().toISOString(),
        }
      );
    };

    // Stretch Goals (Implement Later)
    // // Search posts with the last round's Tag
    // const fetchRecentPostsByTag = async (tag = "#KoiiKwala", limit = 3) => {
    //   const posts = (await agent.api.app.bsky.feed.searchPosts({ q: tag, limit: limit })
    //     .then(res => res.data.posts))
    //     .map(postTransformer);
      
    //   return posts;
    // };

    // // Like all those posts
    // const likePost = async (post) => {
    //   await agent.api.app.bsky.feed.like.create(
    //     { repo: agent.session?.did },
    //     {
    //       subject: { uri: post.uri, cid: post.cid },
    //       createdAt: new Date().toISOString()
    //     }
    //   );
    // };


    // Example usage of the placeholder functions
    // const latestPost = await fetchLatestPost();
    const latestPosts = await fetchRecentPostsByAuthor();
    console.log("\n>>> LATEST POST: ", latestPosts, "\n");

    // const hashtag = await extractHashtag(latestPost);
    // const hashtag =  await extractHashtags(latestPosts);

    // await repostWithThoughts(latestPost, "positive");
    const geminiResponse = await queryGemini(latestPosts);
    console.log("\n>>> GEMINI RESPONSE: ", geminiResponse, "\n");


    // const postsWithTag = await searchPostsWithTag(hashtag);
    makeRepost(latestPosts[1], geminiResponse);

    // Stretch Goals (Implement Later)
    // await likePosts(postsWithTag);
    // await replyOnPosts(postsWithTag, "positive");

  } catch (error) {
    console.error("\n!!! EXECUTE TASK ERROR:", error, "!!!\n");
  }
}