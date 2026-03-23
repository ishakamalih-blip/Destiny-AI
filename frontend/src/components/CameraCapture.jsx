import { useState, useRef, useEffect } from 'react';
import { Camera, X, RotateCcw } from 'lucide-react';

const CameraCapture = ({ onCapture, onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [captured, setCaptured] = useState(false);
  const startRef = useRef(null);
  const initializedRef = useRef(false);
  const [devices, setDevices] = useState([]);
  const [deviceId, setDeviceId] = useState('');

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const startCamera = async () => {
      setError(null);
      // Try back camera first; fallback to front/user camera
      const tryConstraints = async (constraints) => {
        return await navigator.mediaDevices.getUserMedia(constraints);
      };
      try {
        const mediaStream = await tryConstraints(
          deviceId
            ? { video: { deviceId: { exact: deviceId } } }
            : {
                video: {
                  facingMode: { ideal: 'environment' },
                  width: { ideal: 1280 },
                  height: { ideal: 720 }
                }
              }
        );
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        try {
          const all = await navigator.mediaDevices.enumerateDevices();
          const cams = all.filter(d => d.kind === 'videoinput');
          setDevices(cams);
          if (!deviceId && cams.length > 0) {
            setDeviceId(cams[0].deviceId);
          }
        } catch {
          // ignore enumerate failure
        }
      } catch {
        try {
          const mediaStream = await tryConstraints({
            video: {
              facingMode: { ideal: 'user' },
              width: { ideal: 1280 },
              height: { ideal: 720 }
            }
          });
          setStream(mediaStream);
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
          try {
            const all = await navigator.mediaDevices.enumerateDevices();
            const cams = all.filter(d => d.kind === 'videoinput');
            setDevices(cams);
            if (!deviceId && cams.length > 0) {
              setDeviceId(cams[0].deviceId);
            }
          } catch {
            // ignore enumerate failure
          }
        } catch (err) {
          try {
            const mediaStream = await tryConstraints({ video: true });
            setStream(mediaStream);
            if (videoRef.current) {
              videoRef.current.srcObject = mediaStream;
            }
            try {
              const all = await navigator.mediaDevices.enumerateDevices();
              const cams = all.filter(d => d.kind === 'videoinput');
              setDevices(cams);
              if (!deviceId && cams.length > 0) {
                setDeviceId(cams[0].deviceId);
              }
            } catch {
              // ignore enumerate failure
            }
          } catch (finalErr) {
            setError('Camera access denied or not available. Please allow camera permissions and ensure no other app is using the camera.');
            console.error('Camera error:', finalErr);
            return;
          }
          console.error('Camera error:', err);
        }
      }
    };
    startRef.current = startCamera;
    const checkDevices = async () => {
      try {
        const all = await navigator.mediaDevices.enumerateDevices();
        const cams = all.filter(d => d.kind === 'videoinput');
        if (cams.length === 0) {
          setError('No camera devices detected. Please connect a camera and refresh.');
          return false;
        }
        return true;
      } catch (e) {
        console.error('Enumerate devices failed:', e);
        // Proceed to attempt camera; some browsers require getUserMedia before labels appear
        return true;
      }
    };
    checkDevices().then(hasDevices => {
      if (hasDevices) startCamera();
    });

    return () => {
      const s = videoRef.current && videoRef.current.srcObject;
      if (s && typeof s.getTracks === 'function') {
        s.getTracks().forEach(track => track.stop());
      }
    };
  }, [deviceId]);

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      const file = new File([blob], 'palm_capture.jpg', { type: 'image/jpeg' });
      onCapture(file);
      setCaptured(true);
    }, 'image/jpeg', 0.8);
  };

  const retake = () => {
    setCaptured(false);
  };

  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    onClose();
  };
  
  const retryCamera = async () => {
    // Stop existing stream if any
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCaptured(false);
    if (startRef.current) {
      await startRef.current();
    }
  };
  
  const useSelectedCamera = async () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCaptured(false);
    if (startRef.current) {
      await startRef.current();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white text-lg font-semibold">Palm Scanner</h3>
          <button
            onClick={closeCamera}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {!captured && !error && (
          <div className="mb-4 p-3 bg-blue-900/30 border border-blue-500/50 text-blue-200 text-sm text-center rounded">
            Position your palm clearly in the frame and ensure good lighting for accurate analysis.
          </div>
        )}
        
        {!captured && devices.length > 0 && (
          <div className="mb-4 flex items-center gap-2">
            <select
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
              className="flex-1 bg-gray-800 text-white border border-gray-700 rounded px-3 py-2"
            >
              {devices.map(d => (
                <option key={d.deviceId} value={d.deviceId}>
                  {d.label || 'Camera'}
                </option>
              ))}
            </select>
            <button
              onClick={useSelectedCamera}
              className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Use Selected
            </button>
          </div>
        )}

        {error ? (
          <div className="text-red-400 text-center py-8">
            {error}
            <br />
            <button
              onClick={retryCamera}
              className="mt-4 mr-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry Camera
            </button>
            <button
              onClick={closeCamera}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="relative mb-4">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full rounded ${captured ? 'hidden' : 'block'}`}
              />
              <canvas
                ref={canvasRef}
                className={`w-full rounded ${captured ? 'block' : 'hidden'}`}
              />
            </div>

            <div className="flex justify-center gap-4">
              {!captured ? (
                <button
                  onClick={captureImage}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Camera className="w-5 h-5" />
                  Capture Palm
                </button>
              ) : (
                <>
                  <button
                    onClick={retake}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Retake
                  </button>
                  <button
                    onClick={closeCamera}
                    className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Use This Image
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CameraCapture;
