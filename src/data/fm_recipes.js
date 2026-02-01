export const fmRecipes = [
  {
    id: 'crystal_bell',
    name: 'クリスタル・ベル',
    category: 'Percussion',
    description: '非整数の比率が生み出す、金属的できらびやかなベル音です。',
    steps: [
      {
        title: 'MODULATOR RATIO',
        target: 'modulator',
        term: 'モジュレーター比率 (Modulator Ratio)',
        concept: '比率を 3.5 のような非整数に設定すると、数学的に不規則な振動が生まれます。これが金属音特有の「不協和な響き」の正体です。',
        instruction: 'Modulator Ratio を 3.5 に設定してください。',
        targetParams: { modulatorRatio: 3.5 }
      },
      {
        title: 'FM INDEX',
        target: 'modulator',
        term: 'FM Index',
        concept: 'ベルの透明感を保つためには、Indexを低めに調整するのがコツです。上げすぎると「濁り」が出て、金属ではなくノイズに近づいてしまいます。',
        instruction: 'FM Index を 0.5 に設定して、澄んだベル音にしましょう。',
        targetParams: { fmIndex: 0.5 }
      },
      {
        title: 'ENVELOPE',
        target: 'envelope',
        term: '余韻のコントロール',
        concept: 'ベルの音は叩いた瞬間に最大音量になり、その後ゆっくり消えていきます。Sustain を 0 にして、Decay と Release を長く取るのがポイントです。',
        instruction: 'Attack を 0、Decay を 1.5、Sustain を 0、Release を 1.5 に設定してください。',
        targetParams: { attack: 0.0, decay: 1.5, sustain: 0.0, release: 1.5 }
      }
    ]
  },
  {
    id: 'electric_piano',
    name: 'エレクトリック・ピアノ',
    category: 'Keyboards',
    description: 'FMシンセが得意とする、きらびやかで芯のあるエレピサウンドです。',
    steps: [
      {
        title: 'HARMONIC STACK',
        target: 'modulator',
        term: '整数比の倍音',
        concept: 'Carrier と Modulator を 1:1 の比率にすると、調和のとれた「シンセらしい」音が作れます。これは全ての音作りの基本となる比率です。',
        instruction: 'Carrier Ratio を 1.0、Modulator Ratio を 1.0 に設定します。',
        targetParams: { carrierRatio: 1.0, modulatorRatio: 1.0 }
      },
      {
        title: 'TINES BRIGHTNESS',
        target: 'modulator',
        term: 'アタックの輝き',
        concept: 'FM Index を上げることで、ピアノの弦を叩いた瞬間のキラッとした金属的な硬さが生まれます。これがエレピ特有の「プレゼンス」になります。',
        instruction: 'FM Index を 0.8 に設定します。',
        targetParams: { fmIndex: 0.8 }
      },
      {
        title: 'PIANO ENVELOPE',
        target: 'envelope',
        term: '減衰のプロファイル',
        concept: 'ピアノは鍵盤を叩いた後に音が減衰し、離すとすぐに止まります。Release を短めに設定することで、キレの良いタイトな演奏感が得られます。',
        instruction: 'Attack を 0.0、Decay を 1.0、Sustain を 0.0、Release を 0.5 に設定してください。',
        targetParams: { attack: 0.0, decay: 1.0, sustain: 0.0, release: 0.5 }
      }
    ]
  },
  {
    id: 'fm_bass',
    name: 'FMベース',
    category: 'Bass',
    description: '重心の低い、太くてエッジの効いたベース音です。',
    steps: [
      {
        title: 'SUB OSCILLATION',
        target: 'modulator',
        term: 'サブハーモニクス',
        concept: 'Modulator をオクターブ下の比率（0.5）に設定すると、基音の下にさらに低い周波数が重なり、お腹に響くような重低音が生まれます。',
        instruction: 'Carrier Ratio を 1.0、Modulator Ratio を 0.5 に設定します。',
        targetParams: { carrierRatio: 1.0, modulatorRatio: 0.5 }
      },
      {
        title: 'BASS GRIT',
        target: 'modulator',
        term: 'ベースのうなり',
        concept: 'FM Index を 2.0 前後まで上げると、音が少し歪み、シンセベースらしい「噛みつくような」鋭いテクスチャが加わります。',
        instruction: 'FM Index を 1.8 に設定してください。',
        targetParams: { fmIndex: 1.8 }
      },
      {
        title: 'BASS PUNCH',
        target: 'envelope',
        term: 'アタック感',
        concept: 'ベースには「パンチ」が必要です。アタックを最速（0）にし、Decay で音の引き締まり具合を調整することで、グルーヴが生まれます。',
        instruction: 'Attack を 0.0、Decay を 0.5、Sustain を 0.5、Release を 0.2 に設定してください。',
        targetParams: { attack: 0.0, decay: 0.5, sustain: 0.5, release: 0.2 }
      }
    ]
  },
  {
    id: 'warm_pad',
    name: '暖かいシンセパッド',
    category: 'Strings/Pad',
    description: '包み込むような柔らかい響きを持つ、FMならではのパッド音です。',
    steps: [
      {
        title: 'SOFT OVERTONES',
        target: 'modulator',
        term: 'ソフト変調',
        concept: 'パッド音を暖かくするには、Index を極限まで低く（0.15程度）保つのが秘訣です。耳に痛くない「柔らかな倍音」をわずかに加えます。',
        instruction: 'Carrier Ratio を 1.0、Modulator Ratio を 1.0、FM Index を 0.15 に設定します。',
        targetParams: { carrierRatio: 1.0, modulatorRatio: 1.0, fmIndex: 0.15 }
      },
      {
        title: 'SWELLING',
        target: 'envelope',
        term: 'じわ〜っとした立ち上がり',
        concept: 'Attack を長く設定することで、音が霧の中から現れるような効果を生みます。包み込むようなアンビエントな雰囲気には欠かせない設定です。',
        instruction: 'Attack を 1.5、Decay を 0.5、Sustain を 0.8、Release を 1.5 に設定します。',
        targetParams: { attack: 1.5, decay: 0.5, sustain: 0.8, release: 1.5 }
      }
    ]
  },
  {
    id: 'fm_flute',
    name: '和やかなフルート',
    category: 'Woodwinds',
    description: '空気が漏れるような質感を再現した木管サウンドです。',
    steps: [
      {
        title: 'SINE BASE',
        target: 'modulator',
        term: '純正比率',
        concept: 'フルートのピュアな音色は、C:M = 1:1 のサイン波をベースにします。これが安定した管楽器の響きの土台になります。',
        instruction: 'Carrier Ratio を 1.0、Modulator Ratio を 1.0 に設定します。',
        targetParams: { carrierRatio: 1.0, modulatorRatio: 1.0 }
      },
      {
        title: 'AIR NOISE',
        target: 'modulator',
        term: '息の成分',
        concept: 'Index を 0.1 前後のごくわずかな値に設定すると、波形に小さな揺らぎが生まれます。これが「管に息を吹き込む音」に近い質感になります。',
        instruction: 'FM Index を 0.12 に設定してください。',
        targetParams: { fmIndex: 0.12 }
      },
      {
        title: 'BREATH ENVELOPE',
        target: 'envelope',
        term: '吹き込み感',
        concept: '実際のフルート演奏のように、音が安定するまでにわずかな「間」を持たせるため、Attack を 0.2 程度に遅らせるのがコツです。',
        instruction: 'Attack を 0.2、Decay を 0.3、Sustain を 0.8、Release を 0.2 に設定します。',
        targetParams: { attack: 0.2, decay: 0.3, sustain: 0.8, release: 0.2 }
      }
    ]
  },
  {
    id: 'fm_marimba',
    name: '木質のマリンバ',
    category: 'Percussion',
    description: '木の温もりを感じる、ポコポコとした打楽器音です。',
    steps: [
      {
        title: 'WOODEN RATIO',
        target: 'modulator',
        term: '複雑な比率',
        concept: 'Modulator Ratio を 2.0 に設定すると、基音の上の高い成分が強調されます。これが木の板を叩いたときの初期振動のベースになります。',
        instruction: 'Carrier Ratio を 1.0、Modulator Ratio を 2.0 に設定します。',
        targetParams: { carrierRatio: 1.0, modulatorRatio: 2.0 }
      },
      {
        title: 'SOFT KNOCK',
        target: 'modulator',
        term: '打撃の表現',
        concept: 'マリンバの柔らかさを出すには、Index を控えめ（0.6）にします。これによって「金属」ではなく「木」らしい丸みのある音が生まれます。',
        instruction: 'FM Index を 0.6 に設定します。',
        targetParams: { fmIndex: 0.6 }
      },
      {
        title: 'PERCUSSIVE ENV',
        target: 'envelope',
        term: '短い響き',
        concept: 'マレット楽器は音がすぐに減衰します。Decay を短く（0.4）し、Sustain を 0 にすることで、歯切れの良いパーカッシブな響きを再現します。',
        instruction: 'Attack を 0.0、Decay を 0.4、Sustain を 0.0、Release を 0.3 に設定してください。',
        targetParams: { attack: 0.0, decay: 0.4, sustain: 0.0, release: 0.3 }
      }
    ]
  },
  {
    id: 'fm_koto',
    name: '雅な琴',
    category: 'Plucked',
    description: '和楽器特有の、鋭い弦のハジキ音を再現します。',
    steps: [
      {
        title: 'PLUCK RATIO',
        target: 'modulator',
        term: '弦の比率',
        concept: '比率を 2.0 に設定することで、弦楽器らしい明るい倍音の分布を作ります。琴の「ピーン」という芯の強さはこの比率から生まれます。',
        instruction: 'Carrier Ratio を 1.0、Modulator Ratio を 2.0 に設定します。',
        targetParams: { carrierRatio: 1.0, modulatorRatio: 2.0 }
      },
      {
        title: 'TWANG',
        target: 'modulator',
        term: 'ハジキの質感',
        concept: 'Index を 1.0 程度まで上げると、爪で弦を強めに弾いたときの「立ち上がりの鋭さ」や「煌びやかさ」が強調されます。',
        instruction: 'FM Index を 1.0 に設定してください。',
        targetParams: { fmIndex: 1.0 }
      },
      {
        title: 'LONG RESONANCE',
        target: 'envelope',
        term: '弦の振動',
        concept: '琴の魅力は長い余韻にあります。Decay を 2.0 秒と長く取ることで、弾いた後の弦がいつまでも揺れ続けている様子を表現できます。',
        instruction: 'Attack を 0.0、Decay を 2.0、Sustain を 0.0、Release を 1.5 に設定します。',
        targetParams: { attack: 0.0, decay: 2.0, sustain: 0.0, release: 1.5 }
      }
    ]
  },
  {
    id: 'sci_fi_sound',
    name: '宇宙的サウンド',
    category: 'Effects',
    description: 'Indexを最大にしてカオスな音を作ります（※耳にご注意ください）。',
    steps: [
      {
        title: 'CHAOS INDEX',
        target: 'modulator',
        term: 'ノイズ生成',
        concept: 'FM Index を最大（10.0）にすると、波形が崩壊し、カオスなノイズへと変化します。これはアナログシンセでは不可能な、FM独自の破壊的な音作りです。',
        instruction: 'FM Index を最大値 10.0 に設定してください。',
        targetParams: { fmIndex: 10.0 }
      },
      {
        title: 'ALIEN PITCH',
        target: 'carrier',
        term: '非現実的な比率',
        concept: 'Carrier Ratio を高く（5.0）、Modulator を低く（0.25）設定すると、不気味で金属的な高い金属の擦れ合いのような特殊効果音が生まれます。',
        instruction: 'Carrier Ratio を 5.0、Modulator Ratio を 0.25 に設定します。',
        targetParams: { carrierRatio: 5.0, modulatorRatio: 0.25 }
      }
    ]
  }
];
