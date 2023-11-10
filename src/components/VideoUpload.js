export const VideoUpload = ({
  selectedFile,
  videoDuration,
  handleFileChange,
  videoDimensions,
  handleWaveformClick,
  waveformRef,
}) => {
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <input
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          style={{ fontSize: "20px" }}
        />
      </div>
      {selectedFile && (
        <div className="">
          <p>Selected video: {selectedFile.name}</p>
          <p>
            Duration: {videoDuration !== null ? videoDuration : "Loading..."}
          </p>
          <p>
            Dimensions: {videoDimensions.width} x {videoDimensions.height}
          </p>
        </div>
      )}
    </div>
  );
};
