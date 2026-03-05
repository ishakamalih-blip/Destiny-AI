import { useState, useRef, useCallback } from 'react';
import axios from 'axios';
import Webcam from 'react-webcam';
import { motion } from 'framer-motion';
import { Activity, Zap, Heart, Brain, Download, Cpu, Shield, Upload, Scan, Camera, X, FileText } from 'lucide-react';

export default function Analysis() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const webcamRef = useRef(null);

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user"
  };

  const handleCameraError = useCallback((err) => {
    console.error("Camera access error:", err);
    if (err.name === "NotReadableError") {
      setCameraError("CAMERA IS BUSY: Another app (Zoom, Teams, WhatsApp) is using your camera. Please close it and try again.");
    } else if (err.name === "NotAllowedError") {
      setCameraError("PERMISSION DENIED: Please allow camera access in your browser settings.");
    } else {
      setCameraError("CAMERA ERROR: Could not start video. Please ensure your camera is connected.");
    }
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setExtractedData(null);
      setIsCameraOpen(false);
    }
  };

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      // Convert base64 to file
      fetch(imageSrc)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], "webcam-capture.jpg", { type: "image/jpeg" });
          setSelectedFile(file);
          setPreviewUrl(imageSrc);
          setResult(null);
          setExtractedData(null);
          setIsCameraOpen(false);
        });
    }
  }, [webcamRef]);

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setResult(null); // Clear previous results immediately for visual feedback
    setExtractedData(null);
    
    const username = localStorage.getItem('user_name') || 'guest';
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      // Simulate scanning effect time
      await new Promise(resolve => setTimeout(resolve, 2000));

      const response = await axios.post(`http://localhost:8000/analyze-image?username=${username}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setResult(response.data);
      setExtractedData(response.data.extracted_data);
      // Store analysis in localStorage for Chat context
      localStorage.setItem('latestAnalysis', JSON.stringify(response.data));
      setLoading(false);
    } catch (error) {
      console.error("Analysis failed", error);
      setLoading(false);
      alert("SYSTEM ERROR: Analysis failed. Please try again.");
    }
  };

  const handleDownloadReport = async () => {
      if (!extractedData) return;
      
      try {
          const response = await axios.post('http://localhost:8000/report', extractedData, {
              responseType: 'blob'
          });
          
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', 'Palm_Analysis_Report.pdf');
          document.body.appendChild(link);
          link.click();
          link.remove();
      } catch (error) {
          console.error("Report generation failed", error);
          alert("Failed to generate analysis report.");
      }
  };

  return (
    <div className="space-y-8 relative">
       {/* Background Tech Grid Effect */}
       <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] animate-pulse pointer-events-none"></div>

      <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-white font-sci border-b border-blue-500/30 pb-4 inline-block">
        PALM ANALYSIS
      </h1>
      
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Input Section */}
        <div className="glass-panel p-8 rounded-xl relative overflow-hidden border-t border-l border-blue-500/20 flex flex-col">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
             <Scan className="w-48 h-48" />
          </div>

          <h2 className="mb-6 text-xl font-sci text-blue-400 tracking-wider flex items-center">
            <Cpu className="w-5 h-5 mr-2" /> SCAN YOUR PALM
          </h2>

          <div className="flex-1 flex flex-col items-center justify-center space-y-6">
            
            {/* Input Toggle */}
            <div className="flex space-x-4 mb-2">
                <button 
                    onClick={() => setIsCameraOpen(false)}
                    className={`px-4 py-2 text-xs font-mono uppercase tracking-widest border rounded transition-all ${!isCameraOpen ? 'bg-blue-500 text-white border-blue-500' : 'bg-transparent text-cyber-dim border-cyber-dim/30 hover:border-blue-500/50'}`}
                >
                    Upload File
                </button>
                <button 
                    onClick={() => { setIsCameraOpen(true); setPreviewUrl(null); setSelectedFile(null); setResult(null); }}
                    className={`px-4 py-2 text-xs font-mono uppercase tracking-widest border rounded transition-all ${isCameraOpen ? 'bg-blue-500 text-white border-blue-500' : 'bg-transparent text-cyber-dim border-cyber-dim/30 hover:border-blue-500/50'}`}
                >
                    Live Camera
                </button>
            </div>

            {/* Media Area */}
            <div className="w-full relative group">
                {isCameraOpen ? (
                    <div className="w-full h-64 border-2 border-blue-500 rounded-xl flex flex-col items-center justify-center relative overflow-hidden bg-black">
                         {cameraError ? (
                            <div className="text-center p-4">
                                <X className="w-12 h-12 text-red-500 mx-auto mb-2" />
                                <p className="text-red-400 text-xs font-mono uppercase tracking-tighter mb-4">{cameraError}</p>
                                <div className="flex flex-col gap-2">
                                    <button 
                                        onClick={() => { setCameraError(null); }}
                                        className="bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 border border-blue-500/50 px-4 py-2 rounded text-[10px] uppercase font-bold"
                                    >
                                        RETRY CAMERA
                                    </button>
                                    <button 
                                        onClick={() => { setCameraError(null); setIsCameraOpen(false); }}
                                        className="text-cyber-dim hover:text-white text-[10px] underline uppercase transition-colors"
                                    >
                                        Switch to File Upload
                                    </button>
                                </div>
                            </div>
                         ) : (
                            <>
                                <Webcam
                                    audio={false}
                                    ref={webcamRef}
                                    screenshotFormat="image/jpeg"
                                    videoConstraints={videoConstraints}
                                    onUserMedia={() => console.log("Camera Stream Started")}
                                    onUserMediaError={handleCameraError}
                                    mirrored={true}
                                    className="w-full h-full object-cover"
                                />
                                <button 
                                    onClick={capture}
                                    className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-6 py-2 rounded-full font-bold font-sci tracking-wider hover:scale-105 transition-transform flex items-center shadow-neon-blue z-30"
                                >
                                    <Camera className="w-4 h-4 mr-2" /> CAPTURE
                                </button>
                            </>
                         )}
                    </div>
                ) : (
                    <>
                        <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleFileChange} 
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                        />
                        
                        <div className={`w-full h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all duration-300 relative overflow-hidden ${selectedFile ? 'border-blue-500 bg-cyber-dark/80' : 'border-cyber-dim/30 hover:border-blue-500/50 hover:bg-blue-500/5'}`}>
                            
                            {previewUrl ? (
                                <>
                                    <img src={previewUrl} alt="Palm Preview" className="h-full w-full object-contain opacity-80" />
                                    {/* Scanning Overlay */}
                                    {loading && (
                                        <motion.div 
                                            className="absolute inset-0 border-b-2 border-blue-400/80 bg-gradient-to-b from-transparent to-blue-500/10 z-10"
                                            initial={{ top: "-100%" }}
                                            animate={{ top: "100%" }}
                                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                        />
                                    )}
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')] opacity-20 pointer-events-none"></div>
                                </>
                            ) : (
                                <div className="text-center p-6">
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-cyber-dark border border-blue-500/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                        <Upload className="w-8 h-8 text-blue-400" />
                                    </div>
                                    <p className="text-blue-400 font-sci tracking-wider mb-2">UPLOAD PALM SCAN</p>
                                    <p className="text-cyber-dim text-xs font-mono">Supports JPG, PNG (Max 5MB)</p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Action Button */}
            <button 
              id="execute-analysis-btn"
              onClick={handleAnalyze}
              disabled={loading || !selectedFile}
              className={`w-full py-4 font-bold uppercase tracking-[0.2em] transition-all duration-300 rounded relative overflow-hidden group ${loading || !selectedFile ? 'bg-cyber-dark text-cyber-dim cursor-not-allowed border border-cyber-dim/20' : 'bg-transparent border border-blue-500 text-blue-400 hover:bg-blue-600 hover:text-white hover:shadow-neon-blue'}`}
            >
              {loading ? (
                <div className="flex items-center justify-center relative z-10">
                   <div className="absolute inset-0 bg-blue-500/20 animate-pulse"></div>
                   <motion.div 
                     animate={{ rotate: 360 }}
                     transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                     className="mr-3"
                   >
                     <Activity className="w-5 h-5" />
                   </motion.div>
                   <span className="animate-pulse">READING PALM LINES...</span>
                </div>
              ) : 'START ANALYSIS'}
              
              {!loading && selectedFile && (
                 <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent transform skew-x-12 group-hover:animate-shine"></div>
              )}
            </button>
          </div>
        </div>

        {/* Results Section */}
        {result ? (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-panel p-8 rounded-xl border-t-2 border-blue-500 relative overflow-hidden"
          >
             {/* Decorative Circle */}
             <div className="absolute -bottom-12 -right-12 w-48 h-48 border-4 border-blue-500/10 rounded-full border-dashed animate-spin-slow pointer-events-none"></div>

            <h2 className="mb-6 text-xl font-sci text-blue-400 tracking-wider flex items-center">
              <Activity className="w-6 h-6 mr-3 text-blue-400" /> ANALYSIS RESULTS
            </h2>
            
            <div className="space-y-6 relative z-10">
              <div className="p-4 bg-cyber-dark/50 rounded border-l-4 border-blue-500">
                <h3 className="font-bold text-blue-400 text-sm uppercase tracking-wider mb-2 flex items-center">
                  <Brain className="w-4 h-4 mr-2" /> Mind & Thinking
                </h3>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                       <span className="text-cyber-dim text-xs">THINKING STYLE</span>
                       <p className="text-white font-mono text-sm">{result.cognitive_profile.thinking_ability}</p>
                   </div>
                   <div>
                       <span className="text-cyber-dim text-xs">MIND TYPE</span>
                       <p className="text-white font-mono text-sm">{result.cognitive_profile.iq_type}</p>
                   </div>
                </div>
              </div>
              
              <div className="p-4 bg-cyber-dark/50 rounded border-l-4 border-cyan-500">
                <h3 className="font-bold text-cyan-400 text-sm uppercase tracking-wider mb-2 flex items-center">
                  <Heart className="w-4 h-4 mr-2" /> Heart & Feelings
                </h3>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                       <span className="text-cyber-dim text-xs">EMOTIONS</span>
                       <p className="text-white font-mono text-sm">{result.emotional_profile.eq_level}</p>
                   </div>
                   <div>
                       <span className="text-cyber-dim text-xs">RELATIONSHIP</span>
                       <p className="text-white font-mono text-sm">{result.emotional_profile.relationship_dynamic}</p>
                   </div>
                </div>
                <div className="mt-3 pt-3 border-t border-cyber-dim/10">
                   <span className="text-cyber-dim text-xs">SENSE OF HUMOR</span>
                   <p className="text-white font-mono text-sm">{result.emotional_profile.sense_of_humor}</p>
                </div>
              </div>

              <div className="p-4 bg-cyber-dark/50 rounded border-l-4 border-purple-500">
                <h3 className="font-bold text-purple-400 text-sm uppercase tracking-wider mb-2 flex items-center">
                  <Zap className="w-4 h-4 mr-2" /> Career & Nature
                </h3>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                       <span className="text-cyber-dim text-xs">NATURE</span>
                       <p className="text-white font-mono text-sm">{result.behavioral_profile.type}</p>
                   </div>
                   <div>
                       <span className="text-cyber-dim text-xs">BEST CAREER</span>
                       <p className="text-white font-mono text-sm">{result.behavioral_profile.career_guidance}</p>
                   </div>
                </div>
              </div>

              <div className="p-4 bg-cyber-dark/50 rounded border-l-4 border-blue-400">
                <h3 className="font-bold text-blue-400 text-sm uppercase tracking-wider mb-2">Practical Advice</h3>
                <ul className="pl-5 space-y-2">
                  {result.suggestions.map((s, i) => (
                    <li key={i} className="text-sm text-cyber-text list-disc marker:text-blue-400">{s}</li>
                  ))}
                </ul>
              </div>

              {/* Extracted Data Visualization */}
              <div className="p-4 bg-cyber-dark/50 rounded border border-cyber-dim/20">
                  <h3 className="font-bold text-cyber-text text-xs uppercase tracking-wider mb-3">Your Palm Details</h3>
                  <div className="space-y-2">
                      <div className="flex justify-between text-xs font-mono">
                          <span className="text-cyber-dim">Physical Energy</span>
                          <span className="text-blue-400">{result.extracted_data.vitality_index}/10</span>
                      </div>
                      <div className="w-full bg-cyber-black h-1 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }} 
                            animate={{ width: `${result.extracted_data.vitality_index * 10}%` }}
                            transition={{ duration: 1 }}
                            className="h-full bg-blue-400" 
                          />
                      </div>

                      <div className="flex justify-between text-xs font-mono pt-2">
                          <span className="text-cyber-dim">Mental Strength</span>
                          <span className="text-cyan-400">{result.extracted_data.cognitive_index}/10</span>
                      </div>
                      <div className="w-full bg-cyber-black h-1 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }} 
                            animate={{ width: `${result.extracted_data.cognitive_index * 10}%` }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="h-full bg-cyan-400" 
                          />
                      </div>

                      <div className="flex justify-between text-xs font-mono pt-2">
                          <span className="text-cyber-dim">Emotional Nature</span>
                          <span className="text-purple-400">{result.extracted_data.emotional_index}/10</span>
                      </div>
                      <div className="w-full bg-cyber-black h-1 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }} 
                            animate={{ width: `${result.extracted_data.emotional_index * 10}%` }}
                            transition={{ duration: 1, delay: 0.4 }}
                            className="h-full bg-purple-400" 
                          />
                      </div>
                  </div>
              </div>

              <button 
                onClick={handleDownloadReport}
                className="w-full flex items-center justify-center py-3 mt-4 border border-blue-500 text-blue-400 hover:bg-blue-600 hover:text-white transition-all rounded uppercase tracking-wider text-sm font-bold shadow-[0_0_10px_rgba(0,100,255,0.2)] hover:shadow-neon-blue"
              >
                <Download className="w-4 h-4 mr-2" /> Download Analysis Report
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="glass-panel p-8 rounded-xl border border-cyber-dim/20 flex flex-col items-center justify-center text-center space-y-4 opacity-50">
             <div className="w-20 h-20 rounded-full bg-cyber-dark flex items-center justify-center border border-cyber-dim/30">
                <Shield className="w-10 h-10 text-cyber-dim" />
             </div>
             <div>
                <h3 className="text-cyber-text font-sci uppercase tracking-widest">Awaiting Input</h3>
                <p className="text-cyber-dim text-xs max-w-[200px] mx-auto mt-2">Initialize the acquisition module to begin biometric palm analysis.</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}