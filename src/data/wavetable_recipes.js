export const wavetableRecipes = [
  {
    id: 'deep_breath_pad',
    name: '深呼吸パッド',
    category: 'Pad',
    description: '4つの波形すべてを行き来する、呼吸のようなアンビエント・サウンドです。',
    steps: [
      {
        title: 'CENTER POSITION',
        target: 'wavetable',
        term: '中間地点',
        concept: '変化の「中心点」を決めます。ここを基準に、LFOによって波形が左右に行ったり来たりします。',
        instruction: 'Position を 0.35 (ノコギリ波付近) に設定します。',
        targetParams: { wavetablePosition: 0.35 }
      },
      {
        title: 'FULL DEPTH',
        target: 'morph',
        term: '全波形の走査',
        concept: 'Depth を最大にすると、Positionが左端から右端までフルスイングします。LFOをゆっくり動かすことで、ウェーブテーブル内の全ての波形が滑らかに繋がっていることを確認できます。',
        instruction: 'Rate を 0.1、Depth を 1.0 に設定して、波形の旅に出かけましょう。',
        targetParams: { morphSpeed: 0.1, morphDepth: 1.0 }
      },
      {
        title: 'SLOW ATTACK',
        target: 'envelope',
        term: '息の長さ',
        concept: '音がゆっくりと立ち上がり、消えていく設定にすることで、深呼吸のような有機的な動きを表現します。',
        instruction: 'Attack を 2.0、Release を 2.0 に設定します。',
        targetParams: { attack: 2.0, decay: 0.5, sustain: 1.0, release: 2.0 }
      }
    ]
  },
  {
    id: 'emergency_alarm',
    name: '緊急警報',
    category: 'SFX',
    description: 'Rateを極端に上げた、激しい警報音のようなサウンドです。',
    steps: [
      {
        title: 'SQUARE BASE',
        target: 'wavetable',
        term: '矩形波ベース',
        concept: '警報音のような目立つ音には、倍音成分の多い矩形波（Square）やノコギリ波が適しています。',
        instruction: 'Position を 0.7 (矩形波付近) に設定します。',
        targetParams: { wavetablePosition: 0.7 }
      },
      {
        title: 'FASTEST LFO',
        target: 'morph',
        term: '音響心理',
        concept: 'Rate（揺れの速度）を極端に上げると、人間の耳には「揺れ」ではなく「音程感のあるノイズ」や「濁り」として知覚されます。楽器音から効果音への変化を体験しましょう。',
        instruction: 'Rate を最大 (10.0)、Depth を最大 (1.0) に設定して、激しい変調をかけます。',
        targetParams: { morphSpeed: 10.0, morphDepth: 1.0 }
      },
      {
        title: 'GATE ENVELOPE',
        target: 'envelope',
        term: '歯切れの良さ',
        concept: 'Release をゼロにすることで、鍵盤を離した瞬間に音が止まる、機械的な動作を表現します。',
        instruction: 'Sustain を 1.0、Release を 0.0 に設定します。',
        targetParams: { attack: 0.0, decay: 0.1, sustain: 1.0, release: 0.0 }
      }
    ]
  },
  {
    id: 'wobbly_epiano',
    name: '揺らぎのエレピ',
    category: 'Keys',
    description: '正弦波にわずかな倍音を加えた、温かみのあるエレクトリック・ピアノです。',
    steps: [
      {
        title: 'SINE START',
        target: 'wavetable',
        term: '純音からの出発',
        concept: 'エレピの基本は丸い音（サイン波）です。しかし、サイン波だけでは少し物足りません。',
        instruction: 'Position を 0.0 (サイン波) に設定します。',
        targetParams: { wavetablePosition: 0.0 }
      },
      {
        title: 'SUBTLE DEPTH',
        target: 'morph',
        term: '微細な揺らぎ',
        concept: 'Depth を「ほんの少し」だけ上げるのがコツです。サイン波から隣の波形（Saw）へわずかにはみ出すことで、音が「こもる↔明るくなる」を繰り返し、温かみが生まれます。',
        instruction: 'Rate を 1.0、Depth を 0.1 に設定します。',
        targetParams: { morphSpeed: 1.0, morphDepth: 0.1 }
      },
      {
        title: 'PIANO ENVELOPE',
        target: 'envelope',
        term: '減衰感',
        concept: '鍵盤楽器らしく、弾いた後に少しずつ音が小さくなるように設定します。',
        instruction: 'Decay を 0.5、Sustain を 0.5 に設定します。',
        targetParams: { attack: 0.0, decay: 0.5, sustain: 0.5, release: 0.3 }
      }
    ]
  },
  {
    id: '8bit_morph',
    name: '8bitの変身',
    category: 'Chip',
    description: 'ファミコンのようなレトロな波形（SQR, TRI）を行き来するサウンドです。',
    steps: [
      {
        title: 'RETRO WAVES',
        target: 'wavetable',
        term: 'チップチューンの波形',
        concept: 'ファミコン等の古いゲーム機では、矩形波（Square）と三角波（Triangle）が主役でした。この2つの波形の間を中心点にします。',
        instruction: 'Position を 0.8 (SQRとTRIの間) に設定します。',
        targetParams: { wavetablePosition: 0.8 }
      },
      {
        title: 'RANGE CONTROL',
        target: 'morph',
        term: '範囲の制御',
        concept: 'Depthを調整して「狙った波形の間だけ」を往復させます。ここでは矩形波と三角波の間だけを行き来するように設定します。',
        instruction: 'Rate を 0.5、Depth を 0.3 に設定します。',
        targetParams: { morphSpeed: 0.5, morphDepth: 0.3 }
      },
      {
        title: 'SNAPPY EVELOPE',
        target: 'envelope',
        term: 'ピコピコ感',
        concept: 'アタックを最速（0）にし、短めのリリースを設定することで、レトロゲーム特有のピコピコ感を強調します。',
        instruction: 'Attack を 0.0、Release を 0.2 に設定します。',
        targetParams: { attack: 0.0, decay: 0.1, sustain: 0.8, release: 0.2 }
      }
    ]
  },
  {
    id: 'unstable_lead',
    name: '不安定なリード',
    category: 'Lead',
    description: '音の「質感」だけが常にうねうねと変化し続ける、飽きのこないリード音です。',
    steps: [
      {
        title: 'SWEET SPOT',
        target: 'wavetable',
        term: 'スウィートスポット',
        concept: 'ノコギリ波（鋭い）と矩形波（中空）が混ざり合う中間地点は、倍音が複雑でシンセサイザーらしい「おいしい」ポイントです。',
        instruction: 'Position を 0.5 (SAWとSQRの間) に設定します。',
        targetParams: { wavetablePosition: 0.5 }
      },
      {
        title: 'MOTION TEXTURE',
        target: 'morph',
        term: '動きのあるテクスチャ',
        concept: '音程は変えずに、波形の形だけを変えることで、まるで生き物のようにうねるリードサウンドを作ります。',
        instruction: 'Rate を 3.0、Depth を 0.4 に設定します。',
        targetParams: { morphSpeed: 3.0, morphDepth: 0.4 }
      },
      {
        title: 'FULL SUSTAIN',
        target: 'envelope',
        term: '存在感',
        concept: 'ソロパートで埋もれないよう、鍵盤を押している間は最大音量で鳴り続けるようにします。',
        instruction: 'Sustain を 1.0 に設定します。',
        targetParams: { attack: 0.05, decay: 0.2, sustain: 1.0, release: 0.3 }
      }
    ]
  },
  {
    id: 'glassy_drop',
    name: 'ガラスの雫',
    category: 'Pluck',
    description: '減衰音と音色変化を組み合わせた、硬質で透明感のある音です。',
    steps: [
      {
        title: 'HARD START',
        target: 'wavetable',
        term: '硬い音',
        concept: '少し倍音を含んだ波形（Saw寄り）からスタートすることで、音の出だしに「硬さ」を与えます。',
        instruction: 'Position を 0.15 に設定します。',
        targetParams: { wavetablePosition: 0.15 }
      },
      {
        title: 'SLOW MORPH',
        target: 'morph',
        term: '時間変化の錯覚',
        concept: 'LFOの周期を音の長さより長く設定することで、音が鳴ってから消えるまでの一方向の変化（のように聞こえる錯覚）を作り出します。',
        instruction: 'Rate を 0.2、Depth を 0.5 に設定します。',
        targetParams: { morphSpeed: 0.2, morphDepth: 0.5 }
      },
      {
        title: 'PLUCK ENVELOPE',
        target: 'envelope',
        term: 'プラック音',
        concept: '弦を弾いたような音（プラック）にするため、Sustain をゼロにして、Decay で音の長さを決めます。音が消えていく過程での波形変化に注目してください。',
        instruction: 'Decay を 0.3、Sustain を 0.0 に設定します。',
        targetParams: { attack: 0.0, decay: 0.3, sustain: 0.0, release: 0.5 }
      }
    ]
  }
];
