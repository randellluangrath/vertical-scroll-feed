import { faker } from "@faker-js/faker";

const generateVideoData = (count: number) => {
  const videos = [];
  for (let i = 0; i < count; i++) {
    const title = faker.word.words(Math.floor(Math.random() * 10 - 1) + 1);

    videos.push({
      id: i + 1,
      title: title,
      url: `clip-${i + 1}.mp4`,
    });
  }
  return videos;
};

export const manifest = {
  videos: generateVideoData(8),
};
