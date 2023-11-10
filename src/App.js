import React, { useCallback, useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import { VideoUpload } from "./components/VideoUpload";
import { VideoCanvas } from "./components/VideoCanvas";
import { formatTime } from "./helper";

const App = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const isPlaying = useRef(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isPlay, setIsPlay] = useState(false);
  const [videoDuration, setVideoDuration] = useState(null);
  const [videoDimensions, setVideoDimensions] = useState({
    width: null,
    height: null,
  });
  const [emptyFile, setEmptyFile] = useState(false);
  const waveformRef = useRef(null);
  const wavesurferRef = useRef(null);
  const audioContextRef = useRef(null);

  useEffect(() => {
    drawCanvas();
    if (selectedFile) {
      const wavesurfer = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: "violet",
        progressColor: "purple",
        cursorColor: "navy",
        barWidth: 2,
        barRadius: 3,
        responsive: true,
        hideScrollbar: true,
      });

      wavesurfer.load(URL.createObjectURL(selectedFile));
      wavesurfer.on("ready", () => {
        setVideoDuration(formatTime(wavesurfer.getDuration()));
      });
      wavesurferRef.current = wavesurfer;
      wavesurfer.setVolume(0);
    }
  }, [selectedFile]);

  const handleWaveformClick = useCallback((event) => {
    if (wavesurferRef.current && videoRef.current) {
      const rect = waveformRef.current.getBoundingClientRect();
      const seekTime =
        ((event.clientX - rect.left) / rect.width) *
        wavesurferRef.current.getDuration();
      videoRef.current.currentTime = seekTime;
    }
  }, []);

  const handlePlayPause = () => {
    if (videoRef.current && wavesurferRef.current) {
      if (isPlaying.current) {
        videoRef.current.pause();
        wavesurferRef.current.pause();
        isPlaying.current = false;
        setIsPlay(false);
      } else {
        videoRef.current.play();
        wavesurferRef.current.play();
        isPlaying.current = true;
        setIsPlay(true);
        drawCanvas();
      }
    }
  };

  const handleFileChange = (event) => {
    reinitialize();
    const file = event.target.files[0];
    // if (!file) {
    //   // User canceled the file selection
    //   return;
    // }

    const blobURL = URL.createObjectURL(file);

    videoRef.current.src = blobURL;
    videoRef.current.onloadedmetadata = () => {
      setVideoDuration(formatTime(videoRef.current.duration));
      setVideoDimensions({
        width: videoRef.current.videoWidth,
        height: videoRef.current.videoHeight,
      });
    };

    setSelectedFile(file);
    handlePlayPause();

    // Check if AudioContext is supported before using it
    if (window.AudioContext || window.webkitAudioContext) {
      audioContextRef.current = new (window.AudioContext ||
        window.webkitAudioContext)();
      detectAudio(file);
    } else {
      alert("audio context not supported in browser");
      console.log("AudioContext not supported in this browser.");
    }
  };

  const detectAudio = (file) => {
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)(); // Updated initialization

    const reader = new FileReader();
    reader.onload = async (event) => {
      const buffer = event.target.result;

      try {
        const audioBuffer = await audioContext.decodeAudioData(buffer);
        const hasAudio = audioBuffer.numberOfChannels > 0;

        if (!hasAudio) {
          if (waveformRef.current) {
            alert(
              "The uploaded video doesn't contain audio or it's in an unsupported format."
            );
            setSelectedFile(null); // Clear the selected file
          }
        }
      } catch (error) {
        console.error("Error decoding audio data: ", error);

        if (waveformRef.current) {
          reinitialize();
          setEmptyFile(true);
          alert(
            "Error decoding audio data. Please try another file or check the format."
          );
          setSelectedFile(null);
        }
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const draw = () => {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      if (isPlaying.current) {
        requestAnimationFrame(draw);
      }
    };

    requestAnimationFrame(draw);
  };

  const reinitialize = () => {
    videoRef.current.src = ""; // Reset the video source
    setSelectedFile(null); // Reset the selected file state
    setIsPlay(false); // Reset the play state

    setVideoDuration(null); // Reset video duration state
    setVideoDimensions({
      width: null,
      height: null,
    }); // Reset video dimensions state

    // Reset WaveSurfer related refs
    if (wavesurferRef.current) {
      wavesurferRef.current.unAll(); // Unbind all the events
      wavesurferRef.current.destroy(); // Destroy the current WaveSurfer instance
      wavesurferRef.current = null;
    }

    // Reset AudioContext related ref
    audioContextRef.current = null;
  };
  useEffect(() => {
    const handleVideoTimeUpdate = () => {
      if (videoRef.current && wavesurferRef.current) {
        const duration = videoRef.current.duration;
        const time = videoRef.current.currentTime;
        const timeFraction = duration > 0 ? time / duration : 0;

        if (isFinite(time) && isFinite(duration)) {
          wavesurferRef.current.seekTo(timeFraction);
        }
      }
    };

    videoRef.current.addEventListener("timeupdate", handleVideoTimeUpdate);

    return () => {
      videoRef.current.removeEventListener("timeupdate", handleVideoTimeUpdate);
    };
  }, []);

  console.log("render");

  return (
    <div style={{ marginTop: "30px" }}>
      <VideoUpload
        selectedFile={selectedFile}
        videoDuration={videoDuration}
        handleFileChange={handleFileChange}
        videoDimensions={videoDimensions}
        handleWaveformClick={handleWaveformClick}
        waveformRef={waveformRef}
      />
      <VideoCanvas
        canvasRef={canvasRef}
        handlePlayPause={handlePlayPause}
        isPlay={isPlay}
        videoRef={videoRef}
        handleWaveformClick={handleWaveformClick}
        selectedFile={selectedFile}
        waveformRef={waveformRef}
      />
    </div>
  );
};

export default App;
