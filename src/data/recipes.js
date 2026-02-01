export const recipes = [
  {
    id: 'piano',
    name: 'きれいなピアノ',
    description: '澄んだ音色のピアノサウンドを作ってみましょう。',
    steps: [
      {
        title: 'OSCILLATOR',
        target: 'osc',
        concept: 'まずは音の「源」を選びます。波の形によって、音の基本的なキャラクターが決まります。',
        instruction: 'オシレーターの波形を「SAW (のこぎり波)」に設定しましょう。ピアノのような倍音豊かな音の基礎になります。',
        targetParams: { waveform: 1 }
      },
      {
        title: 'FILTER',
        target: 'filter',
        concept: '次に、音の成分を削り取って明るさを調整します。料理でいう「こし器」のような役割です。',
        instruction: '「Cutoff」を少し下げて、落ち着いた音色に調整しましょう。ピアノの弦が響くような暖かさが出ます。',
        targetParams: { cutoff: 2000, resonance: 1.0 }
      },
      {
        title: 'ENVELOPE',
        target: 'adsr',
        concept: '最後に、音が鳴ってから消えるまでの時間的な変化を決めます。',
        instruction: '鍵盤を離した後も音が少し残るように「Release」を長めに、サステインを少し下げて(0.7程度) 自然な響きにしましょう。',
        targetParams: { attack: 0.05, decay: 0.5, sustain: 0.7, release: 1.0 }
      }
    ]
  },
  {
    id: 'snare',
    name: 'パワフルなスネア',
    description: 'ノイズ成分を活用して、打楽器のような鋭い音を作ります。',
    steps: [
      {
        title: 'OSCILLATOR',
        target: 'osc',
        concept: '打楽器の音を作るには、複雑な成分を持つ波形（またはノイズ）が必要です。',
        instruction: '「SQR (矩形波)」を選択し、高い周波数成分を確保しましょう。',
        targetParams: { waveform: 2 }
      },
      {
        title: 'FILTER',
        target: 'filter',
        concept: '鋭いアタック音を作るには、特定の周波数を強調するのが効果的です。',
        instruction: '「Cutoff」を高く設定し、さらに「Resonance」を上げて「カチッ」とした音色にします。',
        targetParams: { cutoff: 6000, resonance: 4.0 }
      },
      {
        title: 'ENVELOPE',
        target: 'adsr',
        concept: '「ドーーーン」と伸びるのではなく、一瞬で「トンッ」と消えるように設定するのがコツです。',
        instruction: '「Decay」と「Release」を非常に短く、サステインを「0」に設定してください。',
        targetParams: { attack: 0.0, decay: 0.1, sustain: 0, release: 0.1 }
      }
    ]
  },
  {
    id: 'lead',
    name: 'シンセ・リード',
    description: 'メロディを弾くための、派手で伸びやかなサウンドです。',
    steps: [
      {
        title: 'OSCILLATOR',
        target: 'osc',
        concept: 'リード（主役）の音には、音の立ち上がりがはっきりした華やかな波形が適しています。',
        instruction: 'パワフルな「SAW」波形を選んでください。',
        targetParams: { waveform: 1 }
      },
      {
        title: 'FILTER',
        target: 'filter',
        concept: '音がこもったり、急に明るくなったりする「表情」をつけることができます。',
        instruction: '「Cutoff」を真ん中あたりにして、「Resonance」で音に癖をつけます。',
        targetParams: { cutoff: 3500, resonance: 2.5 }
      },
      {
        title: 'ENVELOPE',
        target: 'adsr',
        concept: 'リードサウンドは長く伸ばすことが多いため、音量を高く保つのが一般的です。',
        instruction: '鍵盤を押している間ずっと音が鳴るように「Sustain」を最大値にします。',
        targetParams: { attack: 0.1, decay: 0.5, sustain: 1.0, release: 0.5 }
      },
      {
        title: 'LFO',
        target: 'lfo',
        concept: 'LFOは、音に定期的な「揺れ」を与えます。ビブラート効果を生むために最後に調整します。',
        instruction: 'ビブラート効果を生むために「Rate」を 5〜6Hz に調整ましょう。',
        targetParams: { lfoRate: 6, lfoDepth: 500 }
      }
    ]
  }
];
