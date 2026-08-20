import { useState, useRef } from 'react';

export default function VideoPlayer({ 
  videoId, 
  videoSource, 
  setVideoSource, 
  uploadedVideoUrl, 
  setUploadedVideoUrl,
  exercise
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaStream, setMediaStream] = useState(null);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedVideoUrl(url);
      setVideoSource('upload');
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setMediaStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setVideoSource('camera');
      recordedChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setUploadedVideoUrl(url);
        stream.getTracks().forEach(track => track.stop());
        setMediaStream(null);
        setVideoSource('recorded');
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      alert('Camera access denied or unavailable: ' + err.message);
    }
  };

  const stopCamera = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="glass-card overflow-hidden">
      {/* ── Mode Selection Tabs ── */}
      <div className="bg-black/80 flex items-center justify-between px-3 py-2 border-b border-white/10 flex-wrap gap-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setVideoSource('demo')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              videoSource === 'demo'
                ? 'bg-roast text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            🎬 Preset Clip
          </button>
          <label
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              videoSource === 'upload'
                ? 'bg-roast text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            📁 Upload Video
            <input
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
          <button
            onClick={videoSource === 'camera' && isRecording ? stopCamera : startCamera}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1 ${
              videoSource === 'camera' || videoSource === 'recorded'
                ? 'bg-red-600 text-white animate-pulse'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {isRecording ? '⏹ Stop Recording' : '🔴 Record with Camera'}
          </button>
        </div>

        <span className="text-xs text-yellow-400 font-mono capitalize">
          {exercise} mode
        </span>
      </div>

      {/* ── Player Area ── */}
      <div className="relative w-full bg-black" style={{ paddingBottom: '56.25%' }}>
        {videoSource === 'demo' && (
          <iframe
            className="absolute inset-0 w-full h-full"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1`}
            title="Form check video"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}

        {videoSource === 'camera' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            {isRecording && (
              <div className="absolute top-4 left-4 bg-red-600/90 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                RECORDING YOUR ATTEMPT...
              </div>
            )}
          </div>
        )}

        {(videoSource === 'upload' || videoSource === 'recorded') && uploadedVideoUrl && (
          <video
            className="absolute inset-0 w-full h-full object-contain"
            src={uploadedVideoUrl}
            controls
            autoPlay
            loop
          />
        )}
      </div>

      <div className="px-4 py-3 flex items-center justify-between border-t border-white/10 bg-black/40">
        <div className="flex items-center gap-2">
          <span className="text-yellow-400 text-sm">⚠️</span>
          <span className="text-xs text-gray-400">
            {videoSource === 'demo'
              ? 'Analyzing demo form: Structural integrity of wet spaghetti detected.'
              : videoSource === 'camera'
              ? 'Stand back and perform 2-3 clean reps.'
              : 'Uploaded clip ready for AI roast & biomechanical breakdown.'}
          </span>
        </div>
      </div>
    </div>
  );
}
