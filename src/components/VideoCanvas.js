import { AiFillPlayCircle, AiOutlinePauseCircle } from "react-icons/ai";

export const VideoCanvas = ({
  canvasRef,
  handlePlayPause,
  isPlay,
  videoRef,
  selectedFile,
  waveformRef,
  handleWaveformClick,
}) => {
  return (
    <>
      <div
        style={{
          marginTop: "30px",
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <canvas
          ref={canvasRef}
          width="640"
          height="360"
          style={{ border: "1px solid black" }}
        ></canvas>
        <button
          onClick={handlePlayPause}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontSize: "50px",
            background: "none",
            border: "none",
            padding: "0",
            color: "white",
          }}
        >
          {isPlay ? <AiOutlinePauseCircle /> : <AiFillPlayCircle />}
        </button>
        <video
          ref={videoRef}
          style={{ display: "none" }}
          onEnded={handlePlayPause}
        />
      </div>
      {/* metadata details */}
      <div style={{ width: "640" }}>
        {selectedFile && (
          <div
            ref={waveformRef}
            onClick={handleWaveformClick}
            style={{ width: "100%", overflow: "hidden" }}
          ></div>
        )}
      </div>
    </>
  );
};
