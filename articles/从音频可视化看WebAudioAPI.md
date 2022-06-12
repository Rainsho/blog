# 从音频可视化看 Web Audio API

> 这篇本来是在 DY 做 Web 端直播推流时想总结分享的，硬生生的被我拖到了去了 DY 之后，作为自己的新人分享，才勉强写完。

## 一、一点前言

不管是元宇宙还是 Web 3.0，前端的发展似乎永远都是在快车道上。作为一个前端开发，我认为浏览器始终都是我们最重要的「朋友」。从 1.0 时代的 read-only 模式，到 2.0 时代的 read-write 模式，再到不知道会以什么形式呈现的 3.0 时代，总是让人充满期待的。之前参与了一个很有意思的项目，就是将 PC 端的直播伴侣移植到 Web 端，实现通过浏览器进行直播的功能，期间接触了一些音视频相关的知识，今天就让我们一起玩一下 Web Audio API 吧。

## 二、发出声音

![](https://tva1.sinaimg.cn/large/e6c9d24egy1h35td8wwyrj208h03kweg.jpg)

要发出声音，可能最简单的方案就是使用 <audio> 标签。使用 Web Audio 的方式其实也很简单，就如上图所示，拿到 source 输出到 destination。这个 source 可以是音频文件、或者麦克风采集，也可以是电子乐器等等；而 destination 是输出设备，通常是我们的扬声器或者耳机。

一个典型的流程如下：

1. 初始化 AudioContext 对象
2. 加载音频文件
3. 使用 ctx.decodeAudioData 解码
4. 创建 source (封装解码后的 buffer)
5. 将 source 连接到 destination
6. 播放

更直观的表达，如下：

```ts
const ctx = new AudioContext();
const source = ctx.createBufferSource();
const buffer = await fetch(sample1).then(x => x.arrayBuffer());

ctx.decodeAudioData(buffer, decodeData => {
  source.buffer = decodeData;
  source.connect(ctx.destination);
  source.start(0);
});
```

几个概念：

- `AudioContext` 音频上下文，一切操作都在这个环境里进行
- `AudioNode` 音频节点，一个音频处理模块 (In/Out)
- `AudioBuffer` 内存中的一段音频数据

## 三、实现可视化

![](https://tva1.sinaimg.cn/large/e6c9d24egy1h35tf2iwp4j20hz0cf402.jpg)

左上角有一组随着音乐跳动的柱子，想必大家都习以为常了，很多播放器都有这功能。但是其实有没有想过，这是怎么实现的，或者说这到底是想表达什么？

### 3.1 什么是声音

声音本身是个物理概念，由物体振动产生，这个振动经由介质传导到我们的耳朵中引起耳膜振动从而让我们听见声音。声音本质上是个波动，既然是波动，我们就可以用波形去描述。以时间为横轴，用振动的位移表示纵轴，我们便可以画出一段声音的波形图。

既然是振动，就有频率和振幅两个重要属性。其中频率即我们平时所说的**音高**，振幅即我们平时所说的响度或者**音量**。

![](https://tva1.sinaimg.cn/large/e6c9d24egy1h35tfivcpcj20rp05z3z4.jpg)

如上图所示的一段声波，可以看到其在 0.01s 内振动了 2 次，因此频率是 200Hz；振幅是 1。 听起来便是这样一个效果：

<audio controls>
  <source src="https://raw.githubusercontent.com/Rainsho/blog/master/assets/200hz.wav" type="audio/wav">
</audio>

类似的，如果是一段 800Hz 的声音，听起来便是这样一个效果：

<audio controls>
  <source src="https://raw.githubusercontent.com/Rainsho/blog/master/assets/800hz.wav" type="audio/wav">
</audio>

以上两段声音都是 pure tone，而现实世界中我们听到的声音不会是 pure tone，而是各种 pure tone 叠加的结果。比如上面两段叠加后，便是这样一个效果。

<audio controls>
  <source src="https://raw.githubusercontent.com/Rainsho/blog/master/assets/mixed.wav" type="audio/wav">
</audio>

```ts
// 使用 AudioContext 进行 source 合并
const ctx = new AudioContext();
const source1 = await createSourceNode(ctx, rate1);
const source2 = await createSourceNode(ctx, rate2);

/* fetch and decode */

// 加一层 DynamicsCompressorNode 或者两层 GainNode 避免爆音
const compressor = ctx.createDynamicsCompressor();

source1.connect(compressor);
source2.connect(compressor);
compressor.connect(ctx.destination);

source1.start(0);
source2.start(0);
```

### 3.2 声音采样

因为声音是一个随时间变化的连续函数，任意一段间隔内都有无穷多个值，而无穷多的数据是没办法存储在计算机中的。想要存储，我们就需要将它离散化变成离散序列，具体的方法就是采样，使用固定的间隔对函数进行求值。

![](https://tva1.sinaimg.cn/large/e6c9d24egy1h35thiw0paj20zk049gme.jpg)

通过采样，我们将一个无尽序列变成了一个有限序列，其中每一个值叫做样本，这样就可以方便地在计算机中存储了。采样的关键参数有两个，分别是采样频率和采样深度。采样频率是指每秒钟采样多少次，采样深度是指用多少比特去存储采样得到的值。常见的 44.1KHz 16bit 音频即每秒钟采样 441000 个点，每个点占 16 位(2B)，所以每秒钟占用空间 44100 \* 2 约 88KB，如果是双声道则大约是 176KB。

得到采样值数组以后，接下来如何存储这个数组就是编码的范畴了。我们可以直接存(对应无损的 WAV 格式)，也可以采用某种算法压缩以后再存，比如 MP3、AAC 等。如果是 WAV 格式的，其二进制编码和 `ctx.decodeAudioData` 解码后的音频数据是可以一一对应的。

![](https://tva1.sinaimg.cn/large/e6c9d24egy1h35thpryikj20zk0fnn00.jpg)

![](https://tva1.sinaimg.cn/large/e6c9d24egy1h35thxodckj20fy07b3zg.jpg)

前 3 个采集点的值依次为 `[0, 0.02847376838326454, 0.05694753676652908]`，对应音频文件的 45 - 50 字节(其中前 44 字节为 WAV 格式的[头信息](https://codeantenna.com/a/3Mdc0fRshG))，依次为 `00 00 A5 03 4A 07` 按小端字节序读取 getInt16 后依次为 `[0x0000, 0x03A5, 0x074A]`，转换为线性后即为近似的采样值(差异来自 float64 转 float32 时的误差)。

![](https://tva1.sinaimg.cn/large/e6c9d24egy1h35ti83cq5j20fu04wdg8.jpg)

### 3.3 生成音频

了解了声音的采样和编码，我们亦可直接创建一个 source 用来播放。还是以 prue tone 为例，我们用正弦函数构建出对应频率的采样点即可输出对应频率的声音。

```ts
let ctx: AudioContext;

function playTone(freq: number, dur: number = 0.25) {
if (!ctx) ctx = new AudioContext();

const SAMPLE_RATE = ctx.sampleRate;
const buffer = ctx.createBuffer(1, SAMPLE_RATE \* dur, SAMPLE_RATE);
const ch = buffer.getChannelData(0);
const len = SAMPLE_RATE / freq; // 一个周期的采样点数量

for (let i = 0; i < buffer.length; i++) {
const tone = Math.sin(((i % len) / len) _ (Math.PI _ 2));
ch[i] = tone;
}

const source = ctx.createBufferSource();
source.buffer = buffer;
source.connect(ctx.destination);
source.start(0);
}
```

### 3.4 一点数学

给定两个不同频率的波形，计算其叠加后的结果非常简单，类似 `f(x) = f1(x) + f2(x)` 。

![](https://tva1.sinaimg.cn/large/e6c9d24egy1h35tifwejrj20u60ebwgt.jpg)

但是已知 `f(x)` 能不能反求出 `f1(x)` 和 `f2(x)`，比如有下面这样一段波形，能不能看出来它是有那几个不同频率的波形合成的呢？

![](https://tva1.sinaimg.cn/large/e6c9d24egy1h35tiofodwj20zk0523ys.jpg)

自觉告诉我，这不可能吧。但数学会来打我脸，通过傅里叶变换(傅里叶级数)，我们可以将一个复合波形拆解为构成它的简单波形(一系列正余弦函数的和)。这里面的数学知识，稍微有亿点难，我就不展开了。

![](https://tva1.sinaimg.cn/large/e6c9d24egy1h35tivgxahj208d02zmx3.jpg)

![](https://tva1.sinaimg.cn/large/e6c9d24egy1h35tj3dp09j20d101tq2u.jpg)

![](https://tva1.sinaimg.cn/large/e6c9d24egy1h35tj9az7jj20zk0jddhi.jpg)

可以通过 [Fourier Transform in JavaScript](https://www.colby.edu/chemistry/NMR/scripts/clymerfourier.html) 对变换过程有一个大致的了解。

![](https://tva1.sinaimg.cn/large/e6c9d24egy1h35tjg4wpqj20u00wbtey.jpg)

### 3.5 音频可视化

到了这里所有实现音频可视化的知识都备齐了。可以猜到，随音乐跳动的每个柱子，对应的是一个频率或一组频率，而柱子的高度则是频率的分量大小，这两个信息可以通过傅里叶变换得到。

#### 3.5.1 使用 `decodeAudioData`

我们希望得到的频率数据随着音乐在变化，因此这里要选择一个窗口大小(FFT_SIZE)，比如 2048。随着音乐的播放，我们每次都从当前播放位置选择 2048 个样本然后进行傅里叶变换。

```ts
const ctx = new AudioContext();
const source = ctx.createBufferSource();

const chData = source.buffer!.getChannelData(0);
const startIndex = (delta \* source.buffer!.sampleRate) | 0;
const input = Array.from(chData.slice(startIndex, startIndex + size));
```

可以借助一些第三方库进行傅里叶变换，比如 fft.js 。变换后，将数据变换到 0 ~ 1 的范围然后绘图即可。

```ts
import FFT from 'fft.js';

const f = new FFT(size);
const out = f.createComplexArray();
f.realTransform(out, input);

let max = -1;
const samples = new Array(size);

for (let i = 0; i < size; i++) {
  // `out` 为复数对，这里取模
  const v = out[2 * i] ** 2 + out[2 * i + 1] ** 2;
  max = Math.max(max, v);
  samples[i] = v;
}

draw(samples.map(x => x / max));
```

#### 3.5.2 使用 `AnalyserNode`

`decodeAudioData` 需要我们手动进行取样，显然在处理流的时候并不是很友好。由于傅里叶变换是如此常用和重要，Web Audio API 内部其实已经集成了这种功能。我们可以通过一个 `AnalyserNode` 节点，直接拿到 source 的实时的频域数据。

![](https://tva1.sinaimg.cn/large/e6c9d24egy1h35tjucg8sj20j905qgln.jpg)

```ts
const ctx = new AudioContext();
const analyser = new AnalyserNode(ctx, { fftSize: 2048 });

const dataArray = new Uint8Array(analyser.frequencyBinCount);
analyser.getByteFrequencyData(dataArray);

draw(Array.from(dataArray).map(x => x / 255));
```

相比于用第三方库自行进行傅里叶变换 AnalyserNode 输出的频域数据业务含义亦更直观。

> Each item in the array represents the decibel value for a specific frequency. The frequencies are spread linearly from 0 to 1/2 of the sample rate. For example, for 48000 sample rate, the last item of the array will represent the decibel value for 24000 Hz.

> Fun fact: 48K 的采样率意味着每秒有 48K 的样本数量，而要表示周期函数的一个周期，至少需要两个点，比如 [-1, 0, -1, 0] ，所以当前采样率下最多只能发出 24KHz 的音频。刚好在人的听力阈值 20Hz - 20KHz 之上一点。

#### 3.5.3 使用 AudioWorkletNode

除了 `AnalyserNode`，`AudioWorkletNode` 也经常用来做音频可视化，同时还能够对音频数据进行修改。从它的名字其实也可以看出，`AudioWorkletNode` 是在 worker 进程执行的，再配合 `OffscreenCanvas`，我们可以把可视化这部分工作完全移至 worker 进程，而不占用主进程的资源。

```ts
// in worker thread
class VisProcessor extends AudioWorkletProcessor {
  process(inputs: Float32Array[][], outputs: Float32Array[][]) {
    if (inputs[0] && inputs[0][0] && canvas) {
      // apply FFT if needed
      const samples = Array.from(inputs[0][0]).map(x => Math.abs(x));
      draw(canvas, samples);
    }

    return true;
  }
}

registerProcessor('vis-processor', VisProcessor);

// in main thread
import { url as workerUrl } from '../utils/vis.worker?worker';

const ctx = new AudioContext();
await ctx.audioWorklet.addModule(workerUrl);
const worklet = new AudioWorkletNode(ctx, 'vis-processor');

const oc = canvas.transferControlToOffscreen();
worklet.port.postMessage({ canvas: oc }, [oc]);

source.connect(worklet);
```

## 四、还能干什么

![](https://tva1.sinaimg.cn/large/e6c9d24egy1h35tk32myyj20xc0b4wf4.jpg)

- 借助 `BiquadFilterNode` 实现类似均衡器的定制音乐效果
- 借助 `PannerNode` 实现类似苹果 AirPods 的空间音频效果
- 借助 `OscillatorNode` 实现类似 MIDI 的效果
- Use your imagination...

## 五、扩展阅读

- [Getting Started with Web Audio API](https://www.html5rocks.com/en/tutorials/webaudio/intro/)
- [MDN Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Web Audio API 小教程](https://benzleung.gitbooks.io/web-audio-api-mini-guide/content/)
- [音频可视化：采样、频率和傅里叶变换](https://cjting.me/2021/08/07/fourier-transform-and-audio-visualization/)
- [But what is the Fourier Transform? A visual introduction.](https://www.youtube.com/watch?v=spUNpyF58BY)
