// recommendationResponses.js

const lyricallySimilarResponses = [
  'If you like "{{songName}}" by {{artistName}}, you might enjoy "{{recommendedSong}}" by {{recommendedArtist}}.',
  'Fans of "{{songName}}" by {{artistName}} also appreciate "{{recommendedSong}}" by {{recommendedArtist}}.',
  'You might find "{{recommendedSong}}" by {{recommendedArtist}} lyrically similar to "{{songName}}" by {{artistName}}.',
  'Since you enjoyed "{{songName}}" by {{artistName}}, give "{{recommendedSong}}" by {{recommendedArtist}} a listen.',
  'Looking for songs like "{{songName}}" by {{artistName}}? Try "{{recommendedSong}}" by {{recommendedArtist}}.',
  'If you’re into "{{songName}}" by {{artistName}}, you’ll love "{{recommendedSong}}" by {{recommendedArtist}}.',
  'Let "{{recommendedSong}}" by {{recommendedArtist}} be your next favorite after "{{songName}}" by {{artistName}}.',
  'Since "{{songName}}" by {{artistName}} hit the right notes, check out "{{recommendedSong}}" by {{recommendedArtist}}.',
  'If "{{songName}}" by {{artistName}} is your jam, then "{{recommendedSong}}" by {{recommendedArtist}} is a must-listen.',
  'Fans of "{{songName}}" by {{artistName}} usually vibe with "{{recommendedSong}}" by {{recommendedArtist}} too.',
  'Enjoy "{{songName}}" by {{artistName}}? You’ll probably like "{{recommendedSong}}" by {{recommendedArtist}}.',
  'Loving "{{songName}}" by {{artistName}}? Give "{{recommendedSong}}" by {{recommendedArtist}} a go.',
  'Try "{{recommendedSong}}" by {{recommendedArtist}} if "{{songName}}" by {{artistName}} is up your alley.',
  'Can’t get enough of "{{songName}}" by {{artistName}}? Try "{{recommendedSong}}" by {{recommendedArtist}}.',
  'Find the lyrical magic in "{{recommendedSong}}" by {{recommendedArtist}} if you love "{{songName}}" by {{artistName}}.',
];

const musicallySimilarResponses = [
  'A song similar to "{{songName}}" by {{artistName}} is "{{recommendedSong}}" by {{recommendedArtist}}.',
  'If you enjoyed "{{songName}}" by {{artistName}}, you might like "{{recommendedSong}}" by {{recommendedArtist}}.',
  'Check out "{{recommendedSong}}" by {{recommendedArtist}}; it has a similar vibe to "{{songName}}" by {{artistName}}.',
  'Since you liked "{{songName}}" by {{artistName}}, you might appreciate "{{recommendedSong}}" by {{recommendedArtist}}.',
  'For a song with a similar sound to "{{songName}}" by {{artistName}}, listen to "{{recommendedSong}}" by {{recommendedArtist}}.',
  'Digging the sound of "{{songName}}" by {{artistName}}? Try "{{recommendedSong}}" by {{recommendedArtist}}.',
  'If "{{songName}}" by {{artistName}} is your style, you’ll love "{{recommendedSong}}" by {{recommendedArtist}}.',
  'For fans of "{{songName}}" by {{artistName}}, "{{recommendedSong}}" by {{recommendedArtist}} is a great pick.',
  'In the mood for something like "{{songName}}" by {{artistName}}? Check out "{{recommendedSong}}" by {{recommendedArtist}}.',
  'Can’t get enough of "{{songName}}" by {{artistName}}? You might enjoy "{{recommendedSong}}" by {{recommendedArtist}}.',
  'If "{{songName}}" by {{artistName}} is your groove, give "{{recommendedSong}}" by {{recommendedArtist}} a listen.',
  'Love the sound of "{{songName}}" by {{artistName}}? You’ll vibe with "{{recommendedSong}}" by {{recommendedArtist}}.',
  'Try "{{recommendedSong}}" by {{recommendedArtist}} if "{{songName}}" by {{artistName}} is on your playlist.',
  'Enjoy the musical style of "{{songName}}" by {{artistName}}? Check out "{{recommendedSong}}" by {{recommendedArtist}}.',
  'Since "{{songName}}" by {{artistName}} is a hit for you, give "{{recommendedSong}}" by {{recommendedArtist}} a spin.',
];

const moodBasedResponses = [
  'If "{{songName}}" by {{artistName}} resonates with you, you might also enjoy "{{recommendedSong}}" by {{recommendedArtist}}.',
  'Feeling the mood of "{{songName}}" by {{artistName}}? Try listening to "{{recommendedSong}}" by {{recommendedArtist}}.',
  'You might find "{{recommendedSong}}" by {{recommendedArtist}} has a similar mood to "{{songName}}" by {{artistName}}.',
  'Since "{{songName}}" by {{artistName}} speaks to you, consider "{{recommendedSong}}" by {{recommendedArtist}}.',
  'For a song with a similar feel to "{{songName}}" by {{artistName}}, check out "{{recommendedSong}}" by {{recommendedArtist}}.',
  'If "{{songName}}" by {{artistName}} matches your mood, you’ll love "{{recommendedSong}}" by {{recommendedArtist}}.',
  'Let "{{recommendedSong}}" by {{recommendedArtist}} keep the mood going if you love "{{songName}}" by {{artistName}}.',
  'In the mood like "{{songName}}" by {{artistName}}? "{{recommendedSong}}" by {{recommendedArtist}} fits right in.',
  'For a similar emotional vibe to "{{songName}}" by {{artistName}}, listen to "{{recommendedSong}}" by {{recommendedArtist}}.',
  'If "{{songName}}" by {{artistName}} hits the mood right, try "{{recommendedSong}}" by {{recommendedArtist}}.',
  'Since "{{songName}}" by {{artistName}} hits home, check out "{{recommendedSong}}" by {{recommendedArtist}}.',
  'Feel the connection in "{{recommendedSong}}" by {{recommendedArtist}} just like with "{{songName}}" by {{artistName}}.',
  'If "{{songName}}" by {{artistName}} touches your soul, let "{{recommendedSong}}" by {{recommendedArtist}} continue the journey.',
  'In the same emotional space as "{{songName}}" by {{artistName}}? Try "{{recommendedSong}}" by {{recommendedArtist}}.',
  'Let the mood of "{{recommendedSong}}" by {{recommendedArtist}} complement the vibe of "{{songName}}" by {{artistName}}.',
];

module.exports = {
  lyricallySimilarResponses,
  musicallySimilarResponses,
  moodBasedResponses,
};
