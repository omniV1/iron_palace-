import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Calendar, ChevronLeft, ChevronRight, Facebook, Instagram, Play, X } from "lucide-react";
import { Button } from "./components/ui/button";
import { useYouTubeVideos, timeAgo } from "./hooks/useYouTubeVideos";

import imgMerchDragon from "../imports/Group2/9fe969f07b1189f5a7e8d627018c5bf063261cab.png?w=800&format=webp&quality=80";
import imgMerchWhite from "../imports/Group2/0e04069fb44385863cd0bed92320736368ccc2bc.png?w=800&format=webp&quality=80";
import imgMerchGrey from "../imports/Group2/27719387f55cc5e04ab298523fd29ec98849c475.png?w=800&format=webp&quality=80";
import imgLifting from "../imports/Group2/b5fff0d1593285f075f46cfdc89c44bd3b39097f.png?w=1920&format=webp&quality=75";
import imgImg20281 from "../imports/Group2/3079c0be861de6bc379a6ca769dbf0748207144a.png?w=600&format=webp&quality=80";
import imgImg20291 from "../imports/Group2/ce8df0c659a26b7d011b713b1e18821bf06bf4e1.png?w=600&format=webp&quality=80";
import imgImg20251 from "../imports/Group2/1ede6e433cb6efbe5f751aee62ab893cda99b1d5.png?w=600&format=webp&quality=80";
import imgImg20311 from "../imports/Group2/8c77f10a72680404a307b4bf8049706d39cdd092.png?w=600&format=webp&quality=80";
import imgImg20261 from "../imports/Group2/d32e1b27f2f8c2210ddd1d6f3ea0ca06e1cadb54.png?w=600&format=webp&quality=80";
import imgNewLogo from "../assets/feef32863d06775804f6af6bbe43f8df154b97b4.png?w=500&format=webp&quality=85";
import imgCommunity1 from "../assets/1ea5b08a1e66e411f08d673b6535fb4addf3fed8.png?w=1600&format=webp&quality=80";
import imgCommunity2 from "../assets/60f79edf345665e7536dfcdb7ba228f0f791b1b7.png?w=1600&format=webp&quality=80";
import imgCommunity3 from "../assets/da863c2d6b8087a171fdd66ac8e98684908370f4.png?w=1600&format=webp&quality=80";

const crewMembers = [
  {
    name: "Caleb Day",
    role: "Host",
    bio: "The host with the most... of what, we still don't know.",
    image: imgImg20311,
  },
  {
    name: "Holland Millsaps",
    role: "Co-Host",
    bio: "A man of several names and talents, but best known as the world's most handsome man",
    image: imgImg20261,
  },
  {
    name: "Lisa Philippen",
    role: "Co-Host",
    bio: "Not sure why she hangs out with us, but she does.",
    image: imgImg20291,
  },
  {
    name: "Michael Cotney",
    role: "Manager",
    bio: "The man with the unfortunate responsibility of dealing with this bunch",
    image: imgImg20251,
  },
  {
    name: "Allen Fagg",
    role: "Sound & Equipment",
    bio: "He fought a pygmy goat one time... true story",
    image: imgImg20281,
  },
];

const merchItems = [
  { id: 1, name: "Dragon Logo Tee", price: "$29.99", image: imgMerchDragon },
  { id: 2, name: "Classic White Tee", price: "$24.99", image: imgMerchWhite },
  { id: 3, name: "Premium Grey Tee", price: "$27.99", image: imgMerchGrey },
];

// Photo gallery - placeholder images
// To integrate Facebook photos from: https://www.facebook.com/profile.php?id=100095172626714&sk=photos
// You'll need to use the Facebook Graph API with an access token to fetch photos
// See: https://developers.facebook.com/docs/graph-api/reference/user/photos
const galleryPhotos = [
  imgCommunity1,
  imgCommunity2,
  imgCommunity3,
];

// Upcoming events - placeholder data (sync with Apple Calendar)
const upcomingEvents = [
  {
    id: 1,
    title: "Live Podcast Recording",
    date: "April 15, 2026",
    time: "7:00 PM EST",
    location: "The Iron Palace Gym",
  },
  {
    id: 2,
    title: "Meet & Greet",
    date: "April 22, 2026",
    time: "5:00 PM EST",
    location: "Downtown Convention Center",
  },
  {
    id: 3,
    title: "Strongman Competition",
    date: "May 5, 2026",
    time: "10:00 AM EST",
    location: "City Arena",
  },
];

