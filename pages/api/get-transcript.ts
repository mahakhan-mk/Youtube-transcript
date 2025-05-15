import type { NextApiRequest, NextApiResponse } from 'next';
import { YoutubeTranscript } from 'youtube-transcript';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*'); // Optional: Replace * with your frontend URL
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const { video_url } = req.body;

  if (!video_url) {
    return res.status(400).json({ error: 'Video URL is required' });
  }

  const videoIdMatch = video_url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
  const videoId = videoIdMatch?.[1];

  if (!videoId) {
    return res.status(400).json({ error: 'Invalid YouTube URL' });
  }

  try {
    const transcriptArray = await YoutubeTranscript.fetchTranscript(videoId);
    const transcript = transcriptArray.map(t => t.text).join(' ');
    return res.status(200).json({ transcript });
  } catch (error: any) {
    const message = error?.message || 'Transcript unavailable';
    return res.status(200).json({ transcript: null, error: message });
  }
}
