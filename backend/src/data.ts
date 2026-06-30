// Inline copy of shared data so the backend has no build-time dependency on the
// monorepo root — lets you run `npm run dev` in /backend without ts-paths config.
// In prod this would be replaced by DynamoDB reads via the Amplify Data client.
import { Content, Review } from "./types";

export { Content, Review };

function muxThumb(id: string) {
  return `https://image.mux.com/${id}/thumbnail.jpg?time=4`;
}

export const CONTENT: Content[] = [
  {
    id: "peekapods",
    title: "Peekapods",
    tagline: "Peek, discover, wonder.",
    synopsis:
      "Join the Peekapods on imaginative adventures through fantastical worlds where curiosity is the greatest superpower.",
    genres: ["kids", "adventure", "animation"],
    year: 2024,
    maturity: "TV-Y",
    runtimeMinutes: 22,
    matchPercent: 98,
    cast: ["Aria Chen", "Finn Wolfe", "Mila Osei"],
    streamUrl:
      "https://stream.mux.com/W9gTvudoYfqS9fdpDZHuPy2JClPJcjdyBJUeBWWMJOU.m3u8",
    thumbnailUrl: muxThumb("W9gTvudoYfqS9fdpDZHuPy2JClPJcjdyBJUeBWWMJOU"),
    gradient: ["#4f46e5", "#1e1b4b"],
    rails: ["for-you", "trending"],
    trendingRank: 1,
    likes: 45200,
    views: "2.3M",
    rating: 4.8,
    reviews: [
      {
        id: "r-pp-1",
        author: "famfirst",
        avatarColor: "#6366f1",
        rating: 5,
        sentiment: "loved",
        body: "My kids are obsessed. The animation quality is stunning.",
        likes: 1240,
        timeAgo: "2d",
      },
      {
        id: "r-pp-2",
        author: "parentof3",
        avatarColor: "#14b8a6",
        rating: 5,
        sentiment: "loved",
        body: "Finally something genuinely educational and fun at the same time.",
        likes: 870,
        timeAgo: "5d",
      },
    ],
  },
  {
    id: "city-hall-kids",
    title: "City Hall Kids",
    tagline: "Democracy starts here.",
    synopsis:
      "A group of kids accidentally gets elected to run their town for a week. Equal parts chaos and heart.",
    genres: ["kids", "comedy", "education"],
    year: 2024,
    maturity: "TV-Y7",
    runtimeMinutes: 28,
    matchPercent: 94,
    cast: ["Marcus Webb", "Priya Patel", "Jonas Reyes"],
    streamUrl:
      "https://stream.mux.com/36E701oKQcdW6WdLvx00I3wQA1wAIEutY2RxOvFgaCqPU.m3u8",
    thumbnailUrl: muxThumb("36E701oKQcdW6WdLvx00I3wQA1wAIEutY2RxOvFgaCqPU"),
    gradient: ["#0f4c81", "#0c0a09"],
    rails: ["for-you", "trending"],
    trendingRank: 2,
    likes: 31800,
    views: "1.7M",
    rating: 4.6,
    reviews: [
      {
        id: "r-chk-1",
        author: "civicsnerdd",
        avatarColor: "#0ea5e9",
        rating: 5,
        sentiment: "loved",
        body: "Used this in my classroom. Kids were glued to the screen.",
        likes: 2100,
        timeAgo: "3d",
      },
    ],
  },
  {
    id: "zoorama",
    title: "Zoorama",
    tagline: "The wild world up close.",
    synopsis:
      "Go behind the scenes of the world's most extraordinary animal habitats. Zoorama follows conservationists and curious kids.",
    genres: ["nature", "science", "family"],
    year: 2025,
    maturity: "TV-G",
    runtimeMinutes: 35,
    matchPercent: 91,
    cast: ["Dr. Nia Okonkwo", "Elliot Marsh"],
    streamUrl:
      "https://stream.mux.com/n003ev00tQ3OIpkUZYAUgoTOL027NHrKSTng4KkoE3WblI.m3u8",
    thumbnailUrl: muxThumb("n003ev00tQ3OIpkUZYAUgoTOL027NHrKSTng4KkoE3WblI"),
    gradient: ["#052e16", "#0a0a0a"],
    rails: ["for-you"],
    likes: 28400,
    views: "1.1M",
    rating: 4.7,
    reviews: [
      {
        id: "r-zoo-1",
        author: "wildlifefan",
        avatarColor: "#8b5cf6",
        rating: 5,
        sentiment: "loved",
        body: "The octopus episode changed how I think about intelligence.",
        likes: 1890,
        timeAgo: "1d",
      },
    ],
  },
  {
    id: "hello-world",
    title: "Hello World",
    tagline: "Every coder starts somewhere.",
    synopsis:
      "Four kids discover a broken computer and accidentally start a tech club that changes their whole town.",
    genres: ["kids", "science", "adventure"],
    year: 2025,
    maturity: "TV-Y7",
    runtimeMinutes: 30,
    matchPercent: 89,
    cast: ["Zara Lin", "Deshawn Cole", "Isa Vargas"],
    streamUrl:
      "https://stream.mux.com/cTaQ74ZtJlCJrHf4MysV5njJ1VZwTfBqY1THFkD7Q6M.m3u8",
    thumbnailUrl: muxThumb("cTaQ74ZtJlCJrHf4MysV5njJ1VZwTfBqY1THFkD7Q6M"),
    gradient: ["#3b0764", "#0c0a09"],
    rails: ["trending"],
    trendingRank: 3,
    likes: 19700,
    views: "880K",
    rating: 4.9,
    reviews: [
      {
        id: "r-hw-1",
        author: "devdad",
        avatarColor: "#6366f1",
        rating: 5,
        sentiment: "loved",
        body: "My daughter watched this and immediately asked to learn Python.",
        likes: 3200,
        timeAgo: "5h",
      },
    ],
  },
];
