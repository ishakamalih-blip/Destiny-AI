import { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Activity, Zap, Heart, Brain, Download, Cpu, Shield, Upload, Scan, FileText } from 'lucide-react';

export default function Analysis() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setExtractedData(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setResult(null);
    setExtractedData(null);

    const username = localStorage.getItem('user_name') || 'guest';
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const response = await axios.post(`/analyze-image?username=${username}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResult(response.data);
      setExtractedData(response.data.extracted_data);
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
          const response = await axios.post('/report', extractedData, {
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
       <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] animate-pulse pointer-events-none"></div>

      <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-white font-sci border-b border-blue-500/30 pb-4 inline-block">
        PALM ANALYSIS
      </h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="glass-panel p-8 rounded-xl relative overflow-hidden border-t border-l border-blue-500/20 flex flex-col">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
             <Scan className="w-48 h-48" />
          </div>

          <h2 className="mb-6 text-xl font-sci text-blue-400 tracking-wider flex items-center">
            <Cpu className="w-5 h-5 mr-2" /> UPLOAD PALM IMAGE
          </h2>

          <div className="flex-1 flex flex-col items-center justify-center space-y-6">
            <div className="w-full relative group">
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                />

                <div className={`w-full h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all duration-300 relative overflow-hidden ${selectedFile ? 'border-blue-500 bg-cyber-dark/80' : 'border-cyber-dim/30 hover:border-blue-500/50 hover:bg-blue-500/5'}`}>
                    {selectedFile ? (
                        <div className="text-center">
                            <FileText className="w-12 h-12 text-blue-400 mx-auto mb-2" />
                            <p className="text-blue-400 text-sm font-mono uppercase tracking-wider mb-1">File Selected</p>
                            <p className="text-cyber-dim text-xs truncate max-w-48">{selectedFile.name}</p>
                        </div>
                    ) : (
                        <div className="text-center">
                            <Upload className="w-12 h-12 text-cyber-dim mx-auto mb-2" />
                            <p className="text-cyber-dim text-sm font-mono uppercase tracking-wider mb-1">Upload Palm Image</p>
                            <p className="text-cyber-dim/60 text-xs">Click to browse or drag & drop</p>
                        </div>
                    )}
                </div>
            </div>

            {selectedFile && (
                <button
                    onClick={handleAnalyze}
                    disabled={loading}
                    className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white font-bold font-sci tracking-wider py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center shadow-neon-blue"
                >
                    {loading ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            ANALYZING...
                        </>
                    ) : (
                        <>
                            <Scan className="w-5 h-5 mr-2" />
                            ANALYZE PALM
                        </>
                    )}
                </button>
            )}
          </div>
        </div>

        <div className="glass-panel p-8 rounded-xl relative overflow-hidden border-t border-l border-blue-500/20 flex flex-col">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
             <Brain className="w-48 h-48" />
          </div>

          <h2 className="mb-6 text-xl font-sci text-blue-400 tracking-wider flex items-center">
            <Brain className="w-5 h-5 mr-2" /> ANALYSIS RESULTS
          </h2>

          <div className="flex-1 flex flex-col">
            {previewUrl && (
                <div className="mb-6">
                    <img src={previewUrl} alt="Palm preview" className="w-full h-48 object-cover rounded-lg border border-blue-500/30" />
                </div>
            )}

            {loading && (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
                        <p className="text-blue-400 font-mono uppercase tracking-wider">Processing biometric data...</p>
                        <p className="text-cyber-dim text-sm mt-2">Extracting palm patterns and analyzing characteristics</p>
                    </div>
                </div>
            )}

            {result && !loading && (
                <div className="flex-1 space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-cyber-dark/50 rounded-lg border border-blue-500/20">
                            <Activity className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                            <p className="text-xs text-cyber-dim uppercase tracking-wider mb-1">Vitality</p>
                            <p className="text-2xl font-bold text-blue-400">{result.extracted_data?.vitality_index}/10</p>
                        </div>
                        <div className="text-center p-4 bg-cyber-dark/50 rounded-lg border border-blue-500/20">
                            <Brain className="w-8 h-8 text-green-400 mx-auto mb-2" />
                            <p className="text-xs text-cyber-dim uppercase tracking-wider mb-1">Cognitive</p>
                            <p className="text-2xl font-bold text-green-400">{result.extracted_data?.cognitive_index}/10</p>
                        </div>
                        <div className="text-center p-4 bg-cyber-dark/50 rounded-lg border border-blue-500/20">
                            <Heart className="w-8 h-8 text-red-400 mx-auto mb-2" />
                            <p className="text-xs text-cyber-dim uppercase tracking-wider mb-1">Emotional</p>
                            <p className="text-2xl font-bold text-red-400">{result.extracted_data?.emotional_index}/10</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 bg-cyber-dark/30 rounded-lg border border-blue-500/10">
                            <h3 className="text-blue-400 font-sci text-sm uppercase tracking-wider mb-2">Cognitive Profile</h3>
                            <p className="text-cyber-dim text-sm">{result.cognitive_profile?.thinking_ability || 'Analysis in progress'}</p>
                        </div>

                        <div className="p-4 bg-cyber-dark/30 rounded-lg border border-blue-500/10">
                            <h3 className="text-blue-400 font-sci text-sm uppercase tracking-wider mb-2">Emotional Intelligence</h3>
                            <p className="text-cyber-dim text-sm">{result.emotional_profile?.eq_level || 'Analysis in progress'}</p>
                        </div>

                        <div className="p-4 bg-cyber-dark/30 rounded-lg border border-blue-500/10">
                            <h3 className="text-blue-400 font-sci text-sm uppercase tracking-wider mb-2">Behavioral Type</h3>
                            <p className="text-cyber-dim text-sm">{result.behavioral_profile?.type || 'Analysis in progress'}</p>
                        </div>
                    </div>

                    <button
                        onClick={handleDownloadReport}
                        className="w-full bg-green-500/20 hover:bg-green-500/40 text-green-400 border border-green-500/50 py-2 px-4 rounded font-mono text-sm uppercase tracking-wider transition-all duration-300 flex items-center justify-center"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Download Report
                    </button>
                </div>
            )}

            {!result && !loading && !previewUrl && (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <Shield className="w-16 h-16 text-cyber-dim/30 mx-auto mb-4" />
                        <p className="text-cyber-dim font-mono uppercase tracking-wider">Upload an image to begin analysis</p>
                        <p className="text-cyber-dim/60 text-sm mt-2">Your palm biometric data will be processed securely</p>
                    </div>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}