export default function App() {
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const [hoveredCrew, setHoveredCrew] = useState<number | null>(null);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const { videos, loading: videosLoading, error: videosError } = useYouTubeVideos(15);

  const closeVideoModal = useCallback(() => setActiveVideoId(null), []);

  // Auto-rotate gallery
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhoto((prev) => (prev + 1) % galleryPhotos.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const nextPhoto = () => {
    setCurrentPhoto((prev) => (prev + 1) % galleryPhotos.length);
  };

  const prevPhoto = () => {
    setCurrentPhoto((prev) => (prev - 1 + galleryPhotos.length) % galleryPhotos.length);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-md border-b border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <a
              href="https://www.instagram.com/the_iron_palace_podcast/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={imgNewLogo} alt="Iron Palace Podcast" className="h-12 w-auto" decoding="async" fetchPriority="high" />
            </a>

            <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3 md:gap-4">
              <a
                href="https://www.facebook.com/p/The-Iron-Palace-Podcast-100095172626714/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-amber-500 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://www.instagram.com/the_iron_palace_podcast/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-amber-500 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://music.amazon.com/podcasts/948d7a31-8e4a-4cca-a284-b81bbe979f99/the-iron-palace-podcast?ref=dm_sh_W8e0obyIKGENhI3aM53Mf23Vf"
                aria-label="Amazon Music"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-amber-500 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <text x="12" y="12" fontSize="14" fill="currentColor" textAnchor="middle" dominantBaseline="central" fontWeight="600" fontFamily="Arial, sans-serif" stroke="none">a</text>
                </svg>
              </a>
              <a
                href="https://podcasts.apple.com/us/podcast/the-iron-palace-podcast/id1702337857"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-amber-500 transition-colors"
                aria-label="Apple Podcasts"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2.182c5.423 0 9.818 4.395 9.818 9.818 0 5.423-4.395 9.818-9.818 9.818-5.423 0-9.818-4.395-9.818-9.818 0-5.423 4.395-9.818 9.818-9.818zm0 3.273c-2.086 0-3.782 1.696-3.782 3.782 0 1.455.828 2.718 2.036 3.354v5.118c0 .604.491 1.091 1.091 1.091h1.309c.604 0 1.091-.487 1.091-1.091v-5.118c1.209-.636 2.036-1.9 2.036-3.354 0-2.086-1.696-3.782-3.782-3.782zm0 1.636c1.182 0 2.145.964 2.145 2.145 0 1.182-.963 2.145-2.145 2.145-1.182 0-2.145-.963-2.145-2.145 0-1.181.963-2.145 2.145-2.145z"/>
                </svg>
              </a>
              <a
                href="https://open.spotify.com/show/1j1M1DTBSO7wiyqJ4LFvns?si=fe3c30e5c5dd45b1"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-amber-500 transition-colors"
                aria-label="Spotify"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm5.5 17.3c-.2.3-.6.4-.9.2-2.5-1.5-5.6-1.9-9.3-1-0.4.1-.8-.2-.8-.6-.1-.4.2-.8.6-.8 4-.9 7.4-.5 10.2 1.2.3.2.4.7.2 1zm1.3-2.9c-.3.4-.8.5-1.2.2-2.8-1.7-7.1-2.2-10.4-1.2-.5.1-1-.2-1.1-.6-.1-.5.2-1 .6-1.1 3.8-1.1 8.6-.6 11.8 1.4.4.2.5.9.3 1.3zm.1-3c-3.4-2-9-2.2-12.2-1.2-.5.2-1.1-.1-1.3-.6-.2-.5.1-1.1.6-1.3 3.7-1.1 10-0.9 13.9 1.4.5.3.6.9.3 1.4-.3.4-.9.6-1.3.3z"/>
                </svg>
              </a>
              <a
                href="https://dayccaleb.podbean.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-amber-500 transition-colors"
                aria-label="Podcast"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm0 21.6c-5.3 0-9.6-4.3-9.6-9.6S6.7 2.4 12 2.4s9.6 4.3 9.6 9.6-4.3 9.6-9.6 9.6zm0-16.8c-4 0-7.2 3.2-7.2 7.2s3.2 7.2 7.2 7.2 7.2-3.2 7.2-7.2-3.2-7.2-7.2-7.2zm0 12c-2.7 0-4.8-2.2-4.8-4.8S9.3 7.2 12 7.2s4.8 2.2 4.8 4.8-2.1 4.8-4.8 4.8z"/>
                </svg>
              </a>
            </div>

          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={imgLifting}
            alt="The Iron Palace"
            className="w-full h-full object-cover scale-105"
            decoding="async"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.3)_100%)]"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center px-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-xs mx-auto mb-8 relative"
          >
            <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full scale-110"></div>
            <img
              src={imgNewLogo}
              alt="The Iron Palace Podcast"
              className="w-full h-auto relative z-10"
              decoding="async"
              style={{
                filter: 'brightness(1.8) drop-shadow(0 0 30px rgba(255,255,255,0.7))',
              }}
            />
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg md:text-xl tracking-[0.3em] uppercase font-light"
          >
            The World's Most Anabolic Podcast
          </motion.p>
        </motion.div>
      </section>

      {/* Latest Episode Section */}
      <section id="latest" className="py-20 px-4 bg-zinc-950">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-light tracking-wide uppercase mb-4">Latest Episode</h2>
            <p className="text-zinc-400 text-sm">Watch our most recent upload</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto rounded-2xl border border-white/12 bg-zinc-900/75 backdrop-blur-sm p-4 sm:p-5 shadow-[0_24px_70px_rgba(0,0,0,0.65)]"
          >
            <div className="relative rounded-xl border border-white/12 bg-black/35 p-1.5">
              <div className="pointer-events-none absolute left-3 right-3 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/45 to-transparent"></div>
              <div className="relative aspect-video overflow-hidden rounded-lg shadow-[0_14px_38px_rgba(0,0,0,0.55)]">
                <iframe
                  className="absolute inset-0 h-full w-full"
                  src="https://www.youtube.com/embed/videoseries?list=UU9tV0Z2xN1HtvQu5F-ERqpg&playsinline=1"
                  title="Latest YouTube Video"
                  frameBorder="0"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>
          </motion.div>

          <div className="text-center mt-8">
            <a
              href="https://www.youtube.com/@TheIronPalacePodcast"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block relative overflow-hidden group rounded-lg"
            >
              <Button className="relative bg-gradient-to-br from-amber-600 via-amber-600 to-amber-700 hover:from-amber-500 hover:via-amber-500 hover:to-amber-600 text-white font-medium px-5 py-3 rounded-lg shadow-lg shadow-amber-900/50 hover:shadow-xl hover:shadow-amber-900/60 hover:scale-105 transition-all duration-300 border border-amber-500/50 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-amber-400/60 via-transparent to-amber-950/70"></div>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_0%,rgba(255,250,200,0.8),transparent_40%)]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_100%,rgba(113,63,18,0.6),transparent_40%)]"></div>
                <span className="relative z-10">Subscribe on YouTube</span>
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Recent Episodes Grid — auto-updates from YouTube RSS */}
      <section className="py-20 px-4 bg-black">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 flex w-full flex-col items-center text-center"
          >
            <h2 className="text-3xl md:text-4xl font-light tracking-wide uppercase mb-4">Recent Episodes</h2>
            <p className="text-zinc-400 text-sm max-w-xl">Catch up on what you missed</p>
          </motion.div>

          {videosLoading ? (
            <div className="overflow-x-auto pb-2 [scrollbar-width:thin]">
              <div className="flex w-max max-w-full mx-auto gap-5 snap-x snap-mandatory">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-[min(85vw,300px)] flex-shrink-0 snap-start animate-pulse"
                  >
                    <div className="aspect-video bg-zinc-800 rounded-xl mb-3" />
                    <div className="h-4 bg-zinc-800 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-zinc-800 rounded w-1/2" />
                  </div>
                ))}
              </div>
            </div>
          ) : videosError || videos.length <= 1 ? (
            <div className="max-w-lg mx-auto text-center py-8 px-4">
              <p className="text-zinc-400 text-sm mb-4">
                {videosError
                  ? "We couldn’t load the episode list right now."
                  : "More episodes will show here once additional uploads are available."}
              </p>
              <a
                href="https://www.youtube.com/@TheIronPalacePodcast"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-amber-400/90 hover:text-amber-300 underline underline-offset-2"
              >
                Browse all episodes on YouTube
              </a>
            </div>
          ) : (
            <div className="overflow-x-auto pb-2 [scrollbar-width:thin]">
              <div className="flex w-max max-w-full mx-auto gap-5 snap-x snap-mandatory pb-1">
                {videos.slice(1, 4).map((video, index) => (
                  <motion.div
                    key={video.videoId}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -2 }}
                    className="group w-[min(85vw,300px)] flex-shrink-0 snap-start cursor-pointer active:scale-[0.99] transition-transform text-left"
                    onClick={() => setActiveVideoId(video.videoId)}
                  >
                    <div className="relative aspect-video rounded-xl overflow-hidden ring-1 ring-white/10 shadow-lg shadow-black/40 mb-3">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/20 sm:bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-red-600/90 flex items-center justify-center opacity-80 sm:opacity-0 group-hover:opacity-100 scale-90 sm:scale-75 group-hover:scale-100 transition-all duration-300 shadow-lg">
                          <Play className="w-5 h-5 sm:w-6 sm:h-6 text-white ml-0.5" fill="white" />
                        </div>
                      </div>
                    </div>
                    <h3 className="text-sm font-medium line-clamp-2 group-hover:text-amber-400 transition-colors duration-200">
                      {video.title}
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">
                      {video.views.toLocaleString()} views &middot; {timeAgo(video.published)}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

        </div>
      </section>

      {/* YouTube Video Modal */}
      <AnimatePresence>
        {activeVideoId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-3 sm:p-4"
            onClick={closeVideoModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-5xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeVideoModal}
                className="absolute -top-10 sm:-top-12 right-0 z-10 bg-white/10 sm:bg-transparent rounded-full p-1.5 text-white/80 hover:text-white active:scale-90 transition-all"
                aria-label="Close video"
              >
                <X className="w-7 h-7 sm:w-8 sm:h-8" />
              </button>
              <div className="relative aspect-video rounded-xl sm:rounded-2xl overflow-hidden ring-1 ring-white/20 shadow-2xl">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${activeVideoId}?autoplay=1&playsinline=1`}
                  title="YouTube video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upcoming Events Section */}
      <section className="py-20 px-4 bg-black">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-light tracking-wide uppercase mb-4">Upcoming Events</h2>
            <p className="text-zinc-400 text-sm">Join us at these upcoming events</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {upcomingEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="bg-zinc-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-amber-500/50 hover:bg-zinc-900/80 hover:shadow-xl hover:shadow-amber-600/10 transition-all duration-300"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="bg-yellow-600/10 p-2 rounded-lg ring-1 ring-amber-600/20">
                    <Calendar className="w-6 h-6 text-amber-500 flex-shrink-0" />
                  </div>
                  <div>
                    <h3 className="text-xl font-medium mb-2">{event.title}</h3>
                    <p className="text-zinc-400 text-sm mb-1">{event.date}</p>
                    <p className="text-zinc-400 text-sm mb-1">{event.time}</p>
                    <p className="text-zinc-500 text-sm">{event.location}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-sm text-zinc-500">
              Sync with Apple Calendar: <span className="text-amber-500">webcal://your-calendar-link.ics</span>
            </p>
          </div>
        </div>
      </section>

      {/* Merch Section */}
      <section id="merch" className="py-20 px-4 bg-zinc-950">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-light tracking-wide uppercase">Featured Merchandise</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {merchItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-2xl border border-white/20 aspect-square mb-4 shadow-lg shadow-black/40 transition-all duration-300 ring-1 ring-white/10">
                  <img
                    src={item.image}
                    alt={item.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-lg font-light uppercase tracking-wide mb-2 group-hover:text-amber-500 transition-colors">{item.name}</h3>
                <p className="text-zinc-400 text-base">{item.price}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <a
              href="https://www.etsy.com/shop/KDayDreamDesigns?dd_referrer="
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block relative overflow-hidden group rounded-lg"
            >
              <Button className="relative bg-gradient-to-br from-amber-600 via-amber-600 to-amber-700 hover:from-amber-500 hover:via-amber-500 hover:to-amber-600 text-white border border-amber-500/50 rounded-lg px-6 py-3 text-sm font-light uppercase tracking-wider transition-all hover:scale-105 shadow-lg shadow-amber-900/50 hover:shadow-xl hover:shadow-amber-900/60 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-amber-400/60 via-transparent to-amber-950/70"></div>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_0%,rgba(255,250,200,0.8),transparent_40%)]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_100%,rgba(113,63,18,0.6),transparent_40%)]"></div>
                <span className="relative z-10">Shop All</span>
              </Button>
            </a>

            <div className="mt-5">
              <a
                href="https://venmo.com/Caleb-Day-10?txn=pay&note=Iron%20Palace%20Podcast%20Donation"
                target="_blank"
                rel="noopener noreferrer"
                className="relative group transition-transform duration-300 hover:scale-105 active:scale-95"
                aria-label="Just the TIPP Jar"
              >
                <svg className="h-[5.2rem] sm:h-[5.8rem] w-auto mx-auto drop-shadow-[0_10px_20px_rgba(0,0,0,0.55)] group-hover:drop-shadow-[0_12px_24px_rgba(0,0,0,0.65)] transition-all duration-300" viewBox="0 0 96 128" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="shirtJarLidMetal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f0ca6a" />
                      <stop offset="45%" stopColor="#c49532" />
                      <stop offset="100%" stopColor="#8f6718" />
                    </linearGradient>
                    <linearGradient id="shirtJarGlass" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(255,255,255,0.28)" />
                      <stop offset="38%" stopColor="rgba(255,255,255,0.08)" />
                      <stop offset="100%" stopColor="rgba(255,255,255,0.2)" />
                    </linearGradient>
                    <linearGradient id="shirtJarCoin" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ffd86f" />
                      <stop offset="100%" stopColor="#c28a1f" />
                    </linearGradient>
                  </defs>

                  <rect x="30" y="2.5" width="36" height="5" rx="1.5" fill="url(#shirtJarLidMetal)" stroke="#7a5610" strokeWidth="1" />
                  <rect x="26" y="8" width="44" height="9" rx="2.5" fill="url(#shirtJarLidMetal)" stroke="#7a5610" strokeWidth="1" />
                  <line x1="30" y1="11.5" x2="66" y2="11.5" stroke="#e8bc58" strokeWidth="0.9" opacity="0.65" />
                  <line x1="29" y1="14.4" x2="67" y2="14.4" stroke="#6f4e14" strokeWidth="0.7" opacity="0.45" />

                  <path
                    d="M26 17 Q26 25 13 31 L13 101 Q13 119 31 119 L65 119 Q83 119 83 101 L83 31 Q70 25 70 17 Z"
                    fill="url(#shirtJarGlass)"
                    stroke="rgba(255,255,255,0.55)"
                    strokeWidth="1.5"
                  />

                  <path d="M19 33 L23 33 L23 100 Q23 109 29 112 L19 112 L19 33 Z" fill="rgba(255,255,255,0.12)" />

                  <ellipse cx="39" cy="104" rx="9.5" ry="3.1" fill="url(#shirtJarCoin)" opacity="0.9" />
                  <ellipse cx="54.5" cy="105" rx="8.5" ry="2.8" fill="url(#shirtJarCoin)" opacity="0.78" />
                  <ellipse cx="48" cy="99.5" rx="10" ry="3.1" fill="url(#shirtJarCoin)" opacity="0.85" />

                  <rect x="24" y="54" width="48" height="28" rx="8" fill="rgba(0,0,0,0.35)" />
                  <text x="48" y="65" textAnchor="middle" fill="#fff0c7" fontSize="8.5" fontWeight="700" letterSpacing="0.5" stroke="rgba(0,0,0,0.6)" strokeWidth="0.5">Just the</text>
                  <text x="48" y="77" textAnchor="middle" fill="white" fontSize="11" fontWeight="800" letterSpacing="0.35" stroke="rgba(0,0,0,0.7)" strokeWidth="0.6">TIPP Jar</text>
                </svg>
              </a>
              <p className="mt-2 text-[10px] sm:text-xs text-zinc-400 uppercase tracking-wider">
                Like the show? Toss a tip in the jar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Meet the Crew Section */}
      <section id="crew" className="py-20 px-4 bg-black">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-light tracking-wide uppercase mb-4">Meet The Crew</h2>
            <p className="text-zinc-400 text-sm">Hover over each member to learn more</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-8 mb-12">
            {crewMembers.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, rotateZ: 2 }}
                className="relative group cursor-pointer"
                onMouseEnter={() => setHoveredCrew(index)}
                onMouseLeave={() => setHoveredCrew(null)}
              >
                <div className="relative w-full aspect-square rounded-full overflow-hidden border border-white group-hover:border-amber-500 transition-all duration-300 mx-auto shadow-xl shadow-black/40 group-hover:shadow-2xl group-hover:shadow-amber-600/40">
                  <img
                    src={member.image}
                    alt={member.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    style={index === 0 ? { objectPosition: '70% 15%', transform: 'scale(2.2) translateX(-15%)' } : {}}
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/40 group-hover:from-black/40 group-hover:via-black/50 group-hover:to-black/70 transition-all duration-300"></div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bio Display Area */}
          <motion.div
            animate={{
              height: hoveredCrew !== null ? "auto" : 0,
              opacity: hoveredCrew !== null ? 1 : 0,
            }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="overflow-hidden flex items-center justify-center"
          >
            <AnimatePresence mode="wait">
              {hoveredCrew !== null && (
                <motion.div
                  key={hoveredCrew}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white text-black rounded-2xl p-6 md:p-8 text-center max-w-2xl mx-auto w-full my-6 shadow-2xl shadow-amber-600/20 ring-1 ring-white/20"
                >
                  <h3 className="text-xl md:text-2xl uppercase tracking-wide mb-2">
                    {crewMembers[hoveredCrew].name}
                  </h3>
                  <p className="text-sm md:text-base uppercase tracking-wider text-zinc-600 mb-3">
                    {crewMembers[hoveredCrew].role}
                  </p>
                  <p className="text-sm md:text-base">{crewMembers[hoveredCrew].bio}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Photo Gallery Section */}
      <section className="py-20 px-4 bg-zinc-950">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-light tracking-wide uppercase mb-4">From Our Community</h2>
            <p className="text-zinc-400 text-sm">Latest photos from our events and workouts</p>
          </motion.div>

          <div className="relative max-w-4xl mx-auto">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl ring-1 ring-white/20 shadow-2xl shadow-black/60">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentPhoto}
                  src={galleryPhotos[currentPhoto]}
                  alt={`Gallery photo ${currentPhoto + 1}`}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.5 }}
                />
              </AnimatePresence>
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/0 via-transparent to-black/20"></div>
            </div>

            <button
              onClick={prevPhoto}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/70 backdrop-blur-md hover:bg-black/90 p-3 rounded-full transition-all ring-1 ring-white/20 shadow-lg shadow-black/50 hover:shadow-xl hover:shadow-amber-600/20 hover:scale-110 hover:ring-amber-500/30"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <button
              onClick={nextPhoto}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/70 backdrop-blur-md hover:bg-black/90 p-3 rounded-full transition-all ring-1 ring-white/20 shadow-lg shadow-black/50 hover:shadow-xl hover:shadow-amber-600/20 hover:scale-110 hover:ring-amber-500/30"
            >
              <ChevronRight className="w-8 h-8" />
            </button>

            <div className="flex justify-center gap-2 mt-6">
              {galleryPhotos.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPhoto(index)}
                  className={`h-1 rounded-full transition-all ${
                    index === currentPhoto ? "bg-amber-500 w-8" : "bg-white/30 hover:bg-white/50 w-8"
                  }`}
                />
              ))}
            </div>

            <div className="text-center mt-6">
              <p className="text-sm text-zinc-500 mb-2">
                Want to see more? Check out our{" "}
                <a
                  href="https://www.facebook.com/profile.php?id=100095172626714&sk=photos"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-500 hover:text-amber-400 underline"
                >
                  Facebook Photos
                </a>
              </p>
              <p className="text-xs text-zinc-600">
                To automatically sync photos here, integrate Facebook Graph API
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-50 bg-black py-8 px-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center gap-6">
            <img src={imgNewLogo} alt="Iron Palace Podcast" className="h-16 w-auto" loading="lazy" decoding="async" />

            <p className="text-zinc-400 text-sm text-center max-w-md px-2">
              Questions or want to get involved? Message us on{" "}
              <a
                href="https://www.facebook.com/p/The-Iron-Palace-Podcast-100095172626714/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-500 hover:text-amber-400 underline underline-offset-2"
              >
                Facebook
              </a>{" "}
              or{" "}
              <a
                href="https://www.instagram.com/the_iron_palace_podcast/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-500 hover:text-amber-400 underline underline-offset-2"
              >
                Instagram
              </a>
              .
            </p>

            <div className="flex items-center gap-4">
              <a
                href="https://www.facebook.com/p/The-Iron-Palace-Podcast-100095172626714/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-amber-500 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://www.instagram.com/the_iron_palace_podcast/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-amber-500 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://music.amazon.com/podcasts/948d7a31-8e4a-4cca-a284-b81bbe979f99/the-iron-palace-podcast?ref=dm_sh_W8e0obyIKGENhI3aM53Mf23Vf"
                aria-label="Amazon Music"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-amber-500 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <text x="12" y="12" fontSize="14" fill="currentColor" textAnchor="middle" dominantBaseline="central" fontWeight="600" fontFamily="Arial, sans-serif" stroke="none">a</text>
                </svg>
              </a>
              <a
                href="https://podcasts.apple.com/us/podcast/the-iron-palace-podcast/id1702337857"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-amber-500 transition-colors"
                aria-label="Apple Podcasts"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2.182c5.423 0 9.818 4.395 9.818 9.818 0 5.423-4.395 9.818-9.818 9.818-5.423 0-9.818-4.395-9.818-9.818 0-5.423 4.395-9.818 9.818-9.818zm0 3.273c-2.086 0-3.782 1.696-3.782 3.782 0 1.455.828 2.718 2.036 3.354v5.118c0 .604.491 1.091 1.091 1.091h1.309c.604 0 1.091-.487 1.091-1.091v-5.118c1.209-.636 2.036-1.9 2.036-3.354 0-2.086-1.696-3.782-3.782-3.782zm0 1.636c1.182 0 2.145.964 2.145 2.145 0 1.182-.963 2.145-2.145 2.145-1.182 0-2.145-.963-2.145-2.145 0-1.181.963-2.145 2.145-2.145z"/>
                </svg>
              </a>
              <a
                href="https://open.spotify.com/show/1j1M1DTBSO7wiyqJ4LFvns?si=fe3c30e5c5dd45b1"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-amber-500 transition-colors"
                aria-label="Spotify"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm5.5 17.3c-.2.3-.6.4-.9.2-2.5-1.5-5.6-1.9-9.3-1-0.4.1-.8-.2-.8-.6-.1-.4.2-.8.6-.8 4-.9 7.4-.5 10.2 1.2.3.2.4.7.2 1zm1.3-2.9c-.3.4-.8.5-1.2.2-2.8-1.7-7.1-2.2-10.4-1.2-.5.1-1-.2-1.1-.6-.1-.5.2-1 .6-1.1 3.8-1.1 8.6-.6 11.8 1.4.4.2.5.9.3 1.3zm.1-3c-3.4-2-9-2.2-12.2-1.2-.5.2-1.1-.1-1.3-.6-.2-.5.1-1.1.6-1.3 3.7-1.1 10-0.9 13.9 1.4.5.3.6.9.3 1.4-.3.4-.9.6-1.3.3z"/>
                </svg>
              </a>
              <a
                href="https://dayccaleb.podbean.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-amber-500 transition-colors"
                aria-label="Podcast"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm0 21.6c-5.3 0-9.6-4.3-9.6-9.6S6.7 2.4 12 2.4s9.6 4.3 9.6 9.6-4.3 9.6-9.6 9.6zm0-16.8c-4 0-7.2 3.2-7.2 7.2s3.2 7.2 7.2 7.2 7.2-3.2 7.2-7.2-3.2-7.2-7.2-7.2zm0 12c-2.7 0-4.8-2.2-4.8-4.8S9.3 7.2 12 7.2s4.8 2.2 4.8 4.8-2.1 4.8-4.8 4.8z"/>
                </svg>
              </a>
            </div>

            <p className="text-zinc-500 text-xs">© 2026 The Iron Palace Podcast. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}