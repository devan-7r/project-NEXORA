import React from "react";
import { Settings, Volume2, ShieldAlert, Monitor, Accessibility, Languages } from "lucide-react";

export default function SettingsView({ 
  voiceSettings, 
  setVoiceSettings, 
  accessibility, 
  setAccessibility 
}) {
  const handleVoiceToggle = (e) => {
    setVoiceSettings(prev => ({ ...prev, enabled: e.target.checked }));
  };

  const handleVoiceChange = (field, value) => {
    setVoiceSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleAccessibilityChange = (field, value) => {
    setAccessibility(prev => {
      const updated = { ...prev, [field]: value };
      
      // Handle high contrast visual shift
      if (field === "highContrast") {
        if (value) {
          document.documentElement.style.setProperty("--bg-primary", "#000000");
          document.documentElement.style.setProperty("--bg-secondary", "#000000");
          document.documentElement.style.setProperty("--border-color", "#ffffff");
        } else {
          document.documentElement.style.setProperty("--bg-primary", "#060709");
          document.documentElement.style.setProperty("--bg-secondary", "#0d0f14");
          document.documentElement.style.setProperty("--border-color", "rgba(255, 255, 255, 0.08)");
        }
      }

      // Handle custom fonts scale
      if (field === "fontSize") {
        if (value === "large") {
          document.body.classList.add("presentation-mode");
        } else {
          document.body.classList.remove("presentation-mode");
        }
      }

      return updated;
    });
  };

  return (
    <div className="space-y-6">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* VOICE ASSISTANT SETTINGS */}
        <div className="glass-panel p-5 space-y-5">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <Volume2 className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Voice Synthesizer Settings</h3>
          </div>

          {/* Toggle speech */}
          <div className="flex justify-between items-center text-xs">
            <div>
              <span className="font-bold text-gray-200 block">Enable Voice Synthesis</span>
              <span className="text-[10px] text-gray-500">Read AI answers aloud using browser synthesis</span>
            </div>
            
            <label className="checkbox-container">
              <input 
                type="checkbox" 
                checked={voiceSettings.enabled}
                onChange={handleVoiceToggle} 
              />
              <div className="checkbox-custom">
                {voiceSettings.enabled && <div className="w-2.5 h-2.5 rounded bg-blue-500" />}
              </div>
            </label>
          </div>

          {/* Settings sliders */}
          {voiceSettings.enabled && (
            <div className="space-y-4 pt-3 border-t border-white/5 animate-scale">
              {/* Volume Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>Speech Volume</span>
                  <span className="font-mono text-white font-bold">{Math.floor(voiceSettings.volume * 100)}%</span>
                </div>
                <input 
                  type="range"
                  min="0" max="1" step="0.1"
                  value={voiceSettings.volume}
                  onChange={(e) => handleVoiceChange("volume", parseFloat(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              {/* Pitch Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>Audio Pitch</span>
                  <span className="font-mono text-white font-bold">{voiceSettings.pitch}x</span>
                </div>
                <input 
                  type="range"
                  min="0.5" max="2" step="0.1"
                  value={voiceSettings.pitch}
                  onChange={(e) => handleVoiceChange("pitch", parseFloat(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              {/* Speed rate Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>Synthesis Speed Rate</span>
                  <span className="font-mono text-white font-bold">{voiceSettings.rate}x</span>
                </div>
                <input 
                  type="range"
                  min="0.5" max="2" step="0.1"
                  value={voiceSettings.rate}
                  onChange={(e) => handleVoiceChange("rate", parseFloat(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* ACCESSIBILITY & GENERAL */}
        <div className="glass-panel p-5 space-y-5">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <Accessibility className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Accessibility & Display</h3>
          </div>

          {/* High contrast mode */}
          <div className="flex justify-between items-center text-xs">
            <div>
              <span className="font-bold text-gray-200 block">High Contrast Mode</span>
              <span className="text-[10px] text-gray-500">Enable pure black borders for WCAG readability</span>
            </div>
            
            <label className="checkbox-container">
              <input 
                type="checkbox" 
                checked={accessibility.highContrast}
                onChange={(e) => handleAccessibilityChange("highContrast", e.target.checked)} 
              />
              <div className="checkbox-custom">
                {accessibility.highContrast && <div className="w-2.5 h-2.5 rounded bg-blue-500" />}
              </div>
            </label>
          </div>

          {/* Font scale */}
          <div className="flex justify-between items-center text-xs pt-3 border-t border-white/5">
            <div>
              <span className="font-bold text-gray-200 block">Interface Font Size</span>
              <span className="text-[10px] text-gray-500">Scale readable elements across dashboard</span>
            </div>
            
            <select
              value={accessibility.fontSize}
              onChange={(e) => handleAccessibilityChange("fontSize", e.target.value)}
              className="input-premium text-xs py-1 bg-slate-900 border-white/5"
            >
              <option value="default">Standard</option>
              <option value="large">Scale Large</option>
            </select>
          </div>

          {/* Ingestion Auto Logout Timer */}
          <div className="flex justify-between items-center text-xs pt-3 border-t border-white/5">
            <div>
              <span className="font-bold text-gray-200 block">Session Auto-lock Timer</span>
              <span className="text-[10px] text-gray-500">Period before sandbox terminal locks</span>
            </div>
            
            <select
              value={accessibility.logoutTimer || "Never"}
              onChange={(e) => handleAccessibilityChange("logoutTimer", e.target.value)}
              className="input-premium text-xs py-1 bg-slate-900 border-white/5"
            >
              <option value="15min">15 Minutes</option>
              <option value="30min">30 Minutes</option>
              <option value="Never">Never Auto-Lock</option>
            </select>
          </div>

          {/* Languages */}
          <div className="flex justify-between items-center text-xs pt-3 border-t border-white/5">
            <div className="flex items-center gap-2">
              <Languages className="w-4 h-4 text-gray-400" />
              <div>
                <span className="font-bold text-gray-200 block">Interface Language</span>
                <span className="text-[10px] text-gray-500">Select default layout translation</span>
              </div>
            </div>
            
            <select
              defaultValue="en"
              className="input-premium text-xs py-1 bg-slate-900 border-white/5"
            >
              <option value="en">English (US/IN)</option>
              <option value="hi">Hindi (IN)</option>
            </select>
          </div>

        </div>

      </div>

    </div>
  );
}
