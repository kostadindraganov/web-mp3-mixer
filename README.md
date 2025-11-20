# 🎵 Web MP3 Audio Mixer

A modern, web-based audio mixer built with Next.js that allows you to mix background music with voice-over audio files. Files are stored in Cloudflare R2 for scalable, cost-effective cloud storage.

## ✨ Features

- **Dual Audio Streams**: Mix background music with voice-over audio
- **Smart Playback**: Background music loops continuously, voice-overs play in random order
- **Configurable Delay**: Set custom delay (in seconds) before voiceover playback starts
- **Visual Indicators**: Animated sound bars show which audio file is currently playing
- **Real-time Mixing**: Adjust the balance between background and voice-over with a slider
- **Cloud Storage**: Upload and store MP3 files in Cloudflare R2
- **Volume Control**: Master volume control and individual stream mixing
- **Modern UI**: Beautiful, responsive interface built with Tailwind CSS
- **Web Audio API**: High-quality audio mixing using native browser APIs

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- A Cloudflare account with R2 enabled
- npm or yarn package manager

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd web-mp3-mixer
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Set Up Cloudflare R2

#### Create an R2 Bucket

1. Log in to your [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **R2** in the sidebar
3. Click **Create bucket**
4. Enter a bucket name (e.g., `mp3-mixer-storage`)
5. Click **Create bucket**

#### Generate API Tokens

1. In the R2 section, click **Manage R2 API Tokens**
2. Click **Create API token**
3. Configure the token:
   - **Token name**: `mp3-mixer-token`
   - **Permissions**: Select "Object Read & Write"
   - **TTL**: Never expire (or set your preferred expiry)
4. Click **Create API token**
5. **IMPORTANT**: Copy and save these values (you won't see them again):
   - Access Key ID
   - Secret Access Key
   - Account ID (shown in the R2 overview)

#### Configure CORS (Required for Audio Playback)

To allow the browser to fetch audio files, you need to configure CORS on your R2 bucket:

1. In your R2 bucket settings, click on the **Settings** tab
2. Scroll to **CORS Policy**
3. Add the following CORS configuration:

```json
[
  {
    "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

**Important Notes:**
- Replace `https://yourdomain.com` with your actual production domain
- For development, keep `http://localhost:3000`
- You can use `["*"]` for AllowedOrigins during development, but use specific domains in production for security
- The CORS policy is required for the Web Audio API to load and play audio files

### 4. Configure Environment Variables

1. Copy the example environment file:

```bash
cp .env.example .env.local
```

2. Edit `.env.local` and fill in your Cloudflare R2 credentials:

```env
R2_ACCOUNT_ID=your-cloudflare-account-id
R2_ACCESS_KEY_ID=your-r2-access-key-id
R2_SECRET_ACCESS_KEY=your-r2-secret-access-key
R2_BUCKET_NAME=mp3-mixer-storage
```

### 5. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 How to Use

### Uploading Files

1. **Background Music**: Click "Upload MP3" in the left column to add background music files
2. **Voice Over**: Click "Upload MP3" in the right column to add voice-over files

### Setting Voiceover Delay

1. In the Voice Over column, find the "Random Delay" input field
2. Enter the desired delay in seconds (0-300)
3. Click the **Set Random** button to apply the delay
4. The active delay will be displayed below the input

### Playing Audio

1. Upload at least one file to either column
2. (Optional) Set the voiceover delay using the steps above
3. Click the **Play button** in the audio player
4. Audio streams will start playing:
   - Background music starts immediately and plays in a continuous loop
   - Voice-overs start after the configured delay and play one by one in random order
5. Watch the animated sound bars to see which file is currently playing

### Mixing Audio

- Use the **Mix Control slider** to adjust the balance:
  - **Left (0%)**: 100% Background Music, 0% Voice Over
  - **Center (50%)**: 50% Background Music, 50% Voice Over
  - **Right (100%)**: 0% Background Music, 100% Voice Over

### Volume Control

- Adjust the **master volume** using the volume slider in the audio player
- Volume ranges from 0% (muted) to 100% (full volume)

### Managing Files

- Click the **Delete** button next to any file to remove it from storage
- Files are permanently deleted from Cloudflare R2

## 🏗️ Project Structure

```
web-mp3-mixer/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Main application page
│   │   ├── layout.tsx            # Root layout
│   │   ├── globals.css           # Global styles
│   │   └── api/
│   │       ├── upload/route.ts   # File upload endpoint
│   │       ├── files/route.ts    # List files endpoint
│   │       └── delete/route.ts   # Delete file endpoint
│   ├── components/
│   │   ├── AudioPlayer.tsx       # Main audio player with controls
│   │   ├── FileList.tsx          # File list display
│   │   ├── MixerSlider.tsx       # Audio mix control slider
│   │   └── UploadButton.tsx      # File upload button
│   ├── lib/
│   │   ├── r2-client.ts          # Cloudflare R2 client
│   │   └── audio-engine.ts       # Web Audio API engine
│   └── types/
│       └── index.ts              # TypeScript types
├── .env.example                   # Environment variables template
├── .env.local                     # Your local environment (gitignored)
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

## 🔧 Technology Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Storage**: [Cloudflare R2](https://www.cloudflare.com/products/r2/)
- **Audio**: Web Audio API (native browser API)
- **AWS SDK**: [@aws-sdk/client-s3](https://www.npmjs.com/package/@aws-sdk/client-s3) (S3-compatible for R2)

## 🎨 Key Features Explained

### Audio Mixing Engine

The application uses the Web Audio API to create a sophisticated mixing engine:

- **Two Audio Sources**: Separate sources for background and voice-over
- **Gain Nodes**: Individual volume control for each stream
- **Master Gain**: Final output volume control
- **Real-time Mixing**: Adjustments apply immediately without interruption

### Playback Logic

- **Background Music**: Loops through all tracks sequentially
- **Voice Over**: Randomized playback order regenerated on each cycle
- **Auto-progression**: Automatically plays the next track when one ends

### Cloud Storage

Files are stored in Cloudflare R2 with the following structure:
```
bucket-name/
├── background/
│   ├── 1699999999-song1.mp3
│   └── 1699999999-song2.mp3
└── voiceover/
    ├── 1699999999-voice1.mp3
    └── 1699999999-voice2.mp3
```

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard:
   - `R2_ACCOUNT_ID`
   - `R2_ACCESS_KEY_ID`
   - `R2_SECRET_ACCESS_KEY`
   - `R2_BUCKET_NAME`
4. Deploy!

### Deploy to Other Platforms

This app can be deployed to any platform that supports Next.js:

- **Netlify**: Use the Netlify CLI or dashboard
- **Railway**: Connect your GitHub repo
- **DigitalOcean App Platform**: Deploy from GitHub
- **Self-hosted**: Run `npm run build` and `npm run start`

Always remember to set the environment variables on your deployment platform.

## 🔒 Security Considerations

- Never commit `.env.local` to version control
- Keep your R2 API credentials secure
- Consider implementing authentication for production use
- Use CORS policies on your R2 bucket if needed
- Implement file size limits to prevent abuse

## 📝 Environment Variables Reference

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `R2_ACCOUNT_ID` | Your Cloudflare account ID | Yes | `a1b2c3d4e5f6g7h8i9j0` |
| `R2_ACCESS_KEY_ID` | R2 API access key | Yes | `1234567890abcdef` |
| `R2_SECRET_ACCESS_KEY` | R2 API secret key | Yes | `abcdefghijklmnopqrstuvwxyz123456` |
| `R2_BUCKET_NAME` | Name of your R2 bucket | Yes | `mp3-mixer-storage` |
| `R2_PUBLIC_URL` | Public URL (optional) | No | `https://bucket.r2.dev` |

## 🐛 Troubleshooting

### Audio doesn't play / "Failed to fetch" error
- **CORS Configuration**: This is the most common issue. Make sure you've configured CORS on your R2 bucket (see setup instructions above)
- **Check Browser Console**: Look for specific error messages in the browser developer console (F12)
- **Verify URLs**: Check that presigned URLs are being generated correctly
- **Valid MP3 Format**: Ensure uploaded files are valid MP3 format
- **R2 Credentials**: Verify R2 credentials in `.env.local` are correct
- **Network Tab**: Check the browser's Network tab to see if the audio file requests are failing
- **Try Different Browser**: Some browsers have stricter CORS policies than others

### Upload fails
- Verify R2 API token has write permissions
- Check file size (R2 has limits)
- Ensure bucket name is correct
- Check network connectivity

### Mix slider doesn't work
- Check browser console for errors
- Ensure audio engine is initialized
- Try refreshing the page

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

**Built with ❤️ using Next.js and Cloudflare R2**
