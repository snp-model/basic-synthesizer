export const fmRecipes = [
  {
    id: 'crystal_bell',
    name: 'クリスタル・ベル',
    category: 'Percussion',
    emoji: '🔔',
    description: '非整数の比率が生み出す、金属的できらびやかなベル音です。',
    steps: [
      {
        title: 'MODULATOR RATIO',
        target: 'modulator',
        term: 'モジュレーター比率 (Modulator Ratio)',
        concept: 'キャリアに対するモジュレーターの周波数比率です。整数比（1.0, 2.0など）では倍音が調和的になり、非整数比（1.25, 3.5など）では非調和な倍音が生まれて金属的な響きになります。',
        instruction: 'Modulator Ratio を 1.25 に設定してください。非整数比が金属的な響きを作ります。',
        targetParams: { modulatorRatio: 1.25 }
      },
      {
        title: 'FM INDEX',
        target: 'modulator',
        term: 'FM Index (変調指数)',
        concept: 'FMシンセの音色を決める最も重要なパラメータです。値を大きくするほど、倍音が豊かになり、複雑で明るい音色になります。小さくすると、純粋な正弦波に近づきます。',
        instruction: 'FM Index を 4.0 に設定して、倍音を増やしましょう。',
        targetParams: { fmIndex: 4.0 }
      },
      {
        title: 'ENVELOPE',
        target: 'envelope',
        term: '減衰音 (Decay Sound)',
        concept: '鍵盤を押した瞬間に最大音量に達し、その後ゆっくりと消えていく音です。ベルやピアノのような打楽器的な表現に使われます。Sustain を 0 にすることで実現します。',
        instruction: 'Attack を 0、Decay を 2.0、Sustain を 0、Release を 2.0 に設定して、ベルのような余韻を作りましょう。',
        targetParams: { attack: 0.0, decay: 2.0, sustain: 0.0, release: 2.0 }
      }
    ]
  },
  {
    id: 'electric_piano',
    name: 'エレクトリック・ピアノ',
    category: 'Keyboards',
    emoji: '🎹',
    description: 'FMシンセの代名詞。DX7の象徴的な音色です。',
    steps: [
      {
        title: 'CARRIER & MODULATOR',
        target: 'modulator',
        term: 'キャリアとモジュレーターの関係',
        concept: 'FM合成では、モジュレーター（変調波）がキャリア（搬送波）の周波数を揺らすことで音色を作ります。両者の比率によって、生まれる倍音の構成が変わります。',
        instruction: 'Carrier Ratio を 1.0、Modulator Ratio を 4.0 に設定します。4倍の高周波で変調することで、エレピらしい倍音が生まれます。',
        targetParams: { carrierRatio: 1.0, modulatorRatio: 4.0 }
      },
      {
        title: 'FM INDEX',
        target: 'modulator',
        term: '明るさの調整',
        concept: 'FM Index は、音の明るさや倍音の豊かさをコントロールします。エレピでは、強く弾いたときに少し歪むような感じを再現するため、中程度の値を使います。',
        instruction: 'FM Index を 1.5 に設定します。これがエレピの「ちょうど良い歪み感」です。',
        targetParams: { fmIndex: 1.5 }
      },
      {
        title: 'ENVELOPE',
        target: 'envelope',
        term: 'ピアノらしい減衰',
        concept: 'エレクトリックピアノは、叩いた瞬間に音が出て、その後徐々に消えていく楽器です。Sustain を 0 にして、Decay で余韻の長さを調整します。',
        instruction: 'Attack を 0.0、Decay を 1.0、Sustain を 0.0、Release を 0.5 に設定してください。',
        targetParams: { attack: 0.0, decay: 1.0, sustain: 0.0, release: 0.5 }
      }
    ]
  },
  {
    id: 'fm_bass',
    name: 'FMベース',
    category: 'Bass',
    emoji: '🎸',
    description: 'モジュレーターで倍音を加え、太くエッジの効いたベース音を作ります。',
    steps: [
      {
        title: 'SUB-HARMONIC',
        target: 'modulator',
        term: 'サブハーモニクス (Sub-Harmonic)',
        concept: 'モジュレーター比率を 1.0 より小さくすると、元の音より低い周波数成分（サブハーモニクス）が加わります。これによって、音に厚みと低音感が生まれます。',
        instruction: 'Modulator Ratio を 0.5 に設定します。1オクターブ下の音を混ぜることで、太いベースになります。',
        targetParams: { modulatorRatio: 0.5 }
      },
      {
        title: 'FM INDEX',
        target: 'modulator',
        term: 'エッジの追加',
        concept: 'ベース音は太さだけでなく、アタック感や「噛みつくようなエッジ」も重要です。FM Index を上げることで、倍音が増えて音の輪郭がはっきりします。',
        instruction: 'FM Index を 3.0 に設定して、エッジの効いた音にしましょう。',
        targetParams: { fmIndex: 3.0 }
      },
      {
        title: 'ENVELOPE',
        target: 'envelope',
        term: 'パンチのあるアタック',
        concept: 'ベース音は「ボン」という瞬間的な立ち上がりが重要です。Attack を 0 にして、Sustain で伸びる音を確保します。',
        instruction: 'Attack を 0.0、Decay を 0.4、Sustain を 0.6、Release を 0.2 に設定してください。',
        targetParams: { attack: 0.0, decay: 0.4, sustain: 0.6, release: 0.2 }
      }
    ]
  },
  {
    id: 'sci_fi_sound',
    name: '宇宙的サウンド',
    category: 'Effects',
    emoji: '👽',
    description: 'FM Index を極限まで上げて、カオスで未知な音を作ります。',
    steps: [
      {
        title: 'EXTREME MODULATION',
        target: 'modulator',
        term: '過変調 (Over-Modulation)',
        concept: 'FM Index を極端に大きくすると、元の音の面影がなくなるほど複雑な倍音構造が生まれます。これは「ノイズ」とも「新しい音色」とも言える、カオス的な音です。',
        instruction: 'FM Index を最大値 10.0 に設定してください。音が劇的に変化します！',
        targetParams: { fmIndex: 10.0 }
      },
      {
        title: 'CARRIER PITCH',
        target: 'carrier',
        term: 'キャリア比率 (Carrier Ratio)',
        concept: 'キャリアの周波数を変えることで、音の基本的なピッチ（高さ）を変えることができます。高い値にすると、金属的で鋭い音になります。',
        instruction: 'Carrier Ratio を 5.0 に設定して、高音域の宇宙的な音を作りましょう。',
        targetParams: { carrierRatio: 5.0 }
      },
      {
        title: 'LOW-FREQUENCY WOBBLE',
        target: 'modulator',
        term: 'ゆらぎ効果',
        concept: 'モジュレーター比率を非常に小さくすると、音がゆっくりと「うねる」ような効果が生まれます。これは「トレモロ」や「ビブラート」に似た効果です。',
        instruction: 'Modulator Ratio を 0.25 に設定します。音がゆっくりと変化し始めます。',
        targetParams: { modulatorRatio: 0.25 }
      }
    ]
  }
];
