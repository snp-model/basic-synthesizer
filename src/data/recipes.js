export const recipes = [
  {
    id: 'retro_lead',
    name: 'ファミコン風 8bit リード',
    description: 'レトロゲームのような、懐かしくてチープな「ピコピコ音」です。',
    steps: [
      {
        title: 'OSCILLATOR',
        target: 'osc',
        term: '矩形波 (Square Wave)',
        concept: 'デジタルで機械的な響きを持つ、四角い形の波形です。奇数倍音を多く含み、古いゲーム機のような「ピコピコ音」や、木管楽器のような音を表現するのに適しています。',
        instruction: '波形を「SQR」に設定し、Pulse Width（パルスの幅）を少しずらして(0.25くらい)、独特な鼻詰まり感を出しましょう。',
        targetParams: { waveform: 2, pulseWidth: 0.25 }
      },
      {
        title: 'FILTER',
        target: 'filter',
        term: 'カットオフ周波数 (Cutoff)',
        concept: '「ここより高い音を削る」という基準となる周波数のことです。この値を高く設定すると、削られる成分が減るため、音は明るくハッキリとした印象になります。',
        instruction: 'Cutoff を最大値近くまで上げて、音の成分をすべてそのまま出しましょう。',
        targetParams: { cutoff: 8000, resonance: 1.0 }
      },
      {
        title: 'ENVELOPE',
        target: 'adsr',
        term: 'ゲート動作 (Gate)',
        concept: '鍵盤を押している間だけ音が鳴り、離すと即座に止まる、オルガンや電子音のような動作のことです。余韻（リリース）を残さないことで、歯切れの良い演奏ができます。',
        instruction: 'AttackとReleaseを「0」にして、ボタンを押した瞬間に鳴り、離した瞬間に止まる設定にします。',
        targetParams: { attack: 0.0, decay: 0.1, sustain: 1.0, release: 0.0 }
      }
    ]
  },
  {
    id: 'toy_organ',
    name: 'チープな電子オルガン',
    description: 'おもちゃのキーボードのような、丸くて優しいオルガンサウンドです。',
    steps: [
      {
        title: 'OSCILLATOR',
        target: 'osc',
        term: '三角波 (Triangle Wave)',
        concept: '倍音成分が少なく、非常に丸くて柔らかい音が特徴の波形です。フルートやリコーダー、やさしいオルガンのような音を作るのに向いています。',
        instruction: '波形を「TRI」に設定してください。',
        targetParams: { waveform: 3 }
      },
      {
        title: 'FILTER',
        target: 'filter',
        term: 'ローパスフィルター (LPF)',
        concept: '低い音（Low）を通して（Pass）、高い音をカットするフィルターです。音の角を丸くしたり、こもらせたりして、優しく暖かい音色を作るのによく使われます。',
        instruction: 'Cutoff を 1500Hz くらいに下げて、角の取れた音にしましょう。',
        targetParams: { cutoff: 1500, resonance: 1.0 }
      },
      {
        title: 'ENVELOPE',
        target: 'adsr',
        term: 'サステイン (Sustain)',
        concept: '鍵盤を押し続けている間の「持続音量」のことです。ピアノやギターのような減衰音ではなく、オルガンのようにずっと鳴り続ける音を作るには、ここを最大にします。',
        instruction: 'Sustain を最大(1.0)にします。Attackを少しだけ(0.05)上げると、空気感が出ます。',
        targetParams: { attack: 0.05, decay: 0.1, sustain: 1.0, release: 0.1 }
      }
    ]
  },
  {
    id: 'auto_wah',
    name: 'オートワウ・ベース',
    description: 'フィルターが自動で開閉して「ウワウワ」と喋るようなベース音です。',
    steps: [
      {
        title: 'OSCILLATOR',
        target: 'osc',
        term: 'ノコギリ波 (Sawtooth Wave)',
        concept: '全ての整数次倍音を含み、最も明るく鋭い音がする、シンセサイザーの基本波形です。バイオリンのような弦楽器や、太いブラス（金管）サウンドの元になります。',
        instruction: '波形を「SAW」に選択してください。',
        targetParams: { waveform: 1 }
      },
      {
        title: 'FILTER',
        target: 'filter',
        term: 'レゾナンス (Resonance)',
        concept: 'カットオフ周波数の周辺をピンポイントで強調し、音に独特の「クセ」をつける機能です。値を上げると声のような「ミョン」「ビヨーン」といった電子的な響きが加わります。',
        instruction: 'Cutoff を 500Hz くらいまでグッと下げて、暗い音にしてください。',
        targetParams: { cutoff: 500, resonance: 3.0 }
      },
      {
        title: 'LFO',
        target: 'lfo',
        term: 'LFO (Low Frequency Oscillator)',
        concept: '人間の耳には聞こえない低い周波数の揺れを作る装置です。これをフィルターにかけることで、自動的に音色を行ったり来たり変化させる「ワウ効果」などが作れます。',
        instruction: 'Rate(速さ)を2Hzくらい、Depth(深さ)を1500くらいに設定すると、音が「ウワウワ」とうねり始めます！',
        targetParams: { lfoRate: 2.0, lfoDepth: 1500 }
      }
    ]
  }
];
