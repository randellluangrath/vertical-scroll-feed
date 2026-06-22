import { Video } from "@/types/Video";
import { faker } from "@faker-js/faker";

const tags = [
  "sci-fi",
  "comedy",
  "drama",
  "action",
  "horror",
  "romance",
  "thriller",
  "documentary",
  "animation",
  "fantasy",
];

const generateVideoData = (count: number) => {
  const videos: Video[] = [];
  for (let i = 0; i < count; i++) {
    const title = faker.word.words(Math.floor(Math.random() * 10 - 1) + 1);
    const videoTags = faker.helpers.arrayElements(tags, { min: 2, max: 4 });

    console.log(videoTags);

    videos.push({
      id: i + 1,
      title: title,
      url: `clip-${i + 1}.mp4`,
      tags: videoTags,
      durationInSeconds: Math.floor(Math.random() * 300) + 30, // 30s to 5min
      createdAt: faker.date.past().toISOString(),
    });
  }
  return videos;
};

export const manifest = {
  data: { videos: generateVideoData(6) },
};
