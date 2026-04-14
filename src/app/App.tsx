import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Calendar, ChevronLeft, ChevronRight, Facebook, Instagram, Play, X } from "lucide-react";
import { Button } from "./components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./components/ui/dialog";
import { useYouTubeVideos, timeAgo } from "./hooks/useYouTubeVideos";

import imgMerchDragon from "../imports/Group2/9fe969f07b1189f5a7e8d627018c5bf063261cab.png";
import imgMerchWhite from "../imports/Group2/0e04069fb44385863cd0bed92320736368ccc2bc.png";
import imgMerchGrey from "../imports/Group2/27719387f55cc5e04ab298523fd29ec98849c475.png";
import imgLifting from "../imports/Group2/b5fff0d1593285f075f46cfdc89c44bd3b39097f.png";
import imgImg20281 from "../imports/Group2/3079c0be861de6bc379a6ca769dbf0748207144a.png";
import imgImg20291 from "../imports/Group2/ce8df0c659a26b7d011b713b1e18821bf06bf4e1.png";
import imgImg20251 from "../imports/Group2/1ede6e433cb6efbe5f751aee62ab893cda99b1d5.png";
import imgImg20311 from "../imports/Group2/8c77f10a72680404a307b4bf8049706d39cdd092.png";
import imgImg20261 from "../imports/Group2/d32e1b27f2f8c2210ddd1d6f3ea0ca06e1cadb54.png";
import imgNewLogo from "../assets/feef32863d06775804f6af6bbe43f8df154b97b4.png";
import imgCommunity1 from "../assets/1ea5b08a1e66e411f08d673b6535fb4addf3fed8.png";
import imgCommunity2 from "../assets/60f79edf345665e7536dfcdb7ba228f0f791b1b7.png";
import imgCommunity3 from "../assets/da863c2d6b8087a171fdd66ac8e98684908370f4.png";

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
    name: "Lisa Ellen",
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
  const [donateOpen, setDonateOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const [hoveredCrew, setHoveredCrew] = useState<number | null>(null);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [featuredPlaying, setFeaturedPlaying] = useState(false);
  const { videos, loading: videosLoading } = useYouTubeVideos(15);

  const latestVideoId = videos.length > 0 ? videos[0].videoId : null;
  const latestVideoTitle = videos.length > 0 ? videos[0].title : "Latest Episode";

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
    <div className="min-h-screen bg-black text-white pb-[calc(4rem+env(safe-area-inset-bottom,0px))]">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-xl border-b border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <a
              href="https://www.instagram.com/the_iron_palace_podcast/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={imgNewLogo} alt="Iron Palace Podcast" className="h-12 w-auto" />
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

            <Button
              onClick={() => setDonateOpen(true)}
              className="relative shrink-0 bg-gradient-to-br from-amber-600 via-amber-600 to-amber-700 hover:from-amber-500 hover:via-amber-500 hover:to-amber-600 text-white shadow-lg shadow-amber-900/40 hover:shadow-xl hover:shadow-amber-900/50 hover:scale-105 transition-all duration-300 border border-amber-500/50 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-amber-400/60 via-transparent to-amber-950/70"></div>
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_0%,rgba(255,250,200,0.8),transparent_40%)]"></div>
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_100%,rgba(113,63,18,0.6),transparent_40%)]"></div>
              <div className="relative mr-0 sm:mr-2 h-4 w-4 z-10">
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 24 24" fill="none">
                  <defs>
                    <filter id="heartInnerShadow" x="-50%" y="-50%" width="200%" height="200%">
                      <feComponentTransfer in="SourceAlpha" result="inverse">
                        <feFuncA type="table" tableValues="1 0"/>
                      </feComponentTransfer>
                      <feGaussianBlur in="inverse" stdDeviation="1.2" result="blur"/>
                      <feOffset in="blur" dx="0" dy="2" result="offsetBlur"/>
                      <feFlood floodColor="rgb(127, 29, 29)" floodOpacity="0.85" result="color"/>
                      <feComposite in="color" in2="offsetBlur" operator="in" result="shadow"/>
                      <feComposite in="shadow" in2="SourceAlpha" operator="in" result="innerShadow"/>

                      <feGaussianBlur in="inverse" stdDeviation="0.8" result="blur2"/>
                      <feOffset in="blur2" dx="0" dy="-1" result="offsetBlur2"/>
                      <feFlood floodColor="rgb(80, 7, 7)" floodOpacity="0.7" result="color2"/>
                      <feComposite in="color2" in2="offsetBlur2" operator="in" result="shadow2"/>
                      <feComposite in="shadow2" in2="SourceAlpha" operator="in" result="innerShadow2"/>

                      <feMerge>
                        <feMergeNode in="SourceGraphic"/>
                        <feMergeNode in="innerShadow"/>
                        <feMergeNode in="innerShadow2"/>
                      </feMerge>
                    </filter>
                  </defs>
                  <path
                    d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                    fill="#dc2626"
                    filter="url(#heartInnerShadow)"
                  />
                </svg>
              </div>
              <span className="hidden sm:inline relative z-10">Donate</span>
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* Fixed inquire bar — same glass treatment as header */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/20 bg-black/40 backdrop-blur-xl shadow-[0_-8px_32px_rgba(0,0,0,0.3)] pb-[max(0.5rem,env(safe-area-inset-bottom))]"
        role="region"
        aria-label="Participation inquiry"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2.5 flex items-center justify-center gap-2 sm:gap-3">
          <span className="hidden sm:inline text-xs font-light tracking-wide text-white/90">
            Interested in Participating?
          </span>
          <Button
            onClick={() => setContactOpen(true)}
            variant="outline"
            className="border-white/20 bg-black/30 backdrop-blur-md text-white shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:bg-white/10 hover:text-amber-400 hover:border-amber-500/40 transition-all duration-300 rounded-full px-3 py-1.5 h-auto text-[10px] sm:text-xs uppercase tracking-wider"
          >
            Inquire
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={imgLifting}
            alt="The Iron Palace"
            className="w-full h-full object-cover scale-105"
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
              style={{
                filter: 'brightness(2) contrast(1.2) drop-shadow(0 0 40px rgba(255,255,255,0.8)) drop-shadow(0 10px 60px rgba(220,38,38,0.4))',
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
            className="relative aspect-video max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6)] ring-1 ring-white/10 group"
          >
            {featuredPlaying && latestVideoId ? (
              <iframe
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube.com/embed/${latestVideoId}?autoplay=1&playsinline=1`}
                title={latestVideoTitle}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <div
                role="button"
                tabIndex={0}
                onClick={() => setFeaturedPlaying(true)}
                onKeyDown={(e) => e.key === "Enter" && setFeaturedPlaying(true)}
                className="absolute inset-0 cursor-pointer bg-black"
                aria-label={`Play ${latestVideoTitle}`}
              >
                {latestVideoId ? (
                  <img
                    src={`https://i.ytimg.com/vi/${latestVideoId}/hqdefault.jpg`}
                    alt={latestVideoTitle}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-zinc-900 animate-pulse" />
                )}
                <div className="absolute inset-0 bg-black/30 active:bg-black/50 transition-colors duration-300" />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 sm:gap-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-600 flex items-center justify-center shadow-2xl shadow-red-900/60 active:scale-95 transition-transform duration-200">
                    <Play className="w-7 h-7 sm:w-9 sm:h-9 text-white ml-0.5 sm:ml-1" fill="white" />
                  </div>
                  {latestVideoId && (
                    <p className="text-white/90 text-sm sm:text-lg font-medium drop-shadow-lg max-w-xs sm:max-w-lg text-center px-4">
                      {latestVideoTitle}
                    </p>
                  )}
                </div>
              </div>
            )}
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
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-light tracking-wide uppercase mb-4">Recent Episodes</h2>
            <p className="text-zinc-400 text-sm">Catch up on what you missed</p>
          </motion.div>

          {videosLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-video bg-zinc-800 rounded-xl mb-3" />
                  <div className="h-4 bg-zinc-800 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-zinc-800 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {videos.map((video, index) => (
                <motion.div
                  key={video.videoId}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="group cursor-pointer active:scale-[0.98] transition-transform"
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
          )}

          <div className="text-center mt-10">
            <a
              href="https://www.youtube.com/@TheIronPalacePodcast"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <Button className="relative bg-gradient-to-br from-amber-600 via-amber-600 to-amber-700 hover:from-amber-500 hover:via-amber-500 hover:to-amber-600 text-white font-medium px-5 py-3 rounded-lg shadow-lg shadow-amber-900/50 hover:shadow-xl hover:shadow-amber-900/60 hover:scale-105 transition-all duration-300 border border-amber-500/50 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-amber-400/60 via-transparent to-amber-950/70"></div>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_0%,rgba(255,250,200,0.8),transparent_40%)]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_100%,rgba(113,63,18,0.6),transparent_40%)]"></div>
                <span className="relative z-10">View All on YouTube</span>
              </Button>
            </a>
          </div>
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
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-lg font-light uppercase tracking-wide mb-2 group-hover:text-amber-500 transition-colors">{item.name}</h3>
                <p className="text-zinc-400 text-base">{item.price}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <div className="inline-block relative overflow-hidden group rounded-lg">
              <Button className="relative bg-gradient-to-br from-amber-600 via-amber-600 to-amber-700 hover:from-amber-500 hover:via-amber-500 hover:to-amber-600 text-white border border-amber-500/50 rounded-lg px-6 py-3 text-sm font-light uppercase tracking-wider transition-all hover:scale-105 shadow-lg shadow-amber-900/50 hover:shadow-xl hover:shadow-amber-900/60 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-amber-400/60 via-transparent to-amber-950/70"></div>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_0%,rgba(255,250,200,0.8),transparent_40%)]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_100%,rgba(113,63,18,0.6),transparent_40%)]"></div>
                <span className="relative z-10">Shop All</span>
              </Button>
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
            <img src={imgNewLogo} alt="Iron Palace Podcast" className="h-16 w-auto" />

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

      {/* Donate Dialog */}
      <Dialog open={donateOpen} onOpenChange={setDonateOpen}>
        <DialogContent className="bg-black/95 backdrop-blur-xl border-white/20 text-white shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Support The Iron Palace</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Your support helps us keep the podcast running and deliver quality content every week.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-zinc-300">
              We appreciate every donation, no matter the size. Your contributions go towards equipment, editing, and making the show better for you!
            </p>
            <div className="grid grid-cols-2 gap-4">
              <a href="https://venmo.com/Caleb-Day-10?txn=pay&amount=5&note=Iron%20Palace%20Podcast%20Donation" target="_blank" rel="noopener noreferrer" className="block">
                <Button className="w-full relative bg-gradient-to-br from-amber-600 via-amber-600 to-amber-700 hover:from-amber-500 hover:via-amber-500 hover:to-amber-600 text-white border border-amber-500/50 py-6 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-amber-400/60 via-transparent to-amber-950/70"></div>
                  <span className="relative z-10">Donate $5</span>
                </Button>
              </a>
              <a href="https://venmo.com/Caleb-Day-10?txn=pay&amount=10&note=Iron%20Palace%20Podcast%20Donation" target="_blank" rel="noopener noreferrer" className="block">
                <Button className="w-full relative bg-gradient-to-br from-amber-600 via-amber-600 to-amber-700 hover:from-amber-500 hover:via-amber-500 hover:to-amber-600 text-white border border-amber-500/50 py-6 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-amber-400/60 via-transparent to-amber-950/70"></div>
                  <span className="relative z-10">Donate $10</span>
                </Button>
              </a>
              <a href="https://venmo.com/Caleb-Day-10?txn=pay&amount=25&note=Iron%20Palace%20Podcast%20Donation" target="_blank" rel="noopener noreferrer" className="block">
                <Button className="w-full relative bg-gradient-to-br from-amber-600 via-amber-600 to-amber-700 hover:from-amber-500 hover:via-amber-500 hover:to-amber-600 text-white border border-amber-500/50 py-6 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-amber-400/60 via-transparent to-amber-950/70"></div>
                  <span className="relative z-10">Donate $25</span>
                </Button>
              </a>
              <a href="https://venmo.com/Caleb-Day-10?txn=pay&note=Iron%20Palace%20Podcast%20Donation" target="_blank" rel="noopener noreferrer" className="block">
                <Button className="w-full relative bg-gradient-to-br from-amber-600 via-amber-600 to-amber-700 hover:from-amber-500 hover:via-amber-500 hover:to-amber-600 text-white border border-amber-500/50 py-6 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-amber-400/60 via-transparent to-amber-950/70"></div>
                  <span className="relative z-10">Custom Amount</span>
                </Button>
              </a>
            </div>
            <p className="text-xs text-zinc-500 text-center pt-4 flex items-center justify-center gap-1.5">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M19.1 3.5c.8 1.3 1.2 2.7 1.2 4.3 0 3.4-2.3 7.3-4.2 10.2H10L8.5 3.8l5-.5.9 7.1c.8-1.4 1.8-3.5 1.8-5 0-1.5-.4-2.5-.9-3.3l3.8-1.6z"/></svg>
              Powered by Venmo &middot; @Caleb-Day-10
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Contact Dialog */}
      <Dialog open={contactOpen} onOpenChange={setContactOpen}>
        <DialogContent className="bg-black/80 backdrop-blur-2xl border-white/30 text-white shadow-2xl max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl md:text-2xl font-light tracking-wide">Get In Touch</DialogTitle>
            <DialogDescription className="text-zinc-400 text-sm">
              We'd love to hear from you. Fill out the form below and we'll get back to you as soon as possible.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4 py-3"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-xs font-light text-zinc-300">Name</label>
              <input
                id="name"
                type="text"
                className="w-full px-3 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all text-sm"
                placeholder="Your name"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-light text-zinc-300">Email</label>
              <input
                id="email"
                type="email"
                className="w-full px-3 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all text-sm"
                placeholder="your.email@example.com"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="inquiry" className="text-xs font-light text-zinc-300">I'm interested in...</label>
              <select
                id="inquiry"
                className="w-full px-3 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all appearance-none cursor-pointer text-sm"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.75rem center',
                  backgroundSize: '1.25rem'
                }}
              >
                <option value="" className="bg-zinc-900">Select an option</option>
                <option value="guest" className="bg-zinc-900">Being a podcast guest</option>
                <option value="event-signup" className="bg-zinc-900">Signing up for an existing event</option>
                <option value="event-host" className="bg-zinc-900">Inviting Iron Palace to host a future event</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="message" className="text-xs font-light text-zinc-300">Message</label>
              <textarea
                id="message"
                rows={4}
                className="w-full px-3 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all resize-none text-sm"
                placeholder="Tell us more about your inquiry..."
              />
            </div>

            <Button
              type="submit"
              className="w-full relative bg-gradient-to-br from-amber-600 via-amber-600 to-amber-700 hover:from-amber-500 hover:via-amber-500 hover:to-amber-600 text-white border border-amber-500/50 py-3 overflow-hidden shadow-lg hover:shadow-xl transition-all"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-amber-400/60 via-transparent to-amber-950/70"></div>
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_0%,rgba(255,250,200,0.8),transparent_40%)]"></div>
              <span className="relative z-10 font-medium uppercase tracking-wide text-sm">Send Message</span>
            </Button>

            <p className="text-[10px] text-zinc-500 text-center pt-1">
              This is a demo form. Connect your backend to enable message submission.
            </p>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}