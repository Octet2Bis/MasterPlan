/**
 * OPENCUT VIDEO PIPELINE — GÉNÉRATEUR DE TIMELINES VIDÉO (Node.js 24)
 * Pilier : 01_GTM_Growth / 03_Experimentation / Creatives (< 130 lignes)
 */

const fs = require('node:fs');
const path = require('node:path');

const HOOKS_FILE = path.join(__dirname, 'data/aevum_video_hooks.json');

class OpenCutVideoPipeline {
  constructor() {
    this.catalog = this.loadCatalog();
  }

  loadCatalog() {
    try {
      return JSON.parse(fs.readFileSync(HOOKS_FILE, 'utf-8'));
    } catch {
      return { storyboards: [] };
    }
  }

  generateOpenCutProject(storyboardId) {
    const sb = this.catalog.storyboards?.find(s => s.id === storyboardId) || this.catalog.storyboards?.[0];
    if (!sb) throw new Error(`Storyboard [${storyboardId}] introuvable.`);

    const timeline = {
      project_name: `Aevum_Ad_${sb.id}`,
      format: { width: 1080, height: 1920, fps: 30, ratio: "9:16" },
      tracks: [
        {
          id: "video_track_1",
          type: "video",
          clips: sb.scenes.map((scene, idx) => ({
            id: `clip_${idx + 1}`,
            asset: scene.visual_asset,
            duration: scene.duration,
            type: scene.type
          }))
        },
        {
          id: "text_overlay_track",
          type: "text",
          elements: sb.scenes.map((scene, idx) => ({
            id: `text_${idx + 1}`,
            content: scene.text_overlay,
            style: { font: "Plus Jakarta Sans", weight: "800", color: "#FFFFFF", background: "rgba(0,0,0,0.6)" }
          }))
        },
        {
          id: "audio_track_1",
          type: "audio",
          cues: sb.scenes.map(s => s.audio_cue)
        }
      ]
    };

    return timeline;
  }

  exportFfmpegConcatCommand(storyboardId) {
    const project = this.generateOpenCutProject(storyboardId);
    const clips = project.tracks[0].clips.map(c => `file '${c.asset}'`).join('\n');
    return {
      manifest: project,
      concat_list: clips,
      cmd: `ffmpeg -f concat -safe 0 -i concat_list.txt -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2" -c:v libx264 -crf 23 -pix_fmt yuv420p output_${storyboardId}.mp4`
    };
  }
}

if (require.main === module) {
  const pipeline = new OpenCutVideoPipeline();
  console.log("=== OPENCUT VIDEO PIPELINE (PILIER 01 GTM) ===");
  const exported = pipeline.exportFfmpegConcatCommand("hook_pattern_interrupt");
  console.log(`🎬 Projet : ${exported.manifest.project_name}`);
  console.log(`📐 Format : ${exported.manifest.format.ratio} (${exported.manifest.format.width}x${exported.manifest.format.height})`);
  console.log(`⚡ Commande FFmpeg générée :\n${exported.cmd}`);
}

module.exports = { OpenCutVideoPipeline };